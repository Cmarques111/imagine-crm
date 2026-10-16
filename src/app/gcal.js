/* Atlas · CRM da Imagine · integração com o Google Agenda (feita no navegador de cada sócio) */
(function(){
const W = window;
let tok = null, exp = 0, cache = {}, byId = {};
const clientId = () => (W.ST && W.ST.cfg && W.ST.cfg.gcalClientId) || '';
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'; } catch (e) { return 'America/Sao_Paulo'; } };
const loadGIS = () => new Promise((res, rej) => {
  if (W.google && W.google.accounts && W.google.accounts.oauth2) return res();
  const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
  s.onload = () => res(); s.onerror = () => rej(new Error('não foi possível carregar o login do Google'));
  document.head.appendChild(s);
});
const api = async (path, opt) => {
  if (!tok || Date.now() > exp) throw new Error('a conexão com o Google expirou, conecte de novo');
  const r = await fetch('https://www.googleapis.com/calendar/v3/' + path, Object.assign({ headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' } }, opt || {}));
  if (r.status === 401) { tok = null; throw new Error('a conexão com o Google expirou, conecte de novo'); }
  if (!r.ok) throw new Error('o Google respondeu com erro ' + r.status);
  return r.status === 204 ? null : r.json();
};
const pad = (n) => String(n).padStart(2, '0');
const local = (d, h) => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return d + 'T' + pad(hh) + ':' + pad(mm) + ':00'; };

W.GCal = {
  available: () => !!clientId() && !!W.Store && W.Store.mode !== 'local',
  connected: () => !!tok && Date.now() < exp,
  async connect() {
    if (!clientId()) throw new Error('configure o ID do cliente Google em Configurações');
    await loadGIS();
    await new Promise((res, rej) => {
      const c = W.google.accounts.oauth2.initTokenClient({
        client_id: clientId(), scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (r) => { if (r.error) return rej(new Error(r.error_description || r.error)); tok = r.access_token; exp = Date.now() + ((+r.expires_in || 3600) - 60) * 1000; cache = {}; res(); },
        error_callback: (e) => rej(new Error(e && e.message ? e.message : 'acesso não concedido'))
      });
      c.requestAccessToken({ prompt: '' });
    });
  },
  disconnect() { try { if (tok) W.google.accounts.oauth2.revoke(tok); } catch (e) {} tok = null; cache = {}; },
  clear() { cache = {}; },
  cached: (a, b) => cache[a + '|' + b],
  find: (id) => byId[id],
  async events(from, to) {
    const key = from + '|' + to;
    const q = 'calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=250&timeMin=' + encodeURIComponent(new Date(from + 'T00:00:00').toISOString()) + '&timeMax=' + encodeURIComponent(new Date(to + 'T23:59:59').toISOString());
    const data = await api(q);
    const out = (data.items || []).filter(it => it.start && it.start.dateTime && !(it.description || '').includes('[imagine-crm]')).map(it => {
      const s = new Date(it.start.dateTime), e = new Date(it.end.dateTime || it.start.dateTime);
      const ev = { id: 'g_' + it.id, d: iso(s), h: s.getHours() + s.getMinutes() / 60, dur: Math.max(0.25, (e - s) / 36e5), t: it.summary || '(sem título)', tipo: 'google', link: it.htmlLink };
      byId[ev.id] = ev; return ev;
    });
    cache[key] = out;
    return out;
  },
  async create(ev) {
    await api('calendars/primary/events', { method: 'POST', body: JSON.stringify({ summary: ev.t, description: 'Criado pelo Atlas (Imagine Concept) [imagine-crm]', start: { dateTime: local(ev.d, ev.h), timeZone: tz() }, end: { dateTime: local(ev.d, ev.h + ev.dur), timeZone: tz() } }) });
    cache = {};
  }
};
})();
