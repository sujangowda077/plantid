/**
 * /components/PlantCard.jsx  v4
 * Premium card — click anywhere opens detail modal inspector.
 * Gold ring for favourites, animated confidence bar, hover elevation.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import ConfidenceBar from './ConfidenceBar';
import { toggleFavorite, deletePlant, updateNotes } from '@/lib/savePlant';

const HeartIcon = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const ExpandIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);

const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function PlantCard({ plant: initial, onDelete, onInspect, onUpdate }) {
  const [plant, setPlant]           = useState(initial);
  const [imgError, setImgError]     = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimer = useRef(null);

  // Sync if parent updates the plant (e.g. from modal)
  useEffect(() => { setPlant(initial); }, [initial]);

  useEffect(() => {
    if (confirmDelete) {
      deleteTimer.current = setTimeout(() => setConfirmDelete(false), 4000);
    }
    return () => clearTimeout(deleteTimer.current);
  }, [confirmDelete]);

  const handleFav = async (e) => {
    e.stopPropagation();
    if (togglingFav) return;
    setTogglingFav(true);
    const { data } = await toggleFavorite(plant.id, plant.is_favorite);
    if (data) { setPlant(data); onUpdate?.(data); }
    setTogglingFav(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const { error } = await deletePlant(plant.id);
    if (!error) onDelete?.(plant.id);
    else setDeleting(false);
  };

  const pct = Math.round(plant.confidence * 100);

  return (
    <article
      onClick={() => onInspect?.(plant)}
      className={`card card-interactive group overflow-hidden flex flex-col relative
        ${plant.is_favorite ? 'ring-2 ring-yellow-400/50 dark:ring-yellow-500/30' : ''}`}
      style={plant.is_favorite ? { boxShadow: 'var(--sh-card), 0 0 0 2px rgba(212,168,67,0.25)' } : {}}
      aria-label={`Inspect ${plant.plant_name}`}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); onInspect?.(plant); } }}
    >
      {/* Hover indicator */}
      <div className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'var(--grad-emerald)' }} />

      {/* ── Image ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: plant.image_url&&!imgError?'10rem':'4.5rem' }}>
        {plant.image_url && !imgError ? (
          <>
            <img src={plant.image_url} alt={plant.plant_name} onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Confidence badge on image */}
            <div className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-xl text-[11px] font-bold backdrop-blur-sm
              ${pct>=80?'bg-emerald-600/80 text-white':pct>=55?'bg-amber-500/80 text-white':'bg-red-500/80 text-white'}`}>
              {pct}%
            </div>

            {/* Expand hint */}
            <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-xl bg-black/40 text-white/80
                            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all
                            backdrop-blur-sm translate-y-1 group-hover:translate-y-0">
              <ExpandIcon />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20"
            style={{ background:'var(--bg-subtle)' }}>🌿</div>
        )}

        {/* Gold star for favourites */}
        {plant.is_favorite && (
          <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-sm"
            style={{ background:'rgba(212,168,67,0.9)', boxShadow:'var(--sh-gold)' }}>⭐</div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">

        {/* Name + fav */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-primary text-sm leading-snug truncate">{plant.plant_name}</h3>
            {plant.scientific && (
              <p className="text-xs italic text-muted mt-0.5 truncate">{plant.scientific}</p>
            )}
          </div>
          <button onClick={handleFav} disabled={togglingFav} aria-label="Toggle favourite"
            className={`flex-shrink-0 p-1.5 rounded-xl transition-all ${
              plant.is_favorite
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-faint hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            } ${togglingFav ? 'opacity-40' : ''}`}>
            <HeartIcon filled={plant.is_favorite} />
          </button>
        </div>

        {/* Confidence bar */}
        <ConfidenceBar value={plant.confidence} size="sm" showLabel={false} />

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>🗓 {fmt(plant.created_at)}</span>
          {plant.family && (
            <span className="text-faint italic truncate ml-2 max-w-[90px]">{plant.family.split(' ')[0]}</span>
          )}
        </div>

        {/* Note preview */}
        {plant.user_notes && (
          <p className="text-xs text-secondary leading-relaxed line-clamp-2 px-3 py-2 rounded-xl border border-theme"
            style={{ background:'var(--bg-subtle)' }}>
            📝 {plant.user_notes}
          </p>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-1.5 pt-2 border-t border-theme mt-auto" onClick={e => e.stopPropagation()}>
          <button onClick={() => onInspect?.(plant)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                       py-2 rounded-xl border border-theme text-muted hover:text-primary hover:bg-subtle
                       hover:border-theme-mid transition-all">
            <ExpandIcon /> Inspect
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className={`flex items-center justify-center gap-1 text-xs rounded-xl py-2 px-3 border transition-all min-w-[68px] ${
              confirmDelete
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : 'text-muted border-theme hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}>
            <TrashIcon />
            {deleting ? '…' : confirmDelete ? 'Sure?' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  );
}
