/* Estúdio Imagine · editor de designs e apresentações */
(function(){
const W = window;
const E = W.SXE = { doc: null, pg: 0, sel: [], hover: null, editing: null, crop: null, tedit: null, mode: null, pen: { color: null, sw: 8, op: 1, tool: 'caneta' },
  zoom: null, scale: 1, undo: [], redo: [], tab: 'modelos', panel: true, colorT: 'fill', clip: null, styleClip: null, paint: false, guides: [], marquee: null,
  notes: false, root: null, kitPick: null, liveTok: null, lastLocal: 0, drawPts: null, badge: null, light: false };
const docs = () => (W.ST.docs = W.ST.docs || []);
const page = () => E.doc.pages[E.pg];
const els = () => page().els;
const byId = (id) => els().find(e => e.id === id);
const selEls = () => E.sel.map(byId).filter(Boolean);
const K = () => SX.roles(SX.kitOf(E.doc ? E.doc.kit : 'ic'));
const KP = () => SX.roles(SX.kitOf(E.kitPick || (E.doc && E.doc.kit) || 'ic'));
const NUM = new Set(['x', 'y', 'w', 'h', 'rot', 'op', 'size', 'weight', 'lh', 'ls', 'sw', 'radius', 'zoom', 'px', 'py', 'bri', 'con', 'sat', 'hue', 'sep', 'gray', 'blur', 'fs', 'bw']);
try { E.light = localStorage.getItem('sx.light') === '1'; } catch (er) {}
const $r = (s) => E.root ? E.root.querySelector(s) : null;
const live = () => !!(E.doc && E.root && document.body.contains(E.root) && $r('#sxEd'));

/* ---------- Salvar e histórico ---------- */
let thumbT, savedT;
function save(thumbsAll) {
  E.doc.upd = Date.now(); E.lastLocal = Date.now();
  persist();
  const s = $r('#sxSaved'); if (s) { s.innerHTML = icon('refresh', 'ic-sm') + 'Salvando…'; clearTimeout(savedT); savedT = setTimeout(() => { if (s.isConnected) s.innerHTML = icon('check', 'ic-sm') + 'Salvo'; }, 700); }
  clearTimeout(thumbT); thumbT = setTimeout(() => renderThumbs(!thumbsAll), 300);
}
function snap() { E.undo.push(JSON.stringify({ d: E.doc, p: E.pg })); if (E.undo.length > 100) E.undo.shift(); E.redo = []; }
function liveSnap(tok) { if (E.liveTok !== tok) { snap(); E.liveTok = tok; } }
function restore(s) {
  const o = JSON.parse(s), i = docs().findIndex(d => d.id === o.d.id);
  E.doc = o.d; if (i >= 0) docs()[i] = E.doc;
  E.pg = Math.min(o.p, E.doc.pages.length - 1); E.sel = E.sel.filter(id => byId(id)); E.editing = E.crop = E.tedit = null;
}
function undo() { if (!E.undo.length) return toast('Nada para desfazer'); E.redo.push(JSON.stringify({ d: E.doc, p: E.pg })); restore(E.undo.pop()); save(true); full(); }
function redo() { if (!E.redo.length) return; E.undo.push(JSON.stringify({ d: E.doc, p: E.pg })); restore(E.redo.pop()); save(true); full(); }

/* ---------- Criar e abrir ---------- */
function createDoc(fmt, o) {
  o = o || {};
  const f = SX.FORMATS[fmt] || { w: Math.round(o.w || 1080), h: Math.round(o.h || 1080) };
  const kit = o.kit || 'ic', Kr = SX.roles(SX.kitOf(kit));
  const doc = { id: uid('doc'), nome: o.nome || 'Design sem título', fmt: SX.FORMATS[fmt] ? fmt : 'custom', w: f.w, h: f.h, kit, pages: [], upd: Date.now(), criado: Date.now(), autor: W.ME || '' };
  if (o.deck) doc.pages = SX.makeDeck(o.deck, Kr, doc);
  else if (o.tpl) { doc.pages = [SX.makeSocial(o.tpl, Kr)]; }
  else doc.pages = [SX.blankPage('#FFFFFF')];
  SX.measure(doc);
  docs().unshift(doc); persist();
  return doc;
}
function openDoc(doc) {
  E.doc = doc ? SX.migrateDoc(doc) : null;
  E.pg = 0; E.sel = []; E.editing = E.crop = E.tedit = null; E.mode = null; E.undo = []; E.redo = []; E.zoom = null; E.kitPick = doc ? doc.kit : null;
  E.tab = doc && SX.isDeck(doc) ? 'modelos' : (E.tab && !['cor', 'fontes', 'efeitos', 'animar', 'ajustes', 'dados', 'tabela'].includes(E.tab) ? E.tab : 'modelos');
}

/* ---------- Montagem ---------- */
const RAIL = [['modelos', 'layout', 'Modelos'], ['elementos', 'shapes', 'Elementos'], ['texto', 'text', 'Texto'], ['marca', 'brand', 'Marca'], ['uploads', 'upload', 'Uploads'], ['desenhar', 'pen', 'Desenhar'], ['fundo', 'bg', 'Fundo'], ['posicao', 'list', 'Camadas']];
const CTX_TABS = { cor: 'Cor', fontes: 'Fontes', efeitos: 'Efeitos', animar: 'Animar', ajustes: 'Ajustes da imagem', dados: 'Dados do gráfico', tabela: 'Tabela' };
function mount(root) {
  E.root = root;
  root.innerHTML = '<div class="sx-ed' + (E.light ? ' sx-lightws' : '') + '" id="sxEd">' +
    '<header class="sx-top" id="sxTop"></header>' +
    '<div class="sx-body"><nav class="sx-rail" id="sxRail" aria-label="Ferramentas"></nav><aside class="sx-panel" id="sxPanel" aria-label="Painel"></aside>' +
    '<section class="sx-work"><div class="sx-ctx" id="sxCtx"></div>' +
    '<div class="sx-stage" id="sxStage"><div class="sx-scroll" id="sxScroll"><div class="sx-wrap" id="sxWrap"><div class="sx-ab" id="sxAb"></div><div class="sx-ov" id="sxOv"></div></div></div></div>' +
    '<div class="sx-notes" id="sxNotes" hidden></div><div class="sx-thumbs" id="sxThumbs"></div><footer class="sx-foot" id="sxFoot"></footer></section></div>' +
    '<div class="sx-gridv" id="sxGridV" hidden></div><div class="sx-menu" id="sxMenu" hidden role="menu"></div>' +
    '<input type="file" id="sxFile" accept="image/*" multiple hidden></div>';
  bind(); full();
}
function full() { if (!live()) return; renderTop(); renderRail(); renderPanel(); renderCtx(); renderStage(); renderThumbs(); renderFoot(); renderNotes(); }

/* ---------- Barra superior ---------- */
function renderTop() {
  $r('#sxTop').innerHTML =
    '<button class="sx-tb" data-x="home" title="Voltar ao estúdio">' + icon('chevL', 'ic-sm') + '<span>Estúdio</span></button>' +
    '<button class="sx-tb" data-x="fileMenu">Arquivo ' + icon('chevD', 'ic-sm') + '</button>' +
    '<button class="sx-tb" data-x="resizeMenu">' + icon('resize', 'ic-sm') + '<span>Redimensionar</span></button>' +
    '<span class="sx-tsep"></span>' +
    '<button class="sx-ib" data-x="undo" title="Desfazer (Ctrl+Z)" aria-label="Desfazer">' + icon('undo') + '</button>' +
    '<button class="sx-ib" data-x="redo" title="Refazer (Ctrl+Shift+Z)" aria-label="Refazer">' + icon('redo') + '</button>' +
    '<span class="sx-saved" id="sxSaved">' + icon('check', 'ic-sm') + 'Salvo</span>' +
    '<span class="sp"></span><input class="sx-title" id="sxTitle" aria-label="Nome do design" value="' + esc(E.doc.nome) + '"><span class="sx-fmt">' + esc(SX.fmtOf(E.doc).l) + '</span><span class="sp"></span>' +
    '<button class="sx-tb sx-tb-ghost" data-x="presentMenu">' + icon('play', 'ic-sm') + '<span>Apresentar</span></button>' +
    '<button class="sx-tb sx-tb-pri" data-x="exportMenu">' + icon('download', 'ic-sm') + '<span>Exportar</span></button>';
}

/* ---------- Painel lateral ---------- */
function renderRail() {
  $r('#sxRail').innerHTML = RAIL.map(([k, ic, l]) => '<button data-x="tab" data-v="' + k + '" class="' + (E.tab === k && E.panel ? 'on' : '') + '">' + icon(ic) + '<span>' + l + '</span></button>').join('');
}
const h5 = (t, extra) => '<h5>' + t + (extra || '') + '</h5>';
const tileEl = (spec, inner, name) => { const j = esc(JSON.stringify(spec)); return '<button class="sx-tile sx-eltile" data-x="addEl" data-spec="' + j + '" data-drag="' + j + '" draggable="true" data-n="' + esc((name || '').toLowerCase()) + '" title="' + esc(name || '') + '" aria-label="' + esc(name || '') + '">' + inner + '</button>'; };
const pvCache = new Map();
const cachedPv = (key, fn) => { if (!pvCache.has(key)) { if (pvCache.size > 120) pvCache.clear(); pvCache.set(key, fn()); } return pvCache.get(key); };
const swatch = (c, x, extra) => '<button class="sx-sw" data-x="' + x + '" data-c="' + c + '" style="background:' + (c === 'transparent' ? 'repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 50%/10px 10px' : c) + '" title="' + c + '" aria-label="Cor ' + c + '"' + (extra || '') + '></button>';
const kitSelect = () => '<label class="sx-kitsel">' + icon('brand', 'ic-sm') + '<select data-sx="kitPick" aria-label="Kit de marca">' + SX.kits().map(k => '<option value="' + k.id + '"' + (k.id === (E.kitPick || E.doc.kit) ? ' selected' : '') + '>' + esc(k.nome) + '</option>').join('') + '</select></label>';
function renderPanel() {
  const P = $r('#sxPanel'); P.hidden = !E.panel;
  if (!E.panel) return;
  const t = E.tab, title = CTX_TABS[t] || (RAIL.find(r => r[0] === t) || [0, 0, 'Painel'])[2];
  const body = ({ modelos: pModelos, elementos: pElementos, texto: pTexto, marca: pMarca, uploads: pUploads, desenhar: pDesenhar, fundo: pFundo, posicao: pPosicao, cor: pCor, fontes: pFontes, efeitos: pEfeitos, animar: pAnimar, ajustes: pAjustes, dados: pDados, tabela: pTabela }[t] || pModelos)();
  const sc = P.querySelector('.sx-pb'), keep = sc && P.dataset.tab === t ? sc.scrollTop : 0;
  P.dataset.tab = t;
  P.innerHTML = '<div class="sx-ph"><b>' + title + '</b><button class="sx-ib" data-x="closePanel" aria-label="Fechar painel" title="Fechar painel">' + icon('chevL') + '</button></div><div class="sx-pb">' + body + '</div>';
  const nb = P.querySelector('.sx-pb'); if (nb) nb.scrollTop = keep;
}
function pModelos() {
  const Kp = KP(), doc = E.doc;
  let h = kitSelect();
  if (SX.isDeck(doc)) {
    h += h5('Layouts de página') + '<p class="sx-hint">Clique para adicionar depois da página atual. Página vazia é substituída.</p><div class="sx-grid2">' +
      Object.entries(SX.LAYOUTS).map(([k, L]) => '<button class="sx-tile sx-tpl" data-x="layout" data-k="' + k + '" title="' + L.nome + '">' + cachedPv('L|' + Kp.id + '|' + doc.fmt + '|' + k, () => { const pg = SX.makeLayout(k, Kp, doc); SX.measure(doc, [pg]); return SX.preview(pg, doc, 128, 90); }) + '<span>' + L.nome + '</span></button>').join('') + '</div>' +
      h5('Apresentações completas') + '<p class="sx-hint">Substitui todas as páginas. Dá para desfazer com Ctrl+Z.</p>' +
      SX.DECKS.map(d => '<button class="sx-deck" data-x="deck" data-id="' + d.id + '">' + cachedPv('D|' + Kp.id + '|' + doc.fmt + '|' + d.id, () => { const pg = SX.makeLayout(d.pages[0][0], Kp, doc, d.pages[0][1]); SX.measure(doc, [pg]); return SX.preview(pg, doc, 96, 54); }) + '<span><b>' + esc(d.nome) + '</b><small>' + d.pages.length + ' páginas · ' + esc(d.desc) + '</small></span></button>').join('');
  } else {
    const same = SX.SOCIAL.filter(s => s.fmt === doc.fmt), other = SX.SOCIAL.filter(s => s.fmt !== doc.fmt);
    const tile = (s) => { const f = SX.FORMATS[s.fmt]; return '<button class="sx-tile sx-tpl" data-x="social" data-id="' + s.id + '" title="' + esc(s.nome) + '">' + cachedPv('S|' + Kp.id + '|' + s.id, () => { const pg = SX.makeSocial(s, Kp); SX.measure(f, [pg]); return SX.preview(pg, f, 128, 128); }) + '<span>' + esc(s.nome) + (s.fmt !== doc.fmt ? ' · ' + esc(f.l) : '') + '</span></button>'; };
    h += (same.length ? h5('Para este formato') + '<div class="sx-grid2">' + same.map(tile).join('') + '</div>' : '') + h5('Outros formatos') + '<p class="sx-hint">Aplicar um modelo de outro formato muda o tamanho do design.</p><div class="sx-grid2">' + other.map(tile).join('') + '</div>';
  }
  return h;
}
const svgT = (inner, vb) => '<svg viewBox="' + (vb || '0 0 100 100') + '" class="sx-tsvg" aria-hidden="true">' + inner + '</svg>';
function pElementos() {
  const k = K(), c = 'currentColor';
  const shapes = [
    [{ t: 'rect', p: { w: 400, h: 300 } }, svgT('<rect x="12" y="22" width="76" height="56" fill="' + c + '"/>'), 'Retângulo'],
    [{ t: 'rect', p: { w: 400, h: 300, radius: 48 } }, svgT('<rect x="12" y="22" width="76" height="56" rx="14" fill="' + c + '"/>'), 'Retângulo arredondado'],
    [{ t: 'ellipse', p: { w: 320, h: 320 } }, svgT('<circle cx="50" cy="50" r="36" fill="' + c + '"/>'), 'Círculo'],
    [{ t: 'rect', p: { w: 400, h: 300, fill: 'transparent', sw: 6 } }, svgT('<rect x="14" y="24" width="72" height="52" fill="none" stroke="' + c + '" stroke-width="6"/>'), 'Contorno'],
    [{ t: 'rect', p: { w: 360, h: 96, radius: 48 } }, svgT('<rect x="8" y="36" width="84" height="28" rx="14" fill="' + c + '"/>'), 'Etiqueta']
  ].concat(Object.keys(SX.POLY).map(kd => [{ t: 'shape', p: { kind: kd, w: 320, h: kd === 'arrow' || kd === 'chev' || kd === 'para' || kd === 'bubble' ? 240 : 320 } }, svgT('<polygon points="' + SX.POLY[kd].map(q => (8 + q[0] * 0.84).toFixed(1) + ',' + (8 + q[1] * 0.84).toFixed(1)).join(' ') + '" fill="' + c + '"/>'), SX.SHAPE_NAMES[kd]]));
  const lines = [
    [{ t: 'line', p: {} }, svgT('<line x1="10" y1="50" x2="90" y2="50" stroke="' + c + '" stroke-width="6"/>'), 'Linha'],
    [{ t: 'line', p: { dash: 'dashed' } }, svgT('<line x1="10" y1="50" x2="90" y2="50" stroke="' + c + '" stroke-width="6" stroke-dasharray="14 9"/>'), 'Linha tracejada'],
    [{ t: 'line', p: { dash: 'dotted' } }, svgT('<line x1="10" y1="50" x2="90" y2="50" stroke="' + c + '" stroke-width="7" stroke-dasharray=".1 13" stroke-linecap="round"/>'), 'Linha pontilhada'],
    [{ t: 'line', p: { cap2: 'arrow' } }, svgT('<line x1="10" y1="50" x2="74" y2="50" stroke="' + c + '" stroke-width="6"/><polygon points="92,50 72,38 72,62" fill="' + c + '"/>'), 'Seta'],
    [{ t: 'line', p: { cap1: 'arrow', cap2: 'arrow' } }, svgT('<line x1="26" y1="50" x2="74" y2="50" stroke="' + c + '" stroke-width="6"/><polygon points="92,50 72,38 72,62" fill="' + c + '"/><polygon points="8,50 28,38 28,62" fill="' + c + '"/>'), 'Seta dupla'],
    [{ t: 'line', p: { cap1: 'dot', cap2: 'dot' } }, svgT('<line x1="16" y1="50" x2="84" y2="50" stroke="' + c + '" stroke-width="6"/><circle cx="14" cy="50" r="8" fill="' + c + '"/><circle cx="86" cy="50" r="8" fill="' + c + '"/>'), 'Conector']
  ];
  const frames = [['rect', '<rect x="14" y="20" width="72" height="60" fill="' + c + '" opacity=".35"/>', 'Moldura retangular', 480, 360], ['rounded', '<rect x="14" y="20" width="72" height="60" rx="10" fill="' + c + '" opacity=".35"/>', 'Moldura arredondada', 480, 360], ['circle', '<circle cx="50" cy="50" r="34" fill="' + c + '" opacity=".35"/>', 'Moldura circular', 360, 360], ['arch', '<path d="M20 86V48a30 30 0 0 1 60 0v38z" fill="' + c + '" opacity=".35"/>', 'Moldura em arco', 320, 440]]
    .map(([m, s, n, w, h]) => [{ t: 'frame', p: { mask: m, w, h } }, svgT(s + '<path d="M38 60l8-8 6 6 8-9 8 11" fill="none" stroke="' + c + '" stroke-width="3"/>'), n]);
  const charts = SX.CHARTS.map(([kd, n]) => [{ t: 'chart', p: { kind: kd } }, svgT(kd === 'pie' ? '<circle cx="50" cy="50" r="34" fill="' + c + '" opacity=".35"/><path d="M50 50V16a34 34 0 0 1 32 44z" fill="' + c + '"/>' : kd === 'donut' ? '<circle cx="50" cy="50" r="30" fill="none" stroke="' + c + '" stroke-opacity=".35" stroke-width="14"/><path d="M50 20a30 30 0 0 1 28 40" fill="none" stroke="' + c + '" stroke-width="14"/>' : kd === 'line' ? '<polyline points="12,72 34,52 54,60 86,24" fill="none" stroke="' + c + '" stroke-width="6" stroke-linejoin="round"/>' : kd === 'bar' ? '<rect x="14" y="20" width="50" height="14" fill="' + c + '"/><rect x="14" y="43" width="72" height="14" fill="' + c + '"/><rect x="14" y="66" width="36" height="14" fill="' + c + '"/>' : '<rect x="16" y="50" width="14" height="34" fill="' + c + '"/><rect x="43" y="28" width="14" height="56" fill="' + c + '"/><rect x="70" y="40" width="14" height="44" fill="' + c + '"/>'), 'Gráfico de ' + n.toLowerCase()]);
  const tables = [[3, 3], [4, 3], [5, 4]].map(([r, cc]) => [{ t: 'table', p: { rows: r, cols: cc, w: cc * 300, h: r * 90 } }, svgT('<rect x="12" y="20" width="76" height="60" fill="none" stroke="' + c + '" stroke-width="3"/><rect x="12" y="20" width="76" height="14" fill="' + c + '"/>' + Array.from({ length: cc - 1 }, (_, i) => '<line x1="' + (12 + 76 / cc * (i + 1)) + '" y1="20" x2="' + (12 + 76 / cc * (i + 1)) + '" y2="80" stroke="' + c + '" stroke-width="2"/>').join('') + Array.from({ length: r - 1 }, (_, i) => '<line x1="12" y1="' + (20 + 60 / r * (i + 1)) + '" x2="88" y2="' + (20 + 60 / r * (i + 1)) + '" stroke="' + c + '" stroke-width="2"/>').join('')), 'Tabela ' + r + '×' + cc]);
  const icons = ['star', 'heart', 'check', 'arrowR', 'phone', 'mail', 'pin', 'bulb', 'target', 'rocket', 'shield', 'trend', 'chart', 'pie', 'coins', 'money', 'calendar', 'clock', 'user', 'globe', 'sparkle', 'send', 'palette', 'brand', 'social', 'note', 'book', 'calc', 'wallet', 'funnel', 'home', 'magic'];
  const grads = [[k.acc, k.alt], [k.alt, k.bg], [k.acc, k.fg], ['#2F5BCB', '#22C1C3'], ['#0E2152', '#7C3AED'], ['#F25C2A', '#D9A441']];
  const sec = (t, list) => '<div class="sx-sec" data-sec>' + h5(t) + '<div class="sx-grid4">' + list.map(([s, i, n]) => tileEl(s, i, n)).join('') + '</div></div>';
  return '<input class="sx-search" type="search" data-sx="elQ" placeholder="Buscar elementos" aria-label="Buscar elementos">' +
    sec('Formas', shapes) + sec('Linhas e setas', lines) + sec('Molduras para fotos', frames) + sec('Gráficos', charts) + sec('Tabelas', tables) +
    sec('Ícones', icons.map(n => [{ t: 'icon', p: { name: n } }, icon(n), 'Ícone ' + n])) +
    sec('Degradês', grads.map(([a, b], i) => [{ t: 'rect', p: { w: 480, h: 320, fill: a, grad: { c2: b, ang: 135 } } }, '<i class="sx-gradtile" style="background:linear-gradient(135deg,' + a + ',' + b + ')"></i>', 'Degradê ' + (i + 1)]));
}
function pTexto() {
  const k = K(), w = E.doc.w;
  const T = (p, label, st) => '<button class="sx-txtbtn" data-x="addEl" data-spec="' + esc(JSON.stringify({ t: 'text', p })) + '" data-drag="' + esc(JSON.stringify({ t: 'text', p })) + '" draggable="true"><span style="' + st + '">' + label + '</span></button>';
  return '<button class="sx-big" data-x="addEl" data-spec="' + esc(JSON.stringify({ t: 'text', p: { text: 'Seu texto aqui', size: Math.round(w / 30), w: w * 0.45 } })) + '">' + icon('text') + 'Adicionar caixa de texto</button>' +
    h5('Estilos') +
    T({ text: 'Adicione um título', size: Math.round(w / 13), weight: 700, font: k.f0, w: w * 0.7, lh: 1.1 }, 'Adicionar título', "font-family:'" + k.f0 + "';font-size:24px;font-weight:700") +
    T({ text: 'Adicione um subtítulo', size: Math.round(w / 24), weight: 600, font: k.f0, w: w * 0.6 }, 'Adicionar subtítulo', "font-family:'" + k.f0 + "';font-size:17px;font-weight:600") +
    T({ text: 'Adicione um parágrafo. Clique duas vezes para editar.', size: Math.round(w / 40), font: k.f1, w: w * 0.5, lh: 1.5 }, 'Adicionar corpo de texto', "font-family:'" + k.f1 + "';font-size:13px") +
    T({ text: 'LEGENDA', size: Math.round(w / 60), weight: 600, ls: 3, font: k.f1, w: w * 0.4 }, 'LEGENDA', "font-family:'" + k.f1 + "';font-size:11px;letter-spacing:3px;font-weight:600") +
    T({ text: 'Primeiro tópico\nSegundo tópico\nTerceiro tópico', size: Math.round(w / 40), font: k.f1, w: w * 0.45, lh: 1.6, list: 'bullet' }, '•  Lista com marcadores', "font-family:'" + k.f1 + "';font-size:13px") +
    h5('Combinações') +
    [['hero', '<b style="font-size:18px">Título forte</b><br><small>com linha de apoio</small>'], ['num', '<b style="font-size:24px;color:var(--sky)">+38%</b><br><small>número com legenda</small>'], ['quote', '<i style="font-family:\'Playfair Display\';font-size:15px">“Depoimento de cliente”</i><br><small>citação com autor</small>'], ['tag', '<span class="pill p-sky nodot">NOVIDADE</span> <small>selo</small>'], ['over', '<small style="letter-spacing:2px">SOBRELINHA</small><br><b style="font-size:16px">Título com sobrelinha</b>'], ['cta', '<span class="sx-ctaprev">Agende uma conversa</span>']]
      .map(([v, l]) => '<button class="sx-txtbtn" data-x="combo" data-v="' + v + '">' + l + '</button>').join('') +
    h5('Fontes') + '<div class="sx-fontlist">' + SX.FONTS.map(f => '<button class="sx-txtbtn" data-x="addFontText" data-f="' + f + '" style="font-family:\'' + f + '\';font-size:16px">' + f + '</button>').join('') + '</div>';
}
function pMarca() {
  const k = KP();
  return kitSelect() + h5('Cores') + '<div class="sx-sws">' + k.kit.c.map(c => swatch(c, 'kitColor')).join('') + '</div><p class="sx-hint">Com algo selecionado, a cor vai para o elemento. Sem seleção, vira o fundo da página.</p>' +
    h5('Fontes') + '<button class="sx-txtbtn" data-x="addEl" data-spec="' + esc(JSON.stringify({ t: 'text', p: { text: 'Título', font: k.f0, weight: 700, size: Math.round(E.doc.w / 14), w: E.doc.w * 0.6 } })) + '"><span style="font-family:\'' + k.f0 + '\';font-size:20px;font-weight:700">' + esc(k.f0) + '</span><br><small>Títulos</small></button>' +
    '<button class="sx-txtbtn" data-x="addEl" data-spec="' + esc(JSON.stringify({ t: 'text', p: { text: 'Texto de apoio', font: k.f1, size: Math.round(E.doc.w / 40), w: E.doc.w * 0.5 } })) + '"><span style="font-family:\'' + k.f1 + '\';font-size:15px">' + esc(k.f1) + '</span><br><small>Texto</small></button>' +
    h5('Logo') + '<div class="sx-grid2"><button class="sx-tile sx-logo" data-x="addLogo" data-v="dark" style="background:#0B0D11">' + (k.id === 'ic' ? markSVG(56, '#F2F4F8', '#8FB0FF') : '<span class="kit-logo" style="width:56px;height:56px;background:' + k.acc + ';color:' + k.bg + '">' + esc(SX.initials(k.nome)) + '</span>') + '<span>Fundo escuro</span></button>' +
    '<button class="sx-tile sx-logo" data-x="addLogo" data-v="light" style="background:#F2F4F8;color:#111">' + (k.id === 'ic' ? markSVG(56, '#0E2152', '#2F5BCB') : '<span class="kit-logo" style="width:56px;height:56px;background:' + k.bg + ';color:' + k.acc + '">' + esc(SX.initials(k.nome)) + '</span>') + '<span>Fundo claro</span></button></div>' +
    h5('Aplicar kit') + '<button class="btn btn-sm" data-x="applyKit" data-v="page">' + icon('magic', 'ic-sm') + 'Aplicar à página atual</button><button class="btn btn-sm btn-primary" data-x="applyKit" data-v="doc">' + icon('magic', 'ic-sm') + 'Aplicar ao design inteiro</button>' +
    '<p class="sx-hint">Troca as cores e fontes do kit atual do design pelas do kit escolhido. Os kits dos clientes ficam em Estúdio › Marcas.</p>';
}
function pUploads() {
  const lib = W.ST.imgLib || [];
  const moods = Object.entries(W.ST.mood || {}).flatMap(([cid, arr]) => (arr || []).filter(m => m.t === 'img').map(m => Object.assign({ cid }, m)));
  const tile = (id, src, kind, name) => '<button class="sx-imgt" data-x="addImg" data-k="' + kind + '" data-id="' + id + '" data-drag="' + esc(JSON.stringify({ t: 'img', k: kind, id })) + '" draggable="true" aria-label="Inserir ' + esc(name || 'imagem') + '"><img src="' + SX.src(src) + '" alt="" loading="lazy"></button>';
  return '<label class="sx-big" for="sxFile">' + icon('upload') + 'Enviar imagens</label><p class="sx-hint">Você também pode arrastar arquivos do computador direto para a página ou colar com Ctrl+V.</p>' +
    h5('Seus uploads', ' <small>' + lib.length + '</small>') + (lib.length ? '<div class="sx-imgs">' + lib.map(m => tile(m.id, m.src, 'lib', m.name)).join('') + '</div>' : '<div class="sx-empty">' + icon('image') + 'Nenhuma imagem ainda.</div>') +
    (moods.length ? h5('Dos moodboards') + '<div class="sx-imgs">' + moods.map(m => tile(m.id, m.v, 'mood', m.cap)).join('') + '</div>' : '');
}
function pDesenhar() {
  const p = E.pen, on = E.mode === 'draw', col = p.color || SX.ink(page().bg, K());
  return '<div class="sx-tools">' + [['caneta', 'Caneta', 8, 1], ['marcador', 'Marcador', 18, 1], ['marca', 'Marca-texto', 30, 0.4]].map(([k, l]) => '<button class="sx-tool' + (p.tool === k ? ' on' : '') + '" data-x="penTool" data-v="' + k + '">' + icon('pen') + '<span>' + l + '</span></button>').join('') + '</div>' +
    h5('Cor') + '<div class="sx-sws">' + K().kit.c.concat(['#FFFFFF', '#111111', '#E2615F', '#37B486', '#FACC15']).map(c => swatch(c, 'penColor', c === col ? ' data-on="1"' : '')).join('') + '<label class="sx-sw sx-swpick" title="Outra cor"><input type="color" data-sx="penColor" value="' + SX.toHex(col) + '" aria-label="Escolher cor"></label></div>' +
    h5('Espessura', ' <small>' + p.sw + ' px</small>') + '<input type="range" min="2" max="80" value="' + p.sw + '" data-sx="penSw" aria-label="Espessura">' +
    h5('Transparência', ' <small>' + Math.round(p.op * 100) + '%</small>') + '<input type="range" min="10" max="100" value="' + Math.round(p.op * 100) + '" data-sx="penOp" aria-label="Transparência">' +
    '<button class="sx-big' + (on ? ' on' : '') + '" data-x="drawToggle">' + icon(on ? 'check' : 'pen') + (on ? 'Concluir desenho' : 'Começar a desenhar') + '</button>' +
    '<p class="sx-hint">' + (on ? 'Clique e arraste na página. Cada traço vira um elemento que você pode mover, colorir ou apagar.' : 'Ative o modo desenho para rabiscar setas, destaques e assinaturas.') + '</p>';
}
function pFundo() {
  const pg = page(), k = K();
  const grads = [[k.bg, k.alt], [k.alt, k.acc], [k.acc, k.fg], [k.bg, k.acc], ['#0E2152', '#07080B'], ['#2F5BCB', '#22C1C3'], ['#F25C2A', '#D9A441'], ['#FFFFFF', '#E5E7EB']];
  const lib = W.ST.imgLib || [];
  return h5('Cor') + '<div class="sx-row"><label class="sx-sw sx-swpick sx-swbig" style="background:' + SX.fillCSS(pg.bg, pg.bgGrad) + '"><input type="color" data-sx="bgColor" value="' + SX.toHex(pg.bg) + '" aria-label="Cor de fundo"></label><button class="btn btn-sm" data-x="tab" data-v="cor" data-t="bg">Mais cores e degradê</button></div>' +
    h5('Kit') + '<div class="sx-sws">' + k.kit.c.map(c => swatch(c, 'setBg')).join('') + '</div>' +
    h5('Cores') + '<div class="sx-sws">' + SX.PALETTE.map(c => swatch(c, 'setBg')).join('') + '</div>' +
    h5('Degradês') + '<div class="sx-grid4">' + grads.map(([a, b]) => '<button class="sx-tile" data-x="bgGrad" data-a="' + a + '" data-b="' + b + '" aria-label="Degradê"><i class="sx-gradtile" style="background:linear-gradient(135deg,' + a + ',' + b + ')"></i></button>').join('') + '</div>' +
    h5('Imagem de fundo') + (lib.length ? '<div class="sx-imgs">' + lib.slice(0, 12).map(m => '<button class="sx-imgt" data-x="bgImg" data-id="' + m.id + '" aria-label="Usar como fundo"><img src="' + SX.src(m.src) + '" alt="" loading="lazy"></button>').join('') + '</div>' : '<p class="sx-hint">Envie imagens na aba Uploads para usar como fundo.</p>') +
    (pg.bgImg ? '<div class="sx-row"><span class="sx-lbl">Opacidade</span><input type="range" min="5" max="100" value="' + Math.round((pg.bgImg.op == null ? 1 : pg.bgImg.op) * 100) + '" data-sx="bgOp" aria-label="Opacidade da imagem de fundo"></div><button class="btn btn-sm btn-ghost" data-x="bgImgOff">Remover imagem de fundo</button>' : '') +
    '<button class="btn btn-sm" data-x="bgAll" style="margin-top:8px">Aplicar este fundo a todas as páginas</button>';
}
const layerIcon = (e) => ({ text: 'text', rect: 'square', ellipse: 'circle', shape: 'shapes', line: 'line', image: 'image', frame: 'frame', icon: 'star', draw: 'pen', chart: 'chart', table: 'table' }[e.type] || 'square');
const layerName = (e) => e.type === 'text' ? String(e.text).split('\n')[0].slice(0, 30) || 'Texto' : ({ rect: 'Retângulo', ellipse: 'Círculo', shape: SX.SHAPE_NAMES[e.kind] || 'Forma', line: 'Linha', image: 'Imagem', frame: 'Moldura', icon: 'Ícone', draw: 'Desenho', chart: 'Gráfico', table: 'Tabela' }[e.type]);
function pPosicao() {
  const list = selEls(), one = list.length === 1 ? list[0] : null;
  let h = '';
  if (list.length) {
    h += h5('Organizar') + '<div class="sx-grid2 sx-btns">' + [['top', 'up', 'Para a frente de tudo'], ['up', 'up', 'Para frente'], ['down', 'down', 'Para trás'], ['bottom', 'down', 'Para trás de tudo']].map(([a, ic, l]) => '<button class="btn btn-sm" data-x="order" data-a="' + a + '">' + icon(ic, 'ic-sm') + l + '</button>').join('') + '</div>' +
      h5(list.length > 1 ? 'Alinhar seleção' : 'Alinhar à página') + '<div class="sx-grid4 sx-btns">' + [['left', 'alignL', 'Esquerda'], ['hcenter', 'alignC', 'Centro'], ['right', 'alignR', 'Direita'], ['top', 'alignT', 'Topo'], ['vcenter', 'alignM', 'Meio'], ['bottom', 'alignB', 'Base'], ['distH', 'distH', 'Distribuir na horizontal'], ['distV', 'distV', 'Distribuir na vertical']].map(([a, ic, l]) => '<button class="sx-ib sx-ibb" data-x="align" data-a="' + a + '" title="' + l + '" aria-label="' + l + '"' + (a.startsWith('dist') && list.length < 3 ? ' disabled' : '') + '>' + icon(ic) + '</button>').join('') + '</div>';
    if (one) h += h5('Posição e tamanho') + '<div class="sx-grid2">' + [['x', 'X'], ['y', 'Y'], ['w', 'Largura'], ['h', 'Altura'], ['rot', 'Giro °'], ['op', 'Opacidade']].map(([k, l]) => '<label class="sx-num"><span>' + l + '</span><input type="number" data-p="' + k + '" value="' + (k === 'op' ? Math.round(one.op * 100) : Math.round(one[k])) + '"' + (k === 'h' && one.type === 'text' ? ' disabled' : '') + (k === 'op' ? ' data-pct="1" min="0" max="100"' : '') + '></label>').join('') + '</div>';
  }
  const L = els().slice().reverse();
  h += h5('Camadas', ' <small>da frente para trás</small>') + (L.length ? '<div class="sx-layers" id="sxLayers">' + L.map(e => '<div class="sx-ly' + (E.sel.includes(e.id) ? ' on' : '') + (e.hide ? ' hid' : '') + '" data-x="selLayer" data-id="' + e.id + '" draggable="true">' + icon(layerIcon(e), 'ic-sm') + '<span>' + esc(layerName(e)) + '</span>' +
    '<button data-x="lyHide" data-id="' + e.id + '" aria-label="' + (e.hide ? 'Mostrar' : 'Ocultar') + '" title="' + (e.hide ? 'Mostrar' : 'Ocultar') + '">' + icon(e.hide ? 'eyeoff' : 'eye', 'ic-sm') + '</button>' +
    '<button data-x="lyLock" data-id="' + e.id + '" aria-label="' + (e.lock ? 'Destravar' : 'Travar') + '" title="' + (e.lock ? 'Destravar' : 'Travar') + '">' + icon(e.lock ? 'lock' : 'unlock', 'ic-sm') + '</button></div>').join('') + '</div><p class="sx-hint">Arraste as camadas para mudar a ordem.</p>' : '<div class="sx-empty">Página vazia.</div>');
  return h;
}
const COLOR_LABEL = { fill: 'Preenchimento', color: 'Cor', stroke: 'Borda', effC: 'Cor do efeito', tc: 'Cor do texto do gráfico', headFill: 'Fundo do cabeçalho', headColor: 'Texto do cabeçalho', stripeC: 'Faixa alternada', bc: 'Linhas da tabela', bg: 'Fundo da página' };
function curColor(t) { if (t === 'bg') return page().bg; const e = selEls().find(x => t in x); return e ? e[t] : '#000000'; }
function curGrad(t) { if (t === 'bg') return page().bgGrad; const e = selEls().find(x => 'grad' in x); return t === 'fill' && e ? e.grad : null; }
function docColors() { const set = new Set(); E.doc.pages.forEach(p => { set.add(p.bg); p.els.forEach(e => ['fill', 'color', 'stroke', 'effC'].forEach(k => { if (e[k] && SX.isHex(e[k])) set.add(SX.toHex(e[k])); })); }); return [...set].filter(c => c && c !== 'transparent').slice(0, 18); }
function pCor() {
  const t = E.colorT || 'fill', c = curColor(t), g = curGrad(t), canGrad = t === 'fill' || t === 'bg', canNone = t === 'fill' || t === 'stroke';
  return '<p class="sx-hint">Aplicando em: <b>' + (COLOR_LABEL[t] || t) + '</b></p>' +
    '<div class="sx-row"><label class="sx-sw sx-swpick sx-swbig" style="background:' + SX.fillCSS(c, g) + '"><input type="color" data-sx="colorPick" value="' + SX.toHex(c) + '" aria-label="Escolher cor"></label><input class="sx-hex" data-sx="colorHex" value="' + esc(c === 'transparent' ? '' : c) + '" placeholder="#000000" aria-label="Código da cor"></div>' +
    (canGrad ? '<label class="sx-switch"><input type="checkbox" data-sx="gradOn"' + (g ? ' checked' : '') + '><span>Degradê</span></label>' + (g ? '<div class="sx-row"><span class="sx-lbl">Segunda cor</span><label class="sx-sw sx-swpick" style="background:' + g.c2 + '"><input type="color" data-sx="grad2" value="' + SX.toHex(g.c2) + '" aria-label="Segunda cor"></label></div><div class="sx-row"><span class="sx-lbl">Ângulo</span><input type="range" min="0" max="360" step="5" value="' + g.ang + '" data-sx="gradAng" aria-label="Ângulo do degradê"></div>' : '') : '') +
    (canNone ? '<button class="btn btn-sm btn-ghost" data-x="setColor" data-c="transparent">' + icon('x', 'ic-sm') + 'Sem cor</button>' : '') +
    h5('Cores do documento') + '<div class="sx-sws">' + docColors().map(x => swatch(x, 'setColor')).join('') + '</div>' +
    h5('Kit · ' + esc(K().nome)) + '<div class="sx-sws">' + K().kit.c.map(x => swatch(x, 'setColor')).join('') + '</div>' +
    h5('Cores padrão') + '<div class="sx-sws">' + SX.PALETTE.map(x => swatch(x, 'setColor')).join('') + '</div>';
}
function pFontes() {
  const cur = (selEls().find(e => e.font) || {}).font, k = K();
  const btn = (f) => '<button class="sx-fontbtn' + (f === cur ? ' on' : '') + '" data-x="setFont" data-f="' + f + '" data-n="' + f.toLowerCase() + '" style="font-family:\'' + f + '\'">' + f + (f === cur ? icon('check', 'ic-sm') : '') + '</button>';
  return '<input class="sx-search" type="search" data-sx="fontQ" placeholder="Buscar fonte" aria-label="Buscar fonte">' + h5('Fontes do kit') + [k.f0, k.f1].filter((f, i, a) => a.indexOf(f) === i).map(btn).join('') + h5('Todas as fontes') + '<div class="sx-fontlist">' + SX.FONTS.map(btn).join('') + '</div>';
}
function pEfeitos() {
  const e = selEls().find(x => x.type === 'text'); if (!e) return '<div class="sx-empty">Selecione um texto.</div>';
  const sample = (k) => { const s = { shadow: 'text-shadow:2px 2px 3px ' + SX.hexA(e.effC, 0.8), lift: 'text-shadow:0 2px 8px rgba(0,0,0,.5)', outline: '-webkit-text-stroke:1.2px currentColor;color:transparent', highlight: 'background:' + e.effC + ';color:#111;padding:0 4px', neon: 'text-shadow:0 0 3px ' + e.effC + ',0 0 10px ' + e.effC }[k] || ''; return '<span style="' + s + '">Ag</span>'; };
  return '<div class="sx-grid3">' + SX.EFFECTS.map(([k, l]) => '<button class="sx-tile sx-fx' + (e.eff === k ? ' on' : '') + '" data-x="setEff" data-v="' + k + '"><b>' + sample(k) + '</b><span>' + l + '</span></button>').join('') + '</div>' +
    (['shadow', 'highlight', 'neon'].includes(e.eff) ? h5('Cor do efeito') + '<div class="sx-sws">' + K().kit.c.concat(['#000000', '#FFFFFF', '#FACC15', '#22C1C3']).map(c => swatch(c, 'effColor')).join('') + '<label class="sx-sw sx-swpick"><input type="color" data-sx="effColor" value="' + SX.toHex(e.effC) + '" aria-label="Cor do efeito"></label></div>' : '');
}
function pAnimar() {
  const list = selEls(), pg = page();
  const tile = (x, v, l, on) => '<button class="sx-tile sx-anim' + (on ? ' on' : '') + '" data-x="' + x + '" data-v="' + v + '"><i class="sx-animprev sxp-' + v + '"></i><span>' + l + '</span></button>';
  return (list.length ? h5('Animação do elemento') + '<div class="sx-grid3">' + SX.ANIMS.map(([v, l]) => tile('anim', v, l, list.every(e => e.anim === v))).join('') + '</div><p class="sx-hint">Os elementos entram na ordem das camadas, de trás para frente.</p>' : '<p class="sx-hint">Selecione um elemento para animar, ou anime todos de uma vez.</p>') +
    '<div class="sx-grid2 sx-btns"><button class="btn btn-sm" data-x="animAll" data-v="rise">Animar todos (Subir)</button><button class="btn btn-sm" data-x="animAll" data-v="none">Remover animações</button></div>' +
    h5('Transição da página') + '<div class="sx-grid2">' + SX.TRANS.map(([v, l]) => tile('trans', v, l, pg.trans === v)).join('') + '</div>' +
    '<button class="btn btn-sm" data-x="transAll">Usar esta transição em todas as páginas</button>' +
    '<button class="sx-big" data-x="playAnim">' + icon('play') + 'Pré-visualizar a página</button>';
}
function pAjustes() {
  const e = selEls().find(x => x.type === 'image'); if (!e) return '<div class="sx-empty">Selecione uma imagem.</div>';
  const src = SX.src(e.src);
  return h5('Filtros') + '<div class="sx-grid4">' + SX.FILTERS.map(([n, f], i) => { const on = Object.keys(f).every(k => (e[k] || 0) === f[k]); return '<button class="sx-tile sx-filt' + (on ? ' on' : '') + '" data-x="filter" data-i="' + i + '"><img src="' + src + '" alt="" style="filter:' + SX.filterCSS(f) + '"><span>' + n + '</span></button>'; }).join('') + '</div>' +
    h5('Ajustes') + [['bri', 'Brilho', 0, 200], ['con', 'Contraste', 0, 200], ['sat', 'Saturação', 0, 200], ['hue', 'Matiz', -180, 180], ['sep', 'Sépia', 0, 100], ['gray', 'Preto e branco', 0, 100], ['blur', 'Desfoque', 0, 20]]
      .map(([k, l, a, b]) => '<label class="sx-slider"><span>' + l + '<small>' + e[k] + '</small></span><input type="range" min="' + a + '" max="' + b + '" value="' + e[k] + '" data-p="' + k + '"></label>').join('') +
    '<button class="btn btn-sm btn-ghost" data-x="resetFx">Restaurar ajustes</button>';
}
function pDados() {
  const e = selEls().find(x => x.type === 'chart'); if (!e) return '<div class="sx-empty">Selecione um gráfico.</div>';
  const multi = e.kind === 'pie' || e.kind === 'donut' || e.multi;
  return '<div class="sx-grid3">' + SX.CHARTS.map(([k, l]) => '<button class="sx-tile sx-mini' + (e.kind === k ? ' on' : '') + '" data-x="chartKind" data-v="' + k + '">' + l + '</button>').join('') + '</div>' +
    h5('Dados') + '<div class="sx-data">' + e.data.map((r, i) => '<div class="sx-drow">' + (multi ? '<label class="sx-sw sx-swpick sx-swsm" style="background:' + e.colors[i % e.colors.length] + '"><input type="color" data-sx="chartC" data-i="' + (i % e.colors.length) + '" value="' + SX.toHex(e.colors[i % e.colors.length]) + '" aria-label="Cor"></label>' : '') +
      '<input data-sx="chartL" data-i="' + i + '" value="' + esc(r.l) + '" aria-label="Rótulo"><input data-sx="chartV" data-i="' + i + '" value="' + esc(String(r.v).replace('.', ',')) + '" inputmode="decimal" aria-label="Valor"><button class="sx-ib" data-x="chartDel" data-i="' + i + '" aria-label="Remover linha">' + icon('x', 'ic-sm') + '</button></div>').join('') + '</div>' +
    '<button class="btn btn-sm" data-x="chartAdd">' + icon('plus', 'ic-sm') + 'Adicionar linha</button>' +
    '<details class="sx-det"><summary>Colar de uma planilha</summary><textarea data-sx="chartPaste" placeholder="Jan&#9;12&#10;Fev&#9;18"></textarea><button class="btn btn-sm" data-x="chartPasteGo">Usar estes dados</button></details>' +
    (!multi ? h5('Cor') + '<div class="sx-row"><label class="sx-sw sx-swpick sx-swbig" style="background:' + e.colors[0] + '"><input type="color" data-sx="chartC" data-i="0" value="' + SX.toHex(e.colors[0]) + '" aria-label="Cor da série"></label><label class="sx-switch"><input type="checkbox" data-p="multi"' + (e.multi ? ' checked' : '') + '><span>Uma cor por barra</span></label></div>' : '') +
    h5('Opções') + '<label class="sx-switch"><input type="checkbox" data-p="vals"' + (e.vals ? ' checked' : '') + '><span>Mostrar valores</span></label>' +
    (e.kind === 'pie' || e.kind === 'donut' ? '<label class="sx-switch"><input type="checkbox" data-p="legend"' + (e.legend ? ' checked' : '') + '><span>Legenda</span></label>' : '<label class="sx-switch"><input type="checkbox" data-p="grid"' + (e.grid ? ' checked' : '') + '><span>Linhas de grade</span></label>') +
    '<label class="sx-num"><span>Formato</span><select data-p="fmt"><option value="num"' + (e.fmt === 'num' ? ' selected' : '') + '>Número</option><option value="brl"' + (e.fmt === 'brl' ? ' selected' : '') + '>Reais (R$)</option><option value="pct"' + (e.fmt === 'pct' ? ' selected' : '') + '>Porcentagem</option></select></label>' +
    '<label class="sx-slider"><span>Tamanho do texto<small>' + Math.round(e.fs) + '</small></span><input type="range" min="10" max="60" value="' + Math.round(e.fs) + '" data-p="fs"></label>' +
    '<div class="sx-row"><span class="sx-lbl">Cor do texto</span><button class="sx-sw" data-x="tab" data-v="cor" data-t="tc" style="background:' + e.tc + '" aria-label="Cor do texto"></button><button class="btn btn-sm" data-x="tab" data-v="fontes">' + esc(e.font) + '</button></div>';
}
function pTabela() {
  const e = selEls().find(x => x.type === 'table'); if (!e) return '<div class="sx-empty">Selecione uma tabela.</div>';
  const step = (x, l, v) => '<div class="sx-row"><span class="sx-lbl">' + l + '</span><button class="sx-ib sx-ibb" data-x="' + x + '" data-d="-1" aria-label="Remover">' + icon('minus', 'ic-sm') + '</button><b class="num">' + v + '</b><button class="sx-ib sx-ibb" data-x="' + x + '" data-d="1" aria-label="Adicionar">' + icon('plus', 'ic-sm') + '</button></div>';
  const cbtn = (t, l) => '<div class="sx-row"><span class="sx-lbl">' + l + '</span><button class="sx-sw" data-x="tab" data-v="cor" data-t="' + t + '" style="background:' + e[t] + '" aria-label="' + l + '"></button></div>';
  return '<button class="sx-big" data-x="tedit">' + icon('text') + 'Editar células</button>' + step('tblRows', 'Linhas', e.rows) + step('tblCols', 'Colunas', e.cols) +
    '<label class="sx-switch"><input type="checkbox" data-p="head"' + (e.head ? ' checked' : '') + '><span>Linha de cabeçalho</span></label><label class="sx-switch"><input type="checkbox" data-p="stripe"' + (e.stripe ? ' checked' : '') + '><span>Linhas alternadas</span></label>' +
    h5('Cores') + cbtn('headFill', 'Fundo do cabeçalho') + cbtn('headColor', 'Texto do cabeçalho') + cbtn('color', 'Texto') + cbtn('stripeC', 'Faixa alternada') + cbtn('bc', 'Linhas') +
    h5('Texto') + '<label class="sx-slider"><span>Tamanho<small>' + Math.round(e.size) + '</small></span><input type="range" min="10" max="72" value="' + Math.round(e.size) + '" data-p="size"></label>' +
    '<label class="sx-slider"><span>Espessura das linhas<small>' + e.bw + '</small></span><input type="range" min="0" max="8" value="' + e.bw + '" data-p="bw"></label>' +
    '<button class="btn btn-sm" data-x="tab" data-v="fontes">Fonte: ' + esc(e.font) + '</button>';
}

/* ---------- Barra de contexto ---------- */
const cb = (x, ic, label, o) => { o = o || {}; return '<button class="sx-cb' + (o.on ? ' on' : '') + (o.txt ? ' sx-cbt' : '') + '" data-x="' + x + '"' + (o.d || '') + ' title="' + esc(label) + '" aria-label="' + esc(label) + '"' + (o.dis ? ' disabled' : '') + '>' + (ic ? icon(ic, 'ic-sm') : '') + (o.txt ? '<span>' + o.txt + '</span>' : '') + '</button>'; };
const colorBtn = (t, c, label, letter) => '<button class="sx-cb sx-colorbtn" data-x="tab" data-v="cor" data-t="' + t + '" title="' + label + '" aria-label="' + label + '">' + (letter ? '<b>A</b>' : '') + '<i style="background:' + (c === 'transparent' ? 'repeating-conic-gradient(#999 0 25%,#fff 0 50%) 50%/8px 8px' : c) + '"></i></button>';
const sep = '<span class="sx-csep"></span>';
function renderCtx() {
  const C = $r('#sxCtx'); if (!C) return;
  const list = selEls(), types = [...new Set(list.map(e => e.type))], one = list[0], t = types.length === 1 ? types[0] : null;
  let L = '', R = '';
  if (E.mode === 'draw') { C.innerHTML = '<span class="sx-ctxlabel">' + icon('pen', 'ic-sm') + 'Desenhando · clique e arraste na página</span><span class="sp"></span>' + cb('drawToggle', 'check', 'Concluir desenho', { txt: 'Concluir' }); return; }
  if (E.crop) { const e = byId(E.crop); C.innerHTML = '<span class="sx-ctxlabel">' + icon('crop', 'ic-sm') + 'Arraste a imagem para enquadrar</span><label class="sx-cslider">Zoom<input type="range" min="1" max="4" step="0.01" value="' + (e ? e.zoom : 1) + '" data-p="zoom"></label>' + cb('cropReset', 'refresh', 'Centralizar', { txt: 'Centralizar' }) + '<span class="sp"></span>' + cb('cropDone', 'check', 'Concluir corte', { txt: 'Concluir', on: true }); return; }
  if (E.tedit) { C.innerHTML = '<span class="sx-ctxlabel">' + icon('table', 'ic-sm') + 'Editando células · Tab vai para a próxima</span><span class="sp"></span>' + cb('teditDone', 'check', 'Concluir', { txt: 'Concluir', on: true }); return; }
  if (!list.length) {
    const pg = page();
    L = colorBtn('bg', SX.fillCSS(pg.bg, pg.bgGrad), 'Cor de fundo') + cb('tab', 'bg', 'Fundo', { txt: 'Fundo', d: ' data-v="fundo"' }) + cb('tab', 'anim', 'Transição', { txt: 'Transição', d: ' data-v="animar"' }) + (SX.isDeck(E.doc) ? cb('tab', 'layout', 'Layouts', { txt: 'Layouts', d: ' data-v="modelos"' }) : '');
    R = '<span class="sx-ctxhint">Página ' + (E.pg + 1) + ' de ' + E.doc.pages.length + '</span>' + cb('addPage', 'plus', 'Adicionar página (Ctrl+Enter)', { txt: 'Página' });
    C.innerHTML = L + '<span class="sp"></span>' + R; return;
  }
  if (t === 'text') {
    const sz = Math.round(one.size);
    L = '<button class="sx-cb sx-cbfont" data-x="tab" data-v="fontes" style="font-family:\'' + one.font + '\'" title="Fonte">' + esc(one.font) + icon('chevD', 'ic-sm') + '</button>' +
      '<div class="sx-size"><button data-x="size" data-d="-1" aria-label="Diminuir fonte">' + icon('minus', 'ic-sm') + '</button><input data-p="size" value="' + sz + '" inputmode="numeric" aria-label="Tamanho da fonte"><button data-x="size" data-d="1" aria-label="Aumentar fonte">' + icon('plus', 'ic-sm') + '</button></div>' +
      colorBtn('color', one.color, 'Cor do texto', true) + sep +
      cb('bold', 'bold', 'Negrito (Ctrl+B)', { on: one.weight >= 700 }) + cb('tog', 'italic', 'Itálico (Ctrl+I)', { on: one.ital, d: ' data-k="ital"' }) + cb('tog', 'under', 'Sublinhado (Ctrl+U)', { on: one.und, d: ' data-k="und"' }) + cb('tog', 'strike', 'Tachado', { on: one.strike, d: ' data-k="strike"' }) + sep +
      cb('cycleAlign', { left: 'tleft', center: 'tcenter', right: 'tright' }[one.align], 'Alinhamento') + cb('cycleList', one.list === 'num' ? 'listN' : 'listB', 'Lista', { on: one.list !== 'none' }) + cb('tog', '', 'Maiúsculas', { on: one.up, d: ' data-k="up"', txt: 'aA' }) + cb('spacingPop', 'spacing', 'Espaçamento') + sep +
      cb('tab', 'fx', 'Efeitos', { txt: 'Efeitos', d: ' data-v="efeitos"', on: E.tab === 'efeitos' && E.panel });
  } else if (t === 'rect' || t === 'ellipse' || t === 'shape') {
    L = colorBtn('fill', SX.fillCSS(one.fill, one.grad), 'Cor de preenchimento') + cb('borderPop', 'border', 'Borda', { on: one.sw > 0 }) + (t === 'rect' ? cb('radiusPop', 'radius', 'Arredondamento') : '') + cb('tog', 'shadow', 'Sombra', { on: one.shadow, d: ' data-k="shadow"' }) + (t === 'shape' ? cb('shapePop', 'shapes', 'Trocar forma', { txt: 'Forma' }) : '');
  } else if (t === 'frame') {
    L = cb('fillFrame', 'upload', 'Enviar imagem', { txt: 'Enviar imagem' }) + colorBtn('fill', one.fill, 'Cor da moldura') + cb('maskPop', 'frame', 'Formato', { txt: 'Formato' }) + '<span class="sx-ctxhint">Arraste uma imagem dos Uploads para dentro</span>';
  } else if (t === 'image') {
    L = cb('tab', 'sparkle', 'Editar imagem', { txt: 'Editar', d: ' data-v="ajustes"', on: E.tab === 'ajustes' && E.panel }) + cb('crop', 'crop', 'Cortar (duplo clique)', { txt: 'Cortar' }) + cb('flipPop', 'flip', 'Virar', { txt: 'Virar' }) + cb('maskPop', 'frame', 'Formato', { txt: 'Formato' }) + cb('borderPop', 'border', 'Borda', { on: one.sw > 0 }) + sep + cb('replaceImg', 'refresh', 'Substituir imagem', { txt: 'Substituir' }) + cb('imgToBg', 'bg', 'Usar como fundo da página', { txt: 'Usar como fundo' });
  } else if (t === 'line') {
    L = colorBtn('color', one.color, 'Cor da linha') + cb('linePop', 'line', 'Estilo da linha', { txt: 'Estilo' }) + cb('capPop', 'arrowR', 'Pontas', { txt: 'Pontas' });
  } else if (t === 'icon') {
    L = colorBtn('color', one.color, 'Cor do ícone') + cb('iconPop', 'pen', 'Espessura', { txt: 'Traço' }) + cb('tab', 'star', 'Trocar ícone', { txt: 'Trocar', d: ' data-v="elementos"' });
  } else if (t === 'draw') {
    L = colorBtn('color', one.color, 'Cor do traço') + cb('drawPop', 'pen', 'Espessura', { txt: 'Espessura' });
  } else if (t === 'chart') {
    L = cb('tab', 'chart', 'Editar dados', { txt: 'Editar dados', d: ' data-v="dados"', on: E.tab === 'dados' && E.panel }) + '<button class="sx-cb sx-cbfont" data-x="tab" data-v="fontes" style="font-family:\'' + one.font + '\'">' + esc(one.font) + icon('chevD', 'ic-sm') + '</button>' + colorBtn('tc', one.tc, 'Cor do texto', true);
  } else if (t === 'table') {
    L = cb('tedit', 'text', 'Editar células (duplo clique)', { txt: 'Editar células' }) + cb('tab', 'table', 'Configurar tabela', { txt: 'Tabela', d: ' data-v="tabela"', on: E.tab === 'tabela' && E.panel }) + '<button class="sx-cb sx-cbfont" data-x="tab" data-v="fontes" style="font-family:\'' + one.font + '\'">' + esc(one.font) + icon('chevD', 'ic-sm') + '</button>' + colorBtn('color', one.color, 'Cor do texto', true) + colorBtn('headFill', one.headFill, 'Cor do cabeçalho');
  } else {
    L = '<span class="sx-ctxlabel">' + list.length + ' elementos</span>' + (types.every(x => x === 'text') ? colorBtn('color', one.color, 'Cor do texto', true) : '');
  }
  const grouped = list.length > 1 && list.every(e => e.g && e.g === list[0].g);
  if (list.length > 1) L += sep + cb('group', 'group', grouped ? 'Desagrupar (Ctrl+Shift+G)' : 'Agrupar (Ctrl+G)', { txt: grouped ? 'Desagrupar' : 'Agrupar' }) + cb('alignPop', 'alignC', 'Alinhar', { txt: 'Alinhar' });
  R = cb('tab', 'anim', 'Animar', { txt: 'Animar', d: ' data-v="animar"', on: E.tab === 'animar' && E.panel }) + cb('tab', 'list', 'Posição', { txt: 'Posição', d: ' data-v="posicao"', on: E.tab === 'posicao' && E.panel }) + sep +
    cb('opPop', 'opacity', 'Transparência') + cb('copyStyle', 'paint', 'Copiar estilo (Ctrl+Alt+C)', { on: E.paint }) + cb('lock', list.every(e => e.lock) ? 'lock' : 'unlock', list.every(e => e.lock) ? 'Destravar' : 'Travar', { on: list.every(e => e.lock) }) + cb('dup', 'copy', 'Duplicar (Ctrl+D)') + cb('del', 'trash', 'Excluir (Delete)');
  C.innerHTML = L + '<span class="sp"></span>' + R;
}

/* ---------- Palco ---------- */
function computeScale() {
  const st = $r('#sxStage'); if (!st) return 1;
  if (E.zoom) return E.zoom;
  const aw = Math.max(160, st.clientWidth - 72), ah = Math.max(160, st.clientHeight - 72);
  return Math.max(0.05, Math.min(aw / E.doc.w, ah / E.doc.h, 1.5));
}
function renderStage() {
  if (!live()) return;
  const s = E.scale = computeScale(), wrap = $r('#sxWrap'), ab = $r('#sxAb'), pg = page();
  wrap.style.width = Math.round(E.doc.w * s) + 'px'; wrap.style.height = Math.round(E.doc.h * s) + 'px';
  ab.style.cssText = 'width:' + E.doc.w + 'px;height:' + E.doc.h + 'px;transform:scale(' + s + ');' + SX.bgCSS(pg);
  ab.innerHTML = SX.pageInner(pg, E.doc, { live: true, editing: E.editing, crop: E.crop, tedit: E.tedit, showHidden: false });
  measure();
  const st = $r('#sxStage'); st.classList.toggle('drawing', E.mode === 'draw'); st.classList.toggle('painting', !!E.paint);
  const zl = $r('#sxZoomL'); if (zl) zl.textContent = Math.round(s * 100) + '%';
  const zr = $r('[data-sx="zoom"]'); if (zr) zr.value = Math.round(s * 100);
  renderOverlay();
  if (E.editing) { const n = nodeOf(E.editing); if (n) { n.focus(); const r = document.createRange(); r.selectNodeContents(n); r.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); } }
}
function measure() { els().forEach(e => { if (e.type === 'text') { const n = nodeOf(e.id); if (n && n.offsetHeight) e.h = n.offsetHeight; } }); }
const nodeOf = (id) => $r('#sxAb [data-id="' + id + '"]');
function bbox(list) {
  const xs = [], ys = [];
  list.forEach(e => { const r = (e.rot || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), cx = e.x + e.w / 2, cy = e.y + e.h / 2; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const dx = a * e.w / 2, dy = b * e.h / 2; xs.push(cx + dx * c - dy * s); ys.push(cy + dx * s + dy * c); }); });
  const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
function renderOverlay() {
  const ov = $r('#sxOv'); if (!ov) return;
  const s = E.scale; ov.style.width = E.doc.w * s + 'px'; ov.style.height = E.doc.h * s + 'px';
  let h = '';
  const box = (e, cls, inner) => '<div class="' + cls + '" style="left:' + (e.x * s).toFixed(1) + 'px;top:' + (e.y * s).toFixed(1) + 'px;width:' + (e.w * s).toFixed(1) + 'px;height:' + Math.max(e.h * s, 2).toFixed(1) + 'px;transform:rotate(' + (e.rot || 0) + 'deg)">' + (inner || '') + '</div>';
  if (E.hover && !E.sel.includes(E.hover)) { const e = byId(E.hover); if (e && !e.hide) h += box(e, 'sx-hov'); }
  const list = selEls();
  if (E.crop) { const e = byId(E.crop); if (e) { const b = SX.imgBox(e); h += box(e, 'sx-selb sx-cropb', '<div class="sx-cropimg" style="left:' + (b.x * s) + 'px;top:' + (b.y * s) + 'px;width:' + (b.w * s) + 'px;height:' + (b.h * s) + 'px"></div>'); } }
  else if (list.length === 1 && E.editing !== list[0].id) {
    const e = list[0];
    const H = e.lock ? [] : e.type === 'line' ? [['e', 1, 0], ['w', -1, 0]] : e.type === 'text' ? [['nw', -1, -1], ['ne', 1, -1], ['se', 1, 1], ['sw', -1, 1], ['e', 1, 0], ['w', -1, 0]] : e.type === 'draw' || e.type === 'icon' ? [['nw', -1, -1], ['ne', 1, -1], ['se', 1, 1], ['sw', -1, 1]] : [['nw', -1, -1], ['n', 0, -1], ['ne', 1, -1], ['e', 1, 0], ['se', 1, 1], ['s', 0, 1], ['sw', -1, 1], ['w', -1, 0]];
    const cur = { nw: 'nwse', se: 'nwse', ne: 'nesw', sw: 'nesw', n: 'ns', s: 'ns', e: 'ew', w: 'ew' };
    h += box(e, 'sx-selb' + (e.lock ? ' locked' : ''), H.map(([k, ax, ay]) => '<span class="sx-h' + (ax && ay ? '' : ' side ' + (ax ? 'v' : 'h')) + '" data-h="' + k + '" data-ax="' + ax + '" data-ay="' + ay + '" style="left:' + ((ax + 1) * 50) + '%;top:' + ((ay + 1) * 50) + '%;cursor:' + cur[k] + '-resize"></span>').join('') +
      (e.lock ? '<span class="sx-lockb">' + icon('lock', 'ic-sm') + '</span>' : '<span class="sx-h rot" data-h="rot" title="Girar">' + icon('refresh', 'ic-sm') + '</span>'));
  } else if (list.length > 1) {
    list.forEach(e => { h += box(e, 'sx-selb sub'); });
    const b = bbox(list); h += '<div class="sx-selb multi" style="left:' + b.x * s + 'px;top:' + b.y * s + 'px;width:' + b.w * s + 'px;height:' + b.h * s + 'px"></div>';
  }
  E.guides.forEach(g => { h += g.v ? '<div class="sx-guide v" style="left:' + g.p * s + 'px"></div>' : '<div class="sx-guide h" style="top:' + g.p * s + 'px"></div>'; });
  if (E.marquee) { const m = E.marquee, x = Math.min(m.x0, m.x1), y = Math.min(m.y0, m.y1); h += '<div class="sx-marq" style="left:' + x * s + 'px;top:' + y * s + 'px;width:' + Math.abs(m.x1 - m.x0) * s + 'px;height:' + Math.abs(m.y1 - m.y0) * s + 'px"></div>'; }
  if (E.drawPts && E.drawPts.length > 1) h += '<svg class="sx-drawlive" width="' + E.doc.w * s + '" height="' + E.doc.h * s + '"><polyline points="' + E.drawPts.map(p => (p[0] * s).toFixed(1) + ',' + (p[1] * s).toFixed(1)).join(' ') + '" fill="none" stroke="' + (E.pen.color || SX.ink(page().bg, K())) + '" stroke-opacity="' + E.pen.op + '" stroke-width="' + E.pen.sw * s + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (E.badge) h += '<div class="sx-badge" style="left:' + E.badge.x * s + 'px;top:' + E.badge.y * s + 'px">' + E.badge.t + '</div>';
  ov.innerHTML = h;
}

/* ---------- Miniaturas, rodapé e notas ---------- */
function thumbHTML(p, i) {
  const th = 62, tw = Math.min(150, Math.round(th * E.doc.w / E.doc.h));
  return '<div class="sx-th' + (i === E.pg ? ' on' : '') + (p.hidden ? ' hid' : '') + '" data-x="page" data-i="' + i + '" draggable="true" title="Página ' + (i + 1) + '" role="button" tabindex="0">' +
    '<div class="sx-thpv">' + SX.preview(p, E.doc, tw, th) + '</div><span class="sx-thn">' + (i + 1) + '</span>' + (p.notes ? '<span class="sx-thnote" title="Tem notas">' + icon('note', 'ic-sm') + '</span>' : '') + (p.hidden ? '<span class="sx-thhid">' + icon('hide', 'ic-sm') + '</span>' : '') +
    '<button class="sx-thmore" data-x="pageMenu" data-i="' + i + '" aria-label="Opções da página ' + (i + 1) + '">' + icon('dots', 'ic-sm') + '</button></div>';
}
function renderThumbs(onlyCur) {
  const T = $r('#sxThumbs'); if (!T || !E.doc) return;
  const cur = T.querySelector('.sx-th[data-i="' + E.pg + '"]');
  if (onlyCur && cur && T.querySelectorAll('.sx-th').length === E.doc.pages.length) { cur.outerHTML = thumbHTML(page(), E.pg); return; }
  T.innerHTML = E.doc.pages.map(thumbHTML).join('') + '<button class="sx-addpg" data-x="addPage" title="Adicionar página (Ctrl+Enter)" aria-label="Adicionar página">' + icon('plus') + '</button>';
  const on = T.querySelector('.sx-th.on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function renderFoot() {
  const F = $r('#sxFoot'); if (!F) return;
  F.innerHTML = '<button class="sx-fb' + (E.notes ? ' on' : '') + '" data-x="notes">' + icon('note', 'ic-sm') + 'Notas</button>' +
    '<span class="sx-fsep"></span><span class="sx-pgind">Página ' + (E.pg + 1) + ' de ' + E.doc.pages.length + '</span><span class="sp"></span>' +
    '<button class="sx-ib" data-x="zout" aria-label="Diminuir zoom">' + icon('zoomOut', 'ic-sm') + '</button><input type="range" min="5" max="300" value="' + Math.round(E.scale * 100) + '" data-sx="zoom" aria-label="Zoom" class="sx-zoomr"><button class="sx-ib" data-x="zin" aria-label="Aumentar zoom">' + icon('zoomIn', 'ic-sm') + '</button><span id="sxZoomL" class="sx-zl">' + Math.round(E.scale * 100) + '%</span>' +
    '<button class="sx-ib" data-x="zfit" title="Ajustar à tela (Ctrl+0)" aria-label="Ajustar à tela">' + icon('fit', 'ic-sm') + '</button>' +
    '<button class="sx-ib" data-x="gridView" title="Ver todas as páginas" aria-label="Ver todas as páginas">' + icon('grid', 'ic-sm') + '</button>' +
    '<button class="sx-ib" data-x="workspace" title="Área de trabalho clara ou escura" aria-label="Alternar área de trabalho">' + icon(E.light ? 'moon' : 'sun', 'ic-sm') + '</button>' +
    '<button class="sx-ib" data-x="present" data-v="full" title="Apresentar em tela cheia" aria-label="Apresentar">' + icon('expand', 'ic-sm') + '</button>';
}
function renderNotes() {
  const N = $r('#sxNotes'); if (!N) return; N.hidden = !E.notes;
  if (E.notes) N.innerHTML = '<textarea data-sx="notes" placeholder="Notas da página ' + (E.pg + 1) + ' para quem apresenta…" aria-label="Notas da página">' + esc(page().notes || '') + '</textarea>';
}
function renderGrid() {
  const G = $r('#sxGridV'); if (!G) return;
  const w = 250, h = Math.round(w * E.doc.h / E.doc.w);
  G.innerHTML = '<div class="sx-gvh"><b>Todas as páginas</b><span class="muted">' + E.doc.pages.length + ' páginas · arraste para reordenar</span><span class="sp"></span><button class="btn btn-sm" data-x="addPage">' + icon('plus', 'ic-sm') + 'Página</button><button class="btn btn-sm btn-primary" data-x="gridClose">Fechar</button></div>' +
    '<div class="sx-gvb">' + E.doc.pages.map((p, i) => '<div class="sx-gvc' + (i === E.pg ? ' on' : '') + (p.hidden ? ' hid' : '') + '" data-x="gridPick" data-i="' + i + '" draggable="true" data-gi="' + i + '"><div class="sx-gvpv">' + SX.preview(p, E.doc, w, h) + '</div><div class="sx-gvf"><b>' + (i + 1) + '</b>' + (p.hidden ? '<span class="muted">oculta</span>' : '') + '<span class="sp"></span><button class="sx-ib" data-x="pageDup" data-i="' + i + '" aria-label="Duplicar página">' + icon('copy', 'ic-sm') + '</button><button class="sx-ib" data-x="pageHide" data-i="' + i + '" aria-label="Ocultar página">' + icon(p.hidden ? 'eye' : 'hide', 'ic-sm') + '</button><button class="sx-ib" data-x="pageDel" data-i="' + i + '" aria-label="Excluir página"' + (E.doc.pages.length < 2 ? ' disabled' : '') + '>' + icon('trash', 'ic-sm') + '</button></div></div>').join('') + '</div>';
}

/* ---------- Ações sobre elementos ---------- */
function specToEl(spec, at) {
  const k = K(), bg = page().bg, ink = SX.ink(bg, k), p = Object.assign({}, spec.p || {});
  if (spec.t === 'text' && !p.color) p.color = ink;
  if (spec.t === 'line' && !p.color) p.color = ink;
  if (spec.t === 'icon' && !p.color) p.color = SX.lum(bg) > 0.55 && SX.lum(k.acc) > 0.6 ? k.alt : k.acc;
  if ((spec.t === 'rect' || spec.t === 'ellipse' || spec.t === 'shape') && p.fill === undefined) p.fill = SX.lum(bg) > 0.55 && SX.lum(k.acc) > 0.6 ? k.alt : k.acc;
  if (spec.t === 'rect' && p.fill === 'transparent' && !p.stroke) p.stroke = ink;
  if (spec.t === 'chart') { p.tc = p.tc || ink; if (SX.lum(bg) > 0.55 && SX.lum(k.acc) > 0.6) p.colors = [k.alt, k.acc, k.alt2, k.line, k.bg]; }
  if (spec.t === 'table' && SX.lum(bg) > 0.55) { p.color = p.color || '#111111'; p.stripeC = SX.mix(bg, '#000000', 0.06); p.bc = SX.mix(bg, '#000000', 0.18); p.headFill = SX.lum(k.acc) > 0.6 ? k.alt : k.acc; p.headColor = '#FFFFFF'; }
  if (spec.t === 'frame' && !p.fill) p.fill = SX.mix(bg, ink, 0.18);
  const sc = Math.max(0.35, Math.min(E.doc.w, E.doc.h) / 1080);
  if (spec.t !== 'text' && !(spec.p && spec.p.keep)) { if (p.w) p.w *= sc; if (p.h) p.h *= sc; }
  if (spec.t === 'text' && p.size && !spec.p.size) p.size *= sc;
  const e = SX.el(spec.t, p, k);
  if (e.type === 'line') { e.w = Math.min(e.w * sc / (p.w ? sc : 1), E.doc.w * 0.6); e.sw = Math.max(2, Math.round(e.sw * sc)); e.h = Math.max(24, e.sw * 3); }
  if (e.type === 'chart') e.fs = Math.max(12, Math.round(e.fs * sc));
  if (e.type === 'table') e.size = Math.max(12, Math.round(e.size * sc));
  if (e.type === 'icon' && e.w > E.doc.w * 0.3) { e.w = e.h = E.doc.w * 0.3; }
  const cx = at ? at.x : E.doc.w / 2, cy = at ? at.y : E.doc.h / 2;
  e.x = cx - e.w / 2; e.y = cy - e.h / 2;
  return e;
}
function addEls(list, sel) {
  snap(); els().push(...list); E.sel = sel === false ? E.sel : list.map(e => e.id); E.editing = null;
  save(); renderStage(); measureAndKeep(list); renderCtx(); if (E.tab === 'posicao') renderPanel();
}
function measureAndKeep(list) { list.forEach(e => { if (e.type === 'text') { const n = nodeOf(e.id); if (n) { const oh = e.h; e.h = n.offsetHeight; if (Math.abs(oh - e.h) > 1 && !e._placed) { e.y += (oh - e.h) / 2; } } } }); renderStage(); }
const groupOf = (id) => { const e = byId(id); if (!e || !e.g) return [id]; return els().filter(x => x.g === e.g).map(x => x.id); };
function del() { if (!E.sel.length) return; snap(); page().els = els().filter(e => !E.sel.includes(e.id) || e.lock); const kept = E.sel.filter(id => byId(id)); if (kept.length) toast('Elementos travados não foram excluídos'); E.sel = []; save(); renderStage(); renderCtx(); if (['posicao', 'ajustes', 'dados', 'tabela', 'efeitos'].includes(E.tab)) renderPanel(); }
function dup(list, off) {
  list = list || selEls(); if (!list.length) return []; snap();
  const gmap = {}, o = off == null ? 24 : off;
  const copies = list.map(e => { const c = JSON.parse(JSON.stringify(e)); c.id = uid('e'); c.x += o; c.y += o; c.lock = false; if (c.g) c.g = gmap[c.g] = gmap[c.g] || uid('g'); return c; });
  els().push(...copies); E.sel = copies.map(c => c.id); save(); renderStage(); renderCtx(); if (E.tab === 'posicao') renderPanel();
  return copies;
}
function order(a) {
  if (!E.sel.length) return; snap();
  const Lr = els(), S = E.sel;
  if (a === 'top') page().els = Lr.filter(e => !S.includes(e.id)).concat(Lr.filter(e => S.includes(e.id)));
  else if (a === 'bottom') page().els = Lr.filter(e => S.includes(e.id)).concat(Lr.filter(e => !S.includes(e.id)));
  else if (a === 'up') { for (let i = Lr.length - 2; i >= 0; i--) if (S.includes(Lr[i].id) && !S.includes(Lr[i + 1].id)) [Lr[i], Lr[i + 1]] = [Lr[i + 1], Lr[i]]; }
  else if (a === 'down') { for (let i = 1; i < Lr.length; i++) if (S.includes(Lr[i].id) && !S.includes(Lr[i - 1].id)) [Lr[i], Lr[i - 1]] = [Lr[i - 1], Lr[i]]; }
  save(); renderStage(); if (E.tab === 'posicao') renderPanel();
}
function align(a) {
  const list = selEls().filter(e => !e.lock); if (!list.length) return; snap();
  const ref = list.length === 1 ? { x: 0, y: 0, w: E.doc.w, h: E.doc.h } : bbox(list);
  if (a === 'distH' || a === 'distV') {
    const hz = a === 'distH', srt = list.slice().sort((p, q) => hz ? p.x - q.x : p.y - q.y), tot = srt.reduce((s, e) => s + (hz ? e.w : e.h), 0), gap = ((hz ? ref.w : ref.h) - tot) / (srt.length - 1);
    let cur = hz ? ref.x : ref.y; srt.forEach(e => { if (hz) { e.x = cur; cur += e.w + gap; } else { e.y = cur; cur += e.h + gap; } });
  } else list.forEach(e => {
    const b = bbox([e]), ox = e.x - b.x, oy = e.y - b.y;
    if (a === 'left') e.x = ref.x + ox; if (a === 'right') e.x = ref.x + ref.w - b.w + ox; if (a === 'hcenter') e.x = ref.x + (ref.w - b.w) / 2 + ox;
    if (a === 'top') e.y = ref.y + oy; if (a === 'bottom') e.y = ref.y + ref.h - b.h + oy; if (a === 'vcenter') e.y = ref.y + (ref.h - b.h) / 2 + oy;
  });
  save(); renderStage(); if (E.tab === 'posicao') renderPanel();
}
function group() {
  const list = selEls(); if (!list.length) return; snap();
  const grouped = list.length > 1 && list.every(e => e.g && e.g === list[0].g);
  if (grouped || (list.length === 1 && list[0].g)) { const g = list[0].g; els().forEach(e => { if (e.g === g) delete e.g; }); toast('Grupo desfeito'); }
  else if (list.length > 1) { const g = uid('g'); list.forEach(e => e.g = g); toast('Elementos agrupados'); }
  save(); renderStage(); renderCtx();
}
function setProp(k, v, tok) {
  const list = selEls().filter(e => k in e); if (!list.length) return;
  tok ? liveSnap(tok) : snap();
  list.forEach(e => { e[k] = v; if (k === 'sw' && e.type === 'line') { const c = e.y + e.h / 2; e.h = Math.max(24, v * 3); e.y = c - e.h / 2; } });
  save(); renderStage();
}
function setColor(c, tok) {
  const t = E.colorT || 'fill';
  tok ? liveSnap(tok) : snap();
  if (t === 'bg') page().bg = c;
  else if (t === 'pen') E.pen.color = c;
  else selEls().forEach(e => { if (t in e) e[t] = c; else if (t === 'fill' && 'color' in e) e.color = c; });
  save(); renderStage(); if (!tok) { renderCtx(); if (E.tab === 'cor') renderPanel(); }
}
const STYLE = { text: ['font', 'size', 'weight', 'ital', 'und', 'strike', 'color', 'align', 'lh', 'ls', 'up', 'eff', 'effC', 'list'], rect: ['fill', 'grad', 'stroke', 'sw', 'dash', 'shadow', 'radius'], ellipse: ['fill', 'grad', 'stroke', 'sw', 'dash', 'shadow'], shape: ['fill', 'grad', 'stroke', 'sw', 'dash', 'shadow'], line: ['color', 'sw', 'dash', 'cap1', 'cap2'], icon: ['color', 'sw'], draw: ['color', 'sw'], image: ['bri', 'con', 'sat', 'hue', 'sep', 'gray', 'blur', 'radius', 'mask', 'sw', 'stroke'], frame: ['fill', 'mask', 'radius'], table: ['font', 'size', 'color', 'head', 'headFill', 'headColor', 'stripe', 'stripeC', 'bc', 'bw'], chart: ['colors', 'tc', 'font', 'fs', 'vals', 'grid', 'legend', 'fmt'] };
const FAM = { rect: 'shape', ellipse: 'shape', shape: 'shape' };
function copyStyle() { const e = selEls()[0]; if (!e) return; const keys = (STYLE[e.type] || []).concat(['op', 'anim']); E.styleClip = { type: e.type, p: JSON.parse(JSON.stringify(keys.reduce((o, k) => (o[k] = e[k], o), {}))) }; E.paint = true; toast('Estilo copiado. Clique em outro elemento para aplicar.'); renderCtx(); renderStage(); }
function pasteStyle(list) {
  if (!E.styleClip) return; snap();
  (list || selEls()).forEach(e => { const same = e.type === E.styleClip.type || (FAM[e.type] && FAM[e.type] === FAM[E.styleClip.type]); Object.entries(E.styleClip.p).forEach(([k, v]) => { if (k in e && (same || ['op', 'anim', 'color', 'fill', 'font'].includes(k))) e[k] = JSON.parse(JSON.stringify(v)); }); });
  E.paint = false; save(); renderStage(); renderCtx();
}
function hitTest(p) {
  const L = els();
  for (let i = L.length - 1; i >= 0; i--) {
    const e = L[i]; if (e.hide) continue;
    const r = -(e.rot || 0) * Math.PI / 180, cx = e.x + e.w / 2, cy = e.y + e.h / 2, dx = p.x - cx, dy = p.y - cy;
    const lx = dx * Math.cos(r) - dy * Math.sin(r) + e.w / 2, ly = dx * Math.sin(r) + dy * Math.cos(r) + e.h / 2;
    if (lx >= 0 && ly >= 0 && lx <= e.w && ly <= e.h) return e;
  }
  return null;
}

/* ---------- Imagens ---------- */
async function readFiles(files) {
  const out = [];
  for (const f of files) { if (!f.type.startsWith('image/')) continue; try { const im = await readImage(f, 2000); const ref = SX.asset(im.src); const item = { id: uid('img'), src: ref, name: im.name, w: im.w, h: im.h, _c: Date.now() }; (W.ST.imgLib = W.ST.imgLib || []).unshift(item); out.push(item); } catch (er) {} }
  if (out.length) persist();
  return out;
}
function imgElFrom(item, at, size) {
  const k = Math.min(E.doc.w * (size || 0.6) / item.w, E.doc.h * (size || 0.6) / item.h, 1);
  const e = SX.el('image', { src: item.src, iw: item.w, ih: item.h, w: item.w * k, h: item.h * k }, K());
  e.x = (at ? at.x : E.doc.w / 2) - e.w / 2; e.y = (at ? at.y : E.doc.h / 2) - e.h / 2;
  return e;
}
function fillTarget(target, item) {
  snap();
  if (target.type === 'frame') { const i = els().indexOf(target); const ne = SX.el('image', { x: target.x, y: target.y, w: target.w, h: target.h, rot: target.rot, op: target.op, anim: target.anim, mask: target.mask, radius: target.radius, src: item.src, iw: item.w, ih: item.h, g: target.g }, K()); if (!ne.g) delete ne.g; els().splice(i, 1, ne); E.sel = [ne.id]; }
  else { target.src = item.src; target.iw = item.w; target.ih = item.h; target.px = 50; target.py = 50; target.zoom = 1; E.sel = [target.id]; }
  save(); renderStage(); renderCtx();
}
async function addFiles(files, at) {
  const items = await readFiles(files); if (!items.length || !E.doc) return;
  const tgt = at ? hitTest(at) : null;
  if (tgt && (tgt.type === 'frame' || tgt.type === 'image') && items.length === 1) { fillTarget(tgt, items[0]); toast('Imagem colocada na moldura'); }
  else addEls(items.map((it, i) => { const e = imgElFrom(it, at); e.x += i * 30; e.y += i * 30; return e; }));
  if (E.tab === 'uploads') renderPanel();
}
function libItem(kind, id) {
  if (kind === 'mood') { for (const arr of Object.values(W.ST.mood || {})) { const m = (arr || []).find(x => x.id === id); if (m) return { src: m.v, w: m.w || 1200, h: m.h || 900, _probe: !m.w }; } return null; }
  return (W.ST.imgLib || []).find(m => m.id === id) || null;
}
async function probe(item) { if (!item._probe) return item; const im = await SX.loadImg(SX.src(item.src)); if (im) { item.w = im.naturalWidth; item.h = im.naturalHeight; } return item; }

/* ---------- Páginas ---------- */
function goPage(i) { if (E.editing) endEdit(); E.crop = E.tedit = null; E.pg = clamp(i, 0, E.doc.pages.length - 1); E.sel = []; full(); }
function addPage(after, pg) { snap(); const np = pg || SX.blankPage(page().bg); E.doc.pages.splice((after == null ? E.pg : after) + 1, 0, np); E.pg = (after == null ? E.pg : after) + 1; E.sel = []; save(true); full(); }
function dupPage(i) { snap(); const c = JSON.parse(JSON.stringify(E.doc.pages[i])); c.id = uid('pg'); const gm = {}; c.els.forEach(e => { e.id = uid('e'); if (e.g) e.g = gm[e.g] = gm[e.g] || uid('g'); }); E.doc.pages.splice(i + 1, 0, c); E.pg = i + 1; E.sel = []; save(true); full(); }
function delPage(i) { if (E.doc.pages.length < 2) return toast('O design precisa de pelo menos uma página.', 'warn'); snap(); E.doc.pages.splice(i, 1); E.pg = Math.min(E.pg, E.doc.pages.length - 1); E.sel = []; save(true); full(); toast('Página excluída · Ctrl+Z desfaz'); }
function movePage(from, to) { if (from === to || to < 0 || to >= E.doc.pages.length) return; snap(); const [p] = E.doc.pages.splice(from, 1); E.doc.pages.splice(to, 0, p); E.pg = to; save(true); full(); }

/* ---------- Texto, corte e tabela ---------- */
function startEdit(id) {
  const e = byId(id); if (!e || e.type !== 'text' || e.lock) return;
  snap(); E.editing = id; E.sel = [id]; E.crop = E.tedit = null; renderStage(); renderCtx();
  const n = nodeOf(id); if (!n) return;
  const r = document.createRange(); r.selectNodeContents(n); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r);
  n.addEventListener('input', () => { e.text = n.innerText.replace(/\n$/, ''); e.h = n.offsetHeight; renderOverlay(); });
  n.addEventListener('blur', () => { if (E.editing === id) endEdit(); });
  n.addEventListener('paste', (pe) => { pe.preventDefault(); document.execCommand('insertText', false, (pe.clipboardData || window.clipboardData).getData('text')); });
}
function endEdit() { if (!E.editing) return; const e = byId(E.editing); E.editing = null; if (e && !String(e.text).trim()) { page().els = els().filter(x => x !== e); E.sel = []; } save(); renderStage(); renderCtx(); if (E.tab === 'posicao') renderPanel(); }
function startCrop(id) { const e = byId(id); if (!e || e.type !== 'image' || e.lock || e.fit === 'contain') { if (e && e.fit === 'contain') { snap(); e.fit = 'cover'; } else return; } E.crop = id; E.sel = [id]; renderStage(); renderCtx(); }
function endCrop() { if (!E.crop) return; E.crop = null; save(); renderStage(); renderCtx(); }
function startTedit(id, cell) {
  const e = byId(id); if (!e || e.type !== 'table' || e.lock) return;
  snap(); E.tedit = id; E.sel = [id]; renderStage(); renderCtx();
  const node = nodeOf(id); if (!node) return;
  node.querySelectorAll('.sx-cell').forEach(c => {
    c.addEventListener('input', () => { e.cells[+c.dataset.r][+c.dataset.c] = c.innerText.replace(/\n$/, ''); save(); });
    c.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); endTedit(); } });
  });
  const tgt = cell ? node.querySelector('.sx-cell[data-r="' + cell.r + '"][data-c="' + cell.c + '"]') : node.querySelector('.sx-cell');
  if (tgt) { tgt.focus(); const r = document.createRange(); r.selectNodeContents(tgt); r.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); }
}
function endTedit() { if (!E.tedit) return; E.tedit = null; save(); renderStage(); renderCtx(); }

/* ---------- Ponteiro ---------- */
const wrapEl = () => $r('#sxWrap');
function toDoc(ev) { const r = wrapEl().getBoundingClientRect(); return { x: (ev.clientX - r.left) / E.scale, y: (ev.clientY - r.top) / E.scale }; }
function snapMove(b, noSnap) {
  E.guides = []; if (noSnap) return { ox: 0, oy: 0 };
  const T = 7 / E.scale, others = els().filter(e => !E.sel.includes(e.id) && !e.hide);
  const tx = [0, E.doc.w / 2, E.doc.w], ty = [0, E.doc.h / 2, E.doc.h];
  others.forEach(o => { const ob = bbox([o]); tx.push(ob.x, ob.x + ob.w / 2, ob.x + ob.w); ty.push(ob.y, ob.y + ob.h / 2, ob.y + ob.h); });
  let ox = 0, oy = 0, gx = null, gy = null, bx = T, by = T;
  [b.x, b.x + b.w / 2, b.x + b.w].forEach(v => tx.forEach(t => { const d = t - v; if (Math.abs(d) < bx) { bx = Math.abs(d); ox = d; gx = t; } }));
  [b.y, b.y + b.h / 2, b.y + b.h].forEach(v => ty.forEach(t => { const d = t - v; if (Math.abs(d) < by) { by = Math.abs(d); oy = d; gy = t; } }));
  if (gx !== null) E.guides.push({ v: true, p: gx }); if (gy !== null) E.guides.push({ v: false, p: gy });
  return { ox, oy };
}
function onDown(ev) {
  if (ev.button !== 0) return;
  hideMenu();
  if (E.mode === 'draw') return startDraw(ev);
  const hd = ev.target.closest('.sx-h');
  if (hd) { ev.preventDefault(); return hd.dataset.h === 'rot' ? startRotate(ev) : startResize(ev, +hd.dataset.ax, +hd.dataset.ay); }
  const n = ev.target.closest('#sxAb [data-id]');
  if (n && (n.dataset.id === E.editing || n.dataset.id === E.tedit)) return;
  if (E.editing) endEdit();
  if (E.tedit) endTedit();
  if (E.crop) { if (n && n.dataset.id === E.crop) { ev.preventDefault(); return startCropDrag(ev); } endCrop(); }
  if (!n) { return startMarquee(ev); }
  ev.preventDefault();
  const id = n.dataset.id;
  if (E.paint) { const ids = groupOf(id); pasteStyle(ids.map(byId)); E.sel = ids; renderOverlay(); renderCtx(); return; }
  const ids = (ev.ctrlKey || ev.metaKey) ? [id] : groupOf(id);
  if (ev.shiftKey) { const has = E.sel.includes(id); E.sel = has ? E.sel.filter(x => !ids.includes(x)) : E.sel.concat(ids.filter(x => !E.sel.includes(x))); afterSel(); return; }
  if (!ids.every(x => E.sel.includes(x))) { E.sel = ids; afterSel(); }
  let list = selEls().filter(e => !e.lock); if (!list.length) return;
  const p0 = toDoc(ev); let moved = false, start = null, b0 = null;
  const mv = (e2) => {
    const p = toDoc(e2); let dx = p.x - p0.x, dy = p.y - p0.y;
    if (!moved && Math.hypot(dx, dy) * E.scale < 3) return;
    if (!moved) { moved = true; if (e2.altKey) { list = dup(list, 0); } else snap(); start = list.map(e => ({ e, x: e.x, y: e.y })); b0 = bbox(list); }
    const s = snapMove({ x: b0.x + dx, y: b0.y + dy, w: b0.w, h: b0.h }, e2.metaKey || e2.ctrlKey); dx += s.ox; dy += s.oy;
    start.forEach(o => { o.e.x = o.x + dx; o.e.y = o.y + dy; const nd = nodeOf(o.e.id); if (nd) { nd.style.left = o.e.x + 'px'; nd.style.top = o.e.y + 'px'; } });
    E.badge = { x: b0.x + dx, y: b0.y + dy + b0.h + 8 / E.scale, t: 'X ' + Math.round(b0.x + dx) + ' · Y ' + Math.round(b0.y + dy) };
    renderOverlay();
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); E.guides = []; E.badge = null; renderOverlay(); if (moved) { save(); if (E.tab === 'posicao') renderPanel(); } };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function afterSel() { E.hover = null; renderOverlay(); renderCtx(); if (['posicao', 'ajustes', 'dados', 'tabela', 'efeitos', 'fontes', 'cor', 'animar'].includes(E.tab)) { autoTab(); renderPanel(); } }
function autoTab() {
  const t = selEls()[0];
  if (E.tab === 'ajustes' && (!t || t.type !== 'image')) E.tab = 'elementos';
  if (E.tab === 'dados' && (!t || t.type !== 'chart')) E.tab = 'elementos';
  if (E.tab === 'tabela' && (!t || t.type !== 'table')) E.tab = 'elementos';
  if (E.tab === 'efeitos' && (!t || t.type !== 'text')) E.tab = 'texto';
  if (E.tab === 'cor' && !t && E.colorT !== 'bg') E.colorT = 'bg';
  renderRail();
}
function startMarquee(ev) {
  const p0 = toDoc(ev); let moved = false;
  E.marquee = null;
  const mv = (e2) => { const p = toDoc(e2); if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) * E.scale < 4) return; moved = true; E.marquee = { x0: p0.x, y0: p0.y, x1: p.x, y1: p.y }; renderOverlay(); };
  const up = (e2) => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
    if (moved && E.marquee) {
      const m = E.marquee, x = Math.min(m.x0, m.x1), y = Math.min(m.y0, m.y1), w = Math.abs(m.x1 - m.x0), h = Math.abs(m.y1 - m.y0);
      const hit = els().filter(e => { if (e.hide || e.lock) return false; const b = bbox([e]); return b.x < x + w && b.x + b.w > x && b.y < y + h && b.y + b.h > y; });
      const ids = [...new Set(hit.flatMap(e => groupOf(e.id)))];
      E.sel = e2.shiftKey ? [...new Set(E.sel.concat(ids))] : ids;
    } else if (!e2.shiftKey) E.sel = [];
    E.marquee = null; if (E.paint && !E.sel.length) E.paint = false; afterSel();
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function startResize(ev, ax, ay) {
  const e = selEls()[0]; if (!e) return; snap();
  const o = JSON.parse(JSON.stringify(e)), p0 = toDoc(ev), r = o.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), cx0 = o.x + o.w / 2, cy0 = o.y + o.h / 2;
  const mv = (e2) => {
    const p = toDoc(e2), dx = p.x - p0.x, dy = p.y - p0.y, lx = dx * c + dy * s, ly = -dx * s + dy * c;
    let dw = ax * lx, dh = ay * ly;
    const keep = ax && ay && (e2.shiftKey || ['image', 'icon', 'text', 'draw', 'frame'].includes(e.type) || (e.type === 'ellipse' && Math.abs(o.w - o.h) < 1));
    if (keep && !(e2.shiftKey && ['image', 'frame'].includes(e.type))) { const f = Math.max((o.w + dw) / o.w, (o.h + dh) / o.h); dw = o.w * f - o.w; dh = o.h * f - o.h; }
    let nw = Math.max(10, o.w + dw), nh = e.type === 'line' ? o.h : Math.max(10, o.h + dh);
    dw = nw - o.w; dh = nh - o.h;
    const lcx = ax * dw / 2, lcy = ay * dh / 2;
    e.w = nw; e.h = nh;
    if (e.type === 'text' && ax && ay) { const f = nw / o.w; e.size = Math.max(4, o.size * f); e.ls = o.ls * f; }
    if (e.type === 'draw' || e.type === 'icon') { const f = nw / o.w; if (e.type === 'draw') e.sw = Math.max(1, o.sw * f); }
    e.x = cx0 + lcx * c - lcy * s - nw / 2; e.y = cy0 + lcx * s + lcy * c - nh / 2;
    E.badge = { x: e.x, y: e.y + e.h + 10 / E.scale, t: Math.round(e.w) + ' × ' + Math.round(e.type === 'text' ? e.h : e.h) + (e.type === 'text' && ax && ay ? ' · ' + Math.round(e.size) + ' pt' : '') };
    renderStage();
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); E.badge = null; save(); renderStage(); renderCtx(); if (E.tab === 'posicao') renderPanel(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function startRotate(ev) {
  const e = selEls()[0]; if (!e) return; snap();
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  const mv = (e2) => {
    const p = toDoc(e2); let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI - 90;
    if (e2.shiftKey) a = Math.round(a / 15) * 15; else { const n = Math.round(a / 45) * 45; if (Math.abs(n - a) < 4) a = n; }
    a = ((a % 360) + 360) % 360; if (a > 180) a -= 360;
    e.rot = Math.round(a * 10) / 10; const nd = nodeOf(e.id); if (nd) nd.style.transform = 'rotate(' + e.rot + 'deg)';
    E.badge = { x: e.x, y: e.y - 40 / E.scale, t: Math.round(e.rot) + '°' }; renderOverlay();
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); E.badge = null; save(); renderOverlay(); if (E.tab === 'posicao') renderPanel(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function startCropDrag(ev) {
  const e = byId(E.crop); if (!e) return; snap();
  const p0 = toDoc(ev), b0 = SX.imgBox(e), r = -(e.rot || 0) * Math.PI / 180;
  const mv = (e2) => {
    const p = toDoc(e2), dx = p.x - p0.x, dy = p.y - p0.y, lx = dx * Math.cos(r) - dy * Math.sin(r), ly = dx * Math.sin(r) + dy * Math.cos(r);
    const ex = e.w - b0.w, ey = e.h - b0.h;
    const nx = clamp(b0.x + lx, Math.min(ex, 0), Math.max(ex, 0)), ny = clamp(b0.y + ly, Math.min(ey, 0), Math.max(ey, 0));
    e.px = ex ? nx / ex * 100 : 50; e.py = ey ? ny / ey * 100 : 50; renderStage();
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); save(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function startDraw(ev) {
  ev.preventDefault();
  E.drawPts = [[toDoc(ev).x, toDoc(ev).y]];
  const mv = (e2) => { const p = toDoc(e2), L = E.drawPts[E.drawPts.length - 1]; if (Math.hypot(p.x - L[0], p.y - L[1]) * E.scale > 1.5) { E.drawPts.push([p.x, p.y]); renderOverlay(); } };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
    const pts = E.drawPts; E.drawPts = null;
    if (pts.length < 2) { renderOverlay(); return; }
    const sw = E.pen.sw, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x = Math.min(...xs) - sw / 2, y = Math.min(...ys) - sw / 2, w = Math.max(Math.max(...xs) - Math.min(...xs) + sw, 4), h = Math.max(Math.max(...ys) - Math.min(...ys) + sw, 4);
    const e = SX.el('draw', { x, y, w, h, sw, op: E.pen.op, color: E.pen.color || SX.ink(page().bg, K()), pts: pts.map(p => [+((p[0] - x) / w).toFixed(4), +((p[1] - y) / h).toFixed(4)]) }, K());
    snap(); els().push(e); save(); renderStage();
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}

/* ---------- Menu de contexto ---------- */
function showMenu(ev) {
  const M = $r('#sxMenu'); if (!M) return;
  const pt = toDoc(ev), hit = hitTest(pt);
  if (hit && !E.sel.includes(hit.id)) { E.sel = groupOf(hit.id); afterSel(); }
  if (!hit) { E.sel = []; afterSel(); }
  const has = E.sel.length > 0, list = selEls(), grouped = list.length > 1 && list.every(e => e.g && e.g === list[0].g);
  const it = (x, l, k, extra) => '<button role="menuitem" data-x="' + x + '"' + (extra || '') + '><span>' + l + '</span>' + (k ? '<kbd>' + k + '</kbd>' : '') + '</button>';
  M.innerHTML = has ? it('copy', 'Copiar', 'Ctrl+C') + it('paste', 'Colar', 'Ctrl+V', E.clip ? '' : ' disabled') + it('dup', 'Duplicar', 'Ctrl+D') + it('del', 'Excluir', 'Delete') + '<hr>' +
    it('copyStyle', 'Copiar estilo', 'Ctrl+Alt+C') + it('pasteStyle', 'Colar estilo', 'Ctrl+Alt+V', E.styleClip ? '' : ' disabled') + '<hr>' +
    it('order', 'Trazer para frente', ']', ' data-a="up"') + it('order', 'Enviar para trás', '[', ' data-a="down"') + it('align', 'Centralizar na página', '', ' data-a="hcenter"') + '<hr>' +
    (list.length > 1 || (list[0] && list[0].g) ? it('group', grouped || (list.length === 1) ? 'Desagrupar' : 'Agrupar', 'Ctrl+G') : '') + it('lock', list.every(e => e.lock) ? 'Destravar' : 'Travar', 'Alt+Shift+L') +
    (list.length === 1 && list[0].type === 'image' ? it('imgToBg', 'Usar como fundo', '') : '')
    : it('paste', 'Colar', 'Ctrl+V', E.clip ? '' : ' disabled') + it('addPage', 'Adicionar página', 'Ctrl+Enter') + it('dupPageCur', 'Duplicar página', '') + it('tab', 'Mudar o fundo', '', ' data-v="fundo"') + it('selAll', 'Selecionar tudo', 'Ctrl+A');
  M.hidden = false;
  const r = E.root.getBoundingClientRect();
  M.style.left = Math.min(ev.clientX - r.left, r.width - 240) + 'px'; M.style.top = Math.min(ev.clientY - r.top, r.height - M.offsetHeight - 8) + 'px';
}
function hideMenu() { const M = $r('#sxMenu'); if (M) M.hidden = true; }

/* ---------- Pop-ups da barra de contexto ---------- */
const popRange = (label, k, v, a, b, st, fmt) => '<label class="sx-slider"><span>' + label + '<small>' + (fmt ? fmt(v) : v) + '</small></span><input type="range" min="' + a + '" max="' + b + '" step="' + (st || 1) + '" value="' + v + '" data-p="' + k + '"' + (k === 'op' ? ' data-pct="1"' : '') + '></label>';
const popSeg = (k, cur, opts) => '<div class="sx-seg">' + opts.map(([v, l]) => '<button data-x="setP" data-k="' + k + '" data-v="' + v + '" class="' + (String(cur) === String(v) ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
function openCtxPop(b, kind) {
  const e = selEls()[0]; if (!e && kind !== 'alignPop') return;
  let t = '', h = '';
  if (kind === 'opPop') { t = 'Transparência'; h = popRange('Opacidade', 'op', Math.round(e.op * 100), 0, 100, 1, v => v + '%'); }
  if (kind === 'spacingPop') { t = 'Espaçamento'; h = popRange('Entre letras', 'ls', e.ls, -10, 60, 0.5) + popRange('Entre linhas', 'lh', e.lh, 0.6, 3, 0.05); }
  if (kind === 'borderPop') { t = 'Borda'; h = popSeg('dash', e.dash || 'solid', [['solid', 'Contínua'], ['dashed', 'Tracejada'], ['dotted', 'Pontilhada']]) + popRange('Espessura', 'sw', e.sw || 0, 0, 40) + '<div class="sx-row"><span class="sx-lbl">Cor</span><button class="sx-sw" data-x="tab" data-v="cor" data-t="stroke" style="background:' + e.stroke + '" aria-label="Cor da borda"></button></div>'; }
  if (kind === 'radiusPop') { t = 'Arredondamento'; h = popRange('Cantos', 'radius', Math.round(e.radius || 0), 0, Math.round(Math.min(e.w, e.h) / 2)); }
  if (kind === 'linePop') { t = 'Linha'; h = popSeg('dash', e.dash, [['solid', 'Contínua'], ['dashed', 'Tracejada'], ['dotted', 'Pontilhada']]) + popRange('Espessura', 'sw', e.sw, 1, 60); }
  if (kind === 'capPop') { t = 'Pontas da linha'; h = '<span class="sx-lbl">Início</span>' + popSeg('cap1', e.cap1, [['none', 'Nenhuma'], ['arrow', 'Seta'], ['dot', 'Círculo']]) + '<span class="sx-lbl">Fim</span>' + popSeg('cap2', e.cap2, [['none', 'Nenhuma'], ['arrow', 'Seta'], ['dot', 'Círculo']]); }
  if (kind === 'iconPop') { t = 'Traço do ícone'; h = popRange('Espessura', 'sw', e.sw, 0.5, 4, 0.1); }
  if (kind === 'drawPop') { t = 'Traço'; h = popRange('Espessura', 'sw', Math.round(e.sw), 1, 80); }
  if (kind === 'flipPop') { t = 'Virar'; h = '<button class="pop-item" data-x="tog" data-k="flipH">' + icon('flip', 'ic-sm') + ' Virar na horizontal</button><button class="pop-item" data-x="tog" data-k="flipV">' + icon('flipV', 'ic-sm') + ' Virar na vertical</button>'; }
  if (kind === 'maskPop') { t = 'Formato'; h = popSeg('mask', e.mask, [['rect', 'Reto'], ['rounded', 'Arredondado'], ['circle', 'Círculo'], ['arch', 'Arco']]) + (e.mask === 'rect' ? popRange('Cantos', 'radius', Math.round(e.radius || 0), 0, Math.round(Math.min(e.w, e.h) / 2)) : ''); }
  if (kind === 'shapePop') { t = 'Trocar forma'; h = '<div class="sx-grid4">' + Object.keys(SX.POLY).map(kd => '<button class="sx-tile" data-x="setP" data-k="kind" data-v="' + kd + '" title="' + SX.SHAPE_NAMES[kd] + '">' + svgT('<polygon points="' + SX.POLY[kd].map(q => (8 + q[0] * 0.84).toFixed(1) + ',' + (8 + q[1] * 0.84).toFixed(1)).join(' ') + '" fill="currentColor"/>') + '</button>').join('') + '</div>'; }
  if (kind === 'alignPop') { t = 'Alinhar'; h = '<div class="sx-grid4 sx-btns">' + [['left', 'alignL', 'Esquerda'], ['hcenter', 'alignC', 'Centro'], ['right', 'alignR', 'Direita'], ['top', 'alignT', 'Topo'], ['vcenter', 'alignM', 'Meio'], ['bottom', 'alignB', 'Base'], ['distH', 'distH', 'Distribuir na horizontal'], ['distV', 'distV', 'Distribuir na vertical']].map(([a, ic, l]) => '<button class="sx-ib sx-ibb" data-x="align" data-a="' + a + '" title="' + l + '" aria-label="' + l + '"' + (a.startsWith('dist') && E.sel.length < 3 ? ' disabled' : '') + '>' + icon(ic) + '</button>').join('') + '</div>'; }
  openPop(b, t, '<div class="sx-pop">' + h + '</div>');
}

/* ---------- Menus da barra superior ---------- */
function fileMenu(b) {
  openPop(b, 'Arquivo', [
    [icon('plus', 'ic-sm') + ' Novo design', () => { W.Studio && W.Studio.home(); setTimeout(() => W.Studio && W.Studio.createPop && W.Studio.createPop(), 50); }],
    [icon('copy', 'ic-sm') + ' Fazer uma cópia', () => { const c = JSON.parse(JSON.stringify(E.doc)); c.id = uid('doc'); c.nome += ' (cópia)'; c.upd = c.criado = Date.now(); delete c._c; docs().unshift(c); persist(); openDoc(c); full(); toast('Cópia criada e aberta'); }],
    [icon('text', 'ic-sm') + ' Renomear', () => { const i = $r('#sxTitle'); i.focus(); i.select(); }],
    [icon('star', 'ic-sm') + ' Enviar capa à vitrine', toVitrine],
    [icon('trash', 'ic-sm') + ' Excluir design', () => confirmBox('Excluir “' + E.doc.nome + '”?', 'O design e todas as páginas serão removidos para todos os sócios.', 'Excluir', () => { W.ST.docs = docs().filter(d => d.id !== E.doc.id); persist(); E.doc = null; W.Studio && W.Studio.home(); toast('Design excluído'); })]
  ]);
}
function resizeMenu(b) {
  openPop(b, 'Redimensionar', '<div class="sx-pop">' + Object.entries(SX.FORMATS).map(([k, f]) => '<button class="pop-item" data-x="resizeTo" data-v="' + k + '"' + (k === E.doc.fmt ? ' disabled' : '') + '><span>' + icon(f.ic, 'ic-sm') + ' ' + f.l + '</span><small class="muted">' + f.w + '×' + f.h + '</small></button>').join('') +
    '<div class="sx-row" style="margin-top:6px"><input class="sx-hex" id="sxRw" inputmode="numeric" placeholder="Largura" value="' + E.doc.w + '" aria-label="Largura"><span>×</span><input class="sx-hex" id="sxRh" inputmode="numeric" placeholder="Altura" value="' + E.doc.h + '" aria-label="Altura"><button class="btn btn-sm" data-x="resizeCustom">Aplicar</button></div>' +
    '<label class="sx-switch"><input type="checkbox" id="sxRcopy" checked><span>Criar uma cópia redimensionada</span></label></div>');
}
function doResize(fmt, w, h) {
  const asCopy = $('#sxRcopy') ? $('#sxRcopy').checked : true;
  const f = SX.FORMATS[fmt] || { w, h }; if (!(f.w > 50 && f.h > 50 && f.w <= 8000 && f.h <= 8000)) { toast('Use medidas entre 50 e 8000 px.', 'warn'); return; }
  let d = E.doc;
  if (asCopy) { d = JSON.parse(JSON.stringify(E.doc)); d.id = uid('doc'); d.nome += ' · ' + (SX.FORMATS[fmt] ? SX.FORMATS[fmt].l : f.w + '×' + f.h); d.upd = d.criado = Date.now(); delete d._c; docs().unshift(d); } else snap();
  const sx = f.w / d.w, sy = f.h / d.h, m = Math.min(sx, sy);
  d.pages.forEach(p => p.els.forEach(e => {
    const cx = (e.x + e.w / 2) * sx, cy = (e.y + e.h / 2) * sy;
    e.w *= m; e.h *= m; if (e.type === 'text') { e.size *= m; e.ls *= m; } if (e.type === 'chart') e.fs *= m; if (e.type === 'table') e.size *= m; if (e.sw && e.type !== 'icon') e.sw *= m; if (e.radius) e.radius *= m;
    e.x = cx - e.w / 2; e.y = cy - e.h / 2;
  }));
  Object.assign(d, { fmt: SX.FORMATS[fmt] ? fmt : 'custom', w: f.w, h: f.h });
  persist(); closePop(); if (asCopy) openDoc(d); E.zoom = null; full(); toast(asCopy ? 'Cópia redimensionada criada' : 'Design redimensionado');
}
function exportMenu(b) {
  openPop(b, 'Exportar', [
    [icon('image', 'ic-sm') + ' PNG · página atual', () => SX.exportImages(E.doc, 'png', [page()])],
    [icon('image', 'ic-sm') + ' PNG · todas as páginas', () => SX.exportImages(E.doc, 'png', E.doc.pages)],
    [icon('image', 'ic-sm') + ' JPG · página atual', () => SX.exportImages(E.doc, 'jpg', [page()])],
    [icon('file', 'ic-sm') + ' PDF · todas as páginas', () => SX.exportPDF(E.doc, E.doc.pages)],
    [icon('presenter', 'ic-sm') + ' PowerPoint (.pptx)', () => SX.exportPPTX(E.doc, E.doc.pages)],
    [icon('star', 'ic-sm') + ' Enviar capa à vitrine', toVitrine]
  ]);
}
function presentMenu(b) {
  openPop(b, 'Apresentar', [
    [icon('expand', 'ic-sm') + ' Tela cheia · desta página', () => present(E.pg, 'full')],
    [icon('play', 'ic-sm') + ' Tela cheia · do início', () => present(0, 'full')],
    [icon('presenter', 'ic-sm') + ' Modo apresentador · notas e cronômetro', () => present(E.pg, 'presenter')]
  ]);
}
async function toVitrine() {
  if (E.editing) endEdit();
  const img = await SX.thumbData(E.doc, E.doc.pages[0], 900);
  const kit = SX.kitOf(E.doc.kit);
  W.ST.vitrine.unshift({ id: uid('v'), titulo: E.doc.nome, cliente: kit.id === 'ic' ? 'Imagine Concept' : kit.nome, cat: SX.fmtOf(E.doc).l, ano: new Date().getFullYear(), img: SX.asset(img), doc: E.doc.id });
  persist(); toast('Capa enviada à vitrine de trabalhos');
}

/* ---------- Combinações de texto ---------- */
function combo(v) {
  const k = K(), Wd = E.doc.w, Hd = E.doc.h, g = uid('g'), ink = SX.ink(page().bg, k), accT = SX.lum(page().bg) > 0.55 && SX.lum(k.acc) > 0.6 ? k.alt : k.acc;
  const T = (p) => SX.el('text', Object.assign({ g, color: ink, font: k.f1 }, p), k);
  let list = [];
  const s = Wd / 1080;
  if (v === 'hero') list = [T({ x: Wd * 0.1, y: Hd * 0.38, w: Wd * 0.8, text: 'Título forte e direto', size: 88 * s, weight: 800, font: k.f0, lh: 1.05 }), SX.el('line', { g, x: Wd * 0.1, y: Hd * 0.38 + 112 * s, w: 120 * s, sw: Math.max(3, 6 * s), color: accT }, k), T({ x: Wd * 0.1, y: Hd * 0.38 + 150 * s, w: Wd * 0.7, text: 'Uma linha de apoio que explica a ideia principal.', size: 32 * s, op: 0.8, lh: 1.4 })];
  if (v === 'num') list = [T({ x: Wd * 0.1, y: Hd * 0.32, w: Wd * 0.8, text: '+38%', size: 220 * s, weight: 800, font: k.f0, color: accT, lh: 1 }), T({ x: Wd * 0.1, y: Hd * 0.32 + 240 * s, w: Wd * 0.7, text: 'de margem em seis meses', size: 40 * s, weight: 500 })];
  if (v === 'quote') list = [T({ x: Wd * 0.12, y: Hd * 0.32, w: Wd * 0.76, text: '“A Imagine organizou nosso caixa e nossa marca ao mesmo tempo.”', size: 54 * s, weight: 500, ital: true, font: 'Playfair Display', lh: 1.3 }), T({ x: Wd * 0.12, y: Hd * 0.32 + 240 * s, w: Wd * 0.6, text: '[Nome do cliente] · [Empresa]', size: 28 * s, weight: 600, color: accT })];
  if (v === 'tag') { const w = 300 * s, h = 76 * s; list = [SX.el('rect', { g, x: (Wd - w) / 2, y: Hd / 2 - h / 2, w, h, radius: h / 2, fill: accT }, k), T({ x: (Wd - w) / 2, y: Hd / 2 - 22 * s * 0.62, w, text: 'NOVIDADE', size: 22 * s, weight: 700, ls: 3, align: 'center', color: SX.lum(accT) > 0.55 ? '#111111' : '#FFFFFF' })]; }
  if (v === 'over') list = [T({ x: Wd * 0.1, y: Hd * 0.38, w: Wd * 0.8, text: 'SOBRELINHA', size: 24 * s, weight: 600, ls: 4, color: accT }), T({ x: Wd * 0.1, y: Hd * 0.38 + 48 * s, w: Wd * 0.8, text: 'Título com sobrelinha', size: 72 * s, weight: 700, font: k.f0, lh: 1.1 })];
  if (v === 'cta') { const w = 520 * s, h = 100 * s; list = [SX.el('rect', { g, x: (Wd - w) / 2, y: Hd / 2 - h / 2, w, h, radius: h / 2, fill: accT }, k), T({ x: (Wd - w) / 2, y: Hd / 2 - 34 * s * 0.62, w, text: 'Agende uma conversa', size: 34 * s, weight: 600, align: 'center', color: SX.lum(accT) > 0.55 ? '#111111' : '#FFFFFF' })]; }
  addEls(list);
}

/* ---------- Ações (cliques) ---------- */
function act(b, ev) {
  const x = b.dataset.x, k = K();
  switch (x) {
    case 'home': if (E.editing) endEdit(); W.Studio && W.Studio.home(); break;
    case 'fileMenu': fileMenu(b); break;
    case 'resizeMenu': resizeMenu(b); break;
    case 'resizeTo': doResize(b.dataset.v); break;
    case 'resizeCustom': doResize('custom', Math.round(pNum($('#sxRw').value)), Math.round(pNum($('#sxRh').value))); break;
    case 'exportMenu': exportMenu(b); break;
    case 'presentMenu': presentMenu(b); break;
    case 'present': present(E.pg, b.dataset.v || 'full'); break;
    case 'undo': undo(); break;
    case 'redo': redo(); break;
    case 'tab': {
      const v = b.dataset.v;
      if (b.dataset.t) E.colorT = b.dataset.t;
      if (v === E.tab && E.panel && !b.dataset.t && b.closest('#sxRail')) { E.panel = false; }
      else { E.tab = v; E.panel = true; }
      closePop(); hideMenu(); renderRail(); renderPanel(); renderCtx(); requestAnimationFrame(() => { if (!E.zoom) renderStage(); });
      break;
    }
    case 'closePanel': E.panel = false; renderRail(); renderPanel(); renderCtx(); requestAnimationFrame(() => { if (!E.zoom) renderStage(); }); break;
    case 'layout': {
      const pg = SX.makeLayout(b.dataset.k, KP(), E.doc); SX.measure(E.doc, [pg]);
      if (!page().els.length) { snap(); pg.id = page().id; E.doc.pages[E.pg] = pg; E.sel = []; save(true); full(); } else addPage(E.pg, pg);
      if (E.kitPick && E.kitPick !== E.doc.kit && E.doc.pages.length === 1) E.doc.kit = E.kitPick;
      toast('Layout “' + SX.LAYOUTS[b.dataset.k].nome + '” adicionado');
      break;
    }
    case 'deck': { const d = SX.DECKS.find(x2 => x2.id === b.dataset.id); snap(); E.doc.pages = SX.makeDeck(d, KP(), E.doc); SX.measure(E.doc); E.doc.kit = KP().id; if (/sem título/i.test(E.doc.nome)) E.doc.nome = d.nome; E.pg = 0; E.sel = []; save(true); full(); toast('Apresentação “' + d.nome + '” aplicada · Ctrl+Z desfaz'); break; }
    case 'social': {
      const t = SX.SOCIAL.find(s => s.id === b.dataset.id), pg = SX.makeSocial(t, KP()); snap();
      if (t.fmt !== E.doc.fmt) { const f = SX.FORMATS[t.fmt]; Object.assign(E.doc, { fmt: t.fmt, w: f.w, h: f.h }); E.zoom = null; }
      SX.measure(E.doc, [pg]); E.doc.pages[E.pg] = pg; E.doc.kit = KP().id; E.sel = []; save(true); full(); renderTop(); break;
    }
    case 'addEl': { const spec = JSON.parse(b.dataset.spec); addEls([specToEl(spec)]); if (spec.t === 'chart') { E.tab = 'dados'; E.panel = true; renderRail(); renderPanel(); } break; }
    case 'addFontText': addEls([specToEl({ t: 'text', p: { text: b.dataset.f, font: b.dataset.f, size: Math.round(E.doc.w / 16), w: E.doc.w * 0.6 } })]); break;
    case 'combo': combo(b.dataset.v); break;
    case 'addImg': { const it = libItem(b.dataset.k, b.dataset.id); if (!it) break; probe(it).then(item => { const tgt = selEls()[0]; if (tgt && (tgt.type === 'frame' || (tgt.type === 'image' && E.crop))) fillTarget(tgt, item); else addEls([imgElFrom(item)]); }); break; }
    case 'addLogo': { const kk = KP(); const s = Math.min(E.doc.w, E.doc.h) * 0.2; addEls(SX.logoEls(kk, (E.doc.w - s) / 2, (E.doc.h - s) / 2, s, b.dataset.v !== 'light').map(e => { if (e.type === 'image' && kk.id === 'ic' && b.dataset.v === 'light') e.src = SX.logoSrc('#0E2152', '#2F5BCB'); return e; })); break; }
    case 'kitColor': { const c = b.dataset.c; if (E.sel.length) { E.colorT = selEls()[0].type === 'text' || selEls()[0].type === 'icon' || selEls()[0].type === 'line' ? 'color' : 'fill'; setColor(c); } else { E.colorT = 'bg'; setColor(c); } break; }
    case 'applyKit': {
      const from = K(), to = KP(); snap();
      (b.dataset.v === 'doc' ? E.doc.pages : [page()]).forEach(pg => SX.recolorPage(pg, from, to));
      if (b.dataset.v === 'doc') E.doc.kit = to.id; save(true); full(); toast('Kit “' + to.nome + '” aplicado'); break;
    }
    case 'penTool': { const v = b.dataset.v; E.pen.tool = v; Object.assign(E.pen, v === 'marca' ? { sw: 30, op: 0.4 } : v === 'marcador' ? { sw: 18, op: 1 } : { sw: 8, op: 1 }); E.mode = 'draw'; E.sel = []; renderPanel(); renderCtx(); renderStage(); break; }
    case 'penColor': E.pen.color = b.dataset.c; E.mode = 'draw'; renderPanel(); renderCtx(); renderStage(); break;
    case 'drawToggle': E.mode = E.mode === 'draw' ? null : 'draw'; E.sel = []; if (E.mode) { E.tab = 'desenhar'; E.panel = true; } renderRail(); renderPanel(); renderCtx(); renderStage(); break;
    case 'setBg': E.colorT = 'bg'; snap(); page().bg = b.dataset.c; page().bgGrad = null; save(); renderStage(); renderPanel(); renderCtx(); break;
    case 'bgGrad': snap(); page().bg = b.dataset.a; page().bgGrad = { c2: b.dataset.b, ang: 135 }; save(); renderStage(); renderPanel(); renderCtx(); break;
    case 'bgImg': { const it = libItem('lib', b.dataset.id); if (!it) break; snap(); page().bgImg = { src: it.src, iw: it.w, ih: it.h, op: 1 }; save(); renderStage(); renderPanel(); break; }
    case 'bgImgOff': snap(); page().bgImg = null; save(); renderStage(); renderPanel(); break;
    case 'bgAll': { snap(); const p = page(); E.doc.pages.forEach(q => { q.bg = p.bg; q.bgGrad = p.bgGrad ? Object.assign({}, p.bgGrad) : null; q.bgImg = p.bgImg ? Object.assign({}, p.bgImg) : null; }); save(true); renderThumbs(); toast('Fundo aplicado a todas as páginas'); break; }
    case 'imgToBg': { const e = selEls()[0]; if (!e || e.type !== 'image') break; snap(); page().bgImg = { src: e.src, iw: e.iw, ih: e.ih, op: e.op }; page().els = els().filter(x2 => x2 !== e); E.sel = []; save(); renderStage(); renderCtx(); toast('Imagem definida como fundo'); break; }
    case 'setColor': setColor(b.dataset.c); break;
    case 'effColor': snap(); selEls().forEach(e => { if (e.type === 'text') e.effC = b.dataset.c; }); save(); renderStage(); renderPanel(); break;
    case 'setFont': snap(); selEls().forEach(e => { if ('font' in e) e.font = b.dataset.f; }); save(); renderStage(); renderPanel(); renderCtx(); break;
    case 'setEff': snap(); selEls().forEach(e => { if (e.type === 'text') e.eff = b.dataset.v; }); save(); renderStage(); renderPanel(); break;
    case 'anim': snap(); selEls().forEach(e => e.anim = b.dataset.v); save(); renderPanel(); playAnim(); break;
    case 'animAll': snap(); els().forEach(e => e.anim = b.dataset.v); save(); renderPanel(); if (b.dataset.v !== 'none') playAnim(); break;
    case 'trans': snap(); page().trans = b.dataset.v; save(); renderPanel(); playAnim(true); break;
    case 'transAll': snap(); E.doc.pages.forEach(p => p.trans = page().trans); save(); toast('Transição aplicada a todas as páginas'); break;
    case 'playAnim': playAnim(true); break;
    case 'filter': { const f = SX.FILTERS[+b.dataset.i][1]; snap(); selEls().forEach(e => { if (e.type === 'image') Object.assign(e, f); }); save(); renderStage(); renderPanel(); break; }
    case 'resetFx': snap(); selEls().forEach(e => { if (e.type === 'image') Object.assign(e, SX.FILTERS[0][1]); }); save(); renderStage(); renderPanel(); break;
    case 'chartKind': snap(); selEls().forEach(e => { if (e.type === 'chart') e.kind = b.dataset.v; }); save(); renderStage(); renderPanel(); break;
    case 'chartAdd': { const e = selEls().find(z => z.type === 'chart'); snap(); e.data.push({ l: 'Novo', v: 10 }); save(); renderStage(); renderPanel(); break; }
    case 'chartDel': { const e = selEls().find(z => z.type === 'chart'); snap(); e.data.splice(+b.dataset.i, 1); save(); renderStage(); renderPanel(); break; }
    case 'chartPasteGo': { const e = selEls().find(z => z.type === 'chart'), ta = $r('[data-sx="chartPaste"]'); const rows = ta.value.split(/\r?\n/).map(l => l.split(/\t|;/)).filter(r => r.length >= 2 && r[0].trim()); if (!rows.length) { toast('Cole duas colunas: rótulo e valor.', 'warn'); break; } snap(); e.data = rows.map(r => ({ l: r[0].trim(), v: pNum(r[1]) })); save(); renderStage(); renderPanel(); break; }
    case 'tblRows': case 'tblCols': {
      const e = selEls().find(z => z.type === 'table'), d = +b.dataset.d; snap();
      if (x === 'tblRows') { if (d > 0) { e.cells.push(Array(e.cols).fill('')); e.rows++; e.h += e.h / (e.rows - 1); } else if (e.rows > 1) { e.cells.pop(); e.h -= e.h / e.rows; e.rows--; } }
      else { if (d > 0) { e.cells.forEach((r, i) => r.push(i === 0 && e.head ? 'Coluna ' + (e.cols + 1) : '')); e.cols++; } else if (e.cols > 1) { e.cells.forEach(r => r.pop()); e.cols--; } }
      save(); renderStage(); renderPanel(); break;
    }
    case 'tedit': { const e = selEls().find(z => z.type === 'table'); if (e) startTedit(e.id); break; }
    case 'teditDone': endTedit(); break;
    case 'selLayer': { if (ev.target.closest('button')) break; E.sel = (ev.ctrlKey || ev.metaKey || ev.shiftKey) ? [...new Set(E.sel.concat([b.dataset.id]))] : groupOf(b.dataset.id); renderOverlay(); renderCtx(); renderPanel(); break; }
    case 'lyHide': { snap(); const e = byId(b.dataset.id); e.hide = !e.hide; save(); renderStage(); renderPanel(); break; }
    case 'lyLock': { snap(); const e = byId(b.dataset.id); e.lock = !e.lock; save(); renderOverlay(); renderPanel(); renderCtx(); break; }
    case 'order': order(b.dataset.a); hideMenu(); break;
    case 'align': align(b.dataset.a); hideMenu(); break;
    case 'dup': dup(); hideMenu(); break;
    case 'del': del(); hideMenu(); break;
    case 'lock': { snap(); const all = selEls().every(e => e.lock); selEls().forEach(e => e.lock = !all); save(); renderOverlay(); renderCtx(); hideMenu(); if (E.tab === 'posicao') renderPanel(); break; }
    case 'group': group(); hideMenu(); break;
    case 'copy': E.clip = JSON.stringify(selEls()); hideMenu(); toast('Copiado'); break;
    case 'paste': paste(); hideMenu(); break;
    case 'copyStyle': if (E.paint) { E.paint = false; renderCtx(); renderStage(); } else copyStyle(); hideMenu(); break;
    case 'pasteStyle': pasteStyle(); hideMenu(); break;
    case 'selAll': E.sel = els().filter(e => !e.hide && !e.lock).map(e => e.id); afterSel(); hideMenu(); break;
    case 'dupPageCur': dupPage(E.pg); hideMenu(); break;
    case 'setP': { const kk = b.dataset.k, v = b.dataset.v; setProp(kk, v); if (kk === 'mask') { selEls().forEach(e => { if (v !== 'rect') e.radius = 0; }); } renderCtx(); const pop = $('#pop'); if (!pop.hidden && W._popAnchor && W._popAnchor.isConnected) { const kind = W._popAnchor.dataset.x; openCtxPop(W._popAnchor, kind); } else closePop(); break; }
    case 'tog': { const kk = b.dataset.k; snap(); const v = !selEls().every(e => e[kk]); selEls().forEach(e => { if (kk in e) e[kk] = v; }); save(); renderStage(); renderCtx(); break; }
    case 'bold': { snap(); const v = !selEls().every(e => e.weight >= 700); selEls().forEach(e => { if (e.type === 'text') e.weight = v ? 700 : 400; }); save(); renderStage(); renderCtx(); break; }
    case 'size': { const d = +b.dataset.d; snap(); selEls().forEach(e => { if (e.type === 'text') { const step = e.size >= 100 ? 8 : e.size >= 40 ? 4 : 1; e.size = Math.max(4, Math.round(e.size + d * step)); } }); save(); renderStage(); renderCtx(); break; }
    case 'cycleAlign': { snap(); const o = ['left', 'center', 'right']; selEls().forEach(e => { if (e.type === 'text') e.align = o[(o.indexOf(e.align) + 1) % 3]; }); save(); renderStage(); renderCtx(); break; }
    case 'cycleList': { snap(); const o = ['none', 'bullet', 'num']; selEls().forEach(e => { if (e.type === 'text') e.list = o[(o.indexOf(e.list || 'none') + 1) % 3]; }); save(); renderStage(); renderCtx(); break; }
    case 'opPop': case 'spacingPop': case 'borderPop': case 'radiusPop': case 'linePop': case 'capPop': case 'iconPop': case 'drawPop': case 'flipPop': case 'maskPop': case 'shapePop': case 'alignPop': openCtxPop(b, x); break;
    case 'crop': { const e = selEls()[0]; if (e) startCrop(e.id); break; }
    case 'cropDone': endCrop(); break;
    case 'cropReset': { const e = byId(E.crop); if (e) { snap(); e.px = 50; e.py = 50; e.zoom = 1; save(); renderStage(); renderCtx(); } break; }
    case 'fillFrame': case 'replaceImg': E.pendingFrame = selEls()[0] ? selEls()[0].id : null; $r('#sxFile').click(); break;
    case 'page': if (ev.target.closest('.sx-thmore')) break; goPage(+b.dataset.i); break;
    case 'pageMenu': { ev.stopPropagation(); const i = +b.dataset.i, p = E.doc.pages[i]; openPop(b, 'Página ' + (i + 1), [[icon('plus', 'ic-sm') + ' Adicionar página depois', () => addPage(i)], [icon('copy', 'ic-sm') + ' Duplicar', () => dupPage(i)], [icon(p.hidden ? 'eye' : 'hide', 'ic-sm') + (p.hidden ? ' Mostrar na apresentação' : ' Ocultar na apresentação'), () => { snap(); p.hidden = !p.hidden; save(true); renderThumbs(); }], [icon('chevL', 'ic-sm') + ' Mover para a esquerda', () => movePage(i, i - 1)], [icon('chevR', 'ic-sm') + ' Mover para a direita', () => movePage(i, i + 1)], [icon('trash', 'ic-sm') + ' Excluir página', () => delPage(i)]]); break; }
    case 'addPage': addPage(); hideMenu(); break;
    case 'notes': E.notes = !E.notes; renderFoot(); renderNotes(); requestAnimationFrame(() => { if (!E.zoom) renderStage(); }); if (E.notes) { const t = $r('[data-sx="notes"]'); if (t) t.focus(); } break;
    case 'zin': E.zoom = clamp(E.scale * 1.2, 0.05, 4); renderStage(); break;
    case 'zout': E.zoom = clamp(E.scale / 1.2, 0.05, 4); renderStage(); break;
    case 'zfit': E.zoom = null; renderStage(); break;
    case 'gridView': { const G = $r('#sxGridV'); G.hidden = false; renderGrid(); break; }
    case 'gridClose': $r('#sxGridV').hidden = true; break;
    case 'gridPick': if (ev.target.closest('button')) break; $r('#sxGridV').hidden = true; goPage(+b.dataset.i); break;
    case 'pageDup': dupPage(+b.dataset.i); renderGrid(); break;
    case 'pageHide': { snap(); const p = E.doc.pages[+b.dataset.i]; p.hidden = !p.hidden; save(true); renderGrid(); renderThumbs(); break; }
    case 'pageDel': delPage(+b.dataset.i); if (!$r('#sxGridV').hidden) renderGrid(); break;
    case 'workspace': E.light = !E.light; try { localStorage.setItem('sx.light', E.light ? '1' : '0'); } catch (er) {} $r('#sxEd').classList.toggle('sx-lightws', E.light); renderFoot(); break;
  }
}
function paste() {
  if (!E.clip) return; snap();
  const gm = {}, list = JSON.parse(E.clip).map(e => Object.assign(e, { id: uid('e'), x: e.x + 30, y: e.y + 30, g: e.g ? (gm[e.g] = gm[e.g] || uid('g')) : undefined }));
  list.forEach(e => { if (!e.g) delete e.g; });
  els().push(...list); E.sel = list.map(e => e.id); E.clip = JSON.stringify(list); save(); renderStage(); renderCtx();
}
function playAnim(withTrans) {
  const ab = $r('#sxAb'); if (!ab) return;
  ab.innerHTML = SX.pageInner(page(), E.doc, { play: true });
  if (withTrans && page().trans !== 'none') { ab.classList.remove('sxt-fade', 'sxt-slide', 'sxt-zoom'); void ab.offsetWidth; ab.classList.add('sxt-' + page().trans); }
  clearTimeout(E.playT); E.playT = setTimeout(() => { ab.classList.remove('sxt-fade', 'sxt-slide', 'sxt-zoom'); renderStage(); }, 2600);
}

/* ---------- Campos (input/change) ---------- */
function onInput(ev) {
  const t = ev.target, final = ev.type === 'change';
  if (t.dataset.sx) return onSx(t, ev);
  const k = t.dataset.p; if (!k) return;
  if (E.crop && k === 'zoom') { const e = byId(E.crop); liveSnap(t); e.zoom = clamp(parseFloat(t.value) || 1, 1, 4); save(); renderStage(); return; }
  let v = t.type === 'checkbox' ? t.checked : t.value;
  if (NUM.has(k)) { v = parseFloat(String(v).replace(',', '.')); if (isNaN(v)) return; if (t.dataset.pct) v = clamp(v, 0, 100) / 100; }
  if (k === 'size' && t.type !== 'range' && !final) return;
  const list = selEls().filter(e => k in e); if (!list.length) return;
  liveSnap(t);
  list.forEach(e => {
    if (['x', 'y', 'w', 'h'].includes(k) && list.length > 1) return;
    e[k] = v;
    if (k === 'sw' && e.type === 'line') { const c = e.y + e.h / 2; e.h = Math.max(24, v * 3); e.y = c - e.h / 2; }
    if (k === 'w' && e.type === 'line') e.w = Math.max(10, v);
  });
  save(); renderStage();
  const lab = t.closest('.sx-slider'); if (lab) { const sm = lab.querySelector('small'); if (sm) sm.textContent = t.dataset.pct ? Math.round(v * 100) + '%' : (Math.round(v * 100) / 100); }
  if (final) { E.liveTok = null; renderCtx(); if (['posicao', 'dados', 'tabela'].includes(E.tab) && t.type !== 'range') renderPanel(); }
}
function onSx(t, ev) {
  const k = t.dataset.sx, final = ev.type === 'change', v = t.value;
  switch (k) {
    case 'kitPick': E.kitPick = v; renderPanel(); break;
    case 'elQ': { const q = v.trim().toLowerCase(); $r('#sxPanel').querySelectorAll('.sx-eltile').forEach(n => { n.hidden = q && !n.dataset.n.includes(q); }); $r('#sxPanel').querySelectorAll('[data-sec]').forEach(s => { s.hidden = q && !s.querySelector('.sx-eltile:not([hidden])'); }); break; }
    case 'fontQ': { const q = v.trim().toLowerCase(); $r('#sxPanel').querySelectorAll('.sx-fontbtn').forEach(n => { n.hidden = q && !n.dataset.n.includes(q); }); break; }
    case 'colorPick': setColor(v, t); if (final) { E.liveTok = null; renderPanel(); renderCtx(); } else { const hx = $r('[data-sx="colorHex"]'); if (hx) hx.value = v; } break;
    case 'colorHex': if (SX.isHex(v.trim()) && final) { setColor(SX.toHex(v.trim())); renderPanel(); } break;
    case 'gradOn': {
      snap(); const on = t.checked, c2 = K().alt === curColor(E.colorT) ? K().acc : K().alt;
      if (E.colorT === 'bg') page().bgGrad = on ? { c2, ang: 135 } : null; else selEls().forEach(e => { if ('grad' in e) e.grad = on ? { c2, ang: 135 } : null; });
      save(); renderStage(); renderPanel(); renderCtx(); break;
    }
    case 'grad2': case 'gradAng': {
      liveSnap(t); const set = (g) => { if (g) { if (k === 'grad2') g.c2 = v; else g.ang = +v; } };
      if (E.colorT === 'bg') set(page().bgGrad); else selEls().forEach(e => set(e.grad));
      save(); renderStage(); if (final) { E.liveTok = null; renderPanel(); renderCtx(); } break;
    }
    case 'bgColor': liveSnap(t); page().bg = v; page().bgGrad = null; save(); renderStage(); if (final) { E.liveTok = null; renderPanel(); renderCtx(); } break;
    case 'bgOp': liveSnap(t); if (page().bgImg) page().bgImg.op = +v / 100; save(); renderStage(); if (final) E.liveTok = null; break;
    case 'effColor': liveSnap(t); selEls().forEach(e => { if (e.type === 'text') e.effC = v; }); save(); renderStage(); if (final) { E.liveTok = null; renderPanel(); } break;
    case 'penColor': E.pen.color = v; E.mode = 'draw'; if (final) { renderPanel(); renderCtx(); } break;
    case 'penSw': E.pen.sw = +v; t.closest('.sx-pb').querySelectorAll('h5 small')[1] && (t.previousElementSibling.querySelector('small').textContent = v + ' px'); break;
    case 'penOp': E.pen.op = +v / 100; break;
    case 'zoom': E.zoom = clamp(+v / 100, 0.05, 3); renderStage(); break;
    case 'notes': page().notes = v; save(); break;
    case 'chartL': case 'chartV': { const e = selEls().find(z => z.type === 'chart'); if (!e) break; liveSnap(t); const r = e.data[+t.dataset.i]; if (k === 'chartL') r.l = v; else r.v = pNum(v); save(); renderStage(); if (final) E.liveTok = null; break; }
    case 'chartC': { const e = selEls().find(z => z.type === 'chart'); if (!e) break; liveSnap(t); e.colors[+t.dataset.i] = v; save(); renderStage(); if (final) { E.liveTok = null; renderPanel(); } break; }
    case 'chartPaste': break;
  }
}

/* ---------- Ligações ---------- */
function bind() {
  const root = E.root, st = $r('#sxStage');
  st.addEventListener('pointerdown', onDown);
  st.addEventListener('pointermove', (ev) => { if (ev.buttons || E.mode) return; const n = ev.target.closest('#sxAb [data-id]'), id = n ? n.dataset.id : null; if (id !== E.hover) { E.hover = id; renderOverlay(); } });
  st.addEventListener('pointerleave', () => { if (E.hover) { E.hover = null; renderOverlay(); } });
  st.addEventListener('dblclick', (ev) => {
    const n = ev.target.closest('#sxAb [data-id]'); if (!n) return; const e = byId(n.dataset.id); if (!e) return;
    if (e.type === 'text') startEdit(e.id);
    else if (e.type === 'image') startCrop(e.id);
    else if (e.type === 'table') { const c = ev.target.closest('.sx-cell') || [...n.querySelectorAll('.sx-cell')].find(x => { const b = x.parentElement.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom; }); startTedit(e.id, c ? { r: c.dataset.r, c: c.dataset.c } : null); }
    else if (e.type === 'frame') { E.pendingFrame = e.id; $r('#sxFile').click(); }
    else if (e.type === 'chart') { E.tab = 'dados'; E.panel = true; renderRail(); renderPanel(); }
  });
  st.addEventListener('contextmenu', (ev) => { ev.preventDefault(); showMenu(ev); });
  st.addEventListener('dragover', (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; const p = toDoc(ev), h = hitTest(p); const id = h && (h.type === 'frame' || h.type === 'image') ? h.id : null; if (id !== E.hover) { E.hover = id; renderOverlay(); } });
  st.addEventListener('drop', async (ev) => {
    ev.preventDefault(); E.hover = null;
    const at = toDoc(ev);
    if (ev.dataTransfer.files && ev.dataTransfer.files.length) { addFiles([...ev.dataTransfer.files], at); return; }
    let spec = null; try { spec = JSON.parse(ev.dataTransfer.getData('application/x-sx') || 'null'); } catch (er) {}
    if (!spec) return;
    if (spec.t === 'img') { const it = libItem(spec.k, spec.id); if (!it) return; await probe(it); const tgt = hitTest(at); if (tgt && (tgt.type === 'frame' || tgt.type === 'image')) fillTarget(tgt, it); else addEls([imgElFrom(it, at)]); return; }
    addEls([specToEl(spec, at)]);
  });
  root.addEventListener('dragstart', (ev) => {
    const d = ev.target.closest && ev.target.closest('[data-drag]');
    if (d) { ev.dataTransfer.setData('application/x-sx', d.dataset.drag); ev.dataTransfer.effectAllowed = 'copy'; return; }
    const th = ev.target.closest && ev.target.closest('.sx-th,.sx-gvc'); if (th) { E.dragPg = +(th.dataset.i || th.dataset.gi); ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', 'pg'); } catch (er) {} return; }
    const ly = ev.target.closest && ev.target.closest('.sx-ly'); if (ly) { E.dragLy = ly.dataset.id; ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', 'ly'); } catch (er) {} }
  });
  root.addEventListener('dragover', (ev) => { const th = ev.target.closest('.sx-th,.sx-gvc,.sx-ly'); if (th && (E.dragPg != null || E.dragLy)) { ev.preventDefault(); root.querySelectorAll('.dropto').forEach(n => n.classList.remove('dropto')); th.classList.add('dropto'); } });
  root.addEventListener('drop', (ev) => {
    const th = ev.target.closest('.sx-th,.sx-gvc'), ly = ev.target.closest('.sx-ly');
    root.querySelectorAll('.dropto').forEach(n => n.classList.remove('dropto'));
    if (th && E.dragPg != null) { ev.preventDefault(); const to = +(th.dataset.i || th.dataset.gi); movePage(E.dragPg, to); if (!$r('#sxGridV').hidden) renderGrid(); }
    if (ly && E.dragLy) { ev.preventDefault(); const L = els(), from = L.findIndex(e => e.id === E.dragLy), to = L.findIndex(e => e.id === ly.dataset.id); if (from >= 0 && to >= 0 && from !== to) { snap(); const [m] = L.splice(from, 1); L.splice(to, 0, m); save(); renderStage(); renderPanel(); } }
    E.dragPg = null; E.dragLy = null;
  });
  root.addEventListener('dragend', () => { E.dragPg = null; E.dragLy = null; root.querySelectorAll('.dropto').forEach(n => n.classList.remove('dropto')); });
  st.addEventListener('wheel', (ev) => { if (!(ev.ctrlKey || ev.metaKey)) return; ev.preventDefault(); E.zoom = clamp(E.scale * (ev.deltaY < 0 ? 1.08 : 0.92), 0.05, 4); renderStage(); }, { passive: false });
  $r('#sxFile').addEventListener('change', async (ev) => {
    const files = [...ev.target.files]; ev.target.value = '';
    const fid = E.pendingFrame; E.pendingFrame = null;
    if (fid && files[0]) { const items = await readFiles([files[0]]); const tgt = byId(fid); if (tgt && items[0]) fillTarget(tgt, items[0]); if (E.tab === 'uploads') renderPanel(); return; }
    addFiles(files);
  });
  root.addEventListener('change', (ev) => { if (ev.target.id === 'sxTitle') { E.doc.nome = ev.target.value.trim() || 'Design sem título'; save(); } });
  root.addEventListener('keydown', (ev) => { if (ev.target.id === 'sxTitle' && ev.key === 'Enter') ev.target.blur(); if (ev.target.classList.contains('sx-th') && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); goPage(+ev.target.dataset.i); } });
  new ResizeObserver(() => { if (live() && !E.zoom) renderStage(); }).observe(st);
}
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-x]');
  if (!b || b.disabled) { if (!ev.target.closest('#sxMenu')) hideMenu(); return; }
  if (!(b.closest('#sxEd') || b.closest('#pop'))) return;
  if (!E.doc || !live()) return;
  ev.preventDefault(); act(b, ev);
});
['input', 'change'].forEach(tp => document.addEventListener(tp, (ev) => {
  const t = ev.target; if (!t.closest || !(t.closest('#sxEd') || t.closest('#pop'))) return;
  if (!t.dataset || !(t.dataset.p || t.dataset.sx)) return;
  if (!E.doc || !live()) return;
  onInput(ev);
}));
document.addEventListener('paste', (ev) => {
  if (!live() || W.HP_ACTIVE || E.editing || E.tedit) return;
  const tg = ev.target; if (tg && tg.closest && tg.closest('input,textarea,[contenteditable="true"]')) return;
  const files = [...(ev.clipboardData ? ev.clipboardData.files : [])].filter(f => f.type.startsWith('image/'));
  if (files.length) { ev.preventDefault(); addFiles(files); }
});

/* ---------- Teclado ---------- */
document.addEventListener('keydown', (ev) => {
  if (!live() || W.HP_ACTIVE) return;
  if ($('#sxPresent')) return;
  if (!$('#modal').hidden) return;
  const tg = ev.target;
  if (tg.closest && tg.closest('input,textarea,select')) return;
  if (tg.isContentEditable) {
    if (ev.key === 'Escape') { ev.preventDefault(); tg.blur(); if (E.tedit) endTedit(); }
    if (E.editing && (ev.ctrlKey || ev.metaKey) && ['b', 'i', 'u'].includes(ev.key.toLowerCase())) { ev.preventDefault(); const e = byId(E.editing); if (ev.key.toLowerCase() === 'b') e.weight = e.weight >= 700 ? 400 : 700; else if (ev.key.toLowerCase() === 'i') e.ital = !e.ital; else e.und = !e.und; const n = nodeOf(e.id); if (n) { n.style.fontWeight = e.weight; n.style.fontStyle = e.ital ? 'italic' : 'normal'; n.style.textDecoration = e.und ? 'underline' : 'none'; } }
    return;
  }
  const mod = ev.ctrlKey || ev.metaKey, key = ev.key.toLowerCase();
  if (mod && key === 'z') { ev.preventDefault(); ev.shiftKey ? redo() : undo(); return; }
  if (mod && key === 'y') { ev.preventDefault(); redo(); return; }
  if (mod && ev.key === 'Enter') { ev.preventDefault(); addPage(); return; }
  if (mod && ev.altKey && key === 'p') { ev.preventDefault(); present(E.pg, 'full'); return; }
  if (mod && (key === '=' || key === '+')) { ev.preventDefault(); E.zoom = clamp(E.scale * 1.2, 0.05, 4); renderStage(); return; }
  if (mod && key === '-') { ev.preventDefault(); E.zoom = clamp(E.scale / 1.2, 0.05, 4); renderStage(); return; }
  if (mod && key === '0') { ev.preventDefault(); E.zoom = null; renderStage(); return; }
  if (mod && key === 'a') { ev.preventDefault(); E.sel = els().filter(e => !e.hide && !e.lock).map(e => e.id); afterSel(); return; }
  if (mod && ev.altKey && key === 'c') { ev.preventDefault(); copyStyle(); return; }
  if (mod && ev.altKey && key === 'v') { ev.preventDefault(); pasteStyle(); return; }
  if (mod && key === 'c') { if (E.sel.length) { E.clip = JSON.stringify(selEls()); toast('Copiado'); } return; }
  if (mod && key === 'x') { if (E.sel.length) { E.clip = JSON.stringify(selEls()); del(); } return; }
  if (mod && key === 'v') { if (E.clip) { ev.preventDefault(); paste(); } return; }
  if (mod && key === 'd') { ev.preventDefault(); dup(); return; }
  if (mod && key === 'g') { ev.preventDefault(); group(); return; }
  if (ev.key === 'Escape') { if (E.mode) { E.mode = null; renderPanel(); renderCtx(); renderStage(); return; } if (E.crop) { endCrop(); return; } if (E.paint) { E.paint = false; renderCtx(); renderStage(); return; } if (!$r('#sxGridV').hidden) { $r('#sxGridV').hidden = true; return; } E.sel = []; afterSel(); return; }
  if (ev.key === 'PageDown') { ev.preventDefault(); goPage(E.pg + 1); return; }
  if (ev.key === 'PageUp') { ev.preventDefault(); goPage(E.pg - 1); return; }
  if (!E.sel.length) {
    if (mod) return;
    const k = K();
    if (key === 't') { ev.preventDefault(); addEls([specToEl({ t: 'text', p: { text: 'Seu texto aqui', size: Math.round(E.doc.w / 30), w: E.doc.w * 0.45 } })]); }
    else if (key === 'r') addEls([specToEl({ t: 'rect', p: { w: 400, h: 300 } })]);
    else if (key === 'c') addEls([specToEl({ t: 'ellipse', p: { w: 320, h: 320 } })]);
    else if (key === 'l') addEls([specToEl({ t: 'line', p: {} })]);
    else if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { ev.preventDefault(); goPage(E.pg + 1); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { ev.preventDefault(); goPage(E.pg - 1); }
    return;
  }
  if (mod && key === 'b') { ev.preventDefault(); act({ dataset: { x: 'bold' } }, ev); return; }
  if (mod && key === 'i') { ev.preventDefault(); act({ dataset: { x: 'tog', k: 'ital' } }, ev); return; }
  if (mod && key === 'u') { ev.preventDefault(); act({ dataset: { x: 'tog', k: 'und' } }, ev); return; }
  if (ev.altKey && ev.shiftKey && key === 'l') { ev.preventDefault(); act({ dataset: { x: 'lock' } }, ev); return; }
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); del(); return; }
  if (ev.key === ']') { order(ev.shiftKey ? 'top' : 'up'); return; }
  if (ev.key === '[') { order(ev.shiftKey ? 'bottom' : 'down'); return; }
  if (ev.key === 'Enter' && E.sel.length === 1) { const e = selEls()[0]; ev.preventDefault(); if (e.type === 'text') startEdit(e.id); else if (e.type === 'image') startCrop(e.id); else if (e.type === 'table') startTedit(e.id); return; }
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
  if (d) {
    ev.preventDefault(); const stp = ev.shiftKey ? 10 : 1;
    if (!E.nudging) snap(); E.nudging = true; clearTimeout(E.nudgeT); E.nudgeT = setTimeout(() => { E.nudging = false; save(); if (E.tab === 'posicao') renderPanel(); }, 400);
    selEls().forEach(e => { if (!e.lock) { e.x += d[0] * stp; e.y += d[1] * stp; const n = nodeOf(e.id); if (n) { n.style.left = e.x + 'px'; n.style.top = e.y + 'px'; } } });
    renderOverlay();
  }
});

/* ---------- Apresentação ---------- */
function present(start, mode) {
  if (E.editing) endEdit();
  const doc = E.doc, list = doc.pages.map((p, i) => ({ p, i })).filter(x => !x.p.hidden);
  if (!list.length) { toast('Todas as páginas estão ocultas.', 'warn'); return; }
  SX.measure(doc);
  let cur = list.findIndex(x => x.i >= start); if (cur < 0) cur = 0;
  const ov = document.createElement('div'); ov.id = 'sxPresent'; ov.className = 'sx-present' + (mode === 'presenter' ? ' presenter' : ''); ov.tabIndex = -1;
  ov.innerHTML = mode === 'presenter'
    ? '<div class="sxp-main"><div class="sxp-stage" id="sxpStage"></div></div><aside class="sxp-side"><div class="sxp-clock"><span><small>Tempo</small><b id="sxpTimer">00:00</b></span><span><small>Agora</small><b id="sxpNow"></b></span><button class="btn btn-sm" data-pz="reset">Zerar</button></div><div class="sxp-nexth">A seguir</div><div class="sxp-next" id="sxpNext"></div><div class="sxp-nexth">Notas</div><div class="sxp-notes" id="sxpNotes"></div></aside>' +
      '<div class="sxp-bar on"><button data-pz="prev" aria-label="Anterior">' + icon('chevL') + '</button><span id="sxpCount"></span><button data-pz="next" aria-label="Próxima">' + icon('chevR') + '</button><span class="sp"></span><button data-pz="exit">Sair (Esc)</button></div>'
    : '<div class="sxp-stage" id="sxpStage"></div><div class="sxp-bar" id="sxpBar"><button data-pz="prev" aria-label="Anterior">' + icon('chevL') + '</button><span id="sxpCount"></span><button data-pz="next" aria-label="Próxima">' + icon('chevR') + '</button><span class="sp"></span><button data-pz="notes">Notas</button><button data-pz="exit">Sair (Esc)</button></div><div class="sxp-fnotes" id="sxpFNotes" hidden></div>';
  document.body.appendChild(ov);
  try { if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {}); } catch (er) {}
  const t0 = Date.now(); let tOff = t0;
  const slide = (pg, play) => '<div class="sxp-slide' + (play && pg.trans !== 'none' ? ' sxt-' + pg.trans : '') + '" style="width:' + doc.w + 'px;height:' + doc.h + 'px;' + SX.bgCSS(pg) + '">' + SX.pageInner(pg, doc, { play }) + '</div>';
  const fit = (box, w, h) => { const r = box.getBoundingClientRect(); return Math.min(r.width / w, r.height / h); };
  function show(play) {
    const S = $('#sxpStage', ov), it = list[cur];
    S.innerHTML = slide(it.p, play);
    const s = fit(S, doc.w, doc.h), sl = S.firstChild; sl.style.position = 'absolute'; sl.style.left = '50%'; sl.style.top = '50%'; sl.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    $('#sxpCount', ov).textContent = (cur + 1) + ' / ' + list.length;
    if (mode === 'presenter') {
      const N = $('#sxpNext', ov), nx = list[cur + 1];
      N.innerHTML = nx ? SX.preview(nx.p, doc, N.clientWidth || 320) : '<div class="sxp-end">Fim da apresentação</div>';
      $('#sxpNotes', ov).textContent = it.p.notes || 'Sem notas nesta página.';
    } else { const fn = $('#sxpFNotes', ov); if (fn) fn.textContent = it.p.notes || 'Sem notas nesta página.'; }
  }
  const go = (d) => { const n = clamp(cur + d, 0, list.length - 1); if (n === cur) { if (d > 0) toast('Última página'); return; } cur = n; show(true); };
  const exit = () => { clearInterval(tick); removeEventListener('keydown', onKey, true); removeEventListener('resize', onRs); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (er) {} ov.remove(); goPage(list[cur].i); };
  const onKey = (ev) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); go(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); go(-1); }
    else if (ev.key === 'Home') { cur = 0; show(true); } else if (ev.key === 'End') { cur = list.length - 1; show(true); }
    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); exit(); }
    else if (ev.key.toLowerCase() === 'n' && mode !== 'presenter') { const fn = $('#sxpFNotes', ov); fn.hidden = !fn.hidden; }
  };
  const onRs = () => show(false);
  addEventListener('keydown', onKey, true); addEventListener('resize', onRs);
  ov.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-pz]');
    if (b) { const a = b.dataset.pz; if (a === 'next') go(1); if (a === 'prev') go(-1); if (a === 'exit') exit(); if (a === 'notes') { const fn = $('#sxpFNotes', ov); fn.hidden = !fn.hidden; } if (a === 'reset') tOff = Date.now(); return; }
    if (ev.target.closest('#sxpStage')) go(1);
  });
  let hideT; ov.addEventListener('pointermove', () => { const bar = $('#sxpBar', ov); if (!bar) return; bar.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => bar.classList.remove('on'), 2200); });
  const tick = setInterval(() => { const T = $('#sxpTimer', ov); if (T) { const s = Math.floor((Date.now() - tOff) / 1000); T.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); } const N = $('#sxpNow', ov); if (N) N.textContent = nowHM(); }, 500);
  requestAnimationFrame(() => show(true)); ov.focus();
}

/* ---------- Remoto ---------- */
W.addEventListener('imagine:remote', (ev) => {
  const d = ev.detail || {};
  if (d.coll !== 'docs' || !E.doc || d.id !== E.doc.id || !live()) return;
  if (Date.now() - E.lastLocal < 5000 || E.editing || E.tedit) return;
  const nd = docs().find(x => x.id === E.doc.id);
  if (nd && nd !== E.doc) { E.doc = SX.migrateDoc(nd); E.pg = Math.min(E.pg, E.doc.pages.length - 1); E.sel = E.sel.filter(id => byId(id)); full(); toast('Design atualizado por outro sócio'); }
});

W.Editor = {
  mount, create: createDoc,
  open(id) { const d = docs().find(x => x.id === id); openDoc(d || null); return !!d; },
  openDoc(id) { if (!id) { openDoc(null); W.UI.des.sub = 'home'; return; } const d = docs().find(x => x.id === id); openDoc(d || null); W.UI.des.sub = d ? 'editor' : 'home'; },
  newFromKit(kitId, fmt, tplId) { const t = tplId ? SX.SOCIAL.find(s => s.id === tplId) || SX.SOCIAL[0] : null; const d = createDoc(t ? t.fmt : (fmt || 'post'), { kit: kitId, tpl: t, nome: (SX.kitOf(kitId).nome) + ' · ' + (t ? t.nome : 'novo design') }); openDoc(d); W.UI.des.sub = 'editor'; },
  get doc() { return E.doc; },
  present: (i, m) => present(i, m),
  addFiles
};
})();
