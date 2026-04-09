/**
 * /hooks/useDarkMode.js  v3
 * Fixed: safe localStorage access for SSR, system preference listener.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY = 'botanica-theme';

export function useDarkMode() {
  const [isDark, setIsDark]   = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(KEY);
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(stored === 'dark' || (!stored && sysDark));
    } catch { /* SSR / private browsing */ }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    try {
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem(KEY, 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem(KEY, 'light');
      }
    } catch { /* private browsing */ }
  }, [isDark, mounted]);

  // Also listen for OS-level theme changes
  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      try {
        const stored = localStorage.getItem(KEY);
        if (!stored) setIsDark(e.matches);
      } catch { setIsDark(e.matches); }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mounted]);

  const toggle = useCallback(() => setIsDark(d => !d), []);

  return { isDark, toggle, mounted };
}
