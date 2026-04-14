/**
 * /app/login/page.jsx  v4
 * Premium login screen — animated botanical illustration,
 * emerald + gold palette, floating particles, split layout.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useDarkMode } from '@/hooks/useDarkMode';

/* ── Inline Spinner ── */
const Spin = ({ c = 'white' }) => (
  <span className={`inline-block w-4 h-4 rounded-full border-2 flex-shrink-0
    ${c === 'white' ? 'border-white border-t-transparent' : 'border-current border-t-transparent'}`}
    style={{ animation: 'spin 0.72s linear infinite' }} />
);

/* ── Animated SVG botanical illustration ── */
const BotanicalIllustration = () => (
  <svg viewBox="0 0 420 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[360px]">
    {/* Main stem */}
    <path d="M210 490 C210 400 200 320 215 200" stroke="rgba(29,160,102,0.35)" strokeWidth="3" strokeLinecap="round"
      style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: 'drawLine 2.2s ease 0.3s forwards' }} />
    {/* Left branch */}
    <path d="M213 300 C180 270 140 265 100 240" stroke="rgba(29,160,102,0.28)" strokeWidth="2.5" strokeLinecap="round"
      style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'drawLine 1.4s ease 0.9s forwards' }} />
    {/* Right branch */}
    <path d="M214 260 C248 235 285 228 325 210" stroke="rgba(29,160,102,0.28)" strokeWidth="2.5" strokeLinecap="round"
      style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'drawLine 1.4s ease 1.1s forwards' }} />
    {/* Small branch left */}
    <path d="M212 380 C188 360 165 358 145 345" stroke="rgba(29,160,102,0.22)" strokeWidth="2" strokeLinecap="round"
      style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'drawLine 1s ease 1.4s forwards' }} />

    {/* Large leaf left */}
    <ellipse cx="85" cy="228" rx="52" ry="28" fill="rgba(13,92,58,0.18)" stroke="rgba(13,92,58,0.3)" strokeWidth="1.2"
      transform="rotate(-25 85 228)"
      style={{ opacity:0, animation: 'fadeIn 0.6s ease 1.3s forwards' }} />
    <path d="M85 228 L103 215" stroke="rgba(13,92,58,0.25)" strokeWidth="1" strokeLinecap="round"
      style={{ opacity:0, animation: 'fadeIn 0.4s ease 1.6s forwards' }} />

    {/* Large leaf right */}
    <ellipse cx="330" cy="200" rx="54" ry="26" fill="rgba(13,92,58,0.15)" stroke="rgba(13,92,58,0.28)" strokeWidth="1.2"
      transform="rotate(20 330 200)"
      style={{ opacity:0, animation: 'fadeIn 0.6s ease 1.5s forwards' }} />

    {/* Medium leaf lower left */}
    <ellipse cx="142" cy="338" rx="34" ry="18" fill="rgba(13,92,58,0.14)" stroke="rgba(13,92,58,0.24)" strokeWidth="1.2"
      transform="rotate(-15 142 338)"
      style={{ opacity:0, animation: 'fadeIn 0.5s ease 1.8s forwards' }} />

    {/* Flower at top */}
    {[0,60,120,180,240,300].map((deg, i) => (
      <ellipse key={i} cx={210 + 22*Math.cos(deg*Math.PI/180)} cy={185 + 22*Math.sin(deg*Math.PI/180)}
        rx="12" ry="8" fill="rgba(212,168,67,0.55)" stroke="rgba(212,168,67,0.4)" strokeWidth="1"
        transform={`rotate(${deg} ${210 + 22*Math.cos(deg*Math.PI/180)} ${185 + 22*Math.sin(deg*Math.PI/180)})`}
        style={{ opacity:0, animation: `bounceIn 0.5s ease ${1.9 + i*0.08}s forwards` }} />
    ))}
    {/* Flower centre */}
    <circle cx="210" cy="185" r="10" fill="rgba(240,202,110,0.8)" stroke="rgba(212,168,67,0.5)" strokeWidth="1.5"
      style={{ opacity:0, animation: 'bounceIn 0.5s ease 2.4s forwards' }} />

    {/* Small flower right lower */}
    {[0,72,144,216,288].map((deg, i) => (
      <ellipse key={i} cx={318 + 14*Math.cos(deg*Math.PI/180)} cy={385 + 14*Math.sin(deg*Math.PI/180)}
        rx="8" ry="5" fill="rgba(29,160,102,0.45)" stroke="rgba(29,160,102,0.35)" strokeWidth="0.8"
        transform={`rotate(${deg} ${318 + 14*Math.cos(deg*Math.PI/180)} ${385 + 14*Math.sin(deg*Math.PI/180)})`}
        style={{ opacity:0, animation: `bounceIn 0.45s ease ${2.2 + i*0.06}s forwards` }} />
    ))}
    <circle cx="318" cy="385" r="7" fill="rgba(240,202,110,0.7)"
      style={{ opacity:0, animation: 'bounceIn 0.4s ease 2.55s forwards' }} />

    {/* Floating dots / pollen */}
    {[[155, 140, 3],[280, 160, 2],[120, 320, 2.5],[350, 280, 2],[180, 430, 3],[340, 440, 2]].map(([x,y,r],i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="rgba(212,168,67,0.5)"
        style={{ opacity:0, animation: `fadeIn 0.5s ease ${2.6 + i*0.15}s forwards` }} />
    ))}
  </svg>
);

/* ── Floating particle ── */
const Particle = ({ style, emoji }) => (
  <span className="absolute pointer-events-none select-none text-lg opacity-0"
    style={{ animation: `particleDrift ${6 + Math.random()*8}s linear infinite`, ...style }}>
    {emoji}
  </span>
);

/* ── Sun / Moon icons ── */
const SunIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
const MoonIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggle, mounted } = useDarkMode();

  const [mode, setMode]           = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [focused, setFocused]     = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  const handleEmail = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess('Account created! Check your email to confirm before signing in.');
        setLoading(false); return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setGLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.'); setGLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-botanical overflow-hidden relative">

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 morph-blob opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #0d5c3a, #1da066)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 morph-blob opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #d4a843, #0d5c3a)', animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 morph-blob opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #1da066, transparent)', animationDelay: '5s' }} />
      </div>

      {/* ── Floating particles ── */}
      {[
        { top:'8%',  left:'12%', delay:'0s'   }, { top:'22%', right:'8%',  delay:'1.5s' },
        { top:'55%', left:'5%',  delay:'2.8s' }, { top:'72%', right:'15%', delay:'0.8s' },
        { top:'88%', left:'28%', delay:'3.5s' }, { top:'40%', right:'3%',  delay:'2s'   },
      ].map((s, i) => (
        <Particle key={i} emoji={i%3===0?'🍃':i%3===1?'✦':'·'}
          style={{ ...s, fontSize: i%2===0?'1.1rem':'0.8rem', animationDelay: s.delay }} />
      ))}

      {/* ── Dark mode toggle ── */}
      {mounted && (
        <button onClick={toggle}
          className="fixed top-5 right-5 z-20 w-10 h-10 rounded-2xl glass-strong
                     flex items-center justify-center text-muted hover:text-primary transition-all"
          aria-label="Toggle theme">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      )}

      {/* ════════════════ SPLIT LAYOUT ════════════════ */}
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left panel — illustration ── */}
        <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col items-center justify-center p-12"
          style={{ background: 'linear-gradient(160deg, rgba(13,92,58,0.08) 0%, rgba(13,92,58,0.03) 100%)' }}>

          {/* Vertical brand strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: 'var(--grad-emerald)', opacity: 0.4 }} />

          <div className="max-w-[380px] w-full space-y-8" style={{ animation: 'fadeIn 0.8s ease both' }}>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'var(--grad-emerald)', boxShadow: 'var(--sh-emerald-lg)' }}>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-5 9"/>
                </svg>
                <div className="absolute inset-0 rounded-2xl pulse-glow" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-primary leading-none">Botanica</h1>
                <p className="text-xs text-muted font-medium tracking-wider uppercase mt-0.5">Plant Intelligence</p>
              </div>
            </div>

            {/* Illustration */}
            <div className="float-a" style={{ animationDuration: '6s' }}>
              <BotanicalIllustration />
            </div>

            {/* Tagline */}
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-primary leading-snug">
                Identify any plant<br />
                <em className="text-emerald-600 dark:text-emerald-400">instantly</em> with AI
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Point your camera at any plant and get instant identification with care guides, confidence scores, and your personal botanical collection.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['🌿 PlantNet AI', '🔒 Private & Secure', '📱 Mobile Ready', '🌙 Dark Mode'].map(f => (
                <span key={f} className="chip text-xs py-1 px-3 cursor-default">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8"
            style={{ animation: 'slideDown 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--grad-emerald)', boxShadow: 'var(--sh-emerald)' }}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-5 9"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary">Botanica</h1>
          </div>

          {/* Form card */}
          <div className="w-full max-w-[420px]"
            style={{ animation: 'slideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>

            {/* Headline */}
            <div className="mb-7">
              <h2 className="font-display text-[2rem] font-bold text-primary leading-tight">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-muted text-sm mt-1">
                {mode === 'login'
                  ? 'Sign in to your botanical collection'
                  : 'Start identifying plants for free'}
              </p>
            </div>

            {/* Mode toggle pills */}
            <div className="flex gap-2 mb-6 p-1 rounded-2xl border border-theme bg-subtle">
              {[['login','Sign In'],['signup','Sign Up']].map(([m,l]) => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-250 ${
                    mode === m
                      ? 'text-white shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                  style={mode === m ? { background: 'var(--grad-emerald)', boxShadow: 'var(--sh-emerald)' } : {}}>
                  {l}
                </button>
              ))}
            </div>

            {/* Error / success */}
            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm border"
                style={{ background:'rgba(200,50,50,0.06)', borderColor:'rgba(200,50,50,0.2)', color:'#c03030',
                  animation: 'slideDown 0.3s ease both' }}>
                <span className="flex-shrink-0 text-base mt-0.5">⚠️</span>
                <span className="flex-1 leading-snug">{error}</span>
                <button onClick={() => setError('')} className="flex-shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity">×</button>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm border"
                style={{ background:'rgba(13,92,58,0.07)', borderColor:'rgba(13,92,58,0.2)', color:'var(--emerald-mid)',
                  animation: 'slideDown 0.3s ease both' }}>
                <span className="flex-shrink-0 text-base mt-0.5">✅</span>
                <span className="flex-1 leading-snug">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmail} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="you@example.com" required autoComplete="email"
                    className="input-field pl-11" />
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-all duration-200
                    ${focused === 'email' ? 'scale-110' : 'opacity-50'}`}>✉️</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    required minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="input-field pl-11 pr-12" />
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-all duration-200
                    ${focused === 'pass' ? 'scale-110' : 'opacity-50'}`}>🔐</span>
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base transition-all hover:scale-110">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button type="submit" disabled={loading || gLoading} className="btn-primary text-base py-4">
                  {loading
                    ? <><Spin /><span>{mode === 'signup' ? 'Creating account…' : 'Signing in…'}</span></>
                    : <span className="flex items-center gap-2">
                        <span>{mode === 'signup' ? 'Create My Account' : 'Sign In'}</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                  }
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px" style={{ background: 'var(--bd-light)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--bd-light)' }} />
            </div>

            {/* Google */}
            <button onClick={handleGoogle} disabled={gLoading || loading} className="btn-secondary py-4 text-sm gap-3 font-semibold">
              {gLoading ? (
                <><Spin c="current" /><span>Connecting…</span></>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-faint mt-5 leading-relaxed">
              By signing in you agree to our{' '}
              <span className="underline underline-offset-2 cursor-pointer text-muted hover:text-primary transition-colors">Terms</span>
              {' & '}
              <span className="underline underline-offset-2 cursor-pointer text-muted hover:text-primary transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
