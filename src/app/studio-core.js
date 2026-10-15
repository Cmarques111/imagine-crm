/* Estúdio Imagine · modelo de dados, renderização, modelos e exportação */
(function(){
const W = window;
const SX = W.SX = {};

Object.assign(W.ICON_PATHS, {
  play: '<path d="M7 4l13 8-13 8z"/>',
  pen: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>',
  crop: '<path d="M6 2v16h16"/><path d="M2 6h16v16"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  minus: '<path d="M5 12h14"/>',
  under: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>',
  strike: '<path d="M4 12h16"/><path d="M16 7c-.8-1.6-2.3-2.5-4.2-2.5-2.4 0-4 1.3-4 3.1 0 1.2.7 2 1.8 2.6M8 17c.8 1.6 2.4 2.5 4.4 2.5 2.5 0 4.1-1.4 4.1-3.3 0-.8-.3-1.5-.8-2"/>',
  listB: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/>',
  listN: '<path d="M10 6h11M10 12h11M10 18h11M4 4.5h1.5V9M3.5 9h3M3.5 14.5a1.5 1.5 0 0 1 3 .5c0 1-3 2-3 3.5h3"/>',
  spacing: '<path d="M4 4v16M20 4v16"/><path d="M8 12h8M10 9.5L7.5 12 10 14.5M14 9.5l2.5 2.5-2.5 2.5"/>',
  opacity: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>',
  paint: '<rect x="4" y="3" width="13" height="6" rx="1"/><path d="M17 6h3v6h-8v3"/><rect x="10" y="15" width="4" height="6" rx="1"/>',
  border: '<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 2.5"/>',
  radius: '<path d="M4 20v-8a8 8 0 0 1 8-8h8"/>',
  shadow: '<rect x="3" y="3" width="13" height="13" rx="2"/><path d="M19 8v11H8"/>',
  flipV: '<path d="M3 12h18M8 8l4-5 4 5zM8 16l4 5 4-5z"/>',
  bg: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>', chevR: '<path d="M9 6l6 6-6 6"/>',
  anim: '<path d="M3 12h2M7 12h2"/><circle cx="16" cy="12" r="5"/>',
  dots: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  resize: '<rect x="3" y="3" width="11" height="11" rx="1"/><path d="M14 10h7v11H10v-7"/>',
  presenter: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  fx: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  frame: '<rect x="3" y="3" width="18" height="18" rx="9"/><path d="M8 15l3-3 2 2 3-3"/>',
  magic: '<path d="M4 20L15 9M14 4v3M18 6l-2 2M20 10h-3M9 4l.7 1.8L11.5 6.5l-1.8.7L9 9l-.7-1.8-1.8-.7 1.8-.7z"/>',
  hide: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  social: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".8"/>',
  story: '<rect x="7" y="2" width="10" height="20" rx="2"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/>',
  card: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h6M6 14h4"/>',
  banner: '<rect x="2" y="8" width="20" height="8" rx="1"/>',
  video: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
  custom: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'
});

/* ---------- Formatos, fontes, paletas ---------- */
SX.FORMATS = {
  apres: { l: 'Apresentação 16:9', w: 1920, h: 1080, g: 'apres', ic: 'presenter' },
  apres43: { l: 'Apresentação 4:3', w: 1600, h: 1200, g: 'apres', ic: 'presenter' },
  post: { l: 'Post quadrado', w: 1080, h: 1080, g: 'social', ic: 'social' },
  retrato: { l: 'Carrossel · retrato', w: 1080, h: 1350, g: 'social', ic: 'social' },
  story: { l: 'Story · Reels', w: 1080, h: 1920, g: 'social', ic: 'story' },
  linkedin: { l: 'Banner LinkedIn', w: 1584, h: 396, g: 'social', ic: 'banner' },
  youtube: { l: 'Capa YouTube', w: 1280, h: 720, g: 'social', ic: 'video' },
  a4: { l: 'Documento A4', w: 1240, h: 1754, g: 'doc', ic: 'doc' },
  cartao: { l: 'Cartão de visita', w: 1050, h: 600, g: 'doc', ic: 'card' }
};
SX.fmtOf = (d) => SX.FORMATS[d.fmt] || { l: 'Personalizado · ' + d.w + '×' + d.h, w: d.w, h: d.h, g: 'custom', ic: 'custom' };
SX.isDeck = (d) => SX.fmtOf(d).g === 'apres';
SX.GROUPS = { apres: 'Apresentações', social: 'Redes sociais', doc: 'Documentos', custom: 'Personalizados' };
SX.FONTS = ['Archivo', 'IBM Plex Sans', 'Inter', 'Poppins', 'Montserrat', 'Raleway', 'Space Grotesk', 'Oswald', 'Bebas Neue', 'Playfair Display', 'DM Serif Display', 'Lora', 'Libre Baskerville', 'Roboto Slab', 'IBM Plex Mono', 'Caveat'];
SX.PALETTE = ['#000000', '#1F2937', '#4B5563', '#9CA3AF', '#E5E7EB', '#FFFFFF', '#0E2152', '#1B3C88', '#2F5BCB', '#8FB0FF', '#22C1C3', '#0F766E', '#37B486', '#A3E635', '#FACC15', '#D9A441', '#F25C2A', '#E2615F', '#BE185D', '#D9A5B3', '#7C3AED', '#C4B5FD', '#5A2E12', '#C9A27A', '#F3EBDD'];
SX.FILTERS = [
  ['Normal', { bri: 100, con: 100, sat: 100, hue: 0, sep: 0, gray: 0, blur: 0 }],
  ['Vívido', { bri: 104, con: 112, sat: 145, hue: 0, sep: 0, gray: 0, blur: 0 }],
  ['Suave', { bri: 108, con: 86, sat: 85, hue: 0, sep: 0, gray: 0, blur: 0 }],
  ['Quente', { bri: 103, con: 104, sat: 118, hue: -6, sep: 22, gray: 0, blur: 0 }],
  ['Frio', { bri: 102, con: 104, sat: 90, hue: 10, sep: 0, gray: 0, blur: 0 }],
  ['Sépia', { bri: 100, con: 100, sat: 100, hue: 0, sep: 80, gray: 0, blur: 0 }],
  ['P&B', { bri: 100, con: 110, sat: 100, hue: 0, sep: 0, gray: 100, blur: 0 }],
  ['Noir', { bri: 90, con: 145, sat: 100, hue: 0, sep: 0, gray: 100, blur: 0 }]
];
SX.ANIMS = [['none', 'Nenhuma'], ['fade', 'Surgir'], ['rise', 'Subir'], ['pan', 'Deslizar'], ['pop', 'Expandir'], ['wipe', 'Revelar']];
SX.TRANS = [['none', 'Nenhuma'], ['fade', 'Dissolver'], ['slide', 'Deslizar'], ['zoom', 'Aproximar']];
SX.EFFECTS = [['none', 'Nenhum'], ['shadow', 'Sombra'], ['lift', 'Elevar'], ['outline', 'Contorno'], ['highlight', 'Destaque'], ['neon', 'Neon']];

/* ---------- Cores ---------- */
const hx = (c) => { c = String(c || '#000').replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); const n = parseInt(c.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
SX.hexA = (c, a) => { if (!c || c === 'transparent') return 'transparent'; const [r, g, b] = hx(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
SX.mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
SX.lum = (c) => { if (!c || c === 'transparent') return 1; const [r, g, b] = hx(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
SX.toHex = (c) => { if (!c || c === 'transparent') return '#000000'; if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase(); if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map(x => x + x).join('').toLowerCase(); return '#000000'; };
SX.isHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || '').trim());

/* ---------- Kits de marca ---------- */
SX.kits = () => {
  const own = { id: 'ic', nome: 'Imagine Concept', c: ['#07080B', '#8FB0FF', '#F2F4F8', '#0E2152', '#2F5BCB'], f: ['Archivo', 'IBM Plex Sans'] };
  return [own].concat((W.ST.clientes || []).map(c => ({ id: c.id, nome: c.nome, c: (c.cor || []).slice(), f: (c.fontes || ['Archivo', 'IBM Plex Sans']).slice() })));
};
SX.kitOf = (id) => SX.kits().find(k => k.id === id) || SX.kits()[0];
SX.roles = (k) => {
  const c = k.c, bg = c[0] || '#07080B', acc = c[1] || '#8FB0FF', fg = c[2] || '#FFFFFF';
  return { id: k.id, nome: k.nome, kit: k, bg, acc, fg, alt: c[3] || SX.mix(bg, acc, 0.22), alt2: c[4] || SX.mix(acc, fg, 0.35), line: SX.mix(bg, fg, 0.2), f0: k.f[0], f1: k.f[1] || k.f[0] };
};
SX.ink = (bgc, K) => SX.lum(bgc) > 0.55 ? (SX.lum(K.bg) < 0.45 ? K.bg : '#111111') : (SX.lum(K.fg) > 0.6 ? K.fg : '#FFFFFF');
SX.initials = (n) => String(n || '').split(/\s+/).filter(w => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'IC';

/* ---------- Imagens (assets) ---------- */
SX.asset = (src) => {
  if (!src || !/^data:image\/(png|jpe?g|webp|gif)/.test(src)) return src;
  const A = W.ST.assets = W.ST.assets || {};
  for (const k in A) if (A[k] === src) return 'as:' + k;
  const id = uid('a'); A[id] = src;
  if (W.Store && W.Store.putAsset) W.Store.putAsset(id, src);
  return 'as:' + id;
};
SX.src = (r) => {
  if (!r) return '';
  if (r.startsWith('as:')) { const id = r.slice(3); return (W.ST.assets || {})[id] || ((W.ST.assetUrls || {})[id]) || ''; }
  return r;
};
SX.logoSrc = (fill, acc) => 'data:image/svg+xml;utf8,' + encodeURIComponent(markSVG(200, fill, acc).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

/* ---------- Elementos ---------- */
SX.el = (type, p, K) => {
  K = K || SX.roles(SX.kitOf('ic'));
  const D = {
    text: { text: 'Seu texto', font: K.f1, size: 48, weight: 400, ital: false, und: false, strike: false, color: K.fg, align: 'left', lh: 1.2, ls: 0, up: false, list: 'none', eff: 'none', effC: K.acc, w: 600 },
    rect: { fill: K.acc, grad: null, radius: 0, stroke: K.fg, sw: 0, dash: 'solid', shadow: false },
    ellipse: { fill: K.acc, grad: null, stroke: K.fg, sw: 0, dash: 'solid', shadow: false },
    shape: { kind: 'tri', fill: K.acc, grad: null, stroke: K.fg, sw: 0, dash: 'solid', shadow: false },
    line: { color: K.fg, sw: 6, dash: 'solid', cap1: 'none', cap2: 'none', w: 400 },
    frame: { mask: 'rect', radius: 0, fill: K.alt },
    image: { src: '', iw: 0, ih: 0, fit: 'cover', px: 50, py: 50, zoom: 1, mask: 'rect', radius: 0, flipH: false, flipV: false, bri: 100, con: 100, sat: 100, hue: 0, sep: 0, gray: 0, blur: 0, sw: 0, stroke: K.fg },
    icon: { name: 'star', color: K.acc, sw: 1.8, w: 160, h: 160 },
    draw: { pts: [], color: K.acc, sw: 8 },
    chart: { kind: 'col', data: [{ l: 'Jan', v: 12 }, { l: 'Fev', v: 18 }, { l: 'Mar', v: 15 }, { l: 'Abr', v: 24 }], colors: [K.acc, K.alt2, K.fg, K.alt, K.line], multi: false, tc: K.fg, font: K.f1, fs: 22, fmt: 'num', vals: true, grid: true, legend: true, w: 900, h: 560 },
    table: { rows: 4, cols: 3, cells: null, font: K.f1, size: 24, color: K.fg, head: true, headFill: K.acc, headColor: K.bg, stripe: true, stripeC: K.alt, bc: K.line, bw: 1, w: 1000, h: 400 }
  }[type] || {};
  const e = Object.assign({ id: uid('e'), type, x: 0, y: 0, w: 240, h: 240, rot: 0, op: 1, lock: false, hide: false, anim: 'none' }, JSON.parse(JSON.stringify(D)), p || {});
  if (type === 'text' && !(p && p.h)) e.h = Math.round(e.size * e.lh * String(e.text).split('\n').length);
  if (type === 'line') e.h = Math.max(24, e.sw * 3);
  if (type === 'table' && !e.cells) e.cells = Array.from({ length: e.rows }, (_, r) => Array.from({ length: e.cols }, (_, c) => r === 0 && e.head ? 'Coluna ' + (c + 1) : ''));
  return e;
};
/* completa campos que faltam em elementos antigos */
SX.migrateEl = (e, K) => {
  if (e.type === 'rect' && e.ph) { e.type = 'frame'; e.mask = 'rect'; delete e.ph; }
  if (e.type === 'line' && e.color === undefined) { const oh = e.h; e.color = e.fill || '#FFFFFF'; e.sw = oh; e.h = Math.max(24, e.sw * 3); e.y -= (e.h - oh) / 2; delete e.fill; }
  if (e.type === 'image') { if (e.flip !== undefined) { e.flipH = !!e.flip; delete e.flip; } if (e.src && e.src.startsWith('data:image/') && !e.src.startsWith('data:image/svg')) e.src = SX.asset(e.src); }
  const d = SX.el(e.type, {}, K);
  for (const k in d) if (!(k in e)) e[k] = d[k];
  if (e.type === 'image' && !e.iw) { e.iw = e.w; e.ih = e.h; }
  return e;
};
SX.migrateDoc = (doc) => {
  const K = SX.roles(SX.kitOf(doc.kit));
  doc.pages.forEach(pg => {
    if (!pg.id) pg.id = uid('pg');
    if (pg.notes === undefined) pg.notes = '';
    if (!pg.trans) pg.trans = 'none';
    if (pg.hidden === undefined) pg.hidden = false;
    pg.els.forEach(e => SX.migrateEl(e, K));
  });
  if (!doc.criado) doc.criado = doc.upd || Date.now();
  return doc;
};
SX.blankPage = (bg) => ({ id: uid('pg'), bg: bg || '#FFFFFF', bgGrad: null, bgImg: null, els: [], notes: '', trans: 'none', hidden: false });

/* ---------- Formas ---------- */
const reg = (n, rot) => Array.from({ length: n }, (_, i) => { const a = rot + i * 2 * Math.PI / n; return [50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)]; });
const starP = (n, ri) => Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : 50; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; });
SX.POLY = {
  tri: [[50, 0], [100, 100], [0, 100]], rtri: [[0, 0], [100, 100], [0, 100]], diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
  pent: reg(5, -Math.PI / 2), hex: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]], oct: reg(8, Math.PI / 8),
  star: starP(5, 21), star6: starP(6, 30), burst: starP(12, 38),
  arrow: [[0, 30], [62, 30], [62, 6], [100, 50], [62, 94], [62, 70], [0, 70]], chev: [[0, 0], [75, 0], [100, 50], [75, 100], [0, 100], [25, 50]],
  para: [[22, 0], [100, 0], [78, 100], [0, 100]], trap: [[20, 0], [80, 0], [100, 100], [0, 100]],
  plus: [[34, 0], [66, 0], [66, 34], [100, 34], [100, 66], [66, 66], [66, 100], [34, 100], [34, 66], [0, 66], [0, 34], [34, 34]],
  bubble: [[0, 0], [100, 0], [100, 76], [42, 76], [18, 100], [22, 76], [0, 76]]
};
SX.SHAPE_NAMES = { tri: 'Triângulo', rtri: 'Triângulo retângulo', diamond: 'Losango', pent: 'Pentágono', hex: 'Hexágono', oct: 'Octógono', star: 'Estrela', star6: 'Estrela de 6 pontas', burst: 'Selo', arrow: 'Seta', chev: 'Divisa', para: 'Paralelogramo', trap: 'Trapézio', plus: 'Cruz', bubble: 'Balão de fala' };
SX.polyPts = (e) => (SX.POLY[e.kind] || SX.POLY.tri).map(([x, y]) => [x * e.w / 100, y * e.h / 100]);

/* ---------- Auxiliares de estilo ---------- */
SX.gradXY = (w, h, ang) => { const a = ang * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), len = Math.abs(w * dx) + Math.abs(h * dy); return { x1: w / 2 - dx * len / 2, y1: h / 2 - dy * len / 2, x2: w / 2 + dx * len / 2, y2: h / 2 + dy * len / 2 }; };
SX.fillCSS = (fill, grad) => !fill || fill === 'transparent' ? 'transparent' : grad ? 'linear-gradient(' + grad.ang + 'deg,' + fill + ',' + grad.c2 + ')' : fill;
const clampR = (r, w, h) => { const f = Math.min(1, w / ((r[0] + r[1]) || 1), w / ((r[3] + r[2]) || 1), h / ((r[0] + r[3]) || 1), h / ((r[1] + r[2]) || 1)); return r.map(v => v * f); };
SX.radii = (e) => {
  if (e.type === 'ellipse' || e.mask === 'circle') return null;
  if (e.mask === 'arch') return clampR([e.w / 2, e.w / 2, 0, 0], e.w, e.h);
  const r = e.mask === 'rounded' ? Math.min(e.w, e.h) * 0.12 : (e.radius || 0);
  return clampR([r, r, r, r], e.w, e.h);
};
SX.maskCSS = (e) => { const r = SX.radii(e); return r ? 'border-radius:' + r.map(v => v.toFixed(1) + 'px').join(' ') : 'border-radius:50%'; };
SX.filterCSS = (e) => 'brightness(' + e.bri + '%) contrast(' + e.con + '%) saturate(' + e.sat + '%) hue-rotate(' + (e.hue || 0) + 'deg) sepia(' + (e.sep || 0) + '%) grayscale(' + e.gray + '%) blur(' + e.blur + 'px)';
SX.imgBox = (e) => {
  const iw = e.iw || e.w, ih = e.ih || e.h;
  const k = e.fit === 'contain' ? Math.min(e.w / iw, e.h / ih) : Math.max(e.w / iw, e.h / ih);
  const z = e.fit === 'contain' ? 1 : (e.zoom || 1), w = iw * k * z, h = ih * k * z;
  return { x: (e.w - w) * (e.px == null ? 50 : e.px) / 100, y: (e.h - h) * (e.py == null ? 50 : e.py) / 100, w, h };
};
SX.listText = (e) => e.list === 'none' || !e.list ? e.text : String(e.text).split('\n').map((ln, i) => (e.list === 'num' ? (i + 1) + '. ' : '•  ') + ln).join('\n');
const deco = (e) => [e.und ? 'underline' : '', e.strike ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
const dashCSS = (d) => d === 'dashed' ? 'dashed' : d === 'dotted' ? 'dotted' : 'solid';
SX.dashArr = (d, sw) => d === 'dashed' ? [sw * 3, sw * 2] : d === 'dotted' ? [0.01, sw * 2] : [];
SX.drawPath = (e) => {
  const p = (e.pts || []).map(([x, y]) => [x * e.w, y * e.h]);
  if (p.length < 2) return '';
  let d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
  for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; d += ' Q' + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1); }
  const L = p[p.length - 1]; return d + ' L' + L[0].toFixed(1) + ' ' + L[1].toFixed(1);
};
SX.capLen = (e) => Math.max(e.sw * 3.2, 14);
SX.lineGeom = (e) => {
  const L = SX.capLen(e), y = e.h / 2;
  return { y, x1: e.cap1 === 'arrow' ? L * 0.7 : e.cap1 === 'dot' ? e.sw * 1.2 : 0, x2: e.w - (e.cap2 === 'arrow' ? L * 0.7 : e.cap2 === 'dot' ? e.sw * 1.2 : 0), L };
};
const SHADOW_CSS = '0 18px 44px rgba(0,0,0,.38)';
const textFx = (e) => {
  const s = e.size, out = [];
  if (e.eff === 'shadow') out.push('text-shadow:' + (s * 0.06).toFixed(1) + 'px ' + (s * 0.06).toFixed(1) + 'px ' + (s * 0.1).toFixed(1) + 'px ' + SX.hexA(e.effC, 0.75));
  if (e.eff === 'lift') out.push('text-shadow:0 ' + (s * 0.06).toFixed(1) + 'px ' + (s * 0.3).toFixed(1) + 'px rgba(0,0,0,.45)');
  if (e.eff === 'neon') out.push('text-shadow:0 0 ' + (s * 0.08).toFixed(1) + 'px ' + e.effC + ',0 0 ' + (s * 0.3).toFixed(1) + 'px ' + e.effC);
  if (e.eff === 'outline') out.push('-webkit-text-stroke:' + Math.max(1, s * 0.025).toFixed(1) + 'px ' + e.color);
  return out;
};

/* ---------- Gráficos ---------- */
const nice = (v) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
SX.CHARTS = [['col', 'Colunas'], ['bar', 'Barras'], ['line', 'Linhas'], ['pie', 'Pizza'], ['donut', 'Rosca']];
SX.chartPrims = (e) => {
  const P = [], w = e.w, h = e.h, fs = e.fs, tc = e.tc, font = e.font;
  const d = (e.data || []).map(r => ({ l: String(r.l == null ? '' : r.l), v: +r.v || 0 }));
  const col = (i) => e.colors[i % e.colors.length];
  const fmt = (v) => e.fmt === 'brl' ? fBRLk(v) : e.fmt === 'pct' ? fNum(v, v % 1 ? 1 : 0) + '%' : fNum(v, v % 1 ? 1 : 0);
  const T = (x, y, txt, o) => P.push(Object.assign({ t: 'text', x, y, txt: String(txt), s: fs, color: tc, font, anchor: 'start', weight: 400 }, o || {}));
  if (!d.length) { T(w / 2, h / 2, 'Adicione dados ao gráfico', { anchor: 'middle', op: 0.6 }); return P; }
  if (e.kind === 'pie' || e.kind === 'donut') {
    const tot = d.reduce((s, r) => s + Math.max(0, r.v), 0) || 1;
    const legW = e.legend ? Math.min(w * 0.45, Math.max(...d.map(r => r.l.length)) * fs * 0.6 + fs * 2.4) : 0;
    const r = Math.max(10, Math.min((w - legW) / 2, h / 2) * 0.94), cx = (w - legW) / 2, cy = h / 2;
    let a = -Math.PI / 2;
    d.forEach((row, i) => {
      const v = Math.max(0, row.v), a1 = a + v / tot * Math.PI * 2;
      P.push({ t: 'arc', cx, cy, r, r0: e.kind === 'donut' ? r * 0.58 : 0, a0: a, a1, fill: col(i) });
      if (e.vals && v / tot > 0.045) { const am = (a + a1) / 2, rr = e.kind === 'donut' ? r * 0.79 : r * 0.62; T(cx + Math.cos(am) * rr, cy + Math.sin(am) * rr, fNum(v / tot * 100, 0) + '%', { anchor: 'middle', color: SX.lum(col(i)) > 0.6 ? '#111111' : '#FFFFFF', weight: 600 }); }
      a = a1;
    });
    if (legW) { const lh = fs * 1.7, y0 = cy - (d.length - 1) * lh / 2; d.forEach((row, i) => { const y = y0 + i * lh; P.push({ t: 'rect', x: w - legW + fs * 0.4, y: y - fs * 0.4, w: fs * 0.8, h: fs * 0.8, fill: col(i), r: fs * 0.18 }); T(w - legW + fs * 1.6, y, row.l); }); }
    return P;
  }
  const vmax = Math.max(0, ...d.map(r => r.v)), vmin = Math.min(0, ...d.map(r => r.v));
  const step = nice((vmax - vmin || 1) / 4), top = Math.ceil((vmax || step) / step) * step, bot = vmin < 0 ? -Math.ceil(-vmin / step) * step : 0, nt = Math.round((top - bot) / step);
  if (e.kind === 'bar') {
    const lw = Math.min(w * 0.34, Math.max(...d.map(r => r.l.length)) * fs * 0.56 + fs * 0.6);
    const x0 = lw, x1 = w - (e.vals ? fs * 4.4 : fs * 0.5), band = h / d.length, bh = band * 0.62;
    const X = (v) => x0 + (v - bot) / (top - bot) * (x1 - x0);
    if (e.grid) for (let i = 0; i <= nt; i++) { const v = bot + step * i; P.push({ t: 'line', x1: X(v), y1: 0, x2: X(v), y2: h, stroke: tc, sw: 1, op: 0.15 }); }
    d.forEach((r, i) => {
      const cy = band * (i + 0.5), xa = X(Math.min(0, r.v)), xb = X(Math.max(0, r.v));
      T(lw - fs * 0.6, cy, r.l, { anchor: 'end' });
      P.push({ t: 'rect', x: xa, y: cy - bh / 2, w: Math.max(1, xb - xa), h: bh, fill: col(e.multi ? i : 0), r: Math.min(bh * 0.18, 8) });
      if (e.vals) T(xb + fs * 0.5, cy, fmt(r.v), { weight: 600 });
    });
    return P;
  }
  const ml = e.grid ? Math.max(fmt(top).length, fmt(bot).length) * fs * 0.58 + fs * 0.7 : fs * 0.4;
  const x0 = ml, x1 = w - fs * 0.4, y0 = e.vals ? fs * 1.7 : fs * 0.6, y1 = h - fs * 1.9;
  const Y = (v) => y1 - (v - bot) / (top - bot) * (y1 - y0);
  if (e.grid) for (let i = 0; i <= nt; i++) { const v = bot + step * i, yy = Y(v); P.push({ t: 'line', x1: x0, y1: yy, x2: x1, y2: yy, stroke: tc, sw: 1, op: 0.15 }); T(x0 - fs * 0.5, yy, fmt(v), { anchor: 'end', s: fs * 0.85, op: 0.7 }); }
  const band = (x1 - x0) / d.length;
  if (e.kind === 'line') {
    const pts = d.map((r, i) => [x0 + band * (i + 0.5), Y(r.v)]), base = Y(Math.max(0, bot));
    P.push({ t: 'poly', pts: [[pts[0][0], base]].concat(pts, [[pts[pts.length - 1][0], base]]), fill: col(0), op: 0.14 });
    P.push({ t: 'poly', pts, stroke: col(0), sw: Math.max(2, fs * 0.18), open: true });
    pts.forEach((p, i) => { P.push({ t: 'circle', cx: p[0], cy: p[1], r: Math.max(3, fs * 0.28), fill: col(0) }); if (e.vals) T(p[0], p[1] - fs * 0.95, fmt(d[i].v), { anchor: 'middle', weight: 600 }); });
  } else {
    const bw = band * 0.6;
    d.forEach((r, i) => {
      const cx = x0 + band * (i + 0.5), ya = Y(Math.max(0, r.v)), yb = Y(Math.min(0, r.v));
      P.push({ t: 'rect', x: cx - bw / 2, y: ya, w: bw, h: Math.max(1, yb - ya), fill: col(e.multi ? i : 0), r: Math.min(bw * 0.12, 8) });
      if (e.vals) T(cx, ya - fs * 0.75, fmt(r.v), { anchor: 'middle', weight: 600 });
    });
  }
  d.forEach((r, i) => T(x0 + band * (i + 0.5), h - fs * 0.8, r.l, { anchor: 'middle', op: 0.85 }));
  return P;
};
const arcD = (p) => {
  let { cx, cy, r, r0, a0, a1 } = p;
  if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
  if (a1 - a0 < 1e-6) return '';
  const lg = a1 - a0 > Math.PI ? 1 : 0, f = (n) => n.toFixed(2);
  let d = 'M' + f(cx + r * Math.cos(a0)) + ' ' + f(cy + r * Math.sin(a0)) + ' A' + f(r) + ' ' + f(r) + ' 0 ' + lg + ' 1 ' + f(cx + r * Math.cos(a1)) + ' ' + f(cy + r * Math.sin(a1));
  if (r0) d += ' L' + f(cx + r0 * Math.cos(a1)) + ' ' + f(cy + r0 * Math.sin(a1)) + ' A' + f(r0) + ' ' + f(r0) + ' 0 ' + lg + ' 0 ' + f(cx + r0 * Math.cos(a0)) + ' ' + f(cy + r0 * Math.sin(a0)) + ' Z';
  else d += ' L' + f(cx) + ' ' + f(cy) + ' Z';
  return d;
};
SX.primsSVG = (P, w, h) => '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="overflow:visible">' + P.map(p => {
  const op = p.op != null ? ' opacity="' + p.op + '"' : '';
  if (p.t === 'rect') return '<rect x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '" width="' + p.w.toFixed(1) + '" height="' + p.h.toFixed(1) + '" rx="' + (p.r || 0) + '" fill="' + p.fill + '"' + op + '/>';
  if (p.t === 'line') return '<line x1="' + p.x1.toFixed(1) + '" y1="' + p.y1.toFixed(1) + '" x2="' + p.x2.toFixed(1) + '" y2="' + p.y2.toFixed(1) + '" stroke="' + p.stroke + '" stroke-width="' + p.sw + '"' + op + '/>';
  if (p.t === 'circle') return '<circle cx="' + p.cx.toFixed(1) + '" cy="' + p.cy.toFixed(1) + '" r="' + p.r + '" fill="' + p.fill + '"' + op + '/>';
  if (p.t === 'poly') return '<' + (p.open ? 'polyline' : 'polygon') + ' points="' + p.pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '" fill="' + (p.fill || 'none') + '" stroke="' + (p.stroke || 'none') + '" stroke-width="' + (p.sw || 0) + '" stroke-linejoin="round" stroke-linecap="round"' + op + '/>';
  if (p.t === 'arc') return '<path d="' + arcD(p) + '" fill="' + p.fill + '"' + op + '/>';
  if (p.t === 'text') return '<text x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '" font-family="' + esc("'" + p.font + "', sans-serif") + '" font-size="' + p.s + '" font-weight="' + p.weight + '" fill="' + p.color + '" text-anchor="' + p.anchor + '" dominant-baseline="central"' + op + '>' + esc(p.txt) + '</text>';
  return '';
}).join('') + '</svg>';

/* ---------- Renderização em HTML ---------- */
SX.elHTML = (e, o) => {
  o = o || {};
  const st = ['left:' + e.x + 'px', 'top:' + e.y + 'px', 'width:' + e.w + 'px', 'transform:rotate(' + (e.rot || 0) + 'deg)', 'opacity:' + e.op];
  if (e.type !== 'text') st.push('height:' + e.h + 'px');
  if (e.hide && !o.showHidden) st.push('display:none');
  let inner = '', cls = 'sx-el sx-' + e.type, attrs = '';
  if (o.play && e.anim && e.anim !== 'none') { cls += ' sxa sxa-' + e.anim; st.push('animation-delay:' + (0.2 + (o.order || 0) * 0.16).toFixed(2) + 's'); }
  switch (e.type) {
    case 'text': {
      const editing = o.editing === e.id, txt = editing ? e.text : SX.listText(e);
      st.push("font-family:'" + e.font + "',sans-serif", 'font-size:' + e.size + 'px', 'font-weight:' + e.weight, 'font-style:' + (e.ital ? 'italic' : 'normal'), 'color:' + (e.eff === 'outline' ? 'transparent' : e.color), 'text-align:' + e.align, 'line-height:' + e.lh, 'letter-spacing:' + e.ls + 'px', 'text-transform:' + (e.up ? 'uppercase' : 'none'), 'text-decoration:' + deco(e), 'min-height:' + Math.round(e.size * e.lh) + 'px');
      st.push(...textFx(e));
      inner = e.eff === 'highlight' && !editing ? '<span style="background:' + e.effC + ';-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .18em">' + esc(txt) + '</span>' : esc(txt);
      if (editing) attrs = ' contenteditable="true" spellcheck="false"';
      break;
    }
    case 'rect': case 'ellipse':
      st.push('background:' + SX.fillCSS(e.fill, e.grad), SX.maskCSS(e));
      if (e.sw) st.push('border:' + e.sw + 'px ' + dashCSS(e.dash) + ' ' + e.stroke, 'box-sizing:border-box');
      if (e.shadow) st.push('box-shadow:' + SHADOW_CSS);
      break;
    case 'shape': {
      let defs = '', fill = e.fill || 'transparent';
      if (e.grad && fill !== 'transparent') { const g = SX.gradXY(e.w, e.h, e.grad.ang), gid = 'sg' + e.id + (o.pfx || ''); defs = '<defs><linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="' + g.x1 + '" y1="' + g.y1 + '" x2="' + g.x2 + '" y2="' + g.y2 + '"><stop offset="0" stop-color="' + e.fill + '"/><stop offset="1" stop-color="' + e.grad.c2 + '"/></linearGradient></defs>'; fill = 'url(#' + gid + ')'; }
      const da = SX.dashArr(e.dash, e.sw);
      inner = '<svg viewBox="0 0 ' + e.w + ' ' + e.h + '" width="' + e.w + '" height="' + e.h + '" style="overflow:visible;' + (e.shadow ? 'filter:drop-shadow(0 16px 20px rgba(0,0,0,.38))' : '') + '">' + defs + '<polygon points="' + SX.polyPts(e).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="' + fill + '"' + (e.sw ? ' stroke="' + e.stroke + '" stroke-width="' + e.sw + '" stroke-linejoin="round" stroke-linecap="round"' + (da.length ? ' stroke-dasharray="' + da.join(' ') + '"' : '') : '') + '/></svg>';
      break;
    }
    case 'line': {
      const g = SX.lineGeom(e), da = SX.dashArr(e.dash, e.sw), L = g.L;
      let caps = '';
      if (e.cap2 === 'arrow') caps += '<polygon points="' + e.w + ',' + g.y + ' ' + (e.w - L) + ',' + (g.y - L * 0.55) + ' ' + (e.w - L) + ',' + (g.y + L * 0.55) + '" fill="' + e.color + '"/>';
      if (e.cap1 === 'arrow') caps += '<polygon points="0,' + g.y + ' ' + L + ',' + (g.y - L * 0.55) + ' ' + L + ',' + (g.y + L * 0.55) + '" fill="' + e.color + '"/>';
      if (e.cap2 === 'dot') caps += '<circle cx="' + (e.w - e.sw * 1.2) + '" cy="' + g.y + '" r="' + e.sw * 1.2 + '" fill="' + e.color + '"/>';
      if (e.cap1 === 'dot') caps += '<circle cx="' + e.sw * 1.2 + '" cy="' + g.y + '" r="' + e.sw * 1.2 + '" fill="' + e.color + '"/>';
      inner = '<svg viewBox="0 0 ' + e.w + ' ' + e.h + '" width="' + e.w + '" height="' + e.h + '" style="overflow:visible"><line x1="' + g.x1 + '" y1="' + g.y + '" x2="' + g.x2 + '" y2="' + g.y + '" stroke="' + e.color + '" stroke-width="' + e.sw + '" stroke-linecap="' + (e.dash === 'dotted' ? 'round' : 'butt') + '"' + (da.length ? ' stroke-dasharray="' + da.join(' ') + '"' : '') + '/>' + caps + '</svg>';
      break;
    }
    case 'frame':
      st.push('background:' + e.fill, SX.maskCSS(e), 'overflow:hidden');
      if (o.live) inner = '<div class="sx-frame-ph" style="font-size:' + Math.max(14, Math.min(e.w, e.h) / 18).toFixed(0) + 'px">' + icon('image') + '<span>Arraste uma imagem</span></div>';
      break;
    case 'image': {
      const b = SX.imgBox(e), src = SX.src(e.src);
      const img = (extra) => '<img src="' + src + '" alt="" draggable="false" ' + (src.startsWith('http') ? 'crossorigin="anonymous" ' : '') + 'style="position:absolute;left:' + b.x.toFixed(1) + 'px;top:' + b.y.toFixed(1) + 'px;width:' + b.w.toFixed(1) + 'px;height:' + b.h.toFixed(1) + 'px;max-width:none;filter:' + SX.filterCSS(e) + ';transform:scale(' + (e.flipH ? -1 : 1) + ',' + (e.flipV ? -1 : 1) + ');' + (extra || '') + '">';
      const border = e.sw ? '<i style="position:absolute;inset:0;border:' + e.sw + 'px solid ' + e.stroke + ';' + SX.maskCSS(e) + '"></i>' : '';
      if (o.crop === e.id) { st.push('overflow:visible'); inner = img('opacity:.38') + '<div style="position:absolute;inset:0;overflow:hidden;' + SX.maskCSS(e) + '">' + img() + '</div>' + border; }
      else { st.push('overflow:hidden', SX.maskCSS(e)); inner = (src ? img() : '') + border; }
      break;
    }
    case 'icon':
      inner = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="' + e.color + '" stroke-width="' + e.sw + '" stroke-linecap="round" stroke-linejoin="round" style="overflow:visible">' + (ICON_PATHS[e.name] || '') + '</svg>';
      break;
    case 'draw':
      inner = '<svg viewBox="0 0 ' + e.w + ' ' + e.h + '" width="' + e.w + '" height="' + e.h + '" style="overflow:visible"><path d="' + SX.drawPath(e) + '" fill="none" stroke="' + e.color + '" stroke-width="' + e.sw + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      break;
    case 'chart':
      inner = SX.primsSVG(SX.chartPrims(e), e.w, e.h);
      break;
    case 'table': {
      const rh = e.h / e.rows, ed = o.tedit === e.id;
      inner = '<table class="sx-tbl" style="font-family:\'' + e.font + '\',sans-serif;font-size:' + e.size + 'px;color:' + e.color + '">' + e.cells.map((row, r) => '<tr>' + row.map((c, ci) => {
        const head = e.head && r === 0, stripe = e.stripe && !head && ((r - (e.head ? 1 : 0)) % 2 === 1);
        return '<td style="height:' + rh.toFixed(1) + 'px;border:' + e.bw + 'px solid ' + e.bc + ';' + (head ? 'background:' + e.headFill + ';color:' + e.headColor + ';font-weight:700;' : stripe ? 'background:' + e.stripeC + ';' : '') + '"><div class="sx-cell" data-r="' + r + '" data-c="' + ci + '" style="max-height:' + rh.toFixed(1) + 'px;padding:0 ' + (e.size * 0.5).toFixed(1) + 'px"' + (ed ? ' contenteditable="true" spellcheck="false"' : '') + '>' + esc(c) + '</div></td>';
      }).join('') + '</tr>').join('') + '</table>';
      break;
    }
  }
  return '<div class="' + cls + '" data-id="' + e.id + '" style="' + st.join(';') + '"' + attrs + '>' + inner + '</div>';
};
SX.bgCSS = (pg) => 'background:' + SX.fillCSS(pg.bg || '#FFFFFF', pg.bgGrad);
SX.bgHTML = (pg, doc) => {
  if (!pg.bgImg || !pg.bgImg.src) return '';
  const b = SX.imgBox({ w: doc.w, h: doc.h, iw: pg.bgImg.iw || doc.w, ih: pg.bgImg.ih || doc.h, fit: 'cover', px: 50, py: 50, zoom: 1 }), src = SX.src(pg.bgImg.src);
  return '<div class="sx-bgimg" style="opacity:' + (pg.bgImg.op == null ? 1 : pg.bgImg.op) + '"><img src="' + src + '" alt="" draggable="false" ' + (src.startsWith('http') ? 'crossorigin="anonymous" ' : '') + 'style="left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px"></div>';
};
SX.pageInner = (pg, doc, o) => {
  o = o || {}; let n = 0;
  return SX.bgHTML(pg, doc) + pg.els.map(e => SX.elHTML(e, Object.assign({}, o, { order: e.anim && e.anim !== 'none' ? n++ : 0 }))).join('');
};
let pvN = 0;
SX.preview = (pg, doc, boxW, boxH) => {
  const s = boxH ? Math.min(boxW / doc.w, boxH / doc.h) : boxW / doc.w;
  return '<div class="sx-pv" style="width:' + Math.round(doc.w * s) + 'px;height:' + Math.round(doc.h * s) + 'px"><div class="sx-pv-in" style="width:' + doc.w + 'px;height:' + doc.h + 'px;transform:scale(' + s + ');' + SX.bgCSS(pg) + '">' + SX.pageInner(pg, doc, { pfx: 'p' + (++pvN) }) + '</div></div>';
};

/* ---------- Medição de textos ---------- */
SX.measure = (doc, pages) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(host);
  (pages || doc.pages).forEach(pg => {
    if (!pg.els.some(e => e.type === 'text')) return;
    host.innerHTML = '<div style="position:relative;width:' + doc.w + 'px;height:' + doc.h + 'px">' + SX.pageInner(pg, doc, {}) + '</div>';
    pg.els.forEach(e => { if (e.type === 'text') { const n = host.querySelector('[data-id="' + e.id + '"]'); if (n && n.offsetHeight) e.h = n.offsetHeight; } });
  });
  host.remove();
};

/* ---------- Escala de páginas ---------- */
SX.scalePage = (pg, sx, sy) => {
  const m = Math.min(sx, sy);
  pg.els.forEach(e => {
    const uni = e.type === 'ellipse' && Math.abs(e.w - e.h) < 2 || e.type === 'icon' || ((e.type === 'frame' || e.type === 'image') && e.mask === 'circle') || e.type === 'image';
    if (uni) { const cx = (e.x + e.w / 2) * sx, cy = (e.y + e.h / 2) * sy; e.w *= m; e.h *= m; e.x = cx - e.w / 2; e.y = cy - e.h / 2; }
    else { e.x *= sx; e.y *= sy; e.w *= sx; e.h *= sy; }
    if (e.type === 'text') { e.size *= m; e.ls *= m; }
    if (e.type === 'line') { e.sw = Math.max(1, e.sw * m); const c = e.y + e.h / 2; e.h = Math.max(24, e.sw * 3); e.y = c - e.h / 2; }
    if (e.sw && e.type !== 'line' && e.type !== 'icon') e.sw *= m;
    if (e.radius) e.radius *= m;
    if (e.type === 'chart') e.fs *= m;
    if (e.type === 'table') e.size *= m;
  });
  return pg;
};

/* ---------- Kit: troca de cores e fontes ---------- */
SX.recolorPage = (pg, from, to) => {
  const map = {};
  ['bg', 'acc', 'fg', 'alt', 'alt2', 'line'].forEach(k => { if (from[k] && to[k]) map[from[k].toLowerCase()] = to[k]; });
  const fm = { [from.f0]: to.f0, [from.f1]: to.f1 };
  const c = (v) => (v && map[String(v).toLowerCase()]) || v;
  pg.bg = c(pg.bg); if (pg.bgGrad) pg.bgGrad.c2 = c(pg.bgGrad.c2);
  pg.els.forEach(e => {
    ['fill', 'stroke', 'color', 'effC', 'tc', 'headFill', 'headColor', 'stripeC', 'bc'].forEach(k => { if (e[k]) e[k] = c(e[k]); });
    if (e.grad) e.grad.c2 = c(e.grad.c2);
    if (e.colors) e.colors = e.colors.map(c);
    if (e.font && fm[e.font]) e.font = fm[e.font];
    if (e.type === 'image' && e.src && e.src.startsWith('data:image/svg') && from.id === 'ic' && to.id !== 'ic') { /* logo da Imagine permanece */ }
  });
  return pg;
};

/* ---------- Modelos de página (base 1920×1080) ---------- */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
SX.hoje = () => cap(MESES_L[TODAY.getMonth()]) + ' de ' + TODAY.getFullYear();
const T = (K, p) => SX.el('text', Object.assign({ font: K.f1, color: K.fg }, p), K);
const R = (K, p) => SX.el('rect', p, K);
const Fr = (K, p) => SX.el('frame', Object.assign({ fill: K.alt }, p), K);
const Ln = (K, p) => SX.el('line', p, K);
const Ic = (K, p) => SX.el('icon', p, K);
SX.logoEls = (K, x, y, s, onDark) => {
  if (K.id === 'ic') return [SX.el('image', { x, y, w: s, h: s, iw: 200, ih: 200, fit: 'contain', src: SX.logoSrc(onDark === false ? '#0E2152' : '#F2F4F8', '#8FB0FF') }, K)];
  const g = uid('g');
  return [R(K, { x, y, w: s, h: s, radius: s * 0.2, fill: K.acc, g }), T(K, { x, y: y + s * 0.26, w: s, text: SX.initials(K.nome), size: s * 0.4, weight: 700, align: 'center', font: K.f0, color: K.bg, g })];
};
const title = (K, txt, dark) => [T(K, { x: 120, y: 110, w: 1680, text: txt, size: 64, weight: 700, font: K.f0, color: dark ? K.bg : K.fg, lh: 1.1 }), Ln(K, { x: 120, y: 218, w: 100, sw: 6, color: dark ? K.alt : K.acc })];
const LY = SX.LAYOUTS = {};
LY.capa = { nome: 'Capa', make: (K, t) => ({ bg: K.bg, els: [
  Fr(K, { x: 1060, y: 0, w: 860, h: 1080 }),
  T(K, { x: 120, y: 120, w: 820, text: t.eyebrow || K.nome.toUpperCase(), size: 26, weight: 600, ls: 4, color: K.acc }),
  T(K, { x: 120, y: 330, w: 860, text: t.title || 'Planejamento estratégico 2027', size: 96, weight: 700, lh: 1.04, font: K.f0 }),
  T(K, { x: 120, y: 720, w: 760, text: t.sub || 'Diagnóstico financeiro, metas e posicionamento de marca.', size: 34, lh: 1.4, op: 0.78 }),
  Ln(K, { x: 120, y: 888, w: 120, sw: 6, color: K.acc }),
  T(K, { x: 120, y: 940, w: 700, text: t.date || SX.hoje(), size: 26, op: 0.7 })
] }) };
LY.sumario = { nome: 'Agenda', make: (K, t) => { const it = t.items || ['Diagnóstico', 'Objetivos', 'Plano de ação', 'Investimento']; const els = title(K, t.title || 'Agenda');
  it.slice(0, 4).forEach((s, i) => { const x = 120 + (i % 2) * 880, y = 340 + Math.floor(i / 2) * 300;
    els.push(T(K, { x, y, w: 160, text: '0' + (i + 1), size: 72, weight: 700, font: K.f0, color: K.acc }), T(K, { x: x + 180, y: y + 18, w: 620, text: s, size: 44, weight: 600, font: K.f0 }), Ln(K, { x, y: y + 150, w: 760, sw: 2, color: K.fg, op: 0.2 })); });
  return { bg: K.bg, els }; } };
LY.secao = { nome: 'Divisória', make: (K, t) => ({ bg: K.alt, els: [
  SX.el('ellipse', { x: 1320, y: -260, w: 960, h: 960, fill: K.acc, op: 0.12 }, K),
  T(K, { x: 120, y: 230, w: 600, text: t.num || '01', size: 220, weight: 800, font: K.f0, color: K.acc, lh: 1 }),
  T(K, { x: 120, y: 540, w: 1500, text: t.title || 'O conceito', size: 96, weight: 700, font: K.f0, lh: 1.05 }),
  T(K, { x: 120, y: 700, w: 1100, text: t.sub || 'De onde vem a ideia por trás do projeto.', size: 34, op: 0.75, lh: 1.4 })
] }) };
LY.texto = { nome: 'Texto e tópicos', make: (K, t) => ({ bg: K.fg, els: [
  T(K, { x: 120, y: 120, w: 860, text: t.title || 'O que encontramos', size: 72, weight: 700, font: K.f0, color: K.bg, lh: 1.08 }), Ln(K, { x: 120, y: 300, w: 100, sw: 6, color: K.alt }),
  T(K, { x: 120, y: 360, w: 820, text: t.para || 'A empresa cresceu nos últimos dois anos, mas a marca e o controle financeiro não acompanharam o ritmo.', size: 34, lh: 1.55, color: K.bg }),
  T(K, { x: 120, y: 640, w: 820, text: t.bullets || 'Fluxo de caixa sem previsão\nPreço sem margem definida\nIdentidade visual inconsistente', size: 34, lh: 1.8, list: 'bullet', color: K.bg, weight: 600 }),
  Fr(K, { x: 1080, y: 0, w: 840, h: 1080, fill: SX.mix(K.fg, K.bg, 0.12) })
] }) };
LY.duas = { nome: 'Duas colunas', make: (K, t) => { const a = t.a || ['Cores', 'Principal, destaque e apoio, pensadas para funcionar no digital e no impresso.'], b = t.b || ['Tipografia', 'Uma fonte de títulos com personalidade e outra de texto fácil de ler.'];
  return { bg: K.bg, els: title(K, t.title || 'Duas frentes de trabalho').concat([0, 1].flatMap(i => { const x = 120 + i * 870, c = i ? b : a; return [R(K, { x, y: 300, w: 810, h: 620, radius: 24, fill: K.alt }), T(K, { x: x + 56, y: 356, w: 700, text: c[0], size: 44, weight: 700, font: K.f0, color: K.acc }), T(K, { x: x + 56, y: 440, w: 700, text: c[1], size: 30, lh: 1.55, op: 0.88 })]; })) }; } };
LY.imgTexto = { nome: 'Imagem e texto', make: (K, t) => ({ bg: K.bg, els: [
  Fr(K, { x: 0, y: 0, w: 860, h: 1080 }),
  T(K, { x: 960, y: 200, w: 840, text: t.eyebrow || 'QUEM SOMOS', size: 26, weight: 600, ls: 4, color: K.acc }),
  T(K, { x: 960, y: 260, w: 840, text: t.title || 'Marca forte e números organizados', size: 72, weight: 700, font: K.f0, lh: 1.08 }),
  T(K, { x: 960, y: 580, w: 800, text: t.text || 'Unimos identidade visual e consultoria financeira no mesmo time, para a empresa crescer com imagem consistente e decisões baseadas em números.', size: 30, lh: 1.55, op: 0.85 })
] }) };
LY.numeros = { nome: 'Números', make: (K, t) => { const it = t.items || [['R$ 184 mil', 'Faturamento', 'Soma dos últimos 6 meses.'], ['22%', 'Margem líquida', 'Meta para o próximo semestre: 28%.'], ['41 dias', 'Prazo de recebimento', 'Acima do prazo de pagamento.']]; const els = title(K, t.title || 'Resumo do período');
  it.forEach((r, i) => { const x = 120 + i * 600; if (i) els.push(R(K, { x: x - 40, y: 360, w: 2, h: 340, fill: K.fg, op: 0.18 }));
    els.push(T(K, { x, y: 360, w: 520, text: r[0], size: 104, weight: 700, font: K.f0, color: K.acc, lh: 1.05 }), T(K, { x, y: 520, w: 480, text: r[1], size: 34, weight: 600 }), T(K, { x, y: 580, w: 480, text: r[2], size: 24, op: 0.7, lh: 1.5 })); });
  return { bg: K.bg, els }; } };
LY.grafico = { nome: 'Gráfico', make: (K, t) => ({ bg: K.fg, els: title(K, t.title || 'Faturamento por mês', true).concat([
  SX.el('chart', { x: 120, y: 280, w: 1100, h: 680, kind: t.kind || 'col', data: t.data || MESES.slice(0, 6).map((m, i) => ({ l: cap(m), v: [24, 27, 26, 31, 33, 36][i] })), colors: [K.alt, K.acc, K.alt2, K.line], tc: K.bg, fs: 24, fmt: t.fmt || 'num' }, K),
  R(K, { x: 1320, y: 280, w: 480, h: 680, radius: 24, fill: K.bg }),
  T(K, { x: 1370, y: 340, w: 380, text: t.kpi || '+18%', size: 96, weight: 700, font: K.f0, color: K.acc }),
  T(K, { x: 1370, y: 480, w: 380, text: t.kpiTxt || 'de crescimento entre o primeiro e o último mês do período.', size: 28, lh: 1.5, color: K.fg })
]) }) };
LY.tabela = { nome: 'Tabela', make: (K, t) => { const cells = t.cells || [['Categoria', 'Mensal', '% do faturamento', 'Situação'], ['Pessoal', 'R$ 12.400', '40%', 'Dentro da meta'], ['Estrutura', 'R$ 4.100', '13%', 'Atenção'], ['Marketing', 'R$ 2.600', '8%', 'Dentro da meta'], ['Fornecedores', 'R$ 6.900', '22%', 'Rever contratos']];
  return { bg: K.bg, els: title(K, t.title || 'Despesas por categoria').concat([SX.el('table', { x: 120, y: 290, w: 1680, h: 600, rows: cells.length, cols: cells[0].length, cells, size: 28, headFill: K.acc, headColor: K.bg, color: K.fg, stripeC: K.alt, bc: K.line }, K)]) }; } };
LY.linha = { nome: 'Linha do tempo', make: (K, t) => { const st = t.steps || [['Semana 1', 'Imersão', 'Entrevistas, números e referências.'], ['Semanas 2 a 4', 'Criação', 'Identidade visual e estrutura financeira.'], ['Semanas 5 e 6', 'Ajustes', 'Rodadas de revisão e validação.'], ['Semanas 7 e 8', 'Entrega', 'Manual de marca e painel financeiro.']];
  const els = title(K, t.title || 'Cronograma do projeto').concat([Ln(K, { x: 200, y: 548, w: 1520, sw: 4, color: K.fg, op: 0.3 })]);
  st.forEach((s, i) => { const cx = 200 + i * (1520 / (st.length - 1));
    els.push(SX.el('ellipse', { x: cx - 22, y: 538, w: 44, h: 44, fill: K.acc }, K), T(K, { x: cx - 200, y: 455, w: 400, text: s[0], size: 24, weight: 600, ls: 2, up: true, align: 'center', color: K.acc }), T(K, { x: cx - 200, y: 630, w: 400, text: s[1], size: 38, weight: 700, align: 'center', font: K.f0 }), T(K, { x: cx - 190, y: 694, w: 380, text: s[2], size: 24, op: 0.72, lh: 1.5, align: 'center' })); });
  return { bg: K.bg, els }; } };
LY.equipe = { nome: 'Equipe', make: (K, t) => { const p = t.people || [['[Nome]', 'Sócio · Finanças'], ['[Nome]', 'Sócio · Design'], ['[Nome]', 'Sócio · Estratégia'], ['[Nome]', 'Sócio · Comercial']];
  const els = title(K, t.title || 'Quem faz a Imagine', true);
  p.forEach((r, i) => { const x = 150 + i * 430; els.push(Fr(K, { x, y: 300, w: 300, h: 300, mask: 'circle', fill: SX.mix(K.fg, K.bg, 0.15) }), T(K, { x: x - 30, y: 650, w: 360, text: r[0], size: 34, weight: 700, align: 'center', color: K.bg, font: K.f0 }), T(K, { x: x - 30, y: 705, w: 360, text: r[1], size: 24, align: 'center', color: K.bg, op: 0.7 })); });
  return { bg: K.fg, els }; } };
LY.citacao = { nome: 'Depoimento', make: (K, t) => ({ bg: K.alt, els: [
  T(K, { x: 120, y: 40, w: 300, text: '“', size: 320, font: K.f0, color: K.acc, lh: 1, weight: 700 }),
  T(K, { x: 260, y: 330, w: 1400, text: t.quote || 'A Imagine organizou nosso caixa e nossa marca ao mesmo tempo. Hoje sabemos para onde vamos.', size: 60, weight: 500, ital: true, font: K.f0, lh: 1.3 }),
  T(K, { x: 260, y: 780, w: 1000, text: t.author || '[Nome do cliente] · [Empresa]', size: 30, weight: 600, color: K.acc })
] }) };
LY.comparativo = { nome: 'Comparativo', make: (K, t) => { const a = t.a || ['Hoje', 'Caixa controlado em planilhas\nSem reserva de emergência\nPreço definido pelo mercado'], b = t.b || ['Em 6 meses', 'Painel financeiro semanal\nReserva de 3 meses de custos\nPreço com margem calculada'];
  return { bg: K.bg, els: title(K, t.title || 'Onde estamos e onde queremos chegar').concat([
    R(K, { x: 120, y: 300, w: 810, h: 620, radius: 24, fill: K.alt }), T(K, { x: 176, y: 356, w: 700, text: a[0], size: 48, weight: 700, font: K.f0 }), T(K, { x: 176, y: 450, w: 700, text: a[1], size: 30, lh: 1.75, list: 'bullet', op: 0.85 }),
    R(K, { x: 990, y: 300, w: 810, h: 620, radius: 24, fill: K.acc }), T(K, { x: 1046, y: 356, w: 700, text: b[0], size: 48, weight: 700, font: K.f0, color: K.bg }), T(K, { x: 1046, y: 450, w: 700, text: b[1], size: 30, lh: 1.75, list: 'bullet', color: K.bg, weight: 500 }),
    Ic(K, { x: 922, y: 572, w: 76, h: 76, name: 'arrowR', color: K.fg, sw: 2 })
  ]) }; } };
LY.precos = { nome: 'Investimento', make: (K, t) => { const pl = t.plans || [['Essencial', 'R$ [valor]', 'projeto único', 'Identidade visual\nManual de marca\n2 rodadas de revisão'], ['Completo', 'R$ [valor]', 'projeto + 3 meses', 'Identidade visual\nPlanejamento financeiro\nPainel de indicadores\nAcompanhamento mensal'], ['Mensal', 'R$ [valor]', 'por mês', 'Gestão de redes sociais\nRelatório financeiro\nReunião de resultados']];
  const els = title(K, t.title || 'Investimento', true);
  pl.forEach((p, i) => { const x = 120 + i * 600, feat = i === 1, tc = feat ? K.fg : K.bg;
    els.push(R(K, feat ? { x, y: 290, w: 520, h: 650, radius: 24, fill: K.bg } : { x, y: 290, w: 520, h: 650, radius: 24, fill: 'transparent', sw: 3, stroke: K.bg }));
    if (feat) els.push(R(K, { x: x + 300, y: 340, w: 170, h: 44, radius: 22, fill: K.acc }), T(K, { x: x + 300, y: 349, w: 170, text: 'Recomendado', size: 18, weight: 700, align: 'center', color: K.bg }));
    els.push(T(K, { x: x + 50, y: 340, w: 260, text: p[0], size: 32, weight: 700, color: tc }), T(K, { x: x + 50, y: 420, w: 440, text: p[1], size: 64, weight: 700, font: K.f0, color: feat ? K.acc : tc }), T(K, { x: x + 50, y: 510, w: 440, text: p[2], size: 22, op: 0.7, color: tc }), T(K, { x: x + 50, y: 590, w: 430, text: p[3], size: 24, lh: 1.75, list: 'bullet', color: tc })); });
  return { bg: K.fg, els }; } };
LY.fim = { nome: 'Encerramento', make: (K, t) => ({ bg: K.bg, els: SX.logoEls(K, 885, 170, 150).concat([
  T(K, { x: 0, y: 380, w: 1920, text: t.title || 'Obrigado', size: 140, weight: 700, align: 'center', font: K.f0, lh: 1.05 }),
  T(K, { x: 0, y: 580, w: 1920, text: t.sub || 'Vamos transformar ideias em resultado.', size: 34, align: 'center', op: 0.75 }),
  Ic(K, { x: 300, y: 800, w: 40, h: 40, name: 'phone', color: K.acc, sw: 2 }), T(K, { x: 356, y: 802, w: 360, text: '(00) 0 0000-0000', size: 28 }),
  Ic(K, { x: 760, y: 800, w: 40, h: 40, name: 'mail', color: K.acc, sw: 2 }), T(K, { x: 816, y: 802, w: 440, text: 'contato@imagineconcept.com.br', size: 28 }),
  Ic(K, { x: 1340, y: 800, w: 40, h: 40, name: 'social', color: K.acc, sw: 2 }), T(K, { x: 1396, y: 802, w: 360, text: '@imagineconcept', size: 28 })
]) }) };
SX.makeLayout = (key, K, doc, t) => {
  const pg = LY[key].make(K, t || {});
  const out = { id: uid('pg'), bg: pg.bg, bgGrad: pg.bgGrad || null, bgImg: null, els: pg.els, notes: (t && t.notes) || '', trans: 'none', hidden: false };
  if (doc && (doc.w !== 1920 || doc.h !== 1080)) SX.scalePage(out, doc.w / 1920, doc.h / 1080);
  return out;
};

/* Apresentações completas */
SX.DECKS = [
  { id: 'proposta', nome: 'Proposta comercial', desc: 'Diagnóstico, cronograma e investimento', pages: [
    ['capa', { eyebrow: 'PROPOSTA COMERCIAL', title: 'Identidade visual e gestão financeira', sub: 'Preparada para [Nome do cliente] pela Imagine Concept.', notes: 'Agradecer o tempo e relembrar a dor principal levantada no mapeamento.' }],
    ['sumario', { items: ['Diagnóstico', 'O que propomos', 'Cronograma', 'Investimento'] }],
    ['texto', { title: 'O que encontramos', notes: 'Usar exemplos concretos que o cliente citou na R1.' }],
    ['linha', { title: 'Cronograma em 8 semanas' }],
    ['precos', { title: 'Investimento', notes: 'Apresentar primeiro o plano Completo. Reforçar que o sim verbal ativa o projeto.' }],
    ['fim', {}]
  ] },
  { id: 'diagnostico', nome: 'Diagnóstico financeiro', desc: 'Indicadores, gráfico e plano de metas', pages: [
    ['capa', { eyebrow: 'DIAGNÓSTICO FINANCEIRO', title: 'Como está o caixa da [Nome do cliente]', sub: 'Análise dos últimos 6 meses e próximos passos.' }],
    ['numeros', { title: 'Resumo do período' }],
    ['grafico', { title: 'Faturamento por mês', fmt: 'num' }],
    ['tabela', { title: 'Despesas por categoria' }],
    ['comparativo', {}],
    ['fim', {}]
  ] },
  { id: 'institucional', nome: 'Apresentação institucional', desc: 'Quem somos, equipe e método', pages: [
    ['capa', { eyebrow: 'IMAGINE CONCEPT', title: 'Ideias que viram resultado', sub: 'Design e planejamento financeiro para empresas que querem crescer com clareza.' }],
    ['imgTexto', {}],
    ['equipe', {}],
    ['numeros', { title: 'Como trabalhamos', items: [['01', 'Imersão', 'Entendemos o negócio, os números e o público.'], ['02', 'Criação', 'Marca e estrutura financeira construídas juntas.'], ['03', 'Acompanhamento', 'Indicadores e ajustes todos os meses.']] }],
    ['citacao', {}],
    ['fim', {}]
  ] },
  { id: 'relatorio', nome: 'Relatório mensal ao cliente', desc: 'Resultados, metas e próximos passos', pages: [
    ['capa', { eyebrow: 'RELATÓRIO MENSAL', title: 'Resultados de ' + MESES_L[TODAY.getMonth()], sub: '[Nome do cliente] · acompanhamento financeiro e de marca.' }],
    ['numeros', { title: 'Indicadores do mês', items: [['R$ 32,5 mil', 'Faturamento', '+6% sobre o mês anterior.'], ['R$ 9,1 mil', 'Resultado', 'Margem de 28%.'], ['12', 'Peças publicadas', 'Alcance médio de 4,2 mil contas.']] }],
    ['grafico', { title: 'Evolução do faturamento', kind: 'line' }],
    ['tabela', { title: 'Metas do mês', cells: [['Meta', 'Previsto', 'Realizado', 'Status'], ['Faturamento', 'R$ 30 mil', 'R$ 32,5 mil', 'Atingida'], ['Margem', '25%', '28%', 'Atingida'], ['Novos clientes', '4', '3', 'Parcial'], ['Posts publicados', '12', '12', 'Atingida']] }],
    ['texto', { title: 'Próximos passos', para: 'O mês fechou acima da meta de faturamento. O foco agora é reduzir o prazo de recebimento e manter a frequência de publicações.', bullets: 'Renegociar prazo com 2 clientes\nReserva de caixa: guardar 10%\nCampanha de fim de ano' }],
    ['fim', {}]
  ] },
  { id: 'pitch', nome: 'Pitch de identidade visual', desc: 'Conceito, paleta e antes e depois', pages: [
    ['capa', { eyebrow: 'IDENTIDADE VISUAL', title: 'Nova marca para [Nome do cliente]', sub: 'Conceito, paleta e aplicações.' }],
    ['secao', { num: '01', title: 'O conceito', sub: 'De onde vem a ideia por trás da nova marca.' }],
    ['imgTexto', { eyebrow: 'CONCEITO', title: '[Nome do conceito]', text: 'A marca parte da história da empresa e do que os clientes mais valorizam nela. Cada escolha de forma, cor e letra reforça essa ideia.' }],
    ['duas', { title: 'Paleta e tipografia' }],
    ['comparativo', { title: 'Antes e depois', a: ['Antes', 'Logo difícil de ler em tamanho pequeno\nCores diferentes em cada peça\nSem padrão nas redes'], b: ['Depois', 'Símbolo simples e memorável\nPaleta fixa com 3 cores\nModelos prontos para as redes'] }],
    ['fim', {}]
  ] }
];
SX.makeDeck = (deck, K, doc) => deck.pages.map(([k, t]) => SX.makeLayout(k, K, doc, t));

/* Modelos para redes sociais e documentos */
SX.SOCIAL = [
  { id: 's1', nome: 'Lançamento', fmt: 'post', make: (K) => ({ bg: K.bg, els: [
    SX.el('ellipse', { x: 640, y: 620, w: 620, h: 620, fill: K.acc, op: 0.9 }, K),
    R(K, { x: 80, y: 96, w: 240, h: 56, radius: 28, fill: 'transparent', stroke: K.acc, sw: 3 }),
    T(K, { x: 80, y: 109, w: 240, text: 'LANÇAMENTO', size: 24, weight: 600, ls: 4, align: 'center', color: K.acc }),
    T(K, { x: 80, y: 220, w: 760, text: 'Nova\ncoleção\nde outono', size: 132, weight: 800, lh: 0.98, font: K.f0 }),
    T(K, { x: 80, y: 650, w: 520, text: 'Peças feitas à mão, com madeira certificada e acabamento natural.', size: 34, lh: 1.4, op: 0.8 }),
    T(K, { x: 80, y: 960, w: 600, text: K.nome, size: 26, weight: 600, ls: 2, up: true })
  ] }) },
  { id: 's2', nome: 'Dica financeira', fmt: 'post', make: (K) => ({ bg: K.fg, els: [
    R(K, { x: 0, y: 0, w: 1080, h: 18, fill: K.acc }),
    T(K, { x: 80, y: 110, w: 300, text: '3', size: 300, weight: 800, lh: 1, font: K.f0, color: K.alt }),
    T(K, { x: 80, y: 430, w: 900, text: 'passos para organizar o caixa da sua empresa', size: 74, weight: 700, lh: 1.08, font: K.f0, color: K.bg }),
    T(K, { x: 80, y: 700, w: 880, text: 'Separe contas PF e PJ\nRegistre cada entrada e saída\nRevise o fluxo toda semana', size: 36, lh: 1.6, list: 'num', color: K.bg }),
    Ln(K, { x: 80, y: 958, w: 920, sw: 3, color: K.bg, op: 0.25 }),
    T(K, { x: 80, y: 992, w: 600, text: '@imagineconcept', size: 26, weight: 500, color: K.bg, op: 0.7 }),
    Ic(K, { x: 920, y: 984, w: 48, h: 48, name: 'arrowR', color: K.bg, sw: 2 })
  ] }) },
  { id: 's3', nome: 'Agenda aberta', fmt: 'story', make: (K) => ({ bg: K.acc, els: [
    SX.el('ellipse', { x: -260, y: -200, w: 900, h: 900, fill: K.fg, op: 0.18 }, K),
    T(K, { x: 90, y: 620, w: 900, text: 'Agenda\naberta para\n' + MESES_L[(TODAY.getMonth() + 1) % 12], size: 140, weight: 800, lh: 0.98, font: K.f0, color: K.bg }),
    T(K, { x: 90, y: 1130, w: 820, text: 'Planejamento financeiro e identidade visual para empresas que querem crescer com clareza.', size: 42, lh: 1.4, color: K.bg }),
    R(K, { x: 90, y: 1560, w: 640, h: 120, radius: 60, fill: K.bg }),
    T(K, { x: 90, y: 1597, w: 640, text: 'Agende sua conversa', size: 40, weight: 600, align: 'center' })
  ] }) },
  { id: 's4', nome: 'Carrossel · capa', fmt: 'retrato', make: (K) => ({ bg: K.alt, els: [
    T(K, { x: 90, y: 110, w: 600, text: 'FINANÇAS · PARTE 1', size: 28, weight: 600, ls: 4, color: K.acc }),
    T(K, { x: 90, y: 420, w: 900, text: 'Por que sua empresa fatura e o dinheiro some?', size: 96, weight: 800, lh: 1.04, font: K.f0 }),
    R(K, { x: 90, y: 1130, w: 300, h: 90, radius: 45, fill: K.acc }),
    T(K, { x: 90, y: 1155, w: 220, text: 'Arraste', size: 34, weight: 600, align: 'center', color: K.bg }),
    Ic(K, { x: 300, y: 1145, w: 60, h: 60, name: 'arrowR', color: K.bg, sw: 2.2 })
  ] }) },
  { id: 's5', nome: 'Número em destaque', fmt: 'post', make: (K) => ({ bg: K.bg, els: [
    T(K, { x: 80, y: 120, w: 920, text: 'Resultado do trimestre', size: 40, weight: 500, op: 0.75 }),
    T(K, { x: 80, y: 260, w: 920, text: '+38%', size: 260, weight: 800, lh: 1, font: K.f0, color: K.acc }),
    T(K, { x: 80, y: 560, w: 820, text: 'de margem após reorganizar o fluxo de caixa e a precificação.', size: 46, weight: 500, lh: 1.3 }),
    R(K, { x: 80, y: 900, w: 920, h: 2, fill: K.fg, op: 0.25 }),
    T(K, { x: 80, y: 930, w: 800, text: K.nome, size: 28, weight: 600 })
  ] }) },
  { id: 's6', nome: 'Depoimento', fmt: 'post', make: (K) => ({ bg: K.alt, els: [
    T(K, { x: 80, y: 60, w: 300, text: '“', size: 260, font: K.f0, color: K.acc, lh: 1, weight: 700 }),
    T(K, { x: 80, y: 330, w: 920, text: 'Em três meses entendemos para onde ia cada real do caixa.', size: 64, weight: 600, ital: true, font: K.f0, lh: 1.25 }),
    Fr(K, { x: 80, y: 820, w: 140, h: 140, mask: 'circle', fill: SX.mix(K.alt, K.fg, 0.2) }),
    T(K, { x: 250, y: 850, w: 700, text: '[Nome do cliente]', size: 34, weight: 700 }),
    T(K, { x: 250, y: 900, w: 700, text: '[Cargo · Empresa]', size: 26, op: 0.7 })
  ] }) },
  { id: 's7', nome: 'Banner institucional', fmt: 'linkedin', make: (K) => ({ bg: K.bg, els: [
    R(K, { x: 1000, y: 0, w: 584, h: 396, fill: K.alt }),
    SX.el('ellipse', { x: 1180, y: 60, w: 280, h: 280, fill: K.acc, op: 0.9 }, K),
    T(K, { x: 440, y: 120, w: 560, text: 'Ideias que viram resultado', size: 54, weight: 700, lh: 1.05, font: K.f0 }),
    T(K, { x: 440, y: 260, w: 560, text: 'Design · Planejamento financeiro', size: 24, weight: 500, color: K.acc })
  ] }) },
  { id: 's8', nome: 'Cartão de visita', fmt: 'cartao', make: (K) => ({ bg: K.bg, els: SX.logoEls(K, 70, 70, 110).concat([
    T(K, { x: 70, y: 300, w: 600, text: 'Seu Nome', size: 52, weight: 700, font: K.f0 }),
    T(K, { x: 70, y: 372, w: 600, text: 'Sócio · Consultoria financeira', size: 26, color: K.acc }),
    Ic(K, { x: 70, y: 470, w: 30, h: 30, name: 'phone', color: K.acc, sw: 2 }), T(K, { x: 116, y: 470, w: 380, text: '(00) 0 0000-0000', size: 24 }),
    Ic(K, { x: 520, y: 470, w: 30, h: 30, name: 'mail', color: K.acc, sw: 2 }), T(K, { x: 566, y: 470, w: 440, text: 'contato@imagineconcept.com.br', size: 24 })
  ]) }) },
  { id: 's9', nome: 'Capa de vídeo', fmt: 'youtube', make: (K) => ({ bg: K.bg, els: [
    Fr(K, { x: 700, y: 0, w: 580, h: 720 }),
    SX.el('shape', { x: 620, y: 0, w: 160, h: 720, kind: 'para', fill: K.acc }, K),
    T(K, { x: 70, y: 180, w: 600, text: 'Como precificar seus serviços', size: 76, weight: 800, font: K.f0, lh: 1.02 }),
    T(K, { x: 70, y: 520, w: 520, text: 'Episódio 04', size: 28, weight: 600, color: K.acc, ls: 3, up: true })
  ] }) },
  { id: 's10', nome: 'Documento timbrado', fmt: 'a4', make: (K) => ({ bg: '#FFFFFF', els: SX.logoEls(K, 100, 90, 90, false).concat([
    T(K, { x: 220, y: 108, w: 700, text: K.nome, size: 34, weight: 700, font: K.f0, color: K.id === 'ic' ? '#0E2152' : K.bg }),
    R(K, { x: 100, y: 220, w: 1040, h: 4, fill: K.acc }),
    T(K, { x: 100, y: 300, w: 1040, text: 'Título do documento', size: 54, weight: 700, font: K.f0, color: '#111111' }),
    T(K, { x: 100, y: 400, w: 1040, text: 'Escreva aqui o conteúdo. Este modelo serve para propostas, relatórios curtos e comunicados com a identidade da marca.', size: 26, lh: 1.6, color: '#333333' }),
    R(K, { x: 0, y: 1690, w: 1240, h: 64, fill: K.id === 'ic' ? '#0E2152' : K.bg }),
    T(K, { x: 100, y: 1708, w: 1040, text: 'contato@imagineconcept.com.br · @imagineconcept', size: 20, color: '#FFFFFF', op: 0.85 })
  ]) }) }
];
SX.makeSocial = (t, K) => { const pg = t.make(K); return { id: uid('pg'), bg: pg.bg, bgGrad: null, bgImg: null, els: pg.els, notes: '', trans: 'none', hidden: false }; };

/* ---------- Exportação em canvas ---------- */
const loadImg = SX.loadImg = (src) => new Promise((res) => { if (!src) return res(null); const i = new Image(); if (/^https?:/.test(src)) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const rrPath = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (!r) { ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); return; }
  const [a, b, c, d] = r;
  ctx.moveTo(x + a, y); ctx.lineTo(x + w - b, y); ctx.arcTo(x + w, y, x + w, y + b, b); ctx.lineTo(x + w, y + h - c); ctx.arcTo(x + w, y + h, x + w - c, y + h, c);
  ctx.lineTo(x + d, y + h); ctx.arcTo(x, y + h, x, y + h - d, d); ctx.lineTo(x, y + a); ctx.arcTo(x, y, x + a, y, a); ctx.closePath();
};
const cGrad = (ctx, w, h, c1, g) => { const p = SX.gradXY(w, h, g.ang), gr = ctx.createLinearGradient(p.x1, p.y1, p.x2, p.y2); gr.addColorStop(0, c1); gr.addColorStop(1, g.c2); return gr; };
const wrap = (ctx, text, maxW) => {
  const out = [];
  String(text).split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(w => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW + 0.5 && line) { out.push(line); line = w; } else line = test; });
    out.push(line);
  });
  return out;
};
const drawPrims = (ctx, P) => P.forEach(p => {
  ctx.save(); if (p.op != null) ctx.globalAlpha *= p.op;
  if (p.t === 'rect') { ctx.fillStyle = p.fill; const r = Math.min(p.r || 0, p.w / 2, p.h / 2); rrPath(ctx, p.x, p.y, p.w, p.h, [r, r, r, r]); ctx.fill(); }
  else if (p.t === 'line') { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke(); }
  else if (p.t === 'circle') { ctx.fillStyle = p.fill; ctx.beginPath(); ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2); ctx.fill(); }
  else if (p.t === 'poly') { ctx.beginPath(); p.pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); if (!p.open) ctx.closePath(); if (p.fill) { ctx.fillStyle = p.fill; ctx.fill(); } if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } }
  else if (p.t === 'arc') { const d = arcD(p); if (d) { ctx.fillStyle = p.fill; ctx.fill(new Path2D(d)); } }
  else if (p.t === 'text') { ctx.font = p.weight + ' ' + p.s + 'px "' + p.font + '"'; ctx.fillStyle = p.color; ctx.textBaseline = 'middle'; ctx.textAlign = p.anchor === 'middle' ? 'center' : p.anchor === 'end' ? 'right' : 'left'; ctx.fillText(p.txt, p.x, p.y); }
  ctx.restore();
});
async function loadFonts(pages) {
  const set = new Set();
  pages.forEach(pg => pg.els.forEach(e => {
    if (e.type === 'text') set.add((e.ital ? 'italic ' : '') + e.weight + ' 40px "' + e.font + '"');
    if (e.type === 'chart') { set.add('400 40px "' + e.font + '"'); set.add('600 40px "' + e.font + '"'); }
    if (e.type === 'table') { set.add('400 40px "' + e.font + '"'); set.add('700 40px "' + e.font + '"'); }
  }));
  try { await Promise.all([...set].map(f => document.fonts.load(f))); } catch (er) {}
}
async function drawEl(ctx, e, S) {
  if (e.type === 'rect' || e.type === 'ellipse' || e.type === 'frame') {
    const r = SX.radii(e); rrPath(ctx, 0, 0, e.w, e.h, r);
    if (e.shadow) { ctx.shadowColor = 'rgba(0,0,0,.38)'; ctx.shadowBlur = 44 * S; ctx.shadowOffsetY = 18 * S; }
    if (e.fill && e.fill !== 'transparent') { ctx.fillStyle = e.grad ? cGrad(ctx, e.w, e.h, e.fill, e.grad) : e.fill; ctx.fill(); }
    ctx.shadowColor = 'transparent';
    if (e.sw && e.type !== 'frame') { ctx.save(); rrPath(ctx, 0, 0, e.w, e.h, r); ctx.clip(); ctx.lineWidth = e.sw * 2; ctx.strokeStyle = e.stroke; ctx.setLineDash(SX.dashArr(e.dash, e.sw * 2)); if (e.dash === 'dotted') ctx.lineCap = 'round'; rrPath(ctx, 0, 0, e.w, e.h, r); ctx.stroke(); ctx.restore(); }
  } else if (e.type === 'shape') {
    const pts = SX.polyPts(e); ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    if (e.shadow) { ctx.shadowColor = 'rgba(0,0,0,.38)'; ctx.shadowBlur = 20 * S; ctx.shadowOffsetY = 16 * S; }
    if (e.fill && e.fill !== 'transparent') { ctx.fillStyle = e.grad ? cGrad(ctx, e.w, e.h, e.fill, e.grad) : e.fill; ctx.fill(); }
    ctx.shadowColor = 'transparent';
    if (e.sw) { ctx.lineWidth = e.sw; ctx.strokeStyle = e.stroke; ctx.lineJoin = 'round'; ctx.setLineDash(SX.dashArr(e.dash, e.sw)); ctx.stroke(); }
  } else if (e.type === 'line') {
    const g = SX.lineGeom(e), L = g.L; ctx.strokeStyle = e.color; ctx.fillStyle = e.color; ctx.lineWidth = e.sw; ctx.setLineDash(SX.dashArr(e.dash, e.sw)); ctx.lineCap = e.dash === 'dotted' ? 'round' : 'butt';
    ctx.beginPath(); ctx.moveTo(g.x1, g.y); ctx.lineTo(g.x2, g.y); ctx.stroke(); ctx.setLineDash([]);
    const tri = (tx, bx) => { ctx.beginPath(); ctx.moveTo(tx, g.y); ctx.lineTo(bx, g.y - L * 0.55); ctx.lineTo(bx, g.y + L * 0.55); ctx.closePath(); ctx.fill(); };
    if (e.cap2 === 'arrow') tri(e.w, e.w - L); if (e.cap1 === 'arrow') tri(0, L);
    if (e.cap2 === 'dot') { ctx.beginPath(); ctx.arc(e.w - e.sw * 1.2, g.y, e.sw * 1.2, 0, Math.PI * 2); ctx.fill(); }
    if (e.cap1 === 'dot') { ctx.beginPath(); ctx.arc(e.sw * 1.2, g.y, e.sw * 1.2, 0, Math.PI * 2); ctx.fill(); }
  } else if (e.type === 'text') {
    ctx.font = (e.ital ? 'italic ' : '') + e.weight + ' ' + e.size + 'px "' + e.font + '"';
    try { ctx.letterSpacing = e.ls + 'px'; } catch (er) {}
    ctx.textBaseline = 'middle';
    const lines = wrap(ctx, e.up ? SX.listText(e).toUpperCase() : SX.listText(e), e.w), lh = e.size * e.lh;
    lines.forEach((ln, i) => {
      const w = ctx.measureText(ln).width, x = e.align === 'center' ? (e.w - w) / 2 : e.align === 'right' ? e.w - w : 0, y = i * lh + lh / 2;
      ctx.save();
      if (e.eff === 'highlight' && ln) { ctx.fillStyle = e.effC; ctx.fillRect(x - e.size * 0.18, y - e.size * 0.62, w + e.size * 0.36, e.size * 1.24); }
      if (e.eff === 'shadow') { ctx.shadowColor = SX.hexA(e.effC, 0.75); ctx.shadowOffsetX = ctx.shadowOffsetY = e.size * 0.06 * S; ctx.shadowBlur = e.size * 0.1 * S; }
      if (e.eff === 'lift') { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowOffsetY = e.size * 0.06 * S; ctx.shadowBlur = e.size * 0.3 * S; }
      if (e.eff === 'neon') { ctx.shadowColor = e.effC; ctx.shadowBlur = e.size * 0.3 * S; }
      if (e.eff === 'outline') { ctx.lineWidth = Math.max(1, e.size * 0.025); ctx.strokeStyle = e.color; ctx.lineJoin = 'round'; ctx.strokeText(ln, x, y); }
      else { ctx.fillStyle = e.color; ctx.fillText(ln, x, y); if (e.eff === 'neon') ctx.fillText(ln, x, y); }
      ctx.restore();
      if (e.und || e.strike) { ctx.fillStyle = e.color; const th = Math.max(1, e.size * 0.06); if (e.und) ctx.fillRect(x, y + e.size * 0.38, w, th); if (e.strike) ctx.fillRect(x, y + e.size * 0.02, w, th); }
    });
  } else if (e.type === 'image') {
    const im = await loadImg(SX.src(e.src)), r = SX.radii(e);
    ctx.save(); rrPath(ctx, 0, 0, e.w, e.h, r); ctx.clip();
    if (im) { const b = SX.imgBox(e); try { ctx.filter = SX.filterCSS(e); } catch (er) {} ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(e.flipH ? -1 : 1, e.flipV ? -1 : 1); ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h); }
    ctx.restore();
    if (e.sw) { ctx.save(); rrPath(ctx, 0, 0, e.w, e.h, r); ctx.clip(); ctx.lineWidth = e.sw * 2; ctx.strokeStyle = e.stroke; rrPath(ctx, 0, 0, e.w, e.h, r); ctx.stroke(); ctx.restore(); }
  } else if (e.type === 'icon') {
    ctx.scale(e.w / 24, e.h / 24); ctx.strokeStyle = e.color; ctx.fillStyle = e.color; ctx.lineWidth = e.sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const svgDoc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + (ICON_PATHS[e.name] || '') + '</svg>', 'image/svg+xml');
    [...svgDoc.documentElement.children].forEach(n => {
      const fillIt = n.getAttribute('fill') === 'currentColor', A = (k) => +(n.getAttribute(k) || 0);
      let p = null;
      if (n.nodeName === 'path') p = new Path2D(n.getAttribute('d'));
      else if (n.nodeName === 'circle') { p = new Path2D(); p.arc(A('cx'), A('cy'), A('r'), 0, Math.PI * 2); }
      else if (n.nodeName === 'ellipse') { p = new Path2D(); p.ellipse(A('cx'), A('cy'), A('rx'), A('ry'), 0, 0, Math.PI * 2); }
      else if (n.nodeName === 'rect') { const rr = A('rx'); p = new Path2D(); if (p.roundRect) p.roundRect(A('x'), A('y'), A('width'), A('height'), rr); else p.rect(A('x'), A('y'), A('width'), A('height')); }
      if (p) { if (fillIt) ctx.fill(p); else ctx.stroke(p); }
    });
  } else if (e.type === 'draw') {
    ctx.strokeStyle = e.color; ctx.lineWidth = e.sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const d = SX.drawPath(e); if (d) ctx.stroke(new Path2D(d));
  } else if (e.type === 'chart') {
    drawPrims(ctx, SX.chartPrims(e));
  } else if (e.type === 'table') {
    const rh = e.h / e.rows, cw = e.w / e.cols, pad = e.size * 0.5;
    e.cells.forEach((row, r) => row.forEach((txt, c) => {
      const head = e.head && r === 0, stripe = e.stripe && !head && ((r - (e.head ? 1 : 0)) % 2 === 1), x = c * cw, y = r * rh;
      if (head || stripe) { ctx.fillStyle = head ? e.headFill : e.stripeC; ctx.fillRect(x, y, cw, rh); }
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, rh); ctx.clip();
      ctx.font = (head ? 700 : 400) + ' ' + e.size + 'px "' + e.font + '"'; ctx.fillStyle = head ? e.headColor : e.color; ctx.textBaseline = 'middle';
      const ls = wrap(ctx, txt, cw - pad * 2), lh = e.size * 1.25, y0 = y + rh / 2 - (ls.length - 1) * lh / 2;
      ls.forEach((ln, i) => ctx.fillText(ln, x + pad, y0 + i * lh));
      ctx.restore();
      if (e.bw) { ctx.strokeStyle = e.bc; ctx.lineWidth = e.bw; ctx.strokeRect(x, y, cw, rh); }
    }));
  }
}
SX.renderCanvas = async (doc, pg, scale) => {
  const S = scale || 1, c = document.createElement('canvas');
  c.width = Math.round(doc.w * S); c.height = Math.round(doc.h * S);
  const ctx = c.getContext('2d'); ctx.scale(S, S);
  await loadFonts([pg]);
  ctx.fillStyle = pg.bgGrad ? cGrad(ctx, doc.w, doc.h, pg.bg, pg.bgGrad) : (pg.bg || '#FFFFFF'); ctx.fillRect(0, 0, doc.w, doc.h);
  if (pg.bgImg && pg.bgImg.src) { const im = await loadImg(SX.src(pg.bgImg.src)); if (im) { const b = SX.imgBox({ w: doc.w, h: doc.h, iw: im.naturalWidth, ih: im.naturalHeight, fit: 'cover', px: 50, py: 50, zoom: 1 }); ctx.save(); ctx.globalAlpha = pg.bgImg.op == null ? 1 : pg.bgImg.op; ctx.drawImage(im, b.x, b.y, b.w, b.h); ctx.restore(); } }
  for (const e of pg.els) {
    if (e.hide) continue;
    ctx.save(); ctx.globalAlpha = e.op;
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2); ctx.rotate((e.rot || 0) * Math.PI / 180); ctx.translate(-e.w / 2, -e.h / 2);
    try { await drawEl(ctx, e, S); } catch (er) { console.warn('export', e.type, er); }
    ctx.restore();
  }
  return c;
};

/* ---------- Arquivos ---------- */
SX.fileBase = (d) => (d.nome || 'design').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'design';
const expScale = (doc) => Math.min(2, Math.max(1, 1920 / Math.max(doc.w, doc.h)));
SX.exportImages = async (doc, fmt, pages) => {
  SX.measure(doc, pages);
  toast('Gerando ' + fmt.toUpperCase() + '…');
  for (let i = 0; i < pages.length; i++) {
    const c = await SX.renderCanvas(doc, pages[i], expScale(doc)), type = fmt === 'png' ? 'image/png' : 'image/jpeg';
    let blob; try { blob = await new Promise(r => c.toBlob(r, type, 0.92)); } catch (er) { toast('Uma imagem externa impediu a exportação. Envie a imagem de novo pelo estúdio.', 'warn'); return; }
    const n = doc.pages.indexOf(pages[i]) + 1;
    const ok = await saveFile(SX.fileBase(doc) + (doc.pages.length > 1 ? '-p' + n : '') + '.' + fmt, blob, c.toDataURL(type, 0.85));
    if (!ok) break;
  }
};
SX.exportPDF = async (doc, pages) => {
  if (!W.jspdf) { toast('Gerador de PDF indisponível no momento.', 'warn'); return; }
  SX.measure(doc, pages); toast('Gerando PDF…');
  const { jsPDF } = W.jspdf, o = doc.w >= doc.h ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation: o, unit: 'px', format: [doc.w, doc.h], hotfixes: ['px_scaling'] });
  let first = '';
  for (let i = 0; i < pages.length; i++) {
    const c = await SX.renderCanvas(doc, pages[i], expScale(doc)), url = c.toDataURL('image/jpeg', 0.92);
    if (!i) first = url; else pdf.addPage([doc.w, doc.h], o);
    pdf.addImage(url, 'JPEG', 0, 0, doc.w, doc.h);
  }
  await saveFile(SX.fileBase(doc) + '.pdf', pdf.output('blob'), first);
};
const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
SX.exportPPTX = async (doc, pages) => {
  if (!W.PptxGenJS) { try { toast('Carregando gerador de PowerPoint…'); await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'); } catch (er) { toast('Não foi possível carregar o gerador de PowerPoint agora.', 'warn'); return; } }
  SX.measure(doc, pages); toast('Gerando PowerPoint…');
  const p = new W.PptxGenJS(), wIn = 13.333, hIn = +(wIn * doc.h / doc.w).toFixed(3);
  p.defineLayout({ name: 'IMAGINE', width: wIn, height: hIn }); p.layout = 'IMAGINE'; p.title = doc.nome; p.company = 'Imagine Concept';
  for (const pg of pages) {
    const c = await SX.renderCanvas(doc, pg, expScale(doc)), s = p.addSlide();
    s.addImage({ data: c.toDataURL('image/jpeg', 0.9).replace(/^data:/, ''), x: 0, y: 0, w: wIn, h: hIn });
    if (pg.notes) s.addNotes(pg.notes);
  }
  const blob = await p.write({ outputType: 'blob' });
  await saveFile(SX.fileBase(doc) + '.pptx', blob);
};
SX.thumbData = async (doc, pg, maxW) => { SX.measure(doc, [pg]); const c = await SX.renderCanvas(doc, pg, Math.min(1, (maxW || 900) / Math.max(doc.w, doc.h))); return c.toDataURL('image/jpeg', 0.85); };
})();
