/**
 * /app/detect/page.jsx  v3
 * Fixed: @/ imports, proper error boundaries for all async paths,
 * file upload + camera switch, better scan UI, result sharing.
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { supabase } from '@/lib/supabaseClient';
import { savePlant } from '@/lib/savePlant';
import { compressImage, detectBlur, checkResolution, dataURItoBlob } from '@/lib/imageUtils';
import { generateCareTips } from '@/lib/plantIntelligence';
import Navbar from '@/components/Navbar';
import ConfidenceBar from '@/components/ConfidenceBar';
import CareTipsCard from '@/components/CareTipsCard';
import PlantChatbot from '@/components/PlantChatbot';

const VIDEO_CONSTRAINTS = {
  width:  { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment',
};

const STAGE = { CAMERA:'camera', UPLOAD:'upload', PREVIEW:'preview', CHECKING:'checking', COMPRESSING:'compressing', DETECTING:'detecting', RESULT:'result' };

const STAGE_LABELS = {
  checking:    'Checking image quality…',
  compressing: 'Optimising image…',
  detecting:   'Analysing plant…',
};

/* ── Spinner ── */
const Spin = ({ size = 'sm', color = 'white' }) => (
  <span className={`inline-block rounded-full border-2 flex-shrink-0 ${
    size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  } ${color === 'white' ? 'border-white border-t-transparent' : 'border-current border-t-transparent'}`}
    style={{ animation: 'spin 0.7s linear infinite' }}
  />
);

/* ── Scan overlay ── */
const ScanOverlay = ({ stage }) => (
  <div className="absolute inset-0 overflow-hidden rounded-t-[20px] pointer-events-none">
    <div className="absolute inset-0 bg-black/25" />
    <div className="scan-line" />
    {/* Corner brackets */}
    {[
      'top-5 left-5 border-t-2 border-l-2',
      'top-5 right-5 border-t-2 border-r-2',
      'bottom-5 left-5 border-b-2 border-l-2',
      'bottom-5 right-5 border-b-2 border-r-2',
    ].map((cls, i) => (
      <div key={i} className={`absolute ${cls} w-7 h-7 border-white/80 rounded-sm`} />
    ))}
    <div className="absolute bottom-5 left-0 right-0 flex justify-center">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
        <Spin size="sm" />
        {STAGE_LABELS[stage] || 'Processing…'}
      </div>
    </div>
  </div>
);

/* ── Upload drop zone ── */
const DropZone = ({ onFile }) => {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const handle = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onFile(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-3 p-8
        border-2 border-dashed rounded-[20px] transition-all cursor-pointer
        ${dragging ? 'border-forest-400 bg-forest-50/20' : 'border-theme hover:border-forest-400 hover:bg-subtle'}`}
      onClick={() => ref.current?.click()}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handle(e.target.files[0])} />
      <div className="text-5xl leaf-float">📁</div>
      <div className="text-center">
        <p className="font-medium text-primary text-sm">Drop an image here</p>
        <p className="text-xs text-muted mt-1">or <span className="text-forest-500 underline underline-offset-2">browse files</span></p>
        <p className="text-xs text-faint mt-1">JPG · PNG · WEBP — max 10 MB</p>
      </div>
    </div>
  );
};

/* ── Alternative row ── */
const AltRow = ({ alt, rank, onSelect }) => {
  const pct = Math.round(alt.confidence * 100);
  const color = pct >= 60 ? 'text-green-600 dark:text-green-400' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
  return (
    <button onClick={() => onSelect(alt)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-subtle rounded-xl transition-all text-left group">
      <span className="w-6 h-6 rounded-lg bg-subtle border border-theme text-xs font-bold text-muted
                       flex items-center justify-center flex-shrink-0 group-hover:border-forest-400 transition-colors">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-primary truncate group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
          {alt.name}
        </p>
        {alt.scientific && <p className="text-xs italic text-muted truncate">{alt.scientific}</p>}
      </div>
      <span className={`text-xs font-bold font-mono flex-shrink-0 ${color}`}>{pct}%</span>
    </button>
  );
};

export default function DetectPage() {
  const router    = useRouter();
  const webcamRef = useRef(null);

  const [user, setUser]           = useState(null);
  const [stage, setStage]         = useState(STAGE.CAMERA);
  const [captured, setCaptured]   = useState(null);
  const [processed, setProcessed] = useState(null);
  const [camReady, setCamReady]   = useState(false);
  const [camError, setCamError]   = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  const [qualityWarn, setQualityWarn] = useState('');
  const [allResults, setAllResults]   = useState([]);
  const [topResult, setTopResult]     = useState(null);
  const [showAlts, setShowAlts]       = useState(false);
  const [careTips, setCareTips]       = useState(null);

  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [detectError, setDetectError] = useState('');

  /* ── Auth guard ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);
    });
  }, [router]);

  const reset = useCallback(() => {
    setCaptured(null); setProcessed(null);
    setStage(STAGE.CAMERA); setQualityWarn('');
    setAllResults([]); setTopResult(null);
    setShowAlts(false); setCareTips(null);
    setSaved(false); setSaveError(''); setDetectError('');
    setCamReady(false); setCamError('');
  }, []);

  const doCapture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (src) { setCaptured(src); setStage(STAGE.PREVIEW); setQualityWarn(''); }
  }, []);

  const handleUploadFile = useCallback((dataURI) => {
    setCaptured(dataURI); setStage(STAGE.PREVIEW); setQualityWarn('');
  }, []);

  const flipCamera = useCallback(() => {
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
    setCamReady(false);
  }, []);

  /* ── Main detection pipeline ── */
  const runDetection = useCallback(async (skipBlurCheck = false) => {
    if (!captured) return;
    setDetectError(''); setQualityWarn('');

    // 1 — Quality checks
    setStage(STAGE.CHECKING);
    const [blurRes, resRes] = await Promise.all([
      detectBlur(captured),
      checkResolution(captured, { minWidth: 280, minHeight: 280 }),
    ]);

    if (!resRes.ok) {
      setQualityWarn(`Image resolution too low (${resRes.width}×${resRes.height}px). Please retake with a higher-quality camera or closer shot.`);
      setStage(STAGE.PREVIEW);
      return;
    }
    if (!skipBlurCheck && blurRes.isBlurry) {
      setQualityWarn(`Image appears blurry (sharpness score: ${blurRes.score}). Hold steady and ensure good lighting.`);
      setStage(STAGE.PREVIEW);
      return; // user can click "Proceed anyway"
    }

    // 2 — Compress
    setStage(STAGE.COMPRESSING);
    let comp;
    try { comp = await compressImage(captured); }
    catch { comp = captured; }
    setProcessed(comp);

    // 3 — API call
    setStage(STAGE.DETECTING);
    try {
      const blob = dataURItoBlob(comp);
      const fd = new FormData();
      fd.append('image', blob, 'plant.jpg');
      fd.append('organ', 'auto');

      const res  = await fetch('/api/detect', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`);
      if (!json.results?.length) throw new Error('No plants detected. Try a clearer photo focused on leaves, flowers, or bark.');

      const results = json.results;
      setAllResults(results);
      setTopResult(results[0]);
      setCareTips(generateCareTips(results[0].name));
      setStage(STAGE.RESULT);
    } catch (err) {
      console.error('[detect]', err);
      setDetectError(err.message || 'Detection failed. Please try again.');
      setStage(STAGE.PREVIEW);
    }
  }, [captured]);

  const selectAlt = useCallback((alt) => {
    setTopResult(alt);
    setCareTips(generateCareTips(alt.name));
    setShowAlts(false);
    setSaved(false); setSaveError('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!topResult || !user || saved) return;
    setSaving(true); setSaveError('');
    const { error } = await savePlant({
      user_id:      user.id,
      plant_name:   topResult.name,
      scientific:   topResult.scientific || '',
      family:       topResult.family || '',
      confidence:   topResult.confidence,
      image_url:    processed || captured,
      alternatives: allResults.slice(1).map(r => ({ name: r.name, scientific: r.scientific, confidence: r.confidence })),
      care_tips:    careTips,
    });
    if (error) setSaveError('Could not save. Check your connection and try again.');
    else setSaved(true);
    setSaving(false);
  }, [topResult, user, saved, processed, captured, allResults, careTips]);

  const isProcessing = [STAGE.CHECKING, STAGE.COMPRESSING, STAGE.DETECTING].includes(stage);
  const pct = topResult ? Math.round(topResult.confidence * 100) : 0;
  const detectedPlantName = topResult?.name || 'plants in general';

  return (
    <div className="min-h-screen bg-botanical">
      <Navbar user={user} backTo="/dashboard" backLabel="Dashboard" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Title ── */}
        <div style={{ animation: 'slideUp 0.45s ease both' }}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">
            {stage === STAGE.RESULT ? 'Plant Identified' : 'Identify Plant'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {stage === STAGE.RESULT
              ? `Found ${allResults.length} potential match${allResults.length !== 1 ? 'es' : ''}`
              : 'Use your camera or upload a photo'}
          </p>
        </div>

        {/* ══ Camera / Preview Panel ══ */}
        <div className="card overflow-hidden" style={{ animation: 'slideUp 0.45s ease 0.08s both' }}>

          {/* ── Viewport ── */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>

            {/* Camera mode */}
            {stage === STAGE.CAMERA && (
              <>
                <Webcam
                  ref={webcamRef} audio={false}
                  screenshotFormat="image/jpeg" screenshotQuality={0.95}
                  videoConstraints={{ ...VIDEO_CONSTRAINTS, facingMode }}
                  onUserMedia={() => setCamReady(true)}
                  onUserMediaError={err => { setCamError('Camera access denied or unavailable.'); setCamReady(false); }}
                  className="w-full h-full object-cover"
                />

                {!camReady && !camError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 text-white">
                    <Spin size="lg" />
                    <p className="text-sm">Starting camera…</p>
                  </div>
                )}
                {camError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-3 px-8 text-center">
                    <div className="text-4xl">🚫</div>
                    <p className="text-sm text-red-300">{camError}</p>
                    <button onClick={() => { setCamError(''); setCamReady(false); }}
                      className="text-xs text-white/70 underline mt-1 hover:text-white">Retry</button>
                  </div>
                )}

                {/* Camera guidelines overlay */}
                {camReady && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Rule of thirds */}
                    <div className="absolute inset-0 opacity-[0.12]">
                      {[1,2].map(i => <div key={`v${i}`} className={`absolute top-0 bottom-0 w-px bg-white`} style={{ left:`${i*33.33}%` }} />)}
                      {[1,2].map(i => <div key={`h${i}`} className={`absolute left-0 right-0 h-px bg-white`} style={{ top:`${i*33.33}%` }} />)}
                    </div>
                    {/* Focus bracket */}
                    {[['top-[22%] left-[22%]','border-t-2 border-l-2'],
                      ['top-[22%] right-[22%]','border-t-2 border-r-2'],
                      ['bottom-[22%] left-[22%]','border-b-2 border-l-2'],
                      ['bottom-[22%] right-[22%]','border-b-2 border-r-2'],
                    ].map(([pos, cls], i) => (
                      <div key={i} className={`absolute ${pos} w-8 h-8 border-white/70 ${cls}`} />
                    ))}
                    {/* Tip bar */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 flex-wrap px-4">
                      {['🍃 Focus leaf','☀️ Good light','📐 Fill frame'].map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[10px] backdrop-blur-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flip camera button */}
                {camReady && (
                  <button onClick={flipCamera}
                    className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/50 hover:bg-black/70
                               text-white backdrop-blur-sm flex items-center justify-center transition-all"
                    title="Flip camera">
                    🔄
                  </button>
                )}
              </>
            )}

            {/* Upload mode */}
            {stage === STAGE.UPLOAD && (
              <div className="absolute inset-0 p-6 flex items-center justify-center">
                <DropZone onFile={handleUploadFile} />
              </div>
            )}

            {/* Preview / processing */}
            {captured && stage !== STAGE.CAMERA && stage !== STAGE.UPLOAD && (
              <>
                <img src={captured} alt="Captured plant" className="w-full h-full object-cover" />
                {isProcessing && <ScanOverlay stage={stage} />}
                {/* Retake overlay button */}
                {!isProcessing && stage !== STAGE.RESULT && (
                  <button onClick={reset}
                    className="absolute top-3 right-3 flex items-center gap-1.5 text-xs
                               bg-black/55 hover:bg-black/75 text-white rounded-full px-3 py-1.5 backdrop-blur-sm transition-all">
                    🔄 Retake
                  </button>
                )}
                {/* Result badge on image */}
                {stage === STAGE.RESULT && topResult && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 max-w-[70%]">
                      <p className="text-white font-semibold text-sm truncate">{topResult.name}</p>
                      {topResult.scientific && <p className="text-white/60 text-xs italic truncate">{topResult.scientific}</p>}
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-right">
                      <p className={`font-bold text-sm ${pct>=80?'text-green-400':pct>=55?'text-amber-400':'text-red-400'}`}>{pct}%</p>
                      <p className="text-white/50 text-[10px]">match</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Controls ── */}
          <div className="p-5 space-y-3">

            {/* Quality warning */}
            {qualityWarn && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm
                              bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50
                              text-amber-800 dark:text-amber-300"
                style={{ animation: 'slideUp 0.3s ease both' }}>
                <span className="flex-shrink-0 text-base">⚠️</span>
                <div className="flex-1">
                  <p>{qualityWarn}</p>
                  {qualityWarn.includes('blurry') && (
                    <button onClick={() => { setQualityWarn(''); runDetection(true); }}
                      className="mt-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:opacity-80">
                      Try anyway →
                    </button>
                  )}
                </div>
                <button onClick={() => setQualityWarn('')} className="text-amber-400 hover:text-amber-600 text-lg leading-none flex-shrink-0">×</button>
              </div>
            )}

            {/* Detection error */}
            {detectError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm
                              bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50
                              text-red-700 dark:text-red-400"
                style={{ animation: 'slideUp 0.3s ease both' }}>
                <span>⚠️</span>
                <span className="flex-1">{detectError}</span>
                <button onClick={() => setDetectError('')} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
              </div>
            )}

            {/* ── Camera stage ── */}
            {(stage === STAGE.CAMERA || stage === STAGE.UPLOAD) && (
              <>
                <button onClick={stage === STAGE.CAMERA ? doCapture : undefined}
                  disabled={stage === STAGE.CAMERA && (!camReady || !!camError)}
                  className="btn-primary">
                  {stage === STAGE.CAMERA ? '📷 Take Photo' : '📁 Select a file above'}
                </button>
                <button onClick={() => setStage(stage === STAGE.CAMERA ? STAGE.UPLOAD : STAGE.CAMERA)}
                  className="btn-secondary text-sm">
                  {stage === STAGE.CAMERA ? '📁 Upload Image Instead' : '📷 Use Camera Instead'}
                </button>
              </>
            )}

            {/* ── Preview stage ── */}
            {stage === STAGE.PREVIEW && (
              <>
                <button onClick={() => runDetection(false)} className="btn-primary">
                  🔍 Identify This Plant
                </button>
                <button onClick={reset} className="btn-secondary text-sm">🔄 Retake Photo</button>
              </>
            )}

            {/* ── Processing stage ── */}
            {isProcessing && (
              <button disabled className="btn-primary opacity-70 cursor-not-allowed">
                <Spin />{STAGE_LABELS[stage]}
              </button>
            )}

            {/* ── Result stage ── */}
            {stage === STAGE.RESULT && (
              <>
                {saveError && (
                  <p className="text-red-500 dark:text-red-400 text-xs text-center px-2">{saveError}</p>
                )}
                {saved ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-700 dark:text-green-400">
                      <span>✅</span> Saved to your collection!
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => router.push('/dashboard')} className="btn-secondary text-sm">View Collection</button>
                      <button onClick={reset} className="btn-primary text-sm">🔄 Detect Again</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                      {saving ? <><Spin />Saving…</> : <>💾 Save to My Collection</>}
                    </button>
                    <button onClick={reset} className="btn-secondary text-sm">🔄 Detect Another</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══ Result card ══ */}
        {stage === STAGE.RESULT && topResult && (
          <div className="space-y-4" style={{ animation: 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

            {/* Main result */}
            <div className="card overflow-hidden">
              {/* Header gradient */}
              <div className="forest-gradient px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-forest-200 px-2 py-0.5 rounded-full bg-white/10">
                        Best match
                      </span>
                      {allResults.length > 1 && (
                        <span className="text-[10px] text-forest-300">{allResults.length} results</span>
                      )}
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white leading-tight break-words">
                      {topResult.name}
                    </h2>
                    {topResult.scientific && (
                      <p className="italic text-forest-200 text-sm mt-1">{topResult.scientific}</p>
                    )}
                    {topResult.family && (
                      <p className="text-forest-300 text-xs mt-0.5">Family: {topResult.family}</p>
                    )}
                  </div>
                  <div className="text-5xl flex-shrink-0" style={{ animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
                    🌿
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="px-6 py-4 border-b border-theme">
                <ConfidenceBar value={topResult.confidence} size="lg" />
              </div>

              {/* Alternatives */}
              {allResults.length > 1 && (
                <div className="border-b border-theme">
                  <button
                    onClick={() => setShowAlts(s => !s)}
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-subtle transition-colors"
                  >
                    <span className="text-sm font-medium text-secondary flex items-center gap-2">
                      <span>🤔</span>
                      Not right? See {allResults.length - 1} other suggestion{allResults.length > 2 ? 's' : ''}
                    </span>
                    <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${showAlts ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {showAlts && (
                    <div className="px-3 pb-3 space-y-0.5" style={{ animation: 'slideUp 0.25s ease both' }}>
                      {allResults.slice(1).map((alt, i) => (
                        <AltRow key={alt.scientific || i} alt={alt} rank={i+2} onSelect={selectAlt} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved confirmation */}
              {saved && (
                <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 flex items-center gap-2
                                text-green-700 dark:text-green-400 text-sm border-t border-theme">
                  ✅ Saved to your collection
                </div>
              )}
            </div>

            {/* Care tips */}
            {careTips && <CareTipsCard tips={careTips} plantName={topResult.name} />}

          </div>
        )}

        {/* ══ Tips (camera / upload mode) ══ */}
        {(stage === STAGE.CAMERA || stage === STAGE.UPLOAD) && (
          <div className="card px-5 py-4" style={{ animation: 'slideUp 0.45s ease 0.25s both' }}>
            <h3 className="font-semibold text-primary text-sm mb-3">📋 Tips for Best Results</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                ['☀️', 'Natural, even lighting'],
                ['🍃', 'Include leaves or flowers'],
                ['📐', 'Fill the frame tightly'],
                ['🎨', 'Show distinctive features'],
                ['📷', 'Hold steady, avoid blur'],
                ['🔍', 'Move close for detail'],
              ].map(([icon, tip]) => (
                <div key={tip} className="flex items-start gap-2 text-xs text-secondary">
                  <span className="flex-shrink-0 mt-0.5">{icon}</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <PlantChatbot plantName={detectedPlantName} />
    </div>
  );
}
