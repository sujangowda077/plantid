/**
 * /app/layout.jsx — Root layout with dark-mode flash prevention
 */
import './globals.css';

export const metadata = {
  title: 'Botanica — AI Plant Detection',
  description: 'Identify any plant instantly with AI-powered detection.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before React hydration — prevents dark mode flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{
            var s=localStorage.getItem('botanica-theme');
            var d=window.matchMedia('(prefers-color-scheme:dark)').matches;
            if(s==='dark'||(!s&&d)) document.documentElement.classList.add('dark');
          }catch(e){}}());
        `}} />
      </head>
      <body className="bg-botanical min-h-screen">
        {children}
      </body>
    </html>
  );
}
