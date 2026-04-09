/**
 * /components/ConfidenceBar.jsx  v4 — premium colour-coded bar.
 */
'use client';

export default function ConfidenceBar({ value, showLabel = true, size = 'md' }) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));

  const config =
    pct >= 80 ? { fill:'bg-emerald-500', badge:'badge badge-emerald', label:'High confidence'  } :
    pct >= 55 ? { fill:'bg-amber-400',   badge:'badge badge-gold',    label:'Good match'        } :
    pct >= 35 ? { fill:'bg-orange-400',  badge:'badge badge-gold',    label:'Possible match'    } :
                { fill:'bg-red-400',     badge:'badge badge-red',     label:'Low confidence'    };

  const h = size==='sm'?'h-1.5':size==='lg'?'h-3':'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className={config.badge}>{config.label}</span>
          <span className="text-xs font-bold font-mono text-primary">{pct}%</span>
        </div>
      )}
      <div className={`${h} w-full rounded-full overflow-hidden`} style={{ background:'var(--bd-light)' }}>
        <div className={`h-full rounded-full bar-fill ${config.fill}`} style={{ width:`${pct}%` }} />
      </div>
    </div>
  );
}
