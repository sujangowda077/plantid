/**
 * /components/CareTipsCard.jsx  v3
 * Fixed: @/ import for careTips lib.
 * Added: expandable sections, dark-mode aware icon colours.
 */
'use client';

import { useMemo, useState } from 'react';
import { diagnoseDisease, generateCareTips } from '@/lib/plantIntelligence';

const CARE_ICONS = {
  water: { icon: '💧', label: 'Watering' },
  sunlight: { icon: '☀️', label: 'Sunlight' },
  soil: { icon: '🪴', label: 'Soil' },
  humidity: { icon: '🌫️', label: 'Humidity' },
  temperature: { icon: '🌡️', label: 'Temperature' },
  fertilizer: { icon: '🧪', label: 'Fertilizer' },
  repotting: { icon: '📦', label: 'Repotting' },
  pruning: { icon: '✂️', label: 'Pruning' }
};

export default function CareTipsCard({ tips, plantName }) {
  const [open, setOpen] = useState(true);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const computedTips = useMemo(() => {
    const generated = generateCareTips(plantName);
    if (tips?.care) return tips;
    if (tips && (tips.water || tips.sunlight || tips.soil || tips.humidity)) {
      return {
        ...generated,
        care: {
          ...generated.care,
          water: tips.water || generated.care.water,
          sunlight: tips.sunlight || generated.care.sunlight,
          soil: tips.soil || generated.care.soil,
          humidity: tips.humidity || generated.care.humidity
        }
      };
    }
    return generated;
  }, [tips, plantName]);

  if (!computedTips) return null;

  const entries = Object.entries(CARE_ICONS).filter(([key]) => computedTips.care?.[key]);

  const runDiagnosis = () => {
    const result = diagnoseDisease(plantName, symptomsInput);
    setDiagnosisResult(result.matches[0] || null);
  };

  const handoffToChat = () => {
    window.dispatchEvent(
      new CustomEvent('open-plant-chatbot', {
        detail: {
          plantName,
          prefill: symptomsInput || 'My plant has yellow leaves and brown spots. Can you diagnose it?'
        }
      })
    );
  };

  return (
    <div className="card overflow-hidden" style={{ animation: 'slideUp 0.45s ease 0.3s both' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full grad-emerald px-5 py-3.5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌱</span>
          <div>
            <p className="text-white font-semibold text-sm">Care Guide</p>
            {plantName && <p className="text-forest-200 text-xs italic mt-0.5 truncate max-w-[200px]">{plantName}</p>}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-forest-200 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Tips */}
      {open && (
        <div className="bg-surface divide-y" style={{ borderColor: 'var(--bd-light)' }}>
          {entries.map(([key, { icon, label }]) => (
            <div key={key} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-subtle transition-colors">
              <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-0.5">{label}</p>
                <p className="text-sm text-primary leading-relaxed">{computedTips.care[key]}</p>
              </div>
            </div>
          ))}

          {!!computedTips.quickTips?.length && (
            <div className="px-5 py-3.5 bg-subtle border-t border-theme">
              <p className="text-[10px] uppercase tracking-wider text-faint font-semibold mb-2">Quick tips</p>
              <ul className="space-y-1.5 text-sm text-secondary list-disc pl-4">
                {computedTips.quickTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="px-5 py-4 border-t border-theme space-y-3 bg-surface">
            <p className="text-sm font-semibold text-primary">Quick Diagnosis 🔬</p>
            <textarea
              value={symptomsInput}
              onChange={(event) => setSymptomsInput(event.target.value)}
              className="input-field min-h-[84px] text-sm"
              placeholder="Describe symptoms..."
            />
            <button onClick={runDiagnosis} className="btn-primary text-sm">
              Diagnose 🔬
            </button>

            {diagnosisResult && (
              <div className="card p-3 space-y-2 border border-theme">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-primary text-sm">{diagnosisResult.name}</p>
                  <span
                    className={`badge ${
                      diagnosisResult.severity === 'severe'
                        ? 'badge-red'
                        : diagnosisResult.severity === 'moderate'
                        ? 'badge-gold'
                        : 'badge-emerald'
                    }`}
                  >
                    {diagnosisResult.severity}
                  </span>
                </div>
                <p className="text-xs text-muted">{diagnosisResult.description}</p>
                <ol className="list-decimal pl-4 text-xs text-secondary space-y-1">
                  {diagnosisResult.treatment.slice(0, 2).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <button onClick={handoffToChat} className="btn-secondary text-xs">
                  View full details in chat →
                </button>
              </div>
            )}
          </div>

          {/* Quick reference footer */}
          <div className="px-5 py-3 bg-subtle flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-faint font-semibold">Quick reference:</span>
            {entries.slice(0, 3).map(([key, { icon }]) => (
              <span key={key} className="chip text-[10px] py-0.5 px-2 gap-1">
                {icon} <span className="truncate max-w-[80px]">{computedTips.care[key]?.split('.')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
