/* Imagine CRM · Relatórios e Agenda */
(function(){
const W = window;
W.VIEWS = W.VIEWS || {}; W.AFTER = W.AFTER || {}; W.ACT = W.ACT || {}; W.CHANGE = W.CHANGE || {};
const V = W.VIEWS, A = W.ACT, C = W.CHANGE;
const DSTAGES = ['Briefing', 'Criação', 'Revisão', 'Aprovado', 'Entregue'];
const cliKit = (nome) => W.ST.clientes.find(c => c.nome === nome);

/* A aba Design agora é o Estúdio (studio-home.js) */
V.design = () => '';
W.AFTER.design = () => { if (W.Studio) W.Studio.show(); };

/* ---------- Relatórios ---------- */
const REL_OBJ = {
  leads: { l: 'Oportunidades', grp: { stage: 'Etapa', resp: 'Responsável', servico: 'Serviço', origem: 'Origem', segmento: 'Segmento', motivo: 'Motivo da perda' } },
  clientes: { l: 'Clientes', grp: { segmento: 'Segmento', modelo: 'Modelo', resp: 'Responsável', saude: 'Saúde da conta' } },
  receber: { l: 'Contas a receber', grp: { status: 'Status', quem: 'Cliente' } },
  design: { l: 'Projetos de design', grp: { etapa: 'Etapa', cliente: 'Cliente', resp: 'Responsável' } },
  pontos: { l: 'Pontuação', grp: { socio: 'Sócio', k: 'Atividade', ref: 'Referência' } }
};
function relData(obj, grp, met){
  const S = W.ST; let rows = S[obj] || [];
  const key = (r) => {
    if (obj === 'leads') { if (grp === 'servico') return r.f.servicoAprovado || r.f.servico || 'Não definido'; if (grp === 'origem') return r.f.origem || 'Não informada'; if (grp === 'motivo') return r.stage === 'Perdido' ? (r.f.motivo || 'Sem motivo') : null; if (grp === 'resp') return socio(r.resp).nome; return r[grp]; }
    if (grp === 'resp' || grp === 'socio') return socio(r[grp]).nome;
    if (grp === 'k') return PTS_LABEL[r.k];
    return r[grp];
  };
  const val = (r) => obj === 'leads' ? +(r.f.valor || r.valor || 0) : obj === 'pontos' ? ptsOf(r) : +(r.valor || 0);
  const m = {};
  rows.forEach(r => { const k = key(r); if (k == null) return; m[k] = (m[k] || 0) + (met === 'count' ? 1 : val(r)); });
  let out = Object.entries(m).map(([l, v]) => ({ l, v }));
  if (obj === 'leads' && grp === 'stage') out.sort((a, b) => STAGES.indexOf(a.l) - STAGES.indexOf(b.l)); else out.sort((a, b) => b.v - a.v);
  return out;
}
V.relatorios = () => {
  const U = W.UI.rel;
  const subs = [['painel', 'Controle de metas'], ['pontos', 'Pontuação de sócios'], ['builder', 'Construtor de relatórios'], ['config', 'Configurar pontuação']];
  let body = '';
  if (U.sub === 'painel') body = painel();
  if (U.sub === 'pontos') body = pontosView();
  if (U.sub === 'builder') body = builder();
  if (U.sub === 'config') body = config();
  return ph('report', 'Painel', { painel: 'Controle de metas · Imagine', pontos: 'Pontuação de sócios', builder: 'Construtor de relatórios', config: 'Configurar pontuação' }[U.sub], 'A partir de ' + TODAY.toLocaleDateString('pt-BR') + ' ' + nowHM() + ' · exibindo como Sócio', '<button class="btn" data-act="go" data-v="relatorios">' + icon('refresh', 'ic-sm') + 'Atualizar</button>') +
    '<nav class="subnav" aria-label="Relatórios">' + subs.map(([k, l]) => '<button class="' + (U.sub === k ? 'on' : '') + '" data-act="relSub" data-v="' + k + '">' + l + '</button>').join('') + '</nav>' + body;
};
A.relSub = (b) => { W.UI.rel.sub = b.dataset.v; render(); };
const WIDGETS = {
  receitaSocio: () => {
    const rows = SOCIOS.map(s => { const cs = W.ST.clientes.filter(c => c.resp === s.id); return { s, n: cs.length, v: cs.reduce((a, c) => a + c.valor, 0) }; }).sort((a, b) => b.v - a.v);
    const tot = rows.reduce((a, r) => a + r.v, 0), tn = rows.reduce((a, r) => a + r.n, 0);
    return ['Receita por sócio', 'Contratos da carteira', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Responsável</th><th class="r">Clientes</th><th class="r">Receita</th></tr></thead><tbody>' + rows.map(r => '<tr><td><span class="who">' + av(r.s.id) + esc(r.s.nome) + '</span></td><td class="r">' + r.n + '</td><td class="r">' + fBRL(r.v) + '</td></tr>').join('') + '</tbody><tfoot><tr><td>Total</td><td class="r">' + tn + '</td><td class="r">' + fBRL(tot) + '</td></tr></tfoot></table></div>', 'clientes', 'resp', 'sum', true];
  },
  funil: () => {
    const L = W.ST.leads, reach = (i) => L.filter(l => l.stage === 'Perdido' ? STAGES.indexOf(l.lostFrom || 'Leads') >= i : STAGES.indexOf(l.stage) >= i).length;
    const rows = STAGES.slice(0, 5).map((s, i) => ({ l: s, v: reach(i) }));
    return ['Funil e conversão', 'Leads que chegaram a cada etapa', hbars(rows) + '<p class="muted" style="margin:10px 0 0;font-size:12.5px">Conversão total Leads → Convertido: <b class="pos">' + Math.round(rows[4].v / Math.max(1, rows[0].v) * 100) + '%</b></p>', 'leads', 'stage', 'count'];
  },
  ranking: () => ['Ranking de pontuação', 'Mês atual', rankHTML(monthStart()), 'pontos', 'socio', 'sum'],
  historico: () => ['Histórico de pontuação', 'Últimos registros', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Data</th><th>Atividade</th><th class="r">Pts</th><th>Referência</th></tr></thead><tbody>' + W.ST.pontos.slice(0, 6).map(p => '<tr><td>' + fDateS(p.d) + '</td><td>' + esc(PTS_LABEL[p.k]) + '<br><small class="muted">' + esc(socio(p.socio).nome) + '</small></td><td class="r">' + ptsOf(p) + '</td><td>' + esc(p.ref) + '</td></tr>').join('') + '</tbody></table></div>', 'pontos', 'k', 'sum', true],
  origem: () => ['Origem dos leads', 'Quantidade por canal', hbars(relData('leads', 'origem', 'count')), 'leads', 'origem', 'count'],
  perdas: () => ['Motivos de perda', 'Onde e por que perdemos', hbars(relData('leads', 'motivo', 'count').map(r => Object.assign(r, { c: '#E2615F' }))) + '<p class="muted" style="margin:10px 0 0;font-size:12.5px">' + W.ST.leads.filter(l => l.stage === 'Perdido').map(l => esc(l.empresa) + ' saiu em ' + esc(l.lostFrom || '—')).join(' · ') + '</p>', 'leads', 'motivo', 'count'],
  servicos: () => ['Pipeline por serviço', 'Valor em aberto', hbars(relData('leads', 'servico', 'sum'), fBRLk), 'leads', 'servico', 'sum'],
  design: () => ['Produção de design', 'Projetos por etapa', hbars(DSTAGES.map(s => ({ l: s, v: W.ST.design.filter(p => p.etapa === s).length }))), 'design', 'etapa', 'count']
};
function widget(key){
  const [t, sub, body, obj, grp, met, flush] = WIDGETS[key]();
  return '<section class="card" style="display:flex;flex-direction:column"><div class="card-h"><div><h3>' + t + '</h3><div class="sub">' + sub + '</div></div>' + wTools(key) + '</div><div class="card-b" style="flex:1' + (flush ? ';padding:0' : '') + '">' + body + '</div>' +
    '<div class="card-f"><a href="#relatorios" data-act="openReport" data-obj="' + obj + '" data-grp="' + grp + '" data-met="' + met + '">Exibir relatório</a><span>Atualizado às ' + nowHM() + '</span></div></section>';
}
function painel(){
  return '<div class="row" style="margin-bottom:14px"><label class="fld" style="width:220px"><span>Período</span><select data-chg="relPer"><option value="mes"' + (W.UI.rel.per === 'mes' ? ' selected' : '') + '>Mês atual</option><option value="30"' + (W.UI.rel.per === '30' ? ' selected' : '') + '>Últimos 30 dias</option><option value="tri"' + (W.UI.rel.per === 'tri' ? ' selected' : '') + '>Trimestre</option></select></label></div>' +
    '<div class="cols c3">' + ['receitaSocio', 'funil', 'ranking', 'historico', 'origem', 'perdas', 'servicos', 'design'].map(widget).join('') + '</div>';
}
C.relPer = (t, ev) => { if (ev.type === 'change') { W.UI.rel.per = t.value; render(); toast('Painel filtrado'); } };
A.wExpand = (b) => { const [t, sub, body] = WIDGETS[b.dataset.w](); openModal(t, '<p class="muted" style="margin:0">' + sub + '</p>' + body, '', true); };
A.openReport = (b) => { Object.assign(W.UI.rel, { sub: 'builder', obj: b.dataset.obj, grp: b.dataset.grp, met: b.dataset.met }); render(); };
function pontosView(){
  const P = W.ST.pontos, ms = monthStart();
  const byK = Object.keys(PTS_LABEL).map(k => ({ l: PTS_LABEL[k], v: P.filter(p => p.k === k && p.d >= ms).reduce((s, p) => s + ptsOf(p), 0) }));
  return '<div class="cols c-main"><div class="stack">' +
    cardW('Histórico de pontuação', P.length + ' registros', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Data</th><th>Sócio</th><th>Atividade</th><th class="r">Pontos</th><th>Referência</th></tr></thead><tbody>' + P.map(p => '<tr><td>' + fDate(p.d) + '</td><td><span class="who">' + av(p.socio) + esc(socio(p.socio).nome) + '</span></td><td>' + esc(PTS_LABEL[p.k]) + '</td><td class="r"><b>' + ptsOf(p) + '</b></td><td>' + esc(p.ref) + '</td></tr>').join('') + '</tbody></table></div>', { flush: true, tools: '<button class="btn btn-sm" data-act="manualPts">' + icon('plus', 'ic-sm') + 'Registrar</button>' }) +
    '</div><div class="stack">' + cardW('Ranking do mês', MESES_L[TODAY.getMonth()], rankHTML(ms)) + cardW('Ranking geral', 'Desde o início', rankHTML(null)) + cardW('Pontos por atividade', 'Mês atual', hbars(byK)) + '</div></div>';
}
A.manualPts = () => openModal('Registrar pontuação', '<form id="ptsForm" class="grid-f"><label class="fld"><span>Sócio</span><select name="socio">' + SOCIOS.map(s => '<option value="' + s.id + '">' + esc(s.nome) + '</option>').join('') + '</select></label><label class="fld"><span>Atividade</span><select name="k">' + Object.entries(PTS_LABEL).map(([k, l]) => '<option value="' + k + '">' + l + ' · ' + W.ST.cfg.pts[k] + ' pts</option>').join('') + '</select></label><label class="fld" style="grid-column:1/-1"><span>Referência (cliente ou lead)</span><input name="ref"></label></form>',
  '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="savePts">Registrar</button>');
A.savePts = () => { const f = $('#ptsForm'); award(f.socio.value, f.k.value, f.ref.value.trim() || '—'); persist(); closeModal(); render(); toast('Pontuação registrada'); };
function builder(){
  const U = W.UI.rel, o = REL_OBJ[U.obj]; if (!o.grp[U.grp]) U.grp = Object.keys(o.grp)[0];
  const data = relData(U.obj, U.grp, U.met), fmt = U.met === 'sum' && U.obj !== 'pontos' ? fBRL : (v) => fNum(v);
  const tot = data.reduce((s, r) => s + r.v, 0);
  const sel = (chg, cur, opts) => '<select data-chg="' + chg + '">' + opts.map(([v, l]) => '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>';
  const saved = W.ST.relatorios;
  return '<div class="card" style="margin-bottom:16px"><div class="card-b"><div class="cols c4">' +
    '<label class="fld"><span>Objeto</span>' + sel('relObj', U.obj, Object.entries(REL_OBJ).map(([k, v]) => [k, v.l])) + '</label>' +
    '<label class="fld"><span>Agrupar por</span>' + sel('relGrp', U.grp, Object.entries(o.grp)) + '</label>' +
    '<label class="fld"><span>Métrica</span>' + sel('relMet', U.met, [['count', 'Quantidade de registros'], ['sum', U.obj === 'pontos' ? 'Soma de pontos' : 'Soma de valor (R$)']]) + '</label>' +
    '<label class="fld"><span>Visualização</span>' + sel('relVis', U.vis, [['bar', 'Barras'], ['table', 'Tabela']]) + '</label>' +
    '</div></div></div>' +
    '<div class="cols c-main"><section class="card"><div class="card-h"><div><h3>' + esc(o.l) + ' por ' + esc(o.grp[U.grp].toLowerCase()) + '</h3><div class="sub">' + data.length + ' grupos · total ' + fmt(tot) + '</div></div><div class="row" style="gap:6px"><button class="btn btn-sm" data-act="saveReport">Salvar relatório</button><button class="btn btn-sm" data-act="csvReport">' + icon('download', 'ic-sm') + 'CSV</button></div></div><div class="card-b">' +
      (U.vis === 'bar' ? hbars(data, fmt) : '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + esc(o.grp[U.grp]) + '</th><th class="r">' + (U.met === 'count' ? 'Quantidade' : 'Total') + '</th><th class="r">%</th></tr></thead><tbody>' + data.map(r => '<tr><td>' + esc(r.l) + '</td><td class="r">' + fmt(r.v) + '</td><td class="r">' + fNum(r.v / Math.max(1, tot) * 100, 1) + '%</td></tr>').join('') + '</tbody><tfoot><tr><td>Total</td><td class="r">' + fmt(tot) + '</td><td class="r">100%</td></tr></tfoot></table></div>') +
    '</div></section>' +
    cardW('Relatórios salvos', saved.length + ' salvos', saved.length ? saved.map((r, i) => '<div class="ag-i" style="grid-template-columns:minmax(0,1fr) auto"><button class="btn btn-ghost" style="justify-content:flex-start;height:auto;padding:6px 8px;text-align:left;white-space:normal" data-act="loadReport" data-i="' + i + '">' + esc(r.nome) + '</button><button class="ibtn" data-act="delReport" data-i="' + i + '" aria-label="Excluir relatório">' + icon('x', 'ic-sm') + '</button></div>').join('') : '<div class="empty">Monte um relatório e salve para acessar depois.</div>') + '</div>';
}
['relObj', 'relGrp', 'relMet', 'relVis'].forEach(k => C[k] = (t, ev) => { if (ev.type !== 'change') return; W.UI.rel[{ relObj: 'obj', relGrp: 'grp', relMet: 'met', relVis: 'vis' }[k]] = t.value; render(); });
A.saveReport = () => { const U = W.UI.rel, o = REL_OBJ[U.obj]; W.ST.relatorios.unshift({ nome: o.l + ' por ' + o.grp[U.grp].toLowerCase() + (U.met === 'sum' ? ' (valor)' : ''), obj: U.obj, grp: U.grp, met: U.met, vis: U.vis }); persist(); render(); toast('Relatório salvo'); };
A.loadReport = (b) => { Object.assign(W.UI.rel, W.ST.relatorios[+b.dataset.i]); delete W.UI.rel.nome; render(); };
A.delReport = (b) => { W.ST.relatorios.splice(+b.dataset.i, 1); persist(); render(); };
A.csvReport = () => { const U = W.UI.rel, data = relData(U.obj, U.grp, U.met); const csv = '﻿' + [[REL_OBJ[U.obj].grp[U.grp], U.met === 'count' ? 'Quantidade' : 'Total']].concat(data.map(r => [r.l, r.v])).map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n'); saveFile('relatorio-imagine.csv', new Blob([csv], { type: 'text/csv' })); };
function config(){
  const P = W.ST.cfg.pts;
  return '<div class="cols c-main"><section class="card"><div class="card-h"><div><h3>Pesos da pontuação</h3><div class="sub">Pontos que cada atividade vale. A mudança vale para todo o histórico.</div></div></div><div class="card-b"><div class="grid-f">' +
    Object.entries(PTS_LABEL).map(([k, l]) => '<label class="fld"><span>' + l + '</span><input type="number" min="0" step="1" data-chg="ptsCfg" data-k="' + k + '" value="' + P[k] + '"></label>').join('') + '</div></div></section>' +
    cardW('Como os pontos entram', 'Automático pelo funil e pelo design', '<div class="stack" style="gap:8px;font-size:13.5px"><span>Lead passa de R1 para Mapeamento → <b>R1 realizada</b></span><span>Lead entra em Ativação com sim verbal → <b>Mapeamento concluído</b> e <b>Ativação</b> para o sócio que recebeu o sim</span><span>Lead convertido → <b>Cliente convertido</b></span><span>Projeto entregue até o prazo → <b>Design no prazo</b></span><span>Novo lead com origem Indicação → <b>Indicação</b></span></div>') + '</div>';
}
C.ptsCfg = (t, ev) => { if (ev.type !== 'change') return; W.ST.cfg.pts[t.dataset.k] = Math.max(0, parseInt(t.value) || 0); persist(); toast('Peso atualizado'); };

/* ---------- Agenda ---------- */
const hm = (x) => String(Math.floor(x)).padStart(2, '0') + ':' + String(Math.round(x % 1 * 60)).padStart(2, '0');
function weekDays() {
  const wd = TODAY.getDay(), mon = new Date(TODAY); mon.setDate(TODAY.getDate() - ((wd + 6) % 7) + (wd === 6 || wd === 0 ? 7 : 0) + (W.UI.agWeek || 0) * 7);
  return [0, 1, 2, 3, 4].map(i => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}
V.agenda = () => {
  const days = weekDays(), H0 = 7, H1 = 20, today = iso(TODAY), now = new Date(), nowH = now.getHours() + now.getMinutes() / 60;
  const tipoL = { r1: 'R1', map: 'Mapeamento', int: 'Interno', des: 'Design', google: 'Google Agenda' };
  const gc = W.GCal && W.GCal.connected(), gev = gc ? (W.GCal.cached(iso(days[0]), iso(days[4])) || []) : [];
  if (gc && !W.GCal.cached(iso(days[0]), iso(days[4]))) W.GCal.events(iso(days[0]), iso(days[4])).then(() => { if (W.UI.tab === 'agenda') render(); }).catch(er => toast(er.message, 'warn'));
  const all = W.ST.eventos.concat(gev);
  const up = W.ST.eventos.filter(e => e.d >= today).sort((a, b) => (a.d.localeCompare(b.d)) || a.h - b.h).slice(0, 8);
  const gBtn = !W.GCal || !W.GCal.available() ? '<button class="btn" data-act="gcal">' + icon('calendar', 'ic-sm') + 'Google Agenda</button>' : gc ? '<button class="btn" data-act="gcalSync">' + icon('check', 'ic-sm') + 'Google conectado · atualizar</button>' : '<button class="btn" data-act="gcalConnect">' + icon('calendar', 'ic-sm') + 'Conectar Google Agenda</button>';
  return ph('calendar', 'Agenda', 'Semana de ' + days[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }), 'Compromissos dos sócios' + (gc ? ' e do seu Google Agenda' : ''),
      '<div class="seg"><button data-act="agWeek" data-d="-1" aria-label="Semana anterior">' + icon('chevL', 'ic-sm') + '</button><button data-act="agWeek" data-d="0">Hoje</button><button data-act="agWeek" data-d="1" aria-label="Próxima semana">' + icon('chevR', 'ic-sm') + '</button></div>' + gBtn + '<button class="btn btn-primary" data-act="newEvent">' + icon('plus', 'ic-sm') + 'Novo compromisso</button>') +
    '<div class="row" style="margin-bottom:12px;gap:14px;font-size:12.5px"><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--sky)"></i>R1</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--pos)"></i>Mapeamento e fechamento</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--warn)"></i>Design</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--muted)"></i>Interno</span>' + (gc ? '<span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:#C4B5FD"></i>Google Agenda</span>' : '') + '</div>' +
    '<div class="cols c-main"><div class="card"><div class="tbl-wrap"><div class="week"><div class="wk-h"></div>' +
      days.map(d => '<div class="wk-h ' + (iso(d) === today ? 'today' : '') + '">' + d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + '<b>' + d.getDate() + '</b></div>').join('') +
      '<div>' + Array.from({ length: H1 - H0 }, (_, i) => '<div class="wk-hr">' + (H0 + i) + 'h</div>').join('') + '</div>' +
      days.map(d => { const ds = iso(d); return '<div class="wk-col" style="height:' + (H1 - H0) * 60 + 'px">' + Array.from({ length: H1 - H0 }, () => '<div class="wk-hr" style="text-align:left"></div>').join('') +
        all.filter(e => e.d === ds && e.h >= H0 && e.h < H1).map(e => '<div class="ev e-' + e.tipo + '" style="top:' + (e.h - H0) * 60 + 'px;height:' + Math.max(24, e.dur * 60 - 3) + 'px" data-act="evOpen" data-id="' + e.id + '" title="' + esc(e.t) + '">' + esc(e.t) + '<small>' + hm(e.h) + ' · ' + (tipoL[e.tipo] || '') + (e.resp ? ' · ' + esc(socio(e.resp).ini) : '') + '</small></div>').join('') +
        (ds === today && nowH >= H0 && nowH < H1 ? '<div class="now-line" style="top:' + (nowH - H0) * 60 + 'px"></div>' : '') + '</div>'; }).join('') +
    '</div></div></div>' +
    cardW('Próximos compromissos', up.length + ' agendados', up.map(e => '<div class="ag-i" style="grid-template-columns:76px minmax(0,1fr)"><time>' + fDateS(e.d) + '<br>' + hm(e.h) + '</time><span>' + esc(e.t) + '<br><small class="muted">' + (tipoL[e.tipo] || '') + ' · ' + Math.round(e.dur * 60) + ' min' + (e.resp ? ' · ' + esc(socio(e.resp).nome) : '') + '</small></span></div>').join('') || '<div class="empty">Nada agendado.</div>') + '</div>';
};
A.agWeek = (b) => { const d = +b.dataset.d; W.UI.agWeek = d === 0 ? 0 : (W.UI.agWeek || 0) + d; render(); };
A.gcal = (b) => openPop(b, 'Google Agenda', '<p style="margin:0">' + (W.Store && W.Store.mode === 'local' ? 'A integração funciona no sistema publicado no Firebase. Cada sócio conecta a própria conta Google e vê os compromissos junto com os do CRM.' : 'Falta configurar o ID do cliente Google. Peça ao administrador para colar o ID em Configurações › Integrações.') + '</p>' + (W.Store && W.Store.mode !== 'local' ? '<button class="btn btn-sm" data-act="go" data-v="config">Abrir Configurações</button>' : ''));
A.gcalConnect = async () => { try { await W.GCal.connect(); toast('Google Agenda conectado'); render(); } catch (er) { toast('Não foi possível conectar: ' + er.message, 'warn'); } };
A.gcalSync = () => { W.GCal.clear(); render(); };
A.newEvent = () => openModal('Novo compromisso', '<form id="evForm" data-submit="saveEvent" class="grid-f"><label class="fld req" style="grid-column:1/-1"><span>Título</span><input name="t" required placeholder="Ex.: R1 · Nome da empresa"></label>' +
  '<label class="fld"><span>Data</span><input type="date" name="d" value="' + iso(TODAY) + '"></label><label class="fld"><span>Início</span><input type="time" name="h" value="10:00" step="900"></label>' +
  '<label class="fld"><span>Duração</span><select name="dur"><option value="0.5">30 min</option><option value="1" selected>1 hora</option><option value="1.5">1h30</option><option value="2">2 horas</option></select></label>' +
  '<label class="fld"><span>Tipo</span><select name="tipo"><option value="r1">R1</option><option value="map">Mapeamento ou fechamento</option><option value="des">Design</option><option value="int">Interno</option></select></label>' +
  '<label class="fld"><span>Responsável</span><select name="resp">' + SOCIOS.map(s => '<option value="' + s.id + '"' + (s.id === W.ME ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select></label>' +
  (W.GCal && W.GCal.connected() ? '<label class="chk" style="grid-column:1/-1"><input type="checkbox" name="g" checked> Criar também no meu Google Agenda</label>' : '') + '<button type="submit" hidden></button></form>',
  '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveEventBtn">Agendar</button>');
A.saveEventBtn = () => A.saveEvent($('#evForm'));
A.saveEvent = async (f) => {
  const t = f.t.value.trim(); if (!t) { toast('Informe o título.', 'warn'); return; }
  const [hh, mm] = (f.h.value || '10:00').split(':').map(Number);
  const ev = { id: uid('e'), d: f.d.value || iso(TODAY), h: hh + (mm || 0) / 60, dur: +f.dur.value, t, tipo: f.tipo.value, resp: f.resp.value };
  W.ST.eventos.push(ev); persist(); closeModal(); render(); toast('Compromisso agendado');
  if (f.g && f.g.checked) { try { await W.GCal.create(ev); toast('Criado também no Google Agenda'); render(); } catch (er) { toast('Não foi possível criar no Google: ' + er.message, 'warn'); } }
};
A.evOpen = (b) => {
  const e = W.ST.eventos.find(x => x.id === b.dataset.id) || (W.GCal && W.GCal.find(b.dataset.id));
  if (!e) return;
  openPop(b, e.t, '<p style="margin:0">' + fDate(e.d) + ' · ' + hm(e.h) + ' · ' + Math.round(e.dur * 60) + ' min' + (e.resp ? '<br><small class="muted">' + esc(socio(e.resp).nome) + '</small>' : '') + '</p>' + (e.tipo === 'google' ? (e.link ? '<a class="btn btn-sm" href="' + esc(e.link) + '" target="_blank" rel="noopener">Abrir no Google Agenda</a>' : '') : '<button class="btn btn-sm btn-danger" data-act="evDel" data-id="' + e.id + '">Excluir compromisso</button>'));
};
A.evDel = (b) => { W.ST.eventos = W.ST.eventos.filter(e => e.id !== b.dataset.id); persist(); closePop(); render(); };
})();
