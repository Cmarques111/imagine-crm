/* Imagine CRM · shell, navegação e componentes comuns */
(function(){
const W = window;
W.ST = null;
W.normalizeST = (st) => {
  ['docs', 'imgLib', 'relatorios', 'leads', 'clientes', 'receber', 'pagar', 'projetos', 'design', 'vitrine', 'eventos', 'tarefas', 'pontos', 'alertas', 'agendaEco'].forEach(k => { if (!Array.isArray(st[k])) st[k] = []; });
  if (!st.mood) st.mood = {};
  if (!st.assets) st.assets = {};
  if (!st.assetUrls) st.assetUrls = {};
  if (!st.cfg) st.cfg = {};
  st.cfg.pts = Object.assign({ r1: 5, map: 10, ativ: 15, conv: 30, design: 10, indic: 5 }, st.cfg.pts || {});
  if (!st.cfg.metaMes) st.cfg.metaMes = 22000;
  if (!st.cfg.metas) st.cfg.metas = {};
  if (st.saldo == null) st.saldo = 0;
  st.receber.forEach(r => { if (!r.modelo) r.modelo = 'Avulso'; });
  return st;
};
W.UI = {
  tab: 'inicio',
  com: { view: 'kanban', list: 'todos', q: '', resp: '' },
  fin: { per: 'mes' },
  mkt: { cat: 'Todas', q: '', calc: 'juros' },
  des: { sub: 'home', kit: 'c7', vcat: 'Todas', tkit: 'ic', grp: 'all', q: '' },
  rel: { sub: 'painel', per: 'mes', obj: 'leads', grp: 'stage', met: 'count', vis: 'bar' },
  drawer: null
};
W.VIEWS = W.VIEWS || {}; W.AFTER = W.AFTER || {}; W.ACT = W.ACT || {}; W.CHANGE = W.CHANGE || {};

W.persist = () => { if (W.Store && W.ST) W.Store.save(W.ST); };
W.setSync = (txt, kind) => { const si = $('#syncInfo'); if (si) si.innerHTML = '<span class="live-dot"' + (kind === 'warn' ? ' style="background:var(--warn);box-shadow:none"' : kind === 'off' ? ' style="background:var(--muted);box-shadow:none"' : '') + '></span>' + esc(txt); };

const TABS = [
  ['inicio', 'Início', 'home'], ['comercial', 'Comercial', 'funnel'], ['carteira', 'Carteira', 'wallet'], ['financeiro', 'Financeiro', 'money'],
  ['mercado', 'Mercado 24h', 'globe'], ['design', 'Design', 'palette'], ['relatorios', 'Relatórios', 'report'], ['agenda', 'Agenda', 'calendar']
];

/* ---------- Componentes ---------- */
W.av = (id) => '<span class="av" title="' + esc(socio(id).nome) + '">' + esc(socio(id).ini) + '</span>';
W.servTag = (s) => s ? '<span class="tag ' + (s === 'Design' ? 't-design' : s === 'Financeiro' ? 't-fin' : 't-both') + '">' + esc(s) + '</span>' : '';
W.stagePill = (s) => '<span class="pill ' + ({ Convertido: 'p-pos', Perdido: 'p-neg', 'Ativação': 'p-sky', Mapeamento: 'p-sky' }[s] || '') + '">' + esc(s) + '</span>';
W.statusPill = (s) => '<span class="pill ' + ({ Pago: 'p-pos', Vencido: 'p-neg', 'Em aberto': 'p-warn', Saudável: 'p-pos', Atenção: 'p-warn', Risco: 'p-neg' }[s] || '') + '">' + esc(s) + '</span>';
W.ph = (ic, eyebrow, title, meta, actions) => '<div class="ph"><div class="ph-l"><div class="ph-ico">' + icon(ic) + '</div><div><div class="eyebrow">' + esc(eyebrow) + '</div><h1>' + esc(title) + '</h1>' + (meta ? '<div class="ph-meta">' + meta + '</div>' : '') + '</div></div><div class="ph-r">' + (actions || '') + '</div></div>';
W.kpi = (label, value, sub, extra, right) => '<div class="card kpi"><div class="kpi-l"><span>' + label + '</span>' + (right || '') + '</div><div class="kpi-v">' + value + '</div>' + (extra || '') + (sub ? '<div class="kpi-s">' + sub + '</div>' : '') + '</div>';
W.cardW = (title, sub, body, opts) => {
  opts = opts || {};
  return '<section class="card"' + (opts.id ? ' id="' + opts.id + '"' : '') + '><div class="card-h"><div><h3>' + title + '</h3>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + (opts.tools || '') + '</div><div class="card-b"' + (opts.flush ? ' style="padding:0"' : '') + '>' + body + '</div>' + (opts.foot ? '<div class="card-f">' + opts.foot + '</div>' : '') + '</section>';
};
W.wTools = (key) => '<div class="w-icons"><button class="ibtn" data-act="wRefresh" aria-label="Atualizar">' + icon('refresh', 'ic-sm') + '</button><button class="ibtn" data-act="wExpand" data-w="' + key + '" aria-label="Expandir">' + icon('expand', 'ic-sm') + '</button></div>';
W.seg = (act, cur, opts) => '<div class="seg" role="group">' + opts.map(([v, l]) => '<button data-act="' + act + '" data-v="' + v + '" class="' + (v === cur ? 'on' : '') + '" aria-pressed="' + (v === cur) + '">' + l + '</button>').join('') + '</div>';
W.nowHM = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* ---------- Gráficos ---------- */
const niceMax = (v) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
W.chartBars = (data, opts) => {
  // data: [{l, a, b, meta}] · barras empilhadas a (base) + b (topo) com marcador de meta
  opts = opts || {};
  const Wd = 640, H = 250, ml = 52, mr = 12, mt = 16, mb = 30, iw = Wd - ml - mr, ih = H - mt - mb;
  const max = niceMax(Math.max(...data.map(d => Math.max((d.a || 0) + (d.b || 0), d.meta || 0))) * 1.05);
  const y = v => mt + ih - v / max * ih, bw = Math.min(54, iw / data.length * 0.56);
  let s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(opts.label || 'Gráfico de barras') + '">';
  for (let i = 0; i <= 4; i++) { const v = max / 4 * i, yy = y(v); s += '<line x1="' + ml + '" x2="' + (Wd - mr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#1E2430" stroke-width="1"/><text x="' + (ml - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(fBRLk(v).replace('R$ ', '')) + '</text>'; }
  data.forEach((d, i) => {
    const cx = ml + iw / data.length * (i + 0.5), x = cx - bw / 2;
    const ya = y(d.a || 0), yb = y((d.a || 0) + (d.b || 0));
    s += '<rect x="' + x + '" y="' + ya + '" width="' + bw + '" height="' + (mt + ih - ya) + '" fill="' + (opts.ca || '#3E6FE0') + '" rx="2"><title>' + esc(d.l + ' · ' + (opts.la || 'A') + ': ' + fBRL(d.a)) + '</title></rect>';
    if (d.b) s += '<rect x="' + x + '" y="' + yb + '" width="' + bw + '" height="' + Math.max(0, ya - yb - 1.5) + '" fill="' + (opts.cb || '#8FB0FF') + '" rx="2"><title>' + esc(d.l + ' · ' + (opts.lb || 'B') + ': ' + fBRL(d.b)) + '</title></rect>';
    if (d.meta) { const ym = y(d.meta); s += '<line x1="' + (x - 6) + '" x2="' + (x + bw + 6) + '" y1="' + ym + '" y2="' + ym + '" stroke="#D9A441" stroke-width="2.5" stroke-linecap="round"/>'; }
    s += '<text x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle"' + (d.cur ? ' style="fill:#F2F4F8;font-weight:600"' : '') + '>' + esc(d.l) + '</text>';
    s += '<text x="' + cx + '" y="' + (Math.min(yb, d.meta ? y(d.meta) : yb) - 7) + '" text-anchor="middle" style="fill:#C6CDD9;font-size:10.5px">' + esc(fBRLk((d.a || 0) + (d.b || 0)).replace('R$ ', '')) + '</text>';
  });
  return '<div class="chart">' + s + '</svg></div>';
};
W.hbars = (rows, fmt) => {
  const max = Math.max(1, ...rows.map(r => r.v));
  return rows.map(r => '<div class="hbar"><span class="l" title="' + esc(r.l) + '">' + esc(r.l) + '</span><span class="t"><i style="width:' + (r.v / max * 100) + '%;' + (r.c ? 'background:' + r.c : '') + '"></i></span><b class="num">' + (fmt ? fmt(r.v) : r.v) + '</b></div>').join('') || '<div class="empty">Sem dados no período.</div>';
};
W.spark = (vals, up) => {
  const w = 84, h = 24, mn = Math.min(...vals), mx = Math.max(...vals), r = mx - mn || 1;
  const pts = vals.map((v, i) => (i / (vals.length - 1) * w).toFixed(1) + ',' + (h - 2 - (v - mn) / r * (h - 4)).toFixed(1)).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="' + (up ? '#37B486' : '#E2615F') + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
};
W.lineChart = (pts, opts) => {
  opts = opts || {};
  const Wd = 640, H = 200, ml = 56, mr = 14, mt = 14, mb = 28, iw = Wd - ml - mr, ih = H - mt - mb;
  const vs = pts.map(p => p.v), mn0 = Math.min(0, ...vs), mx = niceMax(Math.max(...vs) * 1.05), mn = mn0 < 0 ? -niceMax(-mn0) : 0;
  const x = i => ml + i / (pts.length - 1) * iw, y = v => mt + ih - (v - mn) / (mx - mn) * ih;
  let s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(opts.label || 'Gráfico de linha') + '">';
  for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) / 4 * i, yy = y(v); s += '<line x1="' + ml + '" x2="' + (Wd - mr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#1E2430"/><text x="' + (ml - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(fBRLk(v).replace('R$ ', '')) + '</text>'; }
  const line = pts.map((p, i) => x(i).toFixed(1) + ',' + y(p.v).toFixed(1)).join(' ');
  s += '<polygon points="' + x(0) + ',' + y(mn) + ' ' + line + ' ' + x(pts.length - 1) + ',' + y(mn) + '" fill="rgba(143,176,255,.10)"/>';
  s += '<polyline points="' + line + '" fill="none" stroke="#8FB0FF" stroke-width="2.2" stroke-linejoin="round"/>';
  pts.forEach((p, i) => { if (p.lab) s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(p.lab) + '</text>'; });
  const L = pts[pts.length - 1]; s += '<circle cx="' + x(pts.length - 1) + '" cy="' + y(L.v) + '" r="4" fill="#8FB0FF"/>';
  return '<div class="chart">' + s + '</svg></div>';
};

/* ---------- Pontuação ---------- */
W.award = (socioId, k, ref) => {
  W.ST.pontos.unshift({ id: uid('pt'), d: iso(TODAY), socio: socioId, k, ref });
  return W.ST.cfg.pts[k] || 0;
};
W.ptsOf = (p) => W.ST.cfg.pts[p.k] || 0;
W.ranking = (fromIso) => {
  const tot = {}; SOCIOS.forEach(s => tot[s.id] = 0);
  W.ST.pontos.filter(p => !fromIso || p.d >= fromIso).forEach(p => { tot[p.socio] = (tot[p.socio] || 0) + ptsOf(p); });
  return SOCIOS.map(s => ({ s, v: tot[s.id] })).sort((a, b) => b.v - a.v);
};
W.monthStart = () => iso(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
W.rankHTML = (fromIso) => '<div class="rank">' + ranking(fromIso).map((r, i) => '<div class="rk ' + (i === 0 && r.v ? 'first' : '') + '"><span class="pos-n">' + (i + 1) + '</span>' + av(r.s.id) + '<span>' + esc(r.s.nome) + '</span><b>' + r.v + ' pts</b></div>').join('') + '</div>';

/* ---------- Modal, popover, drawer ---------- */
W.openModal = (title, body, foot, wide) => {
  const m = $('#modal');
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"' + (wide ? ' style="width:min(1000px,100%)"' : '') + '><div class="modal-h"><h3>' + esc(title) + '</h3><button class="ibtn" data-act="closeModal" aria-label="Fechar">' + icon('x') + '</button></div><div class="modal-b">' + body + '</div>' + (foot ? '<div class="modal-f">' + foot + '</div>' : '') + '</div>';
  m.hidden = false;
  const f = m.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus(), 30);
};
W.closeModal = () => { $('#modal').hidden = true; $('#modal').innerHTML = ''; };
W.confirmBox = (title, text, okLabel, fn) => {
  W._confirmFn = fn;
  openModal(title, '<p style="margin:0" class="muted">' + esc(text) + '</p>', '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-danger" data-act="confirmOk">' + esc(okLabel) + '</button>');
};
W.openPop = (anchor, title, content) => {
  const p = $('#pop');
  let body = '';
  if (Array.isArray(content)) { W._popFns = content.map(c => c[1]); body = '<div class="pop-b" style="padding:6px">' + content.map((c, i) => '<button class="pop-item" data-act="popItem" data-i="' + i + '">' + c[0] + '</button>').join('') + '</div>'; }
  else body = '<div class="pop-b">' + content + '</div>';
  p.innerHTML = '<div class="pop-h"><span>' + esc(title) + '</span><button class="ibtn" data-act="closePop" aria-label="Fechar">' + icon('x', 'ic-sm') + '</button></div>' + body;
  p.hidden = false;
  const r = anchor.getBoundingClientRect(), pw = p.offsetWidth, phh = p.offsetHeight;
  let left = clamp(r.left + r.width / 2 - pw / 2, 12, innerWidth - pw - 12);
  let top = r.bottom + 8; if (top + phh > innerHeight - 12) top = Math.max(12, r.top - phh - 8);
  p.style.left = left + 'px'; p.style.top = top + 'px';
  W._popAnchor = anchor;
};
W.closePop = () => { $('#pop').hidden = true; W._popAnchor = null; };
W.openDrawer = (d) => { W.UI.drawer = d; renderDrawer(); $('#drawer').hidden = false; $('#scrim').hidden = false; };
W.closeDrawer = () => { W.UI.drawer = null; $('#drawer').hidden = true; $('#scrim').hidden = true; $('#drawer').innerHTML = ''; };
W.renderDrawer = () => {
  const d = W.UI.drawer; if (!d) return;
  const fn = W.DRAWERS && W.DRAWERS[d.type];
  if (fn) { const st = $('#drawer .dr-b'); const sc = st ? st.scrollTop : 0; $('#drawer').innerHTML = fn(d); const nb = $('#drawer .dr-b'); if (nb) nb.scrollTop = sc; }
};

/* ---------- Navegação ---------- */
function renderTabs(){
  $('#tabs').innerHTML = TABS.map(([id, l, ic]) => '<button class="tab ' + (W.UI.tab === id ? 'on' : '') + '" data-act="go" data-v="' + id + '"' + (W.UI.tab === id ? ' aria-current="page"' : '') + '>' + icon(ic, 'ic-sm') + l + (id === 'comercial' ? '<span class="badge">' + W.ST.leads.filter(l => !['Convertido', 'Perdido'].includes(l.stage)).length + '</span>' : '') + '</button>').join('');
}
W.render = () => {
  const fn = W.VIEWS[W.UI.tab] || W.VIEWS.inicio;
  const main = $('#main'); const keep = main.scrollTop;
  main.innerHTML = fn();
  if (W.AFTER[W.UI.tab]) W.AFTER[W.UI.tab]();
  renderTabs();
  main.scrollTop = keep;
};
W.go = (tab) => {
  if (!W.VIEWS[tab]) tab = 'inicio';
  if (W.Studio) W.Studio.toggle(tab === 'design');
  const changed = W.UI.tab !== tab;
  W.UI.tab = tab;
  try { if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab); } catch (e) {}
  render();
  if (changed) $('#main').scrollTop = 0;
};

/* ---------- Busca global ---------- */
function searchRun(q){
  const box = $('#gresults'); q = q.trim().toLowerCase();
  if (q.length < 2) { box.hidden = true; return; }
  const res = [];
  W.ST.leads.forEach(l => { if ((l.nome + ' ' + l.empresa).toLowerCase().includes(q)) res.push(['lead', l.id, l.nome + ' · ' + l.empresa, 'Lead · ' + l.stage]); });
  W.ST.clientes.forEach(c => { if (c.nome.toLowerCase().includes(q)) res.push(['cliente', c.id, c.nome, 'Cliente · ' + c.segmento]); });
  W.ST.design.forEach(d => { if ((d.peca + ' ' + d.cliente).toLowerCase().includes(q)) res.push(['design', d.id, d.peca, 'Design · ' + d.cliente]); });
  (W.ST.docs || []).forEach(d => { if (d.nome.toLowerCase().includes(q)) res.push(['doc', d.id, d.nome, 'Arquivo do editor']); });
  box.innerHTML = res.slice(0, 9).map(r => '<button class="gres" data-act="gopen" data-t="' + r[0] + '" data-id="' + r[1] + '"><span>' + esc(r[2]) + '</span><small>' + esc(r[3]) + '</small></button>').join('') || '<div class="gres" style="cursor:default"><small>Nada encontrado para “' + esc(q) + '”.</small></div>';
  box.hidden = false;
}

/* ---------- Ações globais ---------- */
Object.assign(W.ACT, {
  go: (b) => { closePop(); go(b.dataset.v); },
  closeModal: () => closeModal(),
  closePop: () => closePop(),
  closeDrawer: () => closeDrawer(),
  confirmOk: () => { const f = W._confirmFn; closeModal(); f && f(); },
  popItem: (b) => { const f = W._popFns && W._popFns[+b.dataset.i]; closePop(); f && f(); },
  toggleHP: () => HP.toggle(),
  wRefresh: (b) => { const f = b.closest('.card').querySelector('.card-f span:last-child'); if (f) f.textContent = 'Atualizado às ' + nowHM(); toast('Painel atualizado'); },
  gopen: (b) => {
    $('#gresults').hidden = true; $('#gsearch').value = '';
    const t = b.dataset.t, id = b.dataset.id;
    if (t === 'lead') { go('comercial'); openDrawer({ type: 'lead', id }); }
    if (t === 'cliente') { go('carteira'); openDrawer({ type: 'cliente', id }); }
    if (t === 'design') { W.UI.des.sub = 'projetos'; go('design'); }
    if (t === 'doc') { W.UI.des.sub = 'editor'; Editor.openDoc(id); go('design'); }
  },
  quickNew: (b) => openPop(b, 'Criar', [
    [icon('funnel', 'ic-sm') + ' Novo lead', () => { go('comercial'); ACT.newLead(); }],
    [icon('calendar', 'ic-sm') + ' Novo compromisso', () => { go('agenda'); ACT.newEvent(); }],
    [icon('money', 'ic-sm') + ' Novo lançamento financeiro', () => { go('financeiro'); ACT.newLanc(); }],
    [icon('palette', 'ic-sm') + ' Novo design', () => { W.UI.des.sub = 'editor'; Editor.openDoc(null); go('design'); }]
  ]),
  openAlerts: (b) => {
    const today = iso(TODAY);
    const venc = W.ST.receber.filter(r => W.stat(r) === 'Vencido');
    const tasks = W.ST.tarefas.filter(t => !t.ok && t.d <= today);
    const stale = W.ST.leads.filter(l => !['Convertido', 'Perdido'].includes(l.stage) && daysSince(l.desde) > 7);
    openPop(b, 'Alertas', [
      ...venc.map(r => [icon('alert', 'ic-sm') + ' <span>Recebível vencido · ' + esc(r.quem) + ' · ' + fBRL(r.valor) + '</span>', () => go('financeiro')]),
      ...stale.map(l => [icon('clock', 'ic-sm') + ' <span>' + esc(l.nome) + ' parado há ' + daysSince(l.desde) + ' dias em ' + esc(l.stage) + '</span>', () => { go('comercial'); openDrawer({ type: 'lead', id: l.id }); }]),
      ...tasks.map(t => [icon('check', 'ic-sm') + ' <span>Tarefa para hoje · ' + esc(t.t) + '</span>', () => go('inicio')])
    ]);
  },
  userMenu: (b) => { const u = W.Store.auth.current() || {}; openPop(b, 'Sua conta', [
    [icon('user', 'ic-sm') + ' <span>' + esc(socio(W.ME).nome) + '<br><small class="muted">' + esc(u.email || '') + '</small></span>', () => go('config')],
    [icon('settings', 'ic-sm') + ' Configurações', () => go('config')]
  ].concat(W.Store.mode === 'local' ? [[icon('refresh', 'ic-sm') + ' Restaurar dados de exemplo', () => confirmBox('Restaurar dados de exemplo?', 'Tudo o que foi alterado neste navegador será substituído pelos dados de demonstração.', 'Restaurar', () => { W.Store.reset().then(() => location.reload()); })]] : []).concat([
    [icon('logout', 'ic-sm') + ' Sair', () => W.Store.auth.signOut().then(() => location.reload())]
  ])); },
  openNotes: (b) => {
    openPop(b, 'Notas rápidas', '<textarea id="quickNote" class="inp" style="height:180px;padding:10px" placeholder="Anote algo para não esquecer…">' + esc(W.ST.nota || '') + '</textarea><span class="muted" style="font-size:12px">Salva automaticamente.</span>');
    const t = $('#quickNote'); t.focus(); t.oninput = () => { W.ST.nota = t.value; persist(); };
  },
  openLinks: (b) => openPop(b, 'Links úteis', LINKS.map(l => '<a class="pop-item" href="' + l.u + '" target="_blank" rel="noopener">' + esc(l.t) + icon('arrowR', 'ic-sm') + '</a>').join('')),
  openWhats: (b) => openPop(b, 'WhatsApp', '<p style="margin:0">A integração com o WhatsApp entra numa próxima fase. Ela vai registrar as conversas na ficha de cada lead e cliente.</p><p class="muted" style="margin:0;font-size:12.5px">Por enquanto, use as notas da ficha para registrar os contatos.</p>')
});

/* ---------- Eventos delegados ---------- */
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-act]');
  const ab = ev.target.closest('[data-act],[data-x]');
  if (!$('#pop').hidden && !ev.target.closest('#pop') && (!ab || ab !== W._popAnchor)) closePop();
  if (!ev.target.closest('.search')) $('#gresults').hidden = true;
  if (!b || b.disabled) return;
  const fn = W.ACT[b.dataset.act];
  if (fn) { ev.preventDefault(); fn(b, ev); }
});
['change', 'input'].forEach(type => document.addEventListener(type, (ev) => {
  const t = ev.target.closest('[data-chg]'); if (!t) return;
  const fn = W.CHANGE[t.dataset.chg]; if (fn) fn(t, ev);
}));
$('#scrim').addEventListener('click', () => closeDrawer());
$('#modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!$('#modal').hidden) closeModal(); else if (!$('#pop').hidden) closePop(); else if (W.UI.drawer) closeDrawer();
});
$('#gsearch').addEventListener('input', (ev) => searchRun(ev.target.value));
$('#gsearch').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { const f = $('#gresults .gres[data-act]'); if (f) f.click(); } });
addEventListener('hashchange', () => { const t = location.hash.slice(1); if (t && t !== W.UI.tab && W.VIEWS[t]) go(t); });
$('#modal').addEventListener('submit', (ev) => { ev.preventDefault(); const f = ev.target.closest('form'); const a = f && f.dataset.submit; if (a && W.ACT[a]) W.ACT[a](f, ev); });

/* ---------- Início da aplicação ---------- */
let started = false;
function startApp(){
  if (started) return; started = true;
  $('#login').hidden = true; $('#app').hidden = false;
  $('#brand').innerHTML = markSVG(34, '#F2F4F8', '#8FB0FF', 'Imagine Concept') + '<span class="brand-word"><b>IMAGINE</b><i>CONCEPT</i></span>';
  $('#meAv').textContent = socio(W.ME).ini || 'IC';
  const t = location.hash.slice(1);
  go(W.VIEWS[t] ? t : 'inicio');
  if (W.startMarket) W.startMarket();
  const alerts = W.ST.receber.some(r => W.stat(r) === 'Vencido') || W.ST.leads.some(l => !['Convertido', 'Perdido'].includes(l.stage) && daysSince(l.desde) > 7);
  $('#alertDot').classList.toggle('on', alerts);
}
let rT;
W.addEventListener('imagine:remote', (ev) => {
  if (!started || W.UI.tab === 'design') return;
  clearTimeout(rT);
  rT = setTimeout(() => {
    const a = document.activeElement;
    if (a && a.matches && a.matches('input,textarea,select,[contenteditable="true"]') && !a.closest('#studio')) return;
    if (!$('#modal').hidden) return;
    render(); if (W.UI.drawer) renderDrawer();
  }, 400);
});
function loginMsg(t, kind) { const m = $('#lgMsg'); m.textContent = t || ''; m.className = 'lg-msg' + (kind ? ' ' + kind : ''); }
function setMode(mode) {
  const f = $('#loginForm'); f.dataset.mode = mode;
  $('#lgTitle').textContent = mode === 'signup' ? 'Primeiro acesso' : mode === 'reset' ? 'Recuperar senha' : 'Acesso interno';
  $('#lgSub').textContent = mode === 'signup' ? 'Use o e-mail em que você foi convidado e crie sua senha.' : mode === 'reset' ? 'Enviaremos um link para criar uma nova senha.' : 'Entre com seu e-mail e senha de sócio.';
  $('#lgNameF').hidden = mode !== 'signup'; $('#lgPassF').hidden = mode === 'reset';
  $('#lgGo').textContent = mode === 'signup' ? 'Criar acesso' : mode === 'reset' ? 'Enviar link' : 'Entrar';
  $('#lgLinks').innerHTML = mode === 'login' ? '<button type="button" class="lg-link" data-lg="signup">Primeiro acesso</button><button type="button" class="lg-link" data-lg="reset">Esqueci minha senha</button>' : '<button type="button" class="lg-link" data-lg="login">Voltar para o login</button>';
  loginMsg('');
}
async function enter() {
  W.setSync && W.setSync('Carregando dados…', 'off');
  try {
    const st = await W.Store.load();
    W.ST = W.normalizeST(st);
    W.SOCIOS = W.Store.members();
    W.ME = W.Store.meId();
    startApp();
  } catch (er) { console.error(er); loginMsg(er.message || 'Não foi possível carregar os dados.', 'err'); $('#login').hidden = false; }
}
W.App = {
  init() {
    $('#loginBrand').innerHTML = '<div style="display:flex;align-items:center;gap:16px">' + markSVG(72, '#FFFFFF', '#8FB0FF', 'Imagine Concept') +
      '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-family:var(--f-display);font-stretch:112%;font-weight:700;font-size:30px;letter-spacing:.05em;line-height:1">IMAGINE</span><span style="font-family:var(--f-display);font-stretch:112%;font-weight:500;font-size:10px;letter-spacing:.6em;color:var(--sky)">CONCEPT</span></div></div>' +
      '<div class="lb-tag">Ideias, números e design no mesmo lugar.</div><div class="lb-foot">CRM interno · uso exclusivo dos sócios</div>';
    const demo = W.Store.mode === 'local';
    $('#lgHint').textContent = demo ? 'Modo demonstração: qualquer e-mail e senha entram. Os dados ficam só neste navegador.' : 'Acesso restrito aos sócios convidados. Conexão protegida.';
    if (demo) { $('#lgUser').value = 'socio@imagineconcept.com.br'; $('#lgPass').value = 'demonstracao'; }
    setMode('login');
    $('#lgLinks').addEventListener('click', (ev) => { const b = ev.target.closest('[data-lg]'); if (b) setMode(b.dataset.lg); });
    $('#loginForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const mode = ev.currentTarget.dataset.mode, email = $('#lgUser').value.trim().toLowerCase(), pass = $('#lgPass').value, nome = $('#lgName').value.trim();
      if (!email) return loginMsg('Informe seu e-mail.', 'err');
      const btn = $('#lgGo'); btn.disabled = true;
      try {
        if (mode === 'reset') { await W.Store.auth.reset(email); loginMsg('Pronto. Verifique sua caixa de entrada.', 'ok'); }
        else if (mode === 'signup') { if (pass.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.'); if (!nome) throw new Error('Informe seu nome.'); const r = await W.Store.auth.signUp(email, pass, nome); if (r && r.msg) { setMode('login'); $('#lgUser').value = email; loginMsg(r.msg, 'ok'); } }
        else { if (!pass) throw new Error('Informe sua senha.'); await W.Store.auth.signIn(email, pass); }
      } catch (er) { loginMsg(W.Store.auth.message ? W.Store.auth.message(er) : er.message, 'err'); }
      btn.disabled = false;
    });
    W.Store.auth.onChange((u) => { if (u && !started) enter(); if (!u) { $('#login').hidden = false; $('#app').hidden = true; } });
  }
};
})();
