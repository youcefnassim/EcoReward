import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// ─── PWA: Service Worker (production only) ────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      // Register SW only in production
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('✅ SW registered:', reg.scope))
        .catch((err) => console.error('❌ SW failed:', err));
    } else {
      // In development, unregister any old SW that might cause blank pages
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }
  });
}
