/**
 * /components/CareTipsCard.jsx  v3
 * Fixed: @/ import for careTips lib.
 * Added: expandable sections, dark-mode aware icon colours.
 */
'use client';

import { useState } from 'react';
import { CARE_ICONS } from '@/lib/careTips';

export default function CareTipsCard({ tips, plantName }) {
  const [open, setOpen] = useState(true);
  if (!tips) return null;

  const entries = Object.entries(CARE_ICONS).filter(([key]) => tips[key]);

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
                <p className="text-sm text-primary leading-relaxed">{tips[key]}</p>
              </div>
            </div>
          ))}

          {/* Quick reference footer */}
          <div className="px-5 py-3 bg-subtle flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-faint font-semibold">Quick reference:</span>
            {entries.slice(0, 3).map(([key, { icon }]) => (
              <span key={key} className="chip text-[10px] py-0.5 px-2 gap-1">
                {icon} <span className="truncate max-w-[80px]">{tips[key]?.split('.')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
