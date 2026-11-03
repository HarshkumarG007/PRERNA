import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from 'react-router-dom';
import App from "./App";
import { I18nProvider } from "./engine/localization/i18n";
import { ToastProvider } from "./components/common/Toast";
import { GlobalErrorBoundary } from "./components/common/GlobalErrorBoundary";
import { deriveSixteenType, isCompleteSixteenType } from "./engine/assessment/sixteenPersonalities";
import "./App.css";

// Native Environment & Update Hygiene: Purge any stale Service Worker or CacheStorage
// so local app updates (APK and Desktop) always load the newest bundled assets.
try {
  const isNative = Boolean(
    (typeof window !== 'undefined' && (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === 'tauri.localhost'
  );

  if (isNative) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().catch(() => {});
        }
      }).catch(() => {});
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {});
        }
      }).catch(() => {});
    }
  } else if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=4').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});
    });
  }
} catch {}

// Startup Self-Healing: Repair any corrupted demo profiles cached in localStorage before render
try {
  const rawDb = localStorage.getItem('prerna_mock_db');
  if (rawDb) {
    const db = JSON.parse(rawDb);
    let dirty = false;
    if (db?.profiles) {
      for (const key of Object.keys(db.profiles)) {
        const prof = db.profiles[key];
        if (prof && !isCompleteSixteenType(prof.sixteenType)) {
          const bigFive = prof.personality?.bigFive || { openness: 78, conscientiousness: 72, extraversion: 68, agreeableness: 80, neuroticism: 34 };
          prof.sixteenType = deriveSixteenType(bigFive);
          dirty = true;
        }
        if (prof && !prof.topCareer) {
          prof.topCareer = { role: 'Game Designer & Systems Thinker' };
          dirty = true;
        }
      }
    }
    if (dirty) {
      localStorage.setItem('prerna_mock_db', JSON.stringify(db));
    }
  }
} catch {
  try {
    localStorage.removeItem('prerna_mock_db');
  } catch {}
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <GlobalErrorBoundary>
        <I18nProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </I18nProvider>
      </GlobalErrorBoundary>
    </HashRouter>
  </React.StrictMode>,
);
