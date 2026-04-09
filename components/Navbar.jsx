/**
 * /components/Navbar.jsx
 * Production-grade top navigation — dark mode toggle, user pill,
 * progress indicator, mobile-responsive.
 */
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useDarkMode } from '@/hooks/useDarkMode';

/* ── Icons ─────────────────────────────────────────── */
const LeafIcon = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-5 9" />
  </svg>
);
const SunIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const BackIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const LogOutIcon = () => (
  <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ── Breadcrumb map ─────────────────────────────────── */
const BREADCRUMBS = {
  '/dashboard': [{ label: 'Garden', href: '/dashboard' }],
  '/detect':    [{ label: 'Garden', href: '/dashboard' }, { label: 'Identify', href: '/detect' }],
};

export default function Navbar({ user, backTo, backLabel }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isDark, toggle, mounted } = useDarkMode();
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const crumbs = BREADCRUMBS[pathname] || [];

  return (
    <header
      className={`sticky top-0 z-40 glass border-b border-theme transition-shadow duration-300
        ${scrolled ? 'shadow-md' : 'shadow-none'}`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[58px] gap-3">

        {/* ── Left ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo always visible */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 rounded-xl grad-emerald flex items-center justify-center shadow-sm" style={{ boxShadow: 'var(--sh-emerald)' }}>
              <LeafIcon />
            </div>
            <span className="font-display font-bold text-[1.05rem] text-primary hidden sm:block tracking-wide">
              Botanica
            </span>
          </button>

          {/* Breadcrumb separator + back (detect page) */}
          {backTo && (
            <>
              <span className="text-faint text-sm hidden sm:block">·</span>
              <button
                onClick={() => router.push(backTo)}
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-primary
                           transition-colors px-2.5 py-1.5 rounded-lg hover:bg-subtle"
              >
                <BackIcon />
                {backLabel || 'Back'}
              </button>
              {/* Mobile back */}
              <button
                onClick={() => router.push(backTo)}
                className="sm:hidden flex items-center gap-1 text-xs text-secondary
                           border border-theme rounded-lg px-2.5 py-1.5 hover:bg-subtle transition-all"
              >
                <BackIcon />
                Back
              </button>
            </>
          )}

          {/* Breadcrumbs on desktop (dashboard) */}
          {!backTo && crumbs.length > 1 && (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted ml-1">
              {crumbs.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="opacity-40">/</span>}
                  <button
                    onClick={() => router.push(c.href)}
                    className={`hover:text-primary transition-colors ${i === crumbs.length - 1 ? 'text-secondary font-medium' : ''}`}
                  >
                    {c.label}
                  </button>
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={toggle}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-muted hover:text-primary hover:bg-subtle
                         border border-theme transition-all duration-200"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          )}

          {/* User email pill — desktop only */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-subtle border border-theme">
              <div className="w-5 h-5 rounded-full grad-emerald flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                {(user.email?.[0] || '?').toUpperCase()}
              </div>
              <span className="text-xs text-muted font-medium truncate max-w-[140px]">
                {user.email}
              </span>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Sign out"
            className="flex items-center gap-1.5 text-xs font-medium text-muted
                       border border-theme rounded-xl px-3 py-2
                       hover:border-red-400/50 hover:text-red-500 hover:bg-red-50
                       dark:hover:bg-red-900/20 dark:hover:border-red-700/50
                       transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOutIcon />
            <span className="hidden sm:inline">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
