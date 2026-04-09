/**
 * /app/dashboard/page.jsx  v4
 * Premium dashboard — inspectable collection, modal detail view,
 * emerald+gold palette, animated stats, real-time updates.
 */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getPlantsByUser } from '@/lib/savePlant';
import Navbar from '@/components/Navbar';
import PlantCard from '@/components/PlantCard';
import PlantDetailModal from '@/components/PlantDetailModal';

/* ── Icons ── */
const CamIcon    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const SearchIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const RefreshIcon= () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>;

/* ── Skeleton ── */
const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="h-40 skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton w-3/4" /><div className="h-3 skeleton w-1/2" />
      <div className="h-2 skeleton w-full" /><div className="h-3 skeleton w-1/3" />
    </div>
  </div>
);

/* ── Stat tile ── */
const StatTile = ({ emoji, value, label, sub, delay = 0, gold = false }) => (
  <div className="stat-tile" style={{ animation:`slideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}>
    {gold && <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[20px]" style={{ background:'var(--grad-gold)' }} />}
    <div className="text-2xl mb-2" style={{ animation:`floatA ${4+delay/500}s ease-in-out infinite`, animationDelay:`${delay}ms` }}>
      {emoji}
    </div>
    <div className="font-display text-2xl font-bold text-primary leading-none">{value}</div>
    <div className="text-xs text-muted mt-1">{label}</div>
    {sub && <div className="text-[10px] text-faint mt-0.5">{sub}</div>}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser]         = useState(null);
  const [plants, setPlants]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [inspecting, setInspecting] = useState(null); // plant to show in modal

  const [search, setSearch]     = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy]     = useState('newest');

  /* ── Load ── */
  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    const { data: { user: u }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !u) { router.replace('/login'); return; }
    setUser(u);
    const { data, error: pErr } = await getPlantsByUser(u.id);
    if (pErr) setError('Could not load your collection.');
    else setPlants(data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e) => {
      if (e === 'SIGNED_OUT') router.replace('/login');
    });
    return () => subscription.unsubscribe();
  }, [loadData, router]);

  /* ── Real-time ── */
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel('plants-rt')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'plants', filter:`user_id=eq.${user.id}` },
        (p) => setPlants(prev => [p.new, ...prev]))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = [...plants];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.plant_name?.toLowerCase().includes(q) ||
        p.scientific?.toLowerCase().includes(q) ||
        p.family?.toLowerCase().includes(q) ||
        p.user_notes?.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'favorites') list = list.filter(p => p.is_favorite);
    switch (sortBy) {
      case 'oldest':     list.sort((a,b) => new Date(a.created_at)-new Date(b.created_at)); break;
      case 'confidence': list.sort((a,b) => b.confidence-a.confidence); break;
      case 'az':         list.sort((a,b) => a.plant_name.localeCompare(b.plant_name)); break;
    }
    return list;
  }, [plants, search, activeTab, sortBy]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total  = plants.length;
    const favs   = plants.filter(p => p.is_favorite).length;
    const hi     = plants.filter(p => p.confidence >= 0.8).length;
    const avg    = total ? Math.round(plants.reduce((s,p)=>s+p.confidence,0)/total*100) : 0;
    const freq   = {};
    plants.forEach(p => { if (p.family) freq[p.family]=(freq[p.family]||0)+1; });
    const topFam = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';
    return { total, favs, hi, avg, topFam };
  }, [plants]);

  /* ── Plant update callback (from modal) ── */
  const handleUpdate = useCallback((updated) => {
    setPlants(prev => prev.map(p => p.id === updated.id ? updated : p));
    setInspecting(updated);
  }, []);

  const handleDelete = useCallback((id) => {
    setPlants(prev => prev.filter(p => p.id !== id));
    if (inspecting?.id === id) setInspecting(null);
  }, [inspecting]);

  return (
    <div className="min-h-screen bg-botanical">
      <Navbar user={user} />

      {/* ══ MODAL ══ */}
      {inspecting && (
        <PlantDetailModal
          plant={inspecting}
          onClose={() => setInspecting(null)}
          onUpdate={handleUpdate}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero ── */}
        <section style={{ animation:'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              {user && (
                <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Welcome back, {user.email?.split('@')[0]}
                </p>
              )}
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-primary leading-none">
                Your Garden
              </h1>
              <p className="text-muted text-sm mt-2 flex items-center gap-1.5">
                {loading ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-muted border-t-transparent" style={{animation:'spin 0.7s linear infinite'}} /> Loading…</>
                ) : (
                  <>{stats.total} plant{stats.total!==1?'s':''} identified · click any card to inspect</>
                )}
              </p>
            </div>
            <button onClick={() => router.push('/detect')}
              className="btn-primary sm:w-auto px-7 text-sm gap-2 flex-shrink-0"
              style={{ boxShadow:'var(--sh-emerald-lg)' }}>
              <CamIcon /> Identify New Plant
            </button>
          </div>
        </section>

        {/* ── Stats ── */}
        {!loading && stats.total > 0 && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile emoji="🌿" value={stats.total}          label="Plants Found"     delay={0} />
            <StatTile emoji="❤️"  value={stats.favs}           label="Favourites"       delay={90} gold />
            <StatTile emoji="🎯" value={`${stats.avg}%`}      label="Avg Confidence"   delay={180} />
            <StatTile emoji="🏆" value={stats.hi}             label="High Confidence"  sub="≥ 80%" delay={270} />
          </section>
        )}

        {/* ── Tabs + Search ── */}
        {!loading && stats.total > 0 && (
          <section className="space-y-3" style={{ animation:'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s both' }}>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[['all','All Plants'],['favorites','Favourites ❤️']].map(([t,l]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`chip flex-shrink-0 transition-all ${activeTab===t?'chip-active':''}`}>
                  {l}
                  <span className="ml-1 text-[10px] font-mono opacity-60">
                    {t==='all'?plants.length:stats.favs}
                  </span>
                </button>
              ))}
              <div className="ml-auto flex-shrink-0">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="input-field text-xs py-2.5 cursor-pointer" style={{ minWidth:'130px' }}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="confidence">By confidence</option>
                  <option value="az">A → Z</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none">
                <SearchIcon />
              </span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search plants, families, or your notes…"
                className="input-field pl-11 text-sm py-3" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-faint hover:text-primary text-xl leading-none transition-colors">
                  ×
                </button>
              )}
            </div>
          </section>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm border"
            style={{ background:'rgba(200,50,50,0.06)', borderColor:'rgba(200,50,50,0.18)', color:'#a02020',
              animation:'slideUp 0.3s ease both' }}>
            <span>⚠️</span><span className="flex-1">{error}</span>
            <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2">
              <RefreshIcon />Retry
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        <section>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length:6},(_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-20 px-8">
              <div className="text-7xl mb-5 float-b">{search?'🔍':activeTab==='favorites'?'❤️':'🌱'}</div>
              <h3 className="font-display text-2xl text-primary mb-2">
                {search?'No plants match':activeTab==='favorites'?'No favourites yet':'Your garden is empty'}
              </h3>
              <p className="text-muted text-sm mb-7 max-w-xs mx-auto leading-relaxed">
                {search?`Nothing found for "${search}"`
                  :activeTab==='favorites'?'Tap the heart on any plant to favourite it'
                  :'Point your camera at any plant to start your collection'}
              </p>
              {search||activeTab!=='all' ? (
                <button onClick={() => { setSearch(''); setActiveTab('all'); }}
                  className="btn-secondary inline-flex w-auto px-6 mx-auto text-sm">Clear filters</button>
              ) : (
                <button onClick={() => router.push('/detect')}
                  className="btn-primary inline-flex w-auto px-7 mx-auto">
                  <CamIcon />Identify My First Plant
                </button>
              )}
            </div>
          ) : (
            <>
              {(search || activeTab !== 'all') && (
                <p className="text-xs text-muted mb-3">
                  Showing {filtered.length} of {plants.length} plants
                  <button onClick={()=>{setSearch('');setActiveTab('all');}}
                    className="ml-2 text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80">
                    Clear
                  </button>
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((plant, i) => (
                  <div key={plant.id}
                    style={{ animation:`slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both`, animationDelay:`${Math.min(i,8)*55}ms` }}>
                    <PlantCard
                      plant={plant}
                      onDelete={handleDelete}
                      onInspect={setInspecting}
                      onUpdate={handleUpdate}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </main>

      <footer className="text-center py-8 text-xs text-faint border-t border-theme mt-8">
        <span className="opacity-50">Botanica v4 · PlantNet AI · Supabase · Next.js 14</span>
      </footer>
    </div>
  );
}
