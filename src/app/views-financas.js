/* Atlas · CRM da Imagine · Financeiro, Mercado 24h e calculadoras */
(function(){
const W = window;
W.VIEWS = W.VIEWS || {}; W.AFTER = W.AFTER || {}; W.ACT = W.ACT || {}; W.CHANGE = W.CHANGE || {};
const V = W.VIEWS, A = W.ACT, C = W.CHANGE;

/* ---------- Financeiro ---------- */
W.stat = (r) => r.status === 'Pago' ? 'Pago' : (r.venc && r.venc < iso(TODAY) ? 'Vencido' : 'Em aberto');
const ymOf = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
W.metaOf = (ym) => (W.ST.cfg.metas || {})[ym] || W.ST.cfg.metaMes;
W.calcMeses = (n) => {
  n = n || 6; const out = [], S = W.ST;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1), ym = ymOf(d);
    const inM = (r) => r.status === 'Pago' && String(r.pagoEm || r.venc || '').slice(0, 7) === ym;
    const sum = (l) => l.reduce((s, r) => s + (+r.valor || 0), 0);
    const recL = S.receber.filter(inM);
    out.push({ m: d.getMonth(), y: d.getFullYear(), ym, rec: sum(recL.filter(r => r.modelo === 'Recorrente')), avl: sum(recL.filter(r => r.modelo !== 'Recorrente')), desp: sum(S.pagar.filter(inM)), meta: W.metaOf(ym), clientes: new Set(recL.map(r => r.quem)).size });
  }
  return out;
};
function period() {
  const n = { mes: 1, tri: 3, sem: 6 }[W.UI.fin.per], all = W.calcMeses(6), sl = all.slice(-n);
  const sum = (k) => sl.reduce((s, m) => s + m[k], 0);
  return { all, sl, rec: sum('rec'), avl: sum('avl'), desp: sum('desp'), n };
}
V.financeiro = () => {
  const S = W.ST, p = period(), fat = p.rec + p.avl, res = fat - p.desp, mg = fat ? res / fat * 100 : 0;
  const cur = p.all[p.all.length - 1], fatM = cur.rec + cur.avl, meta = cur.meta;
  const last = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0), restam = Math.max(0, Math.round((last - TODAY) / 864e5));
  const perL = { mes: 'no mês', tri: 'nos últimos 3 meses', sem: 'nos últimos 6 meses' }[W.UI.fin.per];
  const lim = dOff(30);
  const ins = S.receber.filter(r => r.status !== 'Pago' && r.venc <= lim), outs = S.pagar.filter(r => r.status !== 'Pago' && r.venc <= lim);
  const pts = []; let bal = +S.saldo || 0;
  for (let i = 0; i <= 30; i++) {
    const d = dOff(i);
    ins.forEach(r => { if ((i === 0 && r.venc <= d) || (i > 0 && r.venc === d)) bal += r.valor; });
    outs.forEach(r => { if ((i === 0 && r.venc <= d) || (i > 0 && r.venc === d)) bal -= r.valor; });
    pts.push({ v: bal, lab: i % 5 === 0 ? fDateS(d) : '' });
  }
  const proj = S.projetos.map(x => { const custo = (+x.horas || 0) * (+x.custoHora || 0) + (+x.terceiros || 0); return Object.assign({}, x, { custo, mp: x.receita ? (x.receita - custo) / x.receita * 100 : 0 }); }).sort((a, b) => b.mp - a.mp);
  const show = (list) => list.filter(r => r.status !== 'Pago' || (r.pagoEm || r.venc) >= dOff(-30));
  const tblRows = (list, kind) => show(list).sort((a, b) => a.venc > b.venc ? 1 : -1).map(r => { const st = W.stat(r); return '<tr><td><b>' + esc(r.quem) + '</b><br><small class="muted">' + esc(r.desc || r.cat || '') + (kind === 'receber' ? ' · ' + esc(r.modelo || 'Avulso') : '') + '</small></td><td>' + fDate(r.venc) + '</td><td class="r">' + fBRL(r.valor) + '</td><td>' + statusPill(st) + '</td><td class="r"><span class="row" style="gap:2px;justify-content:flex-end;flex-wrap:nowrap">' + (st !== 'Pago' ? '<button class="btn btn-sm" data-act="payIt" data-k="' + kind + '" data-id="' + r.id + '">' + (kind === 'receber' ? 'Recebido' : 'Pago') + '</button>' : '') + '<button class="ibtn" data-act="delLanc" data-k="' + kind + '" data-id="' + r.id + '" aria-label="Excluir lançamento">' + icon('trash', 'ic-sm') + '</button></span></td></tr>'; }).join('') || '<tr><td colspan="5"><div class="empty">Nada pendente.</div></td></tr>';
  return ph('money', 'Financeiro', 'Números da Imagine', 'Período: ' + perL + ' · calculado a partir dos lançamentos pagos', seg('finPer', W.UI.fin.per, [['mes', 'Mês atual'], ['tri', 'Trimestre'], ['sem', '6 meses']]) + '<button class="btn btn-primary" data-act="newLanc">' + icon('plus', 'ic-sm') + 'Lançamento</button>') +
    '<div class="cols c4" style="margin-bottom:16px">' +
      kpi('Faturamento', fBRL(fat), 'Recorrente ' + fBRL(p.rec) + ' · Avulso ' + fBRL(p.avl)) +
      kpi('Despesas', fBRL(p.desp), fat ? Math.round(p.desp / fat * 100) + '% do faturamento' : 'Sem faturamento no período') +
      kpi('Resultado', '<span class="' + (res >= 0 ? 'pos' : 'neg') + '">' + fBRL(res) + '</span>', 'Margem de ' + fNum(mg, 1) + '%') +
      kpi('Ticket médio', fBRL(cur.clientes ? fatM / cur.clientes : 0), 'Mês atual · ' + cur.clientes + ' cliente' + (cur.clientes === 1 ? '' : 's') + ' faturado' + (cur.clientes === 1 ? '' : 's')) +
    '</div>' +
    '<div class="cols c-main" style="margin-bottom:16px">' +
      cardW('Faturamento mensal', 'Recorrente e avulso · traço amarelo é a meta', chartBars(p.all.map((m, i) => ({ l: MESES[m.m], a: m.rec, b: m.avl, meta: m.meta, cur: i === p.all.length - 1 })), { la: 'Recorrente', lb: 'Avulso', label: 'Faturamento mensal, recorrente e avulso, com meta' }) +
        '<div class="legend" style="margin-top:8px"><span><i style="background:#3E6FE0"></i>Recorrente (contratos mensais)</span><span><i style="background:#8FB0FF"></i>Projetos avulsos</span><span><i style="background:#D9A441;height:3px;vertical-align:3px"></i>Meta</span></div>') +
      '<div class="stack">' +
        cardW('Meta do mês', MESES_L[cur.m] + ' · faltam ' + restam + ' dias', '<div class="kpi-v num">' + fBRL(fatM) + ' <span class="muted" style="font-size:15px;font-weight:500">de ' + fBRL(meta) + '</span></div><div class="bar ' + (fatM >= meta ? 'pos' : '') + '" style="margin:12px 0 10px;height:8px"><i style="width:' + Math.min(100, fatM / meta * 100) + '%"></i></div>' +
          '<div class="kpi-s">' + (fatM >= meta ? '<span class="pos">Meta batida.</span>' : 'Faltam <b>' + fBRL(meta - fatM) + '</b> · cerca de ' + fBRL((meta - fatM) / Math.max(1, restam)) + ' por dia') + '</div>' +
          '<label class="fld" style="margin-top:12px"><span>Meta de ' + MESES_L[cur.m] + ' (R$)</span><input data-chg="meta" inputmode="decimal" value="' + fNum(meta, 2) + '"></label>') +
        cardW('Recorrente × avulso', 'Participação ' + perL, fat ? '<div class="hbar"><span class="l">Recorrente</span><span class="t"><i style="width:' + (p.rec / fat * 100) + '%"></i></span><b class="num">' + Math.round(p.rec / fat * 100) + '%</b></div><div class="hbar"><span class="l">Avulso</span><span class="t"><i style="width:' + (p.avl / fat * 100) + '%;background:#8FB0FF"></i></span><b class="num">' + Math.round(p.avl / fat * 100) + '%</b></div><p class="muted" style="margin:10px 0 0;font-size:12.5px">Quanto maior a parte recorrente, mais previsível o caixa.</p>' : '<div class="empty">Sem recebimentos no período.</div>') +
      '</div>' +
    '</div>' +
    '<div class="cols c2" style="margin-bottom:16px">' +
      cardW('Fluxo de caixa · próximos 30 dias', 'Saldo hoje ' + fBRL(S.saldo) + ' · projeção com contas em aberto', lineChart(pts, { label: 'Projeção de saldo para 30 dias' }) +
        '<div class="row" style="margin-top:10px;justify-content:space-between"><span class="muted">Entradas previstas <b class="pos">' + fBRL(ins.reduce((s, r) => s + r.valor, 0)) + '</b></span><span class="muted">Saídas previstas <b class="neg">' + fBRL(outs.reduce((s, r) => s + r.valor, 0)) + '</b></span><span class="muted">Saldo em 30 dias <b>' + fBRL(pts[pts.length - 1].v) + '</b></span></div>' +
        '<label class="fld" style="margin-top:12px;max-width:240px"><span>Saldo em conta hoje (R$)</span><input data-chg="saldo" inputmode="decimal" value="' + fNum(S.saldo, 2) + '"></label>') +
      cardW('Margem por projeto', 'Receita menos horas e terceiros', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Projeto</th><th class="r">Receita</th><th class="r">Custo</th><th class="r">Margem</th><th style="width:110px"></th><th></th></tr></thead><tbody>' +
        (proj.map(x => '<tr><td><b>' + esc(x.proj) + '</b><br><small class="muted">' + esc(x.cliente) + ' · ' + x.horas + 'h × ' + fBRL(x.custoHora) + '</small></td><td class="r">' + fBRL(x.receita) + '</td><td class="r">' + fBRL(x.custo) + '</td><td class="r ' + (x.mp >= 40 ? 'pos' : x.mp < 20 ? 'neg' : 'warn') + '">' + fNum(x.mp, 0) + '%</td><td><div class="bar' + (x.mp >= 40 ? ' pos' : '') + '"><i style="width:' + clamp(x.mp, 0, 100) + '%"></i></div></td><td class="r"><button class="ibtn" data-act="editProjFin" data-id="' + x.id + '" aria-label="Editar projeto">' + icon('pen', 'ic-sm') + '</button></td></tr>').join('') || '<tr><td colspan="6"><div class="empty">Cadastre projetos para acompanhar a margem.</div></td></tr>') + '</tbody></table></div>', { flush: true, tools: '<button class="btn btn-sm" data-act="editProjFin">' + icon('plus', 'ic-sm') + 'Projeto</button>' }) +
    '</div>' +
    '<div class="cols c2">' +
      cardW('Contas a receber', fBRL(S.receber.filter(r => r.status !== 'Pago').reduce((s, r) => s + r.valor, 0)) + ' em aberto · pagos dos últimos 30 dias também aparecem', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Vencimento</th><th class="r">Valor</th><th>Status</th><th></th></tr></thead><tbody>' + tblRows(S.receber, 'receber') + '</tbody></table></div>', { flush: true }) +
      cardW('Contas a pagar', fBRL(S.pagar.filter(r => r.status !== 'Pago').reduce((s, r) => s + r.valor, 0)) + ' em aberto', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fornecedor</th><th>Vencimento</th><th class="r">Valor</th><th>Status</th><th></th></tr></thead><tbody>' + tblRows(S.pagar, 'pagar') + '</tbody></table></div>', { flush: true }) +
    '</div>';
};
A.finPer = (b) => { W.UI.fin.per = b.dataset.v; render(); };
C.meta = (t, ev) => { if (ev.type !== 'change') return; const v = pNum(t.value); if (v > 0) { W.ST.cfg.metas = W.ST.cfg.metas || {}; W.ST.cfg.metas[ymOf(TODAY)] = v; W.ST.cfg.metaMes = v; persist(); render(); toast('Meta atualizada'); } };
C.saldo = (t, ev) => { if (ev.type !== 'change') return; W.ST.saldo = pNum(t.value); persist(); render(); };
A.payIt = (b) => {
  const list = b.dataset.k === 'receber' ? W.ST.receber : W.ST.pagar, r = list.find(x => x.id === b.dataset.id);
  r.status = 'Pago'; r.pagoEm = iso(TODAY);
  if (b.dataset.k === 'receber') W.ST.saldo += r.valor; else W.ST.saldo -= r.valor;
  persist(); render(); toast((b.dataset.k === 'receber' ? 'Recebimento' : 'Pagamento') + ' registrado · ' + fBRL(r.valor));
};
A.delLanc = (b) => confirmBox('Excluir lançamento?', 'O lançamento sai do financeiro de todos os sócios.', 'Excluir', () => { const k = b.dataset.k; W.ST[k] = W.ST[k].filter(r => r.id !== b.dataset.id); persist(); render(); toast('Lançamento excluído'); });
A.newLanc = () => {
  openModal('Novo lançamento', '<form id="lancForm" data-submit="saveLanc" class="stack" style="gap:12px"><div class="seg" role="group" style="align-self:flex-start"><label style="display:flex;gap:6px;padding:4px 10px;cursor:pointer"><input type="radio" name="tipo" value="receber" checked> A receber</label><label style="display:flex;gap:6px;padding:4px 10px;cursor:pointer"><input type="radio" name="tipo" value="pagar"> A pagar</label></div><div class="grid-f">' +
    '<label class="fld req"><span>Cliente ou fornecedor</span><input name="quem" list="lancQuem" required></label><datalist id="lancQuem">' + W.ST.clientes.map(c => '<option value="' + esc(c.nome) + '">').join('') + '</datalist>' +
    '<label class="fld"><span>Descrição ou categoria</span><input name="desc" list="lancCat" placeholder="Ex.: Mensalidade, Software"></label><datalist id="lancCat">' + ['Mensalidade', 'Projeto', 'Software', 'Estrutura', 'Marketing', 'Serviços', 'Terceiros', 'Impostos'].map(c => '<option value="' + c + '">').join('') + '</datalist>' +
    '<label class="fld req"><span>Valor (R$)</span><input name="valor" inputmode="decimal" required></label>' +
    '<label class="fld req"><span>Vencimento</span><input name="venc" type="date" value="' + iso(TODAY) + '" required></label>' +
    '<label class="fld"><span>Tipo de receita</span><select name="modelo"><option>Recorrente</option><option selected>Avulso</option></select></label>' +
    '<label class="fld"><span>Repetir</span><select name="rep"><option value="1">Não repetir</option><option value="3">Por 3 meses</option><option value="6">Por 6 meses</option><option value="12">Por 12 meses</option></select></label>' +
    '<label class="chk" style="grid-column:1/-1"><input type="checkbox" name="pago"> Já foi pago</label>' +
    '</div><button type="submit" hidden></button></form>', '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveLancBtn">Salvar</button>');
};
A.saveLancBtn = () => A.saveLanc($('#lancForm'));
A.saveLanc = (f) => {
  const g = n => f.elements[n].value.trim(), tipo = f.querySelector('input[name=tipo]:checked').value, v = pNum(g('valor')), rep = +g('rep') || 1, pago = f.elements.pago.checked;
  if (!g('quem') || !(v > 0)) { toast('Informe nome e valor.', 'warn'); return; }
  const [y, m, d] = g('venc').split('-').map(Number);
  for (let i = 0; i < rep; i++) {
    const vd = iso(new Date(y, m - 1 + i, d)), isPaid = pago && i === 0;
    const r = { id: uid(tipo[0]), quem: g('quem'), venc: vd, valor: v, status: isPaid ? 'Pago' : 'Em aberto', pagoEm: isPaid ? vd : null, _c: Date.now() + i };
    if (tipo === 'receber') { r.desc = g('desc') || 'Lançamento'; r.modelo = g('modelo'); W.ST.receber.push(r); } else { r.cat = g('desc') || 'Outros'; W.ST.pagar.push(r); }
  }
  persist(); closeModal(); render(); toast(rep > 1 ? rep + ' lançamentos criados' : 'Lançamento salvo');
};
A.editProjFin = (b) => {
  const x = b.dataset.id ? W.ST.projetos.find(p => p.id === b.dataset.id) : { proj: '', cliente: '', receita: '', horas: '', custoHora: 60, terceiros: 0 };
  openModal(b.dataset.id ? 'Editar projeto' : 'Novo projeto', '<form id="pfForm" class="grid-f"><label class="fld req" style="grid-column:1/-1"><span>Projeto</span><input name="proj" value="' + esc(x.proj) + '"></label><label class="fld"><span>Cliente</span><input name="cliente" list="lancQuem2" value="' + esc(x.cliente) + '"></label><datalist id="lancQuem2">' + W.ST.clientes.map(c => '<option value="' + esc(c.nome) + '">').join('') + '</datalist>' +
    '<label class="fld"><span>Receita (R$)</span><input name="receita" inputmode="decimal" value="' + (x.receita ? fNum(x.receita, 2) : '') + '"></label><label class="fld"><span>Horas trabalhadas</span><input name="horas" inputmode="decimal" value="' + esc(x.horas) + '"></label><label class="fld"><span>Custo por hora (R$)</span><input name="custoHora" inputmode="decimal" value="' + fNum(x.custoHora || 0, 2) + '"></label><label class="fld"><span>Terceiros (R$)</span><input name="terceiros" inputmode="decimal" value="' + fNum(x.terceiros || 0, 2) + '"></label></form>',
    (b.dataset.id ? '<button class="btn btn-danger" data-act="delProjFin" data-id="' + x.id + '">Excluir</button>' : '') + '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveProjFin" data-id="' + (x.id || '') + '">Salvar</button>');
};
A.saveProjFin = (b) => {
  const f = $('#pfForm'), g = n => f.elements[n].value.trim(); if (!g('proj')) { toast('Informe o projeto.', 'warn'); return; }
  const vals = { proj: g('proj'), cliente: g('cliente'), receita: pNum(g('receita')), horas: pNum(g('horas')), custoHora: pNum(g('custoHora')), terceiros: pNum(g('terceiros')) };
  if (b.dataset.id) Object.assign(W.ST.projetos.find(p => p.id === b.dataset.id), vals); else W.ST.projetos.unshift(Object.assign({ id: uid('pf') }, vals));
  persist(); closeModal(); render(); toast('Projeto salvo');
};
A.delProjFin = (b) => { W.ST.projetos = W.ST.projetos.filter(p => p.id !== b.dataset.id); persist(); closeModal(); render(); };

/* ---------- Mercado 24h ---------- */
const GROUPS = ['br', 'intl', 'fx', 'cmd', 'juros', 'acoes'];
const HIST = {};
GROUPS.forEach(g => MKT[g].forEach(t => { const a = [t.v]; for (let i = 0; i < 29; i++) a.unshift(a[0] * (1 - (Math.random() - 0.5) * 0.006)); HIST[t.s] = a; }));
const live = () => !!(W.MKT_LIVE && W.MKT_LIVE.groups);
const G = (g) => (live() ? W.MKT_LIVE.groups[g] : MKT[g]) || [];
const sparkOf = (t) => (t.spark && t.spark.length > 1) ? t.spark : HIST[t.s];
W.mktFind = (s) => { for (const g of GROUPS) { const t = G(g).find(x => x.s === s); if (t) return t; } return null; };
W.mktVal = (t) => !t || t.v == null ? '—' : t.u === '%' ? fNum(t.v, 2) + '%' : (t.u === 'R$' ? 'R$ ' : t.u === 'US$' ? 'US$ ' : '') + fNum(t.v, t.d);
const chg = (t) => t.c == null ? '—' : t.abs ? (t.c >= 0 ? '+' : '') + fNum(t.c, 2) + ' p.p.' : fPct(t.c);
const newsList = () => live() || W.NEWS_LIVE ? (W.NEWS_LIVE || []) : NEWS;
const CAT_C = { 'Bolsa BR': '#4C8DFF', 'Juros e inflação': '#F0B442', 'Câmbio': '#2FD0B8', 'Internacional': '#9B87FF', 'Commodities': '#F08A47', 'Empresas': '#5CC8FF', 'Agro': '#62C46A' };
W.catTag = (c) => '<span class="ncat" style="--c:' + (CAT_C[c] || '#8FB0FF') + '">' + esc(c) + '</span>';
const newsTime = (n) => n.ts ? new Date(n.ts) : new Date(Date.now() - ((n.h || 0) * 60 + (n.mi || 0)) * 60000);
const ago = (d) => { const m = Math.max(0, Math.round((Date.now() - d) / 60000)); return m < 60 ? 'há ' + m + ' min' : m < 1440 ? 'há ' + Math.round(m / 60) + ' h' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };
const arrow = (up) => up ? '▲' : '▼';
W.newsItem = (n, short) => {
  const t = n.ts ? new Date(n.ts) : new Date(Date.now() - (n.h * 60 + n.mi) * 60000);
  const sameDay = iso(t) === iso(new Date());
  const af = W.ST.clientes.filter(c => (n.seg || []).includes(c.segmento));
  return '<article class="nw ' + (n.hot ? 'hot' : '') + '"><time>' + (sameDay ? '' : t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + '<br>') + t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '</time><div><h4>' + (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener" style="color:inherit">' + esc(n.t) + '</a>' : esc(n.t)) + '</h4>' + (short || !n.r ? '' : '<p>' + esc(n.r) + '</p>') +
    '<div class="row">' + (n.hot ? '<span class="nhot">Destaque</span>' : '') + catTag(n.cat) + (n.src ? '<span class="tag" style="background:none;border:1px solid var(--line-2)">' + esc(n.src) + '</span>' : '<span class="tag" style="background:none;border:1px solid var(--line-2)">Exemplo</span>') + af.map(c => '<span class="tag t-both" title="Pode afetar este cliente">Afeta: ' + esc(c.nome) + '</span>').join('') + '</div></div></article>';
};
function tkRow(t) {
  const up = (t.c || 0) >= 0, sp = sparkOf(t);
  return '<tr data-tk="' + esc(t.s) + '"><td><b>' + esc(t.s) + '</b>' + (t.nota ? '<br><small class="muted">' + esc(t.nota) + '</small>' : '') + '</td><td class="r mono"><b class="tv">' + mktVal(t) + '</b></td><td class="r"><span class="chip ' + (!t.c ? '' : up ? 'up' : 'down') + '">' + (t.c == null || !t.c ? '' : arrow(up) + ' ') + chg(t) + '</span></td><td style="width:96px">' + (sp ? spark(sp, up) : '') + '</td></tr>';
}
function pulse() {
  const all = ['br', 'intl', 'fx', 'cmd', 'acoes'].flatMap(G).filter(t => t.c != null && !t.abs);
  if (!all.length) return '';
  const up = all.filter(t => t.c > 0).length, dn = all.filter(t => t.c < 0).length, srt = all.slice().sort((a, b) => b.c - a.c);
  const best = srt[0], worst = srt[srt.length - 1], pct = Math.round(up / Math.max(1, up + dn) * 100);
  const box = (lbl, t, cls) => '<div class="pl-b ' + cls + '"><small>' + lbl + '</small><b>' + esc(t.s) + '</b><span class="chip ' + (t.c >= 0 ? 'up' : 'down') + '">' + arrow(t.c >= 0) + ' ' + fPct(t.c) + '</span></div>';
  return '<section class="pulse"><div class="pl-h"><small>Pulso do mercado</small><b>' + (pct >= 60 ? 'Dia positivo' : pct <= 40 ? 'Dia negativo' : 'Mercado dividido') + '</b><div class="pl-bar" title="' + up + ' em alta, ' + dn + ' em queda"><i style="width:' + pct + '%"></i></div><span><em class="pos">' + up + ' em alta</em> · <em class="neg">' + dn + ' em queda</em></span></div>' +
    box('Maior alta', best, 'up') + box('Maior queda', worst, 'down') + '</section>';
}
function featured(news) {
  const pick = news.filter(n => n.hot).concat(news.filter(n => !n.hot)).slice(0, 3);
  if (!pick.length) return '';
  return '<section class="feat"><div class="feat-h"><h2>Radar de notícias</h2><span class="muted">O que está movendo o mercado agora</span></div><div class="feat-g">' + pick.map((n, i) => {
    const t = newsTime(n), h = '<h3>' + (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(n.t) + '</a>' : esc(n.t)) + '</h3>';
    return '<article class="fn ' + (i === 0 ? 'lead' : '') + '" style="--c:' + (CAT_C[n.cat] || '#8FB0FF') + '"><div class="row">' + (n.hot ? '<span class="nhot">Destaque</span>' : '') + catTag(n.cat) + '<time>' + ago(t) + '</time></div>' + h + (n.r ? '<p>' + esc(n.r) + '</p>' : '') + '<small class="muted">' + esc(n.src || 'Exemplo') + '</small></article>';
  }).join('') + '</div></section>';
}
V.mercado = () => {
  const U = W.UI.mkt, cats = NEWS_CATS, L = live();
  const news = newsList().filter(n => (U.cat === 'Todas' || n.cat === U.cat) && (!U.q || (n.t + ' ' + (n.r || '')).toLowerCase().includes(U.q.toLowerCase())));
  const strip = ['Ibovespa', 'S&P 500', 'Nasdaq', 'USD/BRL', 'EUR/BRL', 'Petróleo Brent', 'Ouro', 'Bitcoin', 'Treasury 10 anos'].map(mktFind).filter(Boolean);
  const tbl = (list) => list.length ? '<div class="tbl-wrap"><table class="tbl mkt-tbl"><tbody>' + list.map(tkRow).join('') + '</tbody></table></div>' : '<div class="empty">Aguardando dados.</div>';
  const at = L && W.MKT_LIVE.at ? new Date(W.MKT_LIVE.at) : null;
  const eco = (W.ST.agendaEco || []).filter(e => e.d >= iso(TODAY)).sort((a, b) => (a.d + a.h).localeCompare(b.d + b.h)).slice(0, 8);
  return ph('globe', 'Mercado financeiro', 'Mercado 24h', '<span class="row" style="gap:8px"><span class="live-dot"' + (L ? '' : ' style="background:var(--warn);box-shadow:none"') + '></span>' + (L ? 'Dados reais · atualizado às ' + (at ? at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—') + ' · cotações da B3 com atraso de até 15 min' : 'Demonstração com dados ilustrativos') + '</span>',
      (W.Store && W.Store.mode !== 'local' ? '<button class="btn" data-act="mktRefresh">' + icon('refresh', 'ic-sm') + 'Atualizar agora</button>' : '') + '<button class="btn" data-act="toggleHP">' + icon('calc', 'ic-sm') + 'HP12C</button><a class="btn" href="#mercado-calc" data-act="scrollCalc">' + icon('calc', 'ic-sm') + 'Calculadoras</a>') +
    (L ? '' : '<div class="banner">' + icon('alert') + '<div><b>Modo demonstração.</b> Cotações e notícias abaixo são exemplos. No sistema publicado no Firebase, um robô busca a cada 10 minutos cotações da B3 e das bolsas internacionais, câmbio, juros do Banco Central e notícias de vários portais.</div></div>') +
    '<div class="ticker" role="list">' + strip.map(t => { const up = (t.c || 0) >= 0, sp = sparkOf(t); return '<div class="tk ' + (up ? 'up' : 'down') + '" role="listitem" data-tk="' + esc(t.s) + '"><small>' + esc(t.s) + '</small><b class="tv">' + mktVal(t) + '</b><div class="tk-f"><span class="chip ' + (up ? 'up' : 'down') + '">' + arrow(up) + ' ' + chg(t) + '</span>' + (sp ? spark(sp, up) : '') + '</div></div>'; }).join('') + '</div>' +
    pulse() + featured(news) +
    '<div class="cols c-main" style="margin-bottom:16px">' +
      '<section class="card news-card"><div class="card-h"><div><h3><span class="live-badge"><i></i>Ao vivo</span>Notícias · últimas 24 horas</h3><div class="sub">' + news.length + ' manchetes' + (L && W.MKT_LIVE.fontes ? ' de ' + W.MKT_LIVE.fontes.length + ' fontes' : '') + ' · “Afeta” liga a notícia aos clientes do mesmo setor</div></div></div>' +
        '<div style="padding:12px 16px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:10px"><input class="inp" type="search" id="newsQ" data-chg="newsQ" placeholder="Filtrar notícias…" value="' + esc(U.q) + '" aria-label="Filtrar notícias"><div class="subnav" style="margin:0">' + cats.map(c => '<button class="' + (U.cat === c ? 'on' : '') + '" data-act="newsCat" data-v="' + c + '" style="height:30px;font-size:12.5px">' + c + '</button>').join('') + '</div></div>' +
        '<div class="news" style="max-height:640px;overflow:auto">' + (news.map(n => newsItem(n)).join('') || '<div class="empty">' + (L ? 'Nenhuma notícia nesse filtro.' : 'Nenhuma notícia nesse filtro.') + '</div>') + '</div></section>' +
      '<div class="stack">' +
        cardW('Juros e inflação', 'Brasil e EUA', tbl(G('juros')), { flush: true }) +
        cardW('Agenda econômica', 'Eventos que mexem com o mercado', (eco.map(e => '<div class="ag-i" style="grid-template-columns:62px minmax(0,1fr) auto auto;align-items:center"><time>' + fDateS(e.d) + '<br><small class="muted">' + esc(e.h) + '</small></time><span>' + esc(e.t) + '<br><small class="muted">' + esc(e.p) + '</small></span><span title="Impacto" style="color:var(--warn);letter-spacing:2px">' + '●'.repeat(e.imp) + '<span style="color:var(--line-2)">' + '●'.repeat(3 - e.imp) + '</span></span><button class="ibtn" data-act="ecoDel" data-id="' + e.id + '" aria-label="Remover evento">' + icon('x', 'ic-sm') + '</button></div>').join('') || '<div class="empty">Nenhum evento cadastrado.</div>'), { tools: '<button class="btn btn-sm" data-act="ecoNew">' + icon('plus', 'ic-sm') + 'Evento</button>' }) +
        cardW('Alertas de preço', 'Avisam quando o ativo cruza o valor', (W.ST.alertas.map(a => { const t = mktFind(a.ativo), hit = t && (a.cond === 'acima de' ? t.v > a.valor : t.v < a.valor); return '<div class="ag-i" style="grid-template-columns:minmax(0,1fr) auto auto;align-items:center"><span><b>' + esc(a.ativo) + '</b> ' + a.cond + ' ' + fNum(a.valor, a.valor < 100 ? 2 : 0) + '<br><small class="muted">Agora: ' + mktVal(t) + '</small></span>' + (hit ? '<span class="pill p-warn">Disparado</span>' : '<span class="pill nodot">Monitorando</span>') + '<button class="ibtn" data-act="delAlert" data-id="' + a.id + '" aria-label="Remover alerta">' + icon('x', 'ic-sm') + '</button></div>'; }).join('') || '<div class="empty">Nenhum alerta.</div>') +
          '<form id="alertForm" class="row" style="margin-top:10px"><select class="inp" name="ativo" style="width:auto;flex:1;min-width:0" aria-label="Ativo">' + GROUPS.flatMap(g => G(g)).map(t => '<option>' + esc(t.s) + '</option>').join('') + '</select><select class="inp" name="cond" style="width:auto" aria-label="Condição"><option>acima de</option><option>abaixo de</option></select><input class="inp" name="valor" inputmode="decimal" placeholder="Valor" style="width:90px" aria-label="Valor do alerta"><button class="btn" type="submit">Criar</button></form>') +
      '</div>' +
    '</div>' +
    '<div class="cols c3" style="margin-bottom:16px">' +
      cardW('Bolsas internacionais', 'EUA, Europa e Ásia', tbl(G('intl')), { flush: true }) +
      cardW('Brasil · índices e ações', 'B3', tbl(G('br').concat(G('acoes'))), { flush: true }) +
      cardW('Câmbio e commodities', 'Moedas, petróleo, metais e grãos', tbl(G('fx').concat(G('cmd'))), { flush: true }) +
    '</div>' +
    '<section class="card" id="mercado-calc"><div class="card-h"><div><h3>Calculadoras financeiras</h3><div class="sub">Para simulações rápidas com clientes</div></div><button class="btn btn-sm" data-act="toggleHP">' + icon('calc', 'ic-sm') + 'Abrir HP12C</button></div><div class="card-b stack">' +
      seg('calcTab', U.calc, [['juros', 'Juros compostos'], ['finan', 'SAC × Price'], ['renda', 'CDB × LCI/LCA'], ['indep', 'Independência financeira']]) +
      '<div id="calcBox">' + calcHTML() + '</div></div></section>';
};
W.AFTER.mercado = () => {
  const f = $('#alertForm');
  if (f) f.onsubmit = (ev) => { ev.preventDefault(); const v = pNum(f.elements.valor.value); if (!(v > 0)) { toast('Informe o valor do alerta.', 'warn'); return; } W.ST.alertas.push({ id: uid('a'), ativo: f.elements.ativo.value, cond: f.elements.cond.value, valor: v }); persist(); render(); toast('Alerta criado'); };
  const q = $('#newsQ'); if (q && W.UI.mkt.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  calcRun();
};
A.newsCat = (b) => { W.UI.mkt.cat = b.dataset.v; render(); };
C.newsQ = (t, ev) => { if (ev.type !== 'input') return; W.UI.mkt.q = t.value; render(); };
A.delAlert = (b) => { W.ST.alertas = W.ST.alertas.filter(a => a.id !== b.dataset.id); persist(); render(); };
A.scrollCalc = () => { const c = $('#mercado-calc'); if (c) c.scrollIntoView({ behavior: 'smooth' }); };
A.mktRefresh = async (b) => { b.disabled = true; try { await W.Store.refreshMarket(); toast('Mercado atualizado'); } catch (er) { toast('Não foi possível atualizar agora: ' + (er.message || er), 'warn'); } b.disabled = false; };
A.ecoNew = () => openModal('Novo evento econômico', '<form id="ecoForm" class="grid-f"><label class="fld req" style="grid-column:1/-1"><span>Evento</span><input name="t" placeholder="Ex.: Decisão de juros · Copom"></label><label class="fld"><span>Data</span><input type="date" name="d" value="' + iso(TODAY) + '"></label><label class="fld"><span>Horário</span><input type="time" name="h" value="09:00"></label><label class="fld"><span>País</span><select name="p"><option>Brasil</option><option>EUA</option><option>Zona do euro</option><option>China</option><option>Outro</option></select></label><label class="fld"><span>Impacto</span><select name="imp"><option value="3">Alto</option><option value="2" selected>Médio</option><option value="1">Baixo</option></select></label></form>',
  '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="ecoSave">Adicionar</button>');
A.ecoSave = () => { const f = $('#ecoForm'); if (!f.t.value.trim()) { toast('Informe o evento.', 'warn'); return; } W.ST.agendaEco.push({ id: uid('ae'), t: f.t.value.trim(), d: f.d.value, h: f.h.value, p: f.p.value, imp: +f.imp.value }); persist(); closeModal(); render(); };
A.ecoDel = (b) => { W.ST.agendaEco = W.ST.agendaEco.filter(e => e.id !== b.dataset.id); persist(); render(); };

W.checkAlerts = () => {
  let changed = false;
  (W.ST.alertas || []).forEach(a => {
    const t = mktFind(a.ativo); if (!t || t.v == null) return;
    const hit = a.cond === 'acima de' ? t.v > a.valor : t.v < a.valor;
    if (hit && !a.hit) { a.hit = Date.now(); changed = true; toast('Alerta: ' + a.ativo + ' ' + a.cond + ' ' + fNum(a.valor, a.valor < 100 ? 2 : 0) + ' · agora ' + mktVal(t), 'warn'); const d = $('#alertDot'); if (d) d.classList.add('on'); }
    if (!hit && a.hit) { a.hit = null; changed = true; }
  });
  if (changed) persist();
};
W.addEventListener('imagine:market', () => {
  W.checkAlerts();
  if (W.UI.tab === 'mercado' || W.UI.tab === 'inicio') { const a = document.activeElement; if (a && a.matches && a.matches('input,textarea,select')) return; render(); }
});
W.startMarket = () => {
  if (W._mktT || live()) return;
  W._mktT = setInterval(() => {
    if (live()) { clearInterval(W._mktT); W._mktT = null; return; }
    GROUPS.forEach(g => MKT[g].forEach(t => {
      if (['Selic', 'CDI', 'IPCA 12m'].includes(t.s)) return;
      if (Math.random() < 0.55) return;
      const step = (Math.random() - 0.5) * (t.abs ? 0.002 : 0.0016);
      const old = t.v; t.v = t.v * (1 + step);
      t.c = t.abs ? t.c + (t.v - old) : t.c + step * 100;
      HIST[t.s].push(t.v); HIST[t.s].shift();
      $$('[data-tk="' + CSS.escape(t.s) + '"]').forEach(el => {
        const b = el.querySelector('.tv'), last = el.querySelector('.chip');
        if (b) b.textContent = mktVal(t);
        if (last) { last.className = 'chip ' + (t.c >= 0 ? 'up' : 'down'); last.textContent = (t.c >= 0 ? '▲ ' : '▼ ') + chg(t); }
        if (el.classList.contains('tk')) { el.classList.toggle('up', t.c >= 0); el.classList.toggle('down', t.c < 0); }
        const sv = el.querySelector('svg.spark'); if (sv) sv.outerHTML = spark(HIST[t.s], t.c >= 0);
        el.classList.remove('flash-up', 'flash-dn'); void el.offsetWidth; el.classList.add(t.v >= old ? 'flash-up' : 'flash-dn');
      });
    }));
    W.checkAlerts();
  }, 4000);
};

/* ---------- Calculadoras ---------- */
const CV = { ini: '10.000,00', apo: '1.000,00', tx: '12', anos: '10', pv: '300.000,00', txf: '11', meses: '360', val: '50.000,00', dias: '720', cdi: '14,90', pcdb: '110', plci: '92', renda: '15.000,00', real: '5', prazo: '20', atual: '100.000,00' };
const ci = (k, l, suf) => '<label class="fld"><span>' + l + '</span><div class="row" style="flex-wrap:nowrap;gap:6px"><input data-chg="calc" data-k="' + k + '" inputmode="decimal" value="' + esc(CV[k]) + '">' + (suf ? '<span class="muted" style="font-size:12px;white-space:nowrap">' + suf + '</span>' : '') + '</div></label>';
function calcHTML(){
  const t = W.UI.mkt.calc;
  if (t === 'juros') return '<div class="cols c4" style="margin-bottom:14px">' + ci('ini', 'Valor inicial (R$)') + ci('apo', 'Aporte mensal (R$)') + ci('tx', 'Taxa anual', '% a.a.') + ci('anos', 'Prazo', 'anos') + '</div><div id="calcOut"></div>';
  if (t === 'finan') return '<div class="cols c3" style="margin-bottom:14px">' + ci('pv', 'Valor financiado (R$)') + ci('txf', 'Taxa anual', '% a.a.') + ci('meses', 'Prazo', 'meses') + '</div><div id="calcOut"></div>';
  if (t === 'renda') return '<div class="cols c3" style="margin-bottom:14px">' + ci('val', 'Valor aplicado (R$)') + ci('dias', 'Prazo', 'dias corridos') + ci('cdi', 'CDI', '% a.a.') + ci('pcdb', 'CDB', '% do CDI') + ci('plci', 'LCI/LCA', '% do CDI') + '</div><div id="calcOut"></div>';
  return '<div class="cols c4" style="margin-bottom:14px">' + ci('renda', 'Renda mensal desejada (R$)') + ci('real', 'Rentabilidade real', '% a.a.') + ci('prazo', 'Tempo até lá', 'anos') + ci('atual', 'Patrimônio atual (R$)') + '</div><div id="calcOut"></div>';
}
const out3 = (arr) => '<div class="calc-out">' + arr.map(([l, v, c]) => '<div><small>' + l + '</small><b class="' + (c || '') + '">' + v + '</b></div>').join('') + '</div>';
function calcRun(){
  const o = $('#calcOut'); if (!o) return;
  const g = (k) => pNum(CV[k]), t = W.UI.mkt.calc;
  if (t === 'juros') {
    const P = g('ini'), A0 = g('apo'), i = Math.pow(1 + g('tx') / 100, 1 / 12) - 1, n = Math.round(g('anos') * 12);
    const fv = -FIN.fvf(n, i, P, A0, false), inv = P + A0 * n;
    const pts = []; for (let y = 0; y <= g('anos'); y++) { const m = y * 12; pts.push({ l: String(y), a: P + A0 * m, b: Math.max(0, -FIN.fvf(m, i, P, A0, false) - (P + A0 * m)) }); }
    o.innerHTML = out3([['Valor acumulado', fBRL(fv)], ['Total investido', fBRL(inv)], ['Juros ganhos', fBRL(fv - inv), 'pos']]) +
      '<div style="margin-top:14px">' + chartBars(pts.length > 16 ? pts.filter((p, k) => k % Math.ceil(pts.length / 16) === 0 || k === pts.length - 1) : pts, { la: 'Investido', lb: 'Juros', label: 'Evolução do patrimônio por ano' }) + '<div class="legend"><span><i style="background:#3E6FE0"></i>Investido</span><span><i style="background:#8FB0FF"></i>Juros acumulados</span><span class="muted">Eixo: anos</span></div></div>';
  } else if (t === 'finan') {
    const PV = g('pv'), i = Math.pow(1 + g('txf') / 100, 1 / 12) - 1, n = Math.max(1, Math.round(g('meses')));
    const pmt = -FIN.pmtf(n, i, PV, 0, false), totP = pmt * n;
    const am = PV / n, first = am + PV * i, lastP = am + am * i, jurosS = i * PV * (n + 1) / 2;
    o.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th class="r">Tabela Price</th><th class="r">SAC</th></tr></thead><tbody>' +
      '<tr><td>Primeira parcela</td><td class="r">' + fBRL2(pmt) + '</td><td class="r">' + fBRL2(first) + '</td></tr>' +
      '<tr><td>Última parcela</td><td class="r">' + fBRL2(pmt) + '</td><td class="r">' + fBRL2(lastP) + '</td></tr>' +
      '<tr><td>Total de juros</td><td class="r">' + fBRL(totP - PV) + '</td><td class="r">' + fBRL(jurosS) + '</td></tr>' +
      '<tr><td>Total pago</td><td class="r">' + fBRL(totP) + '</td><td class="r">' + fBRL(PV + jurosS) + '</td></tr>' +
      '</tbody></table></div><p class="muted" style="margin:10px 0 0;font-size:12.5px">Taxa mensal equivalente: ' + fNum(i * 100, 4) + '% a.m. No SAC a parcela começa maior e cai; o total de juros é ' + fBRL(totP - PV - jurosS) + ' menor que na Price.</p>';
  } else if (t === 'renda') {
    const V0 = g('val'), d = Math.max(1, g('dias')), cdi = g('cdi') / 100;
    const ir = d <= 180 ? 22.5 : d <= 360 ? 20 : d <= 720 ? 17.5 : 15;
    const fac = (p) => Math.pow(1 + cdi * p / 100, d / 365) - 1;
    const bruto = V0 * fac(g('pcdb')), liq = bruto * (1 - ir / 100), lci = V0 * fac(g('plci'));
    const equiv = g('plci') / (1 - ir / 100);
    o.innerHTML = out3([['CDB · rendimento líquido', fBRL2(liq), liq >= lci ? 'pos' : ''], ['LCI/LCA · rendimento (isento)', fBRL2(lci), lci > liq ? 'pos' : ''], ['IR sobre o CDB', ir.toLocaleString('pt-BR') + '% · ' + fBRL2(bruto - liq)]]) +
      '<p style="margin:12px 0 0">Melhor opção: <b class="pos">' + (liq >= lci ? 'CDB ' + g('pcdb') + '% do CDI' : 'LCI/LCA ' + g('plci') + '% do CDI') + '</b>. A LCI/LCA de ' + fNum(g('plci'), 0) + '% do CDI equivale a um CDB de cerca de <b>' + fNum(equiv, 1) + '% do CDI</b> nesse prazo.</p><p class="muted" style="margin:6px 0 0;font-size:12.5px">Aproximação com dias corridos e CDI constante.</p>';
  } else {
    const r = Math.pow(1 + g('real') / 100, 1 / 12) - 1, n = Math.round(g('prazo') * 12), alvo = g('renda') / r;
    const pmt = -FIN.pmtf(n, r, -g('atual'), alvo, false);
    o.innerHTML = out3([['Patrimônio necessário', fBRL(alvo)], ['Aporte mensal necessário', fBRL(Math.max(0, -pmt)), 'pos'], ['Patrimônio atual rende até lá', fBRL(g('atual') * Math.pow(1 + r, n))]]) +
      '<p class="muted" style="margin:10px 0 0;font-size:12.5px">Patrimônio que gera a renda desejada só com os rendimentos reais (acima da inflação), sem consumir o principal.</p>';
  }
}
A.calcTab = (b) => { W.UI.mkt.calc = b.dataset.v; $$('[data-act="calcTab"]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); $('#calcBox').innerHTML = calcHTML(); calcRun(); };
C.calc = (t, ev) => { if (ev.type !== 'input') return; CV[t.dataset.k] = t.value; calcRun(); };
})();
