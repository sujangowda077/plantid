/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Outfit"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        emerald: {
          50:  '#edf7f2', 100: '#cceadb', 200: '#99d5b8',
          300: '#66bf94', 400: '#33aa71', 500: '#0d7a50',
          600: '#0d5c3a', 700: '#0a4a2e', 800: '#073822', 900: '#042516', 950: '#021008',
        },
        sage:  { 300: '#94bfa8', 400: '#6b9e7e', 500: '#4a7a5c' },
        ivory: { DEFAULT: '#faf8f2', dark: '#f0ede2' },
        gold:  { light: '#f0ca6e', DEFAULT: '#d4a843', dark: '#a07020' },
      },
      boxShadow: {
        'emerald':    '0 6px 28px -4px rgba(13,92,58,0.35)',
        'emerald-lg': '0 14px 50px -8px rgba(13,92,58,0.42)',
        'gold':       '0 6px 28px -4px rgba(212,168,67,0.40)',
        'modal':      '0 32px 100px rgba(0,0,0,0.45)',
        'card':       '0 2px 4px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 20px 48px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in':  'fadeIn  0.4s ease both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'modal-in': 'modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'bounce-in':'bounceIn 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
        'spin-fast':'spin 0.7s linear infinite',
        'float-a':  'floatA 5.5s ease-in-out infinite',
        'float-b':  'floatB 7.0s ease-in-out infinite',
        'shimmer':  'shimmer 1.9s ease infinite',
        'bar-grow': 'barGrow 1.2s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
        'grad-shift':'gradientShift 6s ease infinite',
        'morph-blob':'morphBlob 8s ease-in-out infinite',
        'pulse-glow':'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
