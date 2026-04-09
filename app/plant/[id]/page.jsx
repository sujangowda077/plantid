/**
 * /app/plant/[id]/page.jsx
 * Full Plant Detail Page — hero image, care guide, stats, notes, 
 * alternatives, share, download, back navigation.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getPlantById, toggleFavorite, updateNotes, deletePlant } from '@/lib/savePlant';
import { CARE_ICONS } from '@/lib/careTips';
import ConfidenceBar from '@/components/ConfidenceBar';
import Navbar from '@/components/Navbar';

/* ═══════════════════════════════ ICONS ══════════════════════════ */
const HeartIcon = ({ filled }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const ShareIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const CameraIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const InfoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

/* ═══════════════════════════════ HELPERS ════════════════════════ */
const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit',
});

/* ── Lightbox ──────────────────────────────────────── */
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease both' }}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt}
          className="w-full h-full object-contain rounded-2xl shadow-2xl max-h-[85vh]"
          style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
        />
        <button onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20
                     text-white text-xl flex items-center justify-center backdrop-blur-sm transition-all">
          ×
        </button>
        <a href={src} download="plant.jpg"
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl
                     bg-black/60 text-white text-xs hover:bg-black/80 backdrop-blur-sm transition-all">
          <DownloadIcon /> Save image
        </a>
      </div>
    </div>
  );
}

/* ── Stat pill ─────────────────────────────────────── */
const StatPill = ({ icon, label, value, color = '' }) => (
  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-theme bg-surface ${color}`}>
    <span className="text-2xl flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted">{label}</p>
      <p className="text-sm font-bold text-primary mt-0.5 leading-snug">{value}</p>
    </div>
  </div>
);

/* ── Timeline item ─────────────────────────────────── */
const TimelineItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-subtle border border-theme flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">{label}</p>
      <p className="text-sm text-primary mt-0.5">{value}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function PlantDetailPage() {
  const router = useRouter();
  const { id }  = useParams();

  const [plant, setPlant]         = useState(null);
  const [user,  setUser]          = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState('');
  const [lightbox, setLightbox]   = useState(false);

  // Editing states
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText]         = useState('');
  const [savingNote, setSavingNote]     = useState(false);
  const [togglingFav, setTogglingFav]   = useState(false);

  // Delete
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  // Share / copy
  const [copied, setCopied] = useState(false);

  // Care tips tab
  const [carTab, setCarTab] = useState(null); // null = all

  /* ── Load ── */
  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace('/login'); return; }
      setUser(u);

      const { data, error: err } = await getPlantById(id);
      if (err || !data) {
        setError('Plant not found or you do not have access.');
      } else {
        setPlant(data);
        setNoteText(data.user_notes || '');
      }
      setLoading(false);
    })();
  }, [id, router]);

  /* ── Favourite ── */
  const handleFav = useCallback(async () => {
    if (!plant || togglingFav) return;
    setTogglingFav(true);
    const { data } = await toggleFavorite(plant.id, plant.is_favorite);
    if (data) setPlant(data);
    setTogglingFav(false);
  }, [plant, togglingFav]);

  /* ── Save note ── */
  const handleSaveNote = useCallback(async () => {
    if (!plant) return;
    setSavingNote(true);
    const { data } = await updateNotes(plant.id, noteText);
    if (data) setPlant(data);
    setSavingNote(false);
    setEditingNotes(false);
  }, [plant, noteText]);

  /* ── Delete ── */
  const handleDelete = useCallback(async () => {
    if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 4000); return; }
    setDeleting(true);
    await deletePlant(plant.id);
    router.replace('/dashboard');
  }, [plant, confirmDel, router]);

  /* ── Copy share link ── */
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: plant?.plant_name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch { /* user cancelled */ }
  }, [plant]);

  /* ── Download image ── */
  const handleDownload = useCallback(() => {
    if (!plant?.image_url) return;
    const a = document.createElement('a');
    a.href = plant.image_url;
    a.download = `${plant.plant_name?.replace(/\s+/g, '_') || 'plant'}.jpg`;
    a.click();
  }, [plant]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-botanical">
      <Navbar user={null} backTo="/dashboard" backLabel="Collection" />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="h-72 skeleton rounded-3xl" />
        <div className="h-8 skeleton w-1/2 rounded-xl" />
        <div className="h-4 skeleton w-1/3 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      </main>
    </div>
  );

  /* ── Error ── */
  if (error || !plant) return (
    <div className="min-h-screen bg-botanical flex items-center justify-center">
      <div className="card text-center px-8 py-12 max-w-sm">
        <div className="text-5xl mb-4">🍂</div>
        <h2 className="font-display text-xl text-primary mb-2">Plant not found</h2>
        <p className="text-muted text-sm mb-6">{error || 'This plant does not exist in your collection.'}</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">Back to Garden</button>
      </div>
    </div>
  );

  const pct = Math.round(plant.confidence * 100);
  const careTips = plant.care_tips || {};
  const careEntries = Object.entries(CARE_ICONS).filter(([key]) => careTips[key]);
  const filteredCare = carTab ? careEntries.filter(([k]) => k === carTab) : careEntries;

  return (
    <div className="min-h-screen bg-botanical">
      <Navbar user={user} backTo="/dashboard" backLabel="My Collection" />

      {/* Lightbox */}
      {lightbox && plant.image_url && (
        <Lightbox src={plant.image_url} alt={plant.plant_name} onClose={() => setLightbox(false)} />
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ══ Hero Image Card ══ */}
        <div className="card overflow-hidden" style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>

          {/* Image */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
            {plant.image_url ? (
              <>
                <img
                  src={plant.image_url}
                  alt={plant.plant_name}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 hover:scale-[1.02]"
                  onClick={() => setLightbox(true)}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Zoom hint */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px]
                                px-2.5 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  Tap to zoom
                </div>

                {/* Bottom name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Identified Plant</p>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                    {plant.plant_name}
                  </h1>
                  {plant.scientific && (
                    <p className="text-white/75 italic text-sm mt-1 drop-shadow">{plant.scientific}</p>
                  )}
                </div>
              </>
            ) : (
              /* No image placeholder */
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-subtle">
                <span className="text-6xl opacity-30">🌿</span>
                <p className="text-muted text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="px-5 py-3.5 flex items-center gap-2 flex-wrap border-t border-theme">
            {/* Favourite */}
            <button
              onClick={handleFav}
              disabled={togglingFav}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                plant.is_favorite
                  ? 'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
                  : 'border-theme text-muted hover:text-yellow-500 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              } ${togglingFav ? 'opacity-60' : ''}`}
            >
              <HeartIcon filled={plant.is_favorite} />
              {plant.is_favorite ? 'Saved' : 'Save'}
            </button>

            {/* Share */}
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                         border border-theme text-muted hover:text-primary hover:bg-subtle transition-all">
              {copied ? <CheckIcon /> : <ShareIcon />}
              {copied ? 'Copied!' : 'Share'}
            </button>

            {/* Download image */}
            {plant.image_url && (
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                           border border-theme text-muted hover:text-primary hover:bg-subtle transition-all">
                <DownloadIcon />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Detect similar */}
            <button onClick={() => router.push('/detect')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                         border border-theme text-muted hover:text-primary hover:bg-subtle transition-all">
              <CameraIcon />
              <span className="hidden sm:inline">Identify Another</span>
            </button>

            {/* Delete — pushed to right */}
            <button onClick={handleDelete} disabled={deleting}
              className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                ${confirmDel
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'border-theme text-faint hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
            >
              <TrashIcon />
              {deleting ? 'Deleting…' : confirmDel ? 'Confirm delete?' : ''}
            </button>
          </div>
        </div>

        {/* ══ Stats Grid ══ */}
        <section style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both' }}>
          <h2 className="font-display text-xl font-semibold text-primary mb-3">Detection Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill icon="🎯" label="Confidence" value={`${pct}%`} />
            <StatPill icon="🔬" label="Family"     value={plant.family || '—'} />
            <StatPill icon="🗓" label="Date"        value={new Date(plant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            <StatPill icon="⏰" label="Time"        value={fmtTime(plant.created_at)} />
          </div>

          {/* Full confidence bar */}
          <div className="card px-5 py-4 mt-3">
            <ConfidenceBar value={plant.confidence} size="lg" showLabel />
            <p className="text-xs text-muted mt-2">
              {pct >= 80
                ? '✅ High confidence — this identification is very likely correct.'
                : pct >= 55
                ? '⚡ Good match — identification is probable, compare with alternatives below.'
                : '⚠️ Low confidence — consider retaking the photo with better focus and lighting.'}
            </p>
          </div>
        </section>

        {/* ══ Scientific Info ══ */}
        {(plant.scientific || plant.family) && (
          <section className="card px-5 py-5 space-y-4" style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s both' }}>
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <InfoIcon /> Scientific Classification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TimelineItem icon="🌿" label="Common Name"      value={plant.plant_name} />
              {plant.scientific && <TimelineItem icon="🔬" label="Scientific Name" value={plant.scientific} />}
              {plant.family    && <TimelineItem icon="🧬" label="Plant Family"    value={plant.family} />}
              <TimelineItem icon="📅" label="Identified"       value={fmt(plant.created_at)} />
            </div>
          </section>
        )}

        {/* ══ Alternatives ══ */}
        {plant.alternatives?.length > 0 && (
          <section style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s both' }}>
            <h2 className="font-display text-xl font-semibold text-primary mb-3">
              Other Possible Matches
            </h2>
            <div className="card overflow-hidden divide-y divide-theme">
              {plant.alternatives.map((alt, i) => {
                const altPct = Math.round(alt.confidence * 100);
                const color  = altPct >= 60 ? 'text-green-600 dark:text-green-400'
                             : altPct >= 40 ? 'text-amber-500 dark:text-amber-400'
                             :                'text-red-500 dark:text-red-400';
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-subtle transition-colors">
                    <div className="w-7 h-7 rounded-xl bg-subtle border border-theme text-xs font-bold text-muted
                                    flex items-center justify-center flex-shrink-0">
                      {i + 2}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{alt.name}</p>
                      {alt.scientific && (
                        <p className="text-xs italic text-muted truncate">{alt.scientific}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-sm font-bold font-mono ${color}`}>{altPct}%</p>
                      <div className="w-16 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--bd-light)' }}>
                        <div className={`h-full rounded-full bar-fill ${
                          altPct >= 60 ? 'bg-green-500' : altPct >= 40 ? 'bg-amber-400' : 'bg-red-400'
                        }`} style={{ width: `${altPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ Care Guide ══ */}
        {careEntries.length > 0 && (
          <section style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-display text-xl font-semibold text-primary">Care Guide</h2>
              {/* Filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setCarTab(null)}
                  className={`chip text-[11px] py-1 px-2.5 ${!carTab ? 'chip-active' : ''}`}>
                  All
                </button>
                {careEntries.map(([key, { icon, label }]) => (
                  <button key={key}
                    onClick={() => setCarTab(carTab === key ? null : key)}
                    className={`chip text-[11px] py-1 px-2.5 gap-1 ${carTab === key ? 'chip-active' : ''}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden divide-y divide-theme">
              {filteredCare.map(([key, { icon, label }]) => (
                <div key={key} className="px-5 py-4 hover:bg-subtle transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl forest-gradient flex items-center justify-center
                                    text-xl flex-shrink-0 shadow-sm"
                         style={{ boxShadow: 'var(--sh-forest)' }}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-1">{label}</p>
                      <p className="text-sm text-primary leading-relaxed">{careTips[key]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ User Notes ══ */}
        <section style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.26s both' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold text-primary">My Notes</h2>
            {!editingNotes && (
              <button onClick={() => setEditingNotes(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted
                           border border-theme rounded-xl px-3 py-1.5 hover:bg-subtle hover:text-primary transition-all">
                <EditIcon />
                {plant.user_notes ? 'Edit' : 'Add note'}
              </button>
            )}
          </div>

          <div className="card px-5 py-5">
            {editingNotes ? (
              <div className="space-y-3" style={{ animation: 'slideUp 0.25s ease both' }}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Write anything about this plant — where you found it, observations, reminders…"
                  rows={5}
                  className="input-field resize-none text-sm leading-relaxed"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveNote} disabled={savingNote} className="btn-primary text-sm py-2.5 gap-2">
                    {savingNote ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                               style={{ animation: 'spin 0.7s linear infinite' }} />Saving…</>
                    ) : (
                      <><CheckIcon />Save Note</>
                    )}
                  </button>
                  <button onClick={() => { setEditingNotes(false); setNoteText(plant.user_notes || ''); }}
                    className="btn-secondary text-sm py-2.5">
                    Cancel
                  </button>
                </div>
              </div>
            ) : plant.user_notes ? (
              <div>
                <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{plant.user_notes}</p>
                <p className="text-xs text-faint mt-3">Last updated: {fmt(plant.created_at)}</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2 opacity-40">📝</div>
                <p className="text-sm text-muted mb-3">No notes yet</p>
                <button onClick={() => setEditingNotes(true)}
                  className="text-xs text-forest-600 dark:text-forest-400 underline underline-offset-2 hover:opacity-80 transition-opacity">
                  Add a note about this plant
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ Quick Actions Footer ══ */}
        <section className="grid grid-cols-2 gap-3 pb-6"
          style={{ animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary text-sm">
            ← Back to Collection
          </button>
          <button onClick={() => router.push('/detect')} className="btn-primary text-sm">
            <CameraIcon /> Identify Another
          </button>
        </section>

      </main>
    </div>
  );
}
