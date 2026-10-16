/* Atlas · CRM da Imagine · utilidades compartilhadas */
(function(){
const W = window;

W.$ = (s, r) => (r || document).querySelector(s);
W.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
W.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
W.uid = (p) => (p || 'id') + Math.random().toString(36).slice(2, 9);
W.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
W.fBRL = (v) => brl.format(Math.round(v || 0));
W.fBRL2 = (v) => brl2.format(v || 0);
W.fBRLk = (v) => {
  const a = Math.abs(v);
  if (a >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
  if (a >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
  return fBRL(v);
};
W.fNum = (v, d) => (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
W.fPct = (v, d) => (v >= 0 ? '+' : '') + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }) + '%';
W.pNum = (s) => {
  if (typeof s === 'number') return s;
  s = String(s || '').trim().replace(/[R$\s%]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
};

/* Datas: os dados de exemplo são gerados em torno de hoje */
const t0 = new Date(); t0.setHours(0, 0, 0, 0);
W.TODAY = t0;
W.iso = (d) => { const z = new Date(d); return z.getFullYear() + '-' + String(z.getMonth() + 1).padStart(2, '0') + '-' + String(z.getDate()).padStart(2, '0'); };
W.dOff = (n) => { const d = new Date(t0); d.setDate(d.getDate() + n); return iso(d); };
W.pDate = (s) => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
W.fDate = (s) => { const d = pDate(s); return d ? d.toLocaleDateString('pt-BR') : '—'; };
W.fDateS = (s) => { const d = pDate(s); return d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') : '—'; };
W.daysSince = (s) => { const d = pDate(s); return d ? Math.round((t0 - d) / 864e5) : 0; };
W.MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
W.MESES_L = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

/* Toast */
let tt;
W.toast = (msg, kind) => {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast on' + (kind ? ' t-' + kind : '');
  clearTimeout(tt);
  tt = setTimeout(() => { t.className = 'toast'; }, kind === 'warn' ? 4200 : 2600);
};

/* Ícones (traço, 24×24) */
const P = {
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  funnel: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M3 9h18"/>',
  money: '<path d="M12 3v18M16.5 7.5c-1-1.2-2.6-1.8-4.5-1.8-2.5 0-4.2 1.2-4.2 3s1.6 2.6 4.2 3.2 4.6 1.4 4.6 3.4-2 3.1-4.6 3.1c-2 0-3.8-.7-4.8-2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1-.8-1.5-.8-2.4 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 17v-4M12 17v-7M15 17v-2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  kanban: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  line: '<path d="M4 20L20 4"/>',
  shapes: '<rect x="3" y="12" width="9" height="9" rx="1"/><circle cx="16.5" cy="7.5" r="4.5"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  brand: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  alignL: '<path d="M4 4v16M8 8h10M8 16h6"/>',
  alignC: '<path d="M12 4v16M6 8h12M8 16h8"/>',
  alignR: '<path d="M20 4v16M6 8h10M10 16h6"/>',
  alignT: '<path d="M4 4h16M8 8v10M16 8v6"/>',
  alignM: '<path d="M4 12h16M8 6v12M16 8v8"/>',
  alignB: '<path d="M4 20h16M8 6v10M16 10v6"/>',
  distH: '<path d="M4 4v16M20 4v16M10 8h4v8h-4z"/>',
  distV: '<path d="M4 4h16M4 20h16M8 10h8v4H8z"/>',
  group: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M11 7h4v4M13 17H9v-4" stroke-dasharray="2 2"/>',
  bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
  italic: '<path d="M14 5h-4M14 19h-4M14 5l-4 14"/>',
  tleft: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
  tcenter: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
  tright: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
  flip: '<path d="M12 3v18M8 7L3 12l5 5zM16 7l5 5-5 5z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M16 11v7"/>',
  star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  rocket: '<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M9 15l-3-3c2-5 6-9 13-9 0 7-4 11-9 13z"/><circle cx="15" cy="9" r="1.5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  phone: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pie: '<path d="M12 3v9h9A9 9 0 1 1 12 3z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 15v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  note: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  send: '<path d="M4 12l16-8-6 16-3-6z"/><path d="M11 14l9-10"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  file: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
};
W.ICON_PATHS = P;
/* Identidade Atlas: símbolos da marca aplicados como máscara (herdam a cor do texto) */
W.ATLAS_DIR = W.ATLAS_DIR || 'atlas/';
W.atl = (file, cls, label) => '<span class="atl ' + (cls || '') + '"' + (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + ' style="-webkit-mask-image:url(' + W.ATLAS_DIR + file + ');mask-image:url(' + W.ATLAS_DIR + file + ')"></span>';
W.atIcon = (n, cls) => W.atl('icons/nav-' + n + '.png', 'ati ' + (cls || ''));
W.atlasMark = (cls, label) => W.atl('atlas-icon-navy.png', 'atl-mark ' + (cls || ''), label);
W.atlasWord = (cls) => W.atl('atlas-word-navy.png', 'atl-word ' + (cls || ''));
W.icon = (n, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';

/* Monograma IC (nuvem com iniciais vazadas) */
let mk = 0;
W.markSVG = (size, fill, acc, label) => {
  const id = 'mkm' + (++mk);
  return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" ' + (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"') + '>' +
    '<defs><mask id="' + id + '"><rect width="200" height="200" fill="#fff"/><rect x="66" y="88" width="16" height="58" fill="#000"/>' +
    '<path d="M137.6 132.6 A22 22 0 1 1 137.6 101.4" fill="none" stroke="#000" stroke-width="14"/></mask></defs>' +
    '<g mask="url(#' + id + ')" fill="' + (fill || '#F2F4F8') + '"><circle cx="62" cy="118" r="36"/><circle cx="100" cy="82" r="48"/><circle cx="140" cy="116" r="38"/><rect x="62" y="110" width="78" height="44"/></g>' +
    '<circle cx="36" cy="176" r="11" fill="' + (acc || '#8FB0FF') + '"/></svg>';
};

/* Armazenamento local (protótipo) */
W.LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* Leitura de imagem com redução de tamanho */
W.readImage = (file, max) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onerror = rej;
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const m = max || 1600;
      const k = Math.min(1, m / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      res({ src: c.toDataURL(type, 0.86), w: c.width, h: c.height, name: file.name });
    };
    img.onerror = rej;
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
});

/* Download via capacidade do artifact, com alternativa visual */
let dlP = null;
W.getDownloads = () => {
  if (!dlP) dlP = (W.claude && W.claude.use) ? W.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  return dlP;
};
W.saveFile = async (filename, blob, previewSrc) => {
  const dl = await getDownloads();
  if (dl) {
    try { await dl.save({ filename, data: blob }); toast('Arquivo pronto: ' + filename); return true; }
    catch (e) { if (e && e.code === 'declined') { toast('Download cancelado.'); return false; } }
  }
  if (previewSrc && W.openModal) {
    openModal('Arquivo gerado', '<p class="muted" style="margin:0">Este visualizador não permite baixar arquivos diretamente. Clique com o botão direito na imagem e escolha salvar.</p><img src="' + previewSrc + '" alt="Prévia do arquivo exportado" style="max-width:100%;border-radius:8px;border:1px solid var(--line)">', '');
  } else toast('Este visualizador não permite baixar arquivos.', 'warn');
  return false;
};
})();
