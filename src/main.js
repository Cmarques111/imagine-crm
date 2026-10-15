/* Ponto de entrada: carrega o app e escolhe onde os dados ficam.
   Publicado no Firebase Hosting → login real e dados compartilhados (Firestore).
   Sem Firebase (demonstração) → dados só neste navegador. */
import './styles/crm.css';
import './styles/studio.css';
import './app/core.js';
import './app/data.js';
import './app/hp12c.js';
import './app/studio-core.js';
import './app/studio-editor.js';
import './app/studio-home.js';
import './app/views-comercial.js';
import './app/views-financas.js';
import './app/views-design.js';
import './app/views-config.js';
import './app/gcal.js';
import './app/store-local.js';
import './app/app.js';

async function firebaseConfig() {
  const env = import.meta.env;
  if (env.VITE_DEMO === '1') return null;
  if (env.VITE_FIREBASE_API_KEY) {
    return { apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID };
  }
  try {
    const r = await fetch('/__/firebase/init.json', { cache: 'no-store' });
    if (r.ok) { const j = await r.json(); if (j && j.apiKey) return j; }
  } catch (e) { /* sem Firebase Hosting: segue em modo demonstração */ }
  return null;
}

(async () => {
  const cfg = await firebaseConfig();
  if (cfg) {
    const { createFirebaseStore } = await import('./store-firebase.js');
    window.Store = createFirebaseStore(cfg);
  } else {
    window.Store = window.createLocalStore();
  }
  window.App.init();
})();
