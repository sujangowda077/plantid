/**
 * /components/PlantDetailModal.jsx  v4-fixed
 * Premium full-inspect modal — hero zoom, tabs, care guide,
 * gallery-style image viewer, share, edit notes, export.
 *
 * FIXES:
 *  - Line 262: broken ternary  'pct>=55?Good':'Low'  →  pct>=55?'Good':'Low'
 *  - border-1.5 (not a Tailwind class) replaced with border
 *  - float-c / float-b class refs replaced with inline animation
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ConfidenceBar from './ConfidenceBar';
import { CARE_ICONS } from '@/lib/careTips';
import { toggleFavorite, updateNotes } from '@/lib/savePlant';

/* ── Icons ── */
const X     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Heart = ({ f }) => <svg className="w-4 h-4" viewBox="0 0 24 24" fill={f ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const Edit  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const Zoom  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const Copy  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

const fmt     = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

/* ── Confidence colour ── */
const confColor = (pct) =>
  pct >= 80 ? { bg:'rgba(13,92,58,0.10)',   border:'rgba(13,92,58,0.22)',   text:'#0d5c3a', darkText:'#4ade80' } :
  pct >= 55 ? { bg:'rgba(212,168,67,0.10)', border:'rgba(212,168,67,0.22)', text:'#8a6000', darkText:'#d4a843' } :
              { bg:'rgba(200,50,50,0.10)',   border:'rgba(200,50,50,0.20)',  text:'#a02020', darkText:'#e07070' };

export default function PlantDetailModal({ plant: initial, onClose, onUpdate }) {
  const closeRef = useRef(null);

  const [plant,       setPlant]       = useState(initial);
  const [imgError,    setImgError]    = useState(false);
  const [imgZoomed,   setImgZoomed]   = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText,    setNoteText]    = useState(initial.user_notes || '');
  const [savingNote,  setSavingNote]  = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [shareMsg,    setShareMsg]    = useState('');

  /* ── Keyboard & scroll lock ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === 'Escape') { if (imgZoomed) setImgZoomed(false); else onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, imgZoomed]);

  const handleFav = useCallback(async () => {
    if (togglingFav) return;
    setTogglingFav(true);
    const { data } = await toggleFavorite(plant.id, plant.is_favorite);
    if (data) { setPlant(data); onUpdate?.(data); }
    setTogglingFav(false);
  }, [plant, togglingFav, onUpdate]);

  const handleSaveNote = useCallback(async () => {
    setSavingNote(true);
    const { data } = await updateNotes(plant.id, noteText);
    if (data) { setPlant(data); onUpdate?.(data); }
    setSavingNote(false);
    setEditingNote(false);
  }, [plant, noteText, onUpdate]);

  const handleCopy = useCallback(async () => {
    const text = [
      `🌿 ${plant.plant_name}`,
      plant.scientific ? `   Scientific: ${plant.scientific}` : '',
      plant.family     ? `   Family: ${plant.family}` : '',
      `   Confidence: ${Math.round(plant.confidence * 100)}%`,
      `   Identified: ${fmt(plant.created_at)}`,
      plant.user_notes ? `\n📝 Notes: ${plant.user_notes}` : '',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareMsg('Could not access clipboard.');
    }
  }, [plant]);

  const pct      = Math.round((plant.confidence <= 1 ? plant.confidence * 100 : plant.confidence));
  const cc       = confColor(pct);
  const careTips = plant.care_tips || {};
  const careList = Object.entries(CARE_ICONS).filter(([k]) => careTips[k]);

  const TABS = [
    { id:'overview', icon:'🔍', label:'Overview' },
    ...(careList.length > 0            ? [{ id:'care', icon:'🌱', label:'Care Guide' }] : []),
    ...(plant.alternatives?.length > 0 ? [{ id:'alts', icon:'🔬', label:'Matches'    }] : []),
    { id:'notes', icon:'📝', label:'My Notes' },
  ];

  /* ── Full-screen image viewer ── */
  if (imgZoomed && plant.image_url && !imgError) {
    return (
      <div
        className="modal-backdrop flex items-center justify-center p-4"
        onClick={() => setImgZoomed(false)}
      >
        <div
          style={{ animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
          className="relative max-w-4xl w-full max-h-[90vh] rounded-3xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <img
            src={plant.image_url}
            alt={plant.plant_name}
            className="w-full h-full object-contain"
            style={{ maxHeight:'85vh' }}
          />
          <button
            onClick={() => setImgZoomed(false)}
            className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-black/60 text-white
                       flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition-all"
          >
            <X />
          </button>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="px-3 py-1.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
              {plant.plant_name} · Click outside or press Esc to close
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-5"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={plant.plant_name}
        className="relative w-full sm:max-w-[520px] max-h-[96vh] sm:max-h-[88vh] flex flex-col
                   rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
        style={{
          background:  'var(--bg-surface)',
          border:      '1px solid var(--bd-light)',
          boxShadow:   'var(--sh-modal)',
          animation:   'modalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >

        {/* ══ Hero image ══ */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height:240 }}>
          {plant.image_url && !imgError ? (
            <>
              <img
                src={plant.image_url}
                alt={plant.plant_name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in"
                onClick={() => setImgZoomed(true)}
              />
              <div className="absolute inset-0 pointer-events-none" style={{ background:'var(--grad-hero)' }} />
              <button
                onClick={() => setImgZoomed(true)}
                className="absolute top-14 right-3 w-8 h-8 rounded-xl bg-black/40 text-white/80
                           flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-all"
              >
                <Zoom />
              </button>
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-7xl opacity-15"
              style={{ background:'var(--bg-subtle)' }}
            >
              🌿
            </div>
          )}

          {/* Top controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* Fav */}
            <button
              onClick={handleFav}
              disabled={togglingFav}
              aria-label="Toggle favourite"
              className={`w-9 h-9 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all
                ${plant.is_favorite
                  ? 'bg-yellow-400/90 text-yellow-900'
                  : 'bg-black/45 text-white hover:bg-black/65'}`}
              style={plant.is_favorite ? { boxShadow:'var(--sh-gold)' } : {}}
            >
              <Heart f={plant.is_favorite} />
            </button>

            {/* Right: copy + close */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                aria-label="Copy plant info"
                className="w-9 h-9 rounded-2xl bg-black/45 text-white backdrop-blur-sm
                           flex items-center justify-center hover:bg-black/65 transition-all relative"
                title="Copy to clipboard"
              >
                <Copy />
                {copied && (
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full
                                   bg-black/70 text-white text-[10px] whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-2xl bg-black/45 text-white backdrop-blur-sm
                           flex items-center justify-center hover:bg-black/65 transition-all"
              >
                <X />
              </button>
            </div>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pointer-events-none">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display text-[1.6rem] font-bold text-white leading-tight drop-shadow-lg">
                  {plant.plant_name}
                </h2>
                {plant.scientific && (
                  <p className="text-white/65 text-sm italic mt-0.5 drop-shadow">{plant.scientific}</p>
                )}
              </div>
              {/* Confidence pill */}
              <div
                className="flex-shrink-0 px-3 py-1.5 rounded-2xl backdrop-blur-md text-center"
                style={{ background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.15)' }}
              >
                <p className={`text-xl font-bold leading-none ${
                  pct >= 80 ? 'text-green-400' : pct >= 55 ? 'text-amber-400' : 'text-red-400'
                }`}>{pct}%</p>
                <p className="text-white/50 text-[9px] uppercase tracking-wider mt-0.5">match</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Meta strip ══ */}
        <div className="flex-shrink-0 px-5 pt-3.5 pb-2 border-b border-theme">
          <ConfidenceBar value={plant.confidence} size="md" />
          <div className="flex items-center justify-between mt-2.5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span>🗓</span>
              <span>{fmt(plant.created_at)}</span>
              <span className="text-faint">·</span>
              <span className="text-faint">{fmtTime(plant.created_at)}</span>
            </span>
            {plant.family && (
              <span className="flex items-center gap-1 italic text-faint">
                <span>🔬</span>{plant.family}
              </span>
            )}
          </div>
        </div>

        {/* ══ Tab bar ══ */}
        <div className="flex-shrink-0 flex px-2 pt-1 border-b border-theme overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold
                         border-b-2 transition-all whitespace-nowrap flex-shrink-0 rounded-t-lg mr-0.5 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-subtle'
                  : 'border-transparent text-muted hover:text-primary hover:bg-subtle/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ══ Tab content ══ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="p-5 space-y-4" style={{ animation:'fadeIn 0.25s ease both' }}>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon:'🎯', label:'Confidence', val:`${pct}%`, sub: pct>=80 ? 'High' : pct>=55 ? 'Good' : 'Low' },
                  { icon:'🔬', label:'Family',      val: plant.family || '—' },
                  { icon:'🌿', label:'Common Name', val: plant.plant_name },
                  { icon:'📚', label:'Scientific',  val: plant.scientific || '—' },
                ].map(({ icon, label, val }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-theme px-4 py-3.5 hover:border-theme-mid transition-colors"
                    style={{ background:'var(--bg-subtle)' }}
                  >
                    <p className="text-[9px] uppercase tracking-[0.12em] font-bold text-faint mb-1">{icon} {label}</p>
                    <p className="text-sm font-bold text-primary leading-snug truncate" title={val}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Confidence interpretation */}
              <div
                className="rounded-2xl px-4 py-3.5 text-sm leading-relaxed border"
                style={{ background:cc.bg, borderColor:cc.border, color:cc.text }}
              >
                <p className="font-semibold mb-0.5">
                  {pct >= 80 ? '✅ High Confidence' : pct >= 55 ? '⚡ Good Match' : '⚠️ Low Confidence'}
                </p>
                <p className="text-xs opacity-80">
                  {pct >= 80
                    ? 'This identification is very likely correct. The AI matched with strong certainty.'
                    : pct >= 55
                    ? 'This is probably correct. Consider comparing with the alternative matches below.'
                    : 'Identification is uncertain. Try a photo with better lighting and a clearer view of leaves or flowers.'}
                </p>
              </div>

              {/* Quick care summary if available */}
              {careList.length > 0 && (
                <div
                  className="rounded-2xl border border-theme overflow-hidden"
                  style={{ background:'var(--bg-subtle)' }}
                >
                  <div className="px-4 py-2.5 border-b border-theme flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted">🌱 Quick Care</p>
                    <button
                      onClick={() => setActiveTab('care')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:opacity-80"
                    >
                      Full guide →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-px" style={{ background:'var(--bd-light)' }}>
                    {careList.slice(0, 4).map(([key, { icon, label }]) => (
                      <div key={key} className="px-3.5 py-2.5" style={{ background:'var(--bg-subtle)' }}>
                        <p className="text-[9px] uppercase tracking-wider font-bold text-faint mb-1">{icon} {label}</p>
                        <p className="text-xs text-primary leading-snug line-clamp-2">{careTips[key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note preview */}
              {plant.user_notes && (
                <div
                  className="rounded-2xl border border-theme px-4 py-3.5"
                  style={{ background:'var(--bg-subtle)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted">📝 My Note</p>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:opacity-80"
                    >
                      Edit →
                    </button>
                  </div>
                  <p className="text-xs text-primary leading-relaxed line-clamp-3">{plant.user_notes}</p>
                </div>
              )}

              {/* Identifiers row */}
              <div className="flex flex-wrap gap-1.5">
                <span className="chip text-[11px] py-1 cursor-default">#{plant.id.slice(0, 8)}</span>
                {plant.is_favorite && (
                  <span className="chip chip-active text-[11px] py-1 cursor-default">⭐ Favourite</span>
                )}
                {plant.alternatives?.length > 0 && (
                  <button onClick={() => setActiveTab('alts')} className="chip text-[11px] py-1">
                    +{plant.alternatives.length} alternatives
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── CARE GUIDE ── */}
          {activeTab === 'care' && (
            <div style={{ animation:'fadeIn 0.25s ease both' }}>
              {/* Hero care summary */}
              <div className="px-5 pt-5 pb-3 grid grid-cols-3 gap-2">
                {careList.slice(0, 3).map(([key, { icon, label }]) => (
                  <div key={key} className="stat-tile text-center p-3">
                    <div
                      className="text-2xl mb-1.5"
                      style={{ animation:'float1 4.5s ease-in-out infinite' }}
                    >
                      {icon}
                    </div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted">{label}</p>
                  </div>
                ))}
              </div>
              {/* Full care list */}
              <div className="divide-y" style={{ borderColor:'var(--bd-light)' }}>
                {careList.map(([key, { icon, label }], i) => (
                  <div
                    key={key}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-subtle transition-colors"
                    style={{ animation:`slideLeft 0.35s ease ${i * 0.06}s both` }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background:'var(--grad-emerald)', boxShadow:'var(--sh-emerald)' }}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted mb-0.5">{label}</p>
                      <p className="text-sm text-primary leading-relaxed">{careTips[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALTERNATIVES ── */}
          {activeTab === 'alts' && (
            <div className="p-5 space-y-3" style={{ animation:'fadeIn 0.25s ease both' }}>
              <p className="text-xs text-muted">
                The AI considered these other plants. Confidence drops quickly with rank.
              </p>

              {/* Top result (current) */}
              <div
                className="rounded-2xl border-2 border-emerald-600/30 px-4 py-3.5 flex items-center gap-3"
                style={{ background:'rgba(13,92,58,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background:'var(--grad-emerald)' }}
                >
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{plant.plant_name}</p>
                  {plant.scientific && (
                    <p className="text-xs italic text-muted truncate">{plant.scientific}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{pct}%</p>
                  <p className="text-[10px] text-faint">selected</p>
                </div>
              </div>

              {plant.alternatives?.map((alt, i) => {
                const ap  = Math.round((alt.confidence <= 1 ? alt.confidence * 100 : alt.confidence));
                const col = ap >= 60 ? 'text-emerald-600 dark:text-emerald-400' : ap >= 40 ? 'text-amber-500' : 'text-red-500';
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-theme px-4 py-3.5 hover:border-theme-mid transition-all"
                    style={{ background:'var(--bg-subtle)', animation:`slideLeft 0.35s ease ${i * 0.07}s both` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-xl border border-theme flex items-center justify-center
                                   text-xs font-bold text-muted flex-shrink-0"
                        style={{ background:'var(--bg-surface)' }}
                      >
                        {i + 2}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{alt.name}</p>
                        {alt.scientific && (
                          <p className="text-xs italic text-muted truncate">{alt.scientific}</p>
                        )}
                      </div>
                      <span className={`text-sm font-bold font-mono flex-shrink-0 ${col}`}>{ap}%</span>
                    </div>
                    {/* Mini bar */}
                    <div className="h-1 rounded-full overflow-hidden" style={{ background:'var(--bd-light)' }}>
                      <div
                        className={`h-full rounded-full ${ap>=60?'bg-emerald-500':ap>=40?'bg-amber-400':'bg-red-400'}`}
                        style={{
                          width:`${ap}%`,
                          transform:'scaleX(0)',
                          transformOrigin:'left',
                          animation:`barGrow 0.8s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.1}s both`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── NOTES ── */}
          {activeTab === 'notes' && (
            <div className="p-5" style={{ animation:'fadeIn 0.25s ease both' }}>
              {editingNote ? (
                <div className="space-y-3" style={{ animation:'slideUp 0.25s ease both' }}>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-2">
                    Your Notes
                  </label>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Write anything — where you found it, observations, care reminders, fun facts…"
                    rows={7}
                    className="input-field resize-none text-sm leading-relaxed"
                    autoFocus
                  />
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveNote} disabled={savingNote} className="btn-primary text-sm py-3">
                      {savingNote
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" style={{ animation:'spin 0.7s linear infinite' }} /> Saving…</>
                        : '✓ Save Note'}
                    </button>
                    <button
                      onClick={() => { setEditingNote(false); setNoteText(plant.user_notes || ''); }}
                      className="btn-secondary text-sm py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : plant.user_notes ? (
                <div className="space-y-4">
                  <div
                    className="rounded-2xl border border-theme px-5 py-4"
                    style={{ background:'var(--bg-subtle)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-muted flex items-center gap-1.5">
                        <span>📝</span> My Note
                      </p>
                      <span className="text-[10px] text-faint">{plant.user_notes.length} chars</span>
                    </div>
                    <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{plant.user_notes}</p>
                  </div>
                  <button onClick={() => setEditingNote(true)} className="btn-secondary text-sm py-3 gap-2">
                    <Edit /> Edit Note
                  </button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div
                    className="text-5xl mb-4 inline-block"
                    style={{ animation:'float2 6s ease-in-out infinite' }}
                  >
                    📝
                  </div>
                  <h3 className="font-display text-lg text-primary mb-2">No notes yet</h3>
                  <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
                    Add personal notes — where you found it, care observations, or anything you want to remember.
                  </p>
                  <button
                    onClick={() => setEditingNote(true)}
                    className="btn-primary w-auto px-6 py-3 mx-auto text-sm"
                  >
                    + Write a Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ Footer ══ */}
        <div
          className="flex-shrink-0 flex items-center gap-2.5 px-5 py-4 border-t border-theme"
          style={{ background:'var(--bg-subtle)' }}
        >
          <button onClick={onClose} className="btn-secondary text-sm py-3 flex-1">
            Close
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm py-3 flex-shrink-0 px-3"
            style={{ width:48 }}
            title="Copy details"
          >
            <Copy />
          </button>
          <button
            onClick={handleFav}
            disabled={togglingFav}
            className={`flex-shrink-0 py-3 rounded-2xl border transition-all text-sm flex items-center justify-center ${
              plant.is_favorite
                ? 'bg-yellow-400/90 text-yellow-900 border-yellow-400'
                : 'btn-secondary px-3'
            }`}
            style={{ width:48 }}
          >
            <Heart f={plant.is_favorite} />
          </button>
        </div>

        {shareMsg && (
          <p className="text-xs text-center text-muted pb-2">{shareMsg}</p>
        )}
      </div>
    </div>
  );
}