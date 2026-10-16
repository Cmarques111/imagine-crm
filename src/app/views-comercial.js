/* Atlas · CRM da Imagine · Início, Comercial (funil) e Carteira */
(function(){
const W = window;
W.VIEWS = W.VIEWS || {}; W.AFTER = W.AFTER || {}; W.ACT = W.ACT || {}; W.CHANGE = W.CHANGE || {}; W.DRAWERS = W.DRAWERS || {};
const V = W.VIEWS, A = W.ACT, C = W.CHANGE;
const sIdx = (s) => STAGES.indexOf(s);
const OPEN = ['Leads', 'R1', 'Mapeamento', 'Ativação'];
const leadVal = (l) => +(l.f.valor || l.valor || 0);
W.filled = (r, v) => r.t === 'check' ? v === true : r.t === 'money' ? +v > 0 : v != null && String(v).trim() !== '';

/* ---------- Início ---------- */
V.inicio = () => {
  const S = W.ST, cur = W.calcMeses(1)[0], fat = cur.rec + cur.avl, meta = cur.meta;
  const mrr = S.clientes.filter(c => c.modelo === 'Recorrente').reduce((s, c) => s + c.valor, 0);
  const open = S.leads.filter(l => OPEN.includes(l.stage)), pipe = open.reduce((s, l) => s + leadVal(l), 0);
  const rk = ranking(monthStart()), me = rk.findIndex(r => r.s.id === W.ME);
  const h = new Date().getHours(), hi = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const today = iso(TODAY);
  const ag = S.eventos.filter(e => e.d === today).sort((a, b) => a.h - b.h);
  const hm = (x) => String(Math.floor(x)).padStart(2, '0') + ':' + (x % 1 ? '30' : '00');
  const tasks = S.tarefas.slice().sort((a, b) => a.ok - b.ok || (a.d > b.d ? 1 : -1));
  const funil = STAGES.slice(0, 5).map(s => { const ls = S.leads.filter(l => l.stage === s); return { s, n: ls.length, v: ls.reduce((a, l) => a + leadVal(l), 0) }; });
  const tk = ['Ibovespa', 'S&P 500', 'USD/BRL', 'Petróleo Brent'].map(n => W.mktFind(n)).filter(Boolean);
  return ph('home', TODAY.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), hi + ', ' + (socio(W.ME).nome === 'Você' ? 'sócio' : socio(W.ME).nome.split(' ')[0]), 'Resumo da Imagine Concept hoje.',
      '<button class="btn" data-act="go" data-v="relatorios">' + icon('report', 'ic-sm') + 'Painéis</button><button class="btn btn-primary" data-act="quickNew">' + icon('plus', 'ic-sm') + 'Criar</button>') +
    '<div class="cols c4" style="margin-bottom:16px">' +
      kpi('Faturamento do mês', fBRL(fat), 'Meta ' + fBRL(meta) + ' · ' + Math.round(fat / meta * 100) + '% atingido', '<div class="bar ' + (fat >= meta ? 'pos' : '') + '"><i style="width:' + Math.min(100, fat / meta * 100) + '%"></i></div>') +
      kpi('Receita recorrente mensal', fBRL(mrr), S.clientes.filter(c => c.modelo === 'Recorrente').length + ' contratos mensais ativos') +
      kpi('Pipeline aberto', fBRL(pipe), open.length + ' oportunidades entre Leads e Ativação') +
      kpi('Seus pontos no mês', (rk[me] ? rk[me].v : 0) + ' pts', (me + 1) + 'º lugar entre os sócios', '', '<button class="btn btn-sm btn-ghost" data-act="go" data-v="relatorios" style="height:22px">Ranking</button>') +
    '</div>' +
    '<div class="cols c-main">' +
      '<div class="stack">' +
        cardW('Funil comercial', 'Leads → R1 → Mapeamento → Ativação → Convertido', '<div class="tbl-wrap"><div style="display:grid;grid-template-columns:repeat(5,minmax(110px,1fr));min-width:560px">' + funil.map((f, i) =>
          '<button data-act="go" data-v="comercial" style="background:none;border:0;padding:0;cursor:pointer;color:inherit;text-align:center"><div class="chev" style="' + (i === 0 ? 'clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%);border-radius:8px 0 0 8px;' : '') + (i === 4 ? 'clip-path:polygon(0 0,100% 0,100% 100%,0 100%,14px 50%);border-radius:0 8px 8px 0;margin-right:0;background:#174A3A;' : '') + '">' + f.s + ' <span class="n">(' + f.n + ')</span></div>' +
          '<div style="padding:12px 4px 2px;font-family:var(--f-display);font-size:18px;font-weight:600;color:' + (i === 4 ? 'var(--pos)' : 'var(--sky)') + '" class="num">' + fBRLk(f.v) + '</div></button>').join('') + '</div></div>') +
        cardW('Mercado agora', W.MKT_LIVE ? 'Dados reais · atraso de até 15 min' : 'Valores ilustrativos · demonstração', '<div class="cols c4" style="gap:10px;margin-bottom:12px">' + tk.map(t => '<div data-tk="' + esc(t.s) + '" style="background:var(--panel-2);border-radius:8px;padding:10px 12px"><small class="muted" style="font-size:12px">' + esc(t.s) + '</small><b class="tv mono num" style="display:block;font-size:15px;font-weight:500">' + W.mktVal(t) + '</b><span class="tc num ' + (t.c >= 0 ? 'pos' : 'neg') + '" style="font-size:12px">' + fPct(t.c) + '</span></div>').join('') + '</div>' +
          '<div class="news" style="margin:0 -16px -16px">' + (W.NEWS_LIVE || NEWS).slice(0, 3).map(n => W.newsItem(n)).join('') + '</div>', { tools: '<button class="btn btn-sm btn-ghost" data-act="go" data-v="mercado">Abrir Mercado 24h</button>' }) +
      '</div>' +
      '<div class="stack">' +
        cardW('Agenda de hoje', ag.length + ' compromisso' + (ag.length === 1 ? '' : 's'), ag.length ? ag.map(e => '<div class="ag-i"><time>' + hm(e.h) + '</time><span>' + esc(e.t) + '</span></div>').join('') : '<div class="empty">Nenhum compromisso hoje.</div>', { tools: '<button class="btn btn-sm btn-ghost" data-act="go" data-v="agenda">Semana</button>' }) +
        cardW('Tarefas', tasks.filter(t => !t.ok).length + ' pendentes', tasks.map(t => '<label class="todo ' + (t.ok ? 'done' : '') + '"><input type="checkbox" data-chg="todo" data-id="' + t.id + '"' + (t.ok ? ' checked' : '') + '><span style="flex:1">' + esc(t.t) + '<br><small class="muted">' + (t.d < iso(TODAY) && !t.ok ? '<span class="neg">Atrasada · </span>' : '') + fDateS(t.d) + ' · ' + esc(socio(t.resp).nome) + '</small></span></label>').join('') +
          '<form class="row" data-submit="addTodo" id="todoForm" style="margin-top:10px;flex-wrap:nowrap"><input class="inp" id="todoIn" placeholder="Nova tarefa" aria-label="Nova tarefa"><button class="btn" type="submit">Adicionar</button></form>') +
        cardW('Ranking de sócios', 'Pontuação do mês', rankHTML(monthStart())) +
      '</div>' +
    '</div>';
};
W.AFTER.inicio = () => { const f = $('#todoForm'); if (f) f.onsubmit = (ev) => { ev.preventDefault(); A.addTodo(); }; };
C.todo = (t) => { const x = W.ST.tarefas.find(k => k.id === t.dataset.id); x.ok = t.checked; persist(); render(); };
A.addTodo = () => { const v = $('#todoIn').value.trim(); if (!v) return; W.ST.tarefas.unshift({ id: uid('t'), t: v, ok: false, d: iso(TODAY), resp: W.ME }); persist(); render(); toast('Tarefa adicionada'); };

/* ---------- Comercial ---------- */
function filtered(){
  const U = W.UI.com; let L = W.ST.leads;
  if (U.list === 'design') L = L.filter(l => /Design/.test(l.f.servicoAprovado || l.f.servico || ''));
  if (U.list === 'fin') L = L.filter(l => /Financeiro/.test(l.f.servicoAprovado || l.f.servico || ''));
  if (U.list === 'meus') L = L.filter(l => l.resp === W.ME);
  if (U.resp) L = L.filter(l => l.resp === U.resp);
  if (U.q) { const q = U.q.toLowerCase(); L = L.filter(l => (l.nome + ' ' + l.empresa + ' ' + l.segmento).toLowerCase().includes(q)); }
  return L;
}
function reached(L, i){ return L.filter(l => l.stage === 'Perdido' ? sIdx(l.lostFrom || 'Leads') >= i : sIdx(l.stage) >= i).length; }
function leadCard(l){
  const d = daysSince(l.desde), serv = l.f.servicoAprovado || l.f.servico;
  return '<article class="lc" draggable="true" data-lid="' + l.id + '">' +
    '<div class="lc-top"><span class="lc-grip" aria-hidden="true">' + icon('grip', 'ic-sm') + '</span><button class="lc-name" data-act="openLead" data-id="' + l.id + '">' + esc(l.nome) + '</button>' + av(l.resp) + '</div>' +
    '<div class="lc-co">' + esc(l.empresa) + ' · ' + esc(l.segmento) + '</div>' +
    '<div class="lc-row"><span class="lc-val">' + fBRL(leadVal(l)) + '</span>' + (serv ? servTag(serv) : '<span class="muted">' + esc(l.periodo) + '</span>') + '</div>' +
    '<div class="lc-row"><span class="lc-age ' + (d > 7 && OPEN.includes(l.stage) ? 'old' : '') + '">' + icon('clock', 'ic-sm') + ' ' + (d === 0 ? 'hoje' : d + (d === 1 ? ' dia' : ' dias')) + ' na etapa</span><span>' + (l.stage === 'Perdido' ? esc(l.f.motivo || '') : l.modelo) + '</span></div>' +
    '<select class="inp lc-move" data-chg="moveSel" data-id="' + l.id + '" aria-label="Mover ' + esc(l.nome) + ' para"><option value="">Mover para…</option>' + STAGES.filter(s => s !== l.stage).map(s => '<option>' + s + '</option>').join('') + '</select>' +
  '</article>';
}
V.comercial = () => {
  const U = W.UI.com, L = filtered(), all = W.ST.leads;
  const cnt = { todos: all.length, design: all.filter(l => /Design/.test(l.f.servicoAprovado || l.f.servico || '')).length, fin: all.filter(l => /Financeiro/.test(l.f.servicoAprovado || l.f.servico || '')).length, meus: all.filter(l => l.resp === W.ME).length };
  let body = '';
  if (U.view === 'kanban') {
    body = '<div class="board"><div class="board-in">' + STAGES.map((s, i) => {
      const ls = L.filter(l => l.stage === s), sum = ls.reduce((a, l) => a + leadVal(l), 0);
      const conv = i > 0 && i < 5 ? (reached(L, i - 1) ? Math.round(reached(L, i) / reached(L, i - 1) * 100) : 0) : null;
      return '<div class="stage ' + (s === 'Convertido' ? 'won' : s === 'Perdido' ? 'lost' : '') + '"><div class="chev">' + s + ' <span class="n">(' + ls.length + ')</span></div>' +
        '<div class="stage-sum"><b>' + fBRLk(sum) + '</b><small>' + (conv !== null ? conv + '% vindos de ' + STAGES[i - 1] : s === 'Leads' ? 'Entrada do funil' : s === 'Perdido' ? 'Registre o motivo' : 'Fechados') + '</small></div>' +
        '<div class="drop" data-stage="' + s + '">' + (ls.map(leadCard).join('') || '<div class="empty" style="padding:18px 6px;font-size:12.5px">Arraste um card para cá</div>') + '</div></div>';
    }).join('') + '</div></div>';
  } else {
    body = '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nome</th><th>Empresa</th><th>Etapa</th><th>Serviço</th><th class="r">Valor</th><th>Responsável</th><th class="r">Dias na etapa</th><th>Origem</th></tr></thead><tbody>' +
      L.slice().sort((a, b) => sIdx(a.stage) - sIdx(b.stage)).map(l => '<tr class="click" data-act="openLead" data-id="' + l.id + '"><td><b style="color:var(--sky)">' + esc(l.nome) + '</b></td><td>' + esc(l.empresa) + '</td><td>' + stagePill(l.stage) + '</td><td>' + servTag(l.f.servicoAprovado || l.f.servico) + '</td><td class="r">' + fBRL(leadVal(l)) + '</td><td><span class="who">' + av(l.resp) + esc(socio(l.resp).nome) + '</span></td><td class="r ' + (daysSince(l.desde) > 7 && OPEN.includes(l.stage) ? 'warn' : '') + '">' + daysSince(l.desde) + '</td><td>' + esc(l.f.origem || '—') + '</td></tr>').join('') +
      '</tbody></table></div></div>';
  }
  return ph('funnel', 'Oportunidades', 'Funil Imagine', L.length + ' itens · classificado por etapa · atualizado às ' + nowHM(),
      '<button class="btn" data-act="exportLeads">' + icon('download', 'ic-sm') + 'Exportar CSV</button><button class="btn btn-primary" data-act="newLead">' + icon('plus', 'ic-sm') + 'Novo lead</button>') +
    '<div class="list-tabs" role="tablist">' + [['todos', 'Todos'], ['design', 'Design'], ['fin', 'Financeiro'], ['meus', 'Meus leads']].map(([k, l]) => '<button role="tab" aria-selected="' + (U.list === k) + '" class="' + (U.list === k ? 'on' : '') + '" data-act="comList" data-v="' + k + '">' + l + ' (' + cnt[k] + ')</button>').join('') + '</div>' +
    '<div class="toolbar"><input class="inp" type="search" id="comQ" data-chg="comQ" placeholder="Pesquisar nesta lista…" value="' + esc(U.q) + '" aria-label="Pesquisar leads">' +
      '<select class="inp" style="width:auto;height:34px" data-chg="comResp" aria-label="Responsável"><option value="">Todos os sócios</option>' + SOCIOS.map(s => '<option value="' + s.id + '"' + (U.resp === s.id ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select>' +
      '<span class="sp"></span>' + seg('comView', U.view, [['kanban', icon('kanban', 'ic-sm') + ' Kanban'], ['lista', icon('list', 'ic-sm') + ' Lista']]) + '</div>' + body;
};
W.AFTER.comercial = () => {
  let dragId = null;
  $$('.lc').forEach(c => {
    c.addEventListener('dragstart', (e) => { dragId = c.dataset.lid; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (er) {} });
    c.addEventListener('dragend', () => c.classList.remove('dragging'));
  });
  $$('.drop').forEach(d => {
    d.addEventListener('dragover', (e) => { e.preventDefault(); d.classList.add('over'); });
    d.addEventListener('dragleave', () => d.classList.remove('over'));
    d.addEventListener('drop', (e) => { e.preventDefault(); d.classList.remove('over'); if (dragId) tryMove(dragId, d.dataset.stage); dragId = null; });
  });
  const q = $('#comQ'); if (q && W.UI.com.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
};
A.comList = (b) => { W.UI.com.list = b.dataset.v; render(); };
A.comView = (b) => { W.UI.com.view = b.dataset.v; render(); };
C.comQ = (t, ev) => { if (ev.type !== 'input') return; W.UI.com.q = t.value; render(); };
C.comResp = (t, ev) => { if (ev.type !== 'change') return; W.UI.com.resp = t.value; render(); };
C.moveSel = (t, ev) => { if (ev.type !== 'change' || !t.value) return; tryMove(t.dataset.id, t.value); };
A.openLead = (b) => openDrawer({ type: 'lead', id: b.dataset.id });

W.missingFor = (l, target) => reqFor(target).filter(r => !filled(r, l.f[r.k]));
function tryMove(id, to){
  const l = W.ST.leads.find(x => x.id === id); if (!l || l.stage === to) return;
  const back = to !== 'Perdido' && l.stage !== 'Perdido' && sIdx(to) < sIdx(l.stage);
  const miss = back ? [] : missingFor(l, to);
  if (miss.length) {
    toast('Para ir para ' + to + ', preencha: ' + miss.map(m => m.l).join(', ') + '.', 'warn');
    openDrawer({ type: 'lead', id, target: to });
    return;
  }
  moveLead(l, to);
}
W.moveLead = (l, to) => {
  const from = l.stage, fi = sIdx(from), ti = sIdx(to); let pts = 0;
  if (to === 'Perdido') l.lostFrom = from;
  else if (from !== 'Perdido' && ti > fi) {
    for (let i = fi + 1; i <= ti; i++) {
      const s = STAGES[i];
      if (s === 'Mapeamento') pts += award(l.resp, 'r1', l.empresa);
      if (s === 'Ativação') { pts += award(l.f.simSocio || l.resp, 'map', l.empresa); pts += award(l.f.simSocio || l.resp, 'ativ', l.empresa); }
      if (s === 'Convertido') { pts += award(l.resp, 'conv', l.empresa); createClient(l); }
    }
  }
  l.stage = to; l.desde = iso(TODAY);
  l.hist.unshift({ d: iso(TODAY), txt: 'Movido de ' + from + ' para ' + to + (to === 'Perdido' && l.f.motivo ? ' · motivo: ' + l.f.motivo : '') + (pts ? ' · +' + pts + ' pts' : ''), by: W.ME });
  persist(); render(); if (W.UI.drawer) renderDrawer();
  toast(l.nome + ' agora está em ' + to + (pts ? ' · +' + pts + ' pontos para ' + socio(l.resp).nome : ''));
};
function createClient(l){
  if (W.ST.clientes.some(c => c.nome === l.empresa)) return;
  const sv = l.f.servicoAprovado || l.f.servico || 'Design';
  W.ST.clientes.unshift({ id: uid('c'), nome: l.empresa, segmento: l.segmento, servicos: sv === 'Design + Financeiro' ? ['Design', 'Financeiro'] : [sv], modelo: l.modelo, valor: leadVal(l), desde: iso(TODAY), resp: l.resp, saude: 'Saudável', cor: ['#0E2152', '#8FB0FF', '#F2F4F8'], fontes: ['Archivo', 'IBM Plex Sans'], tom: '' });
}

function fieldInput(r, v, attr){
  const id = 'lf_' + r.k;
  const base = ' id="' + id + '" ' + attr + '="' + r.k + '"';
  let inp;
  if (r.t === 'select') inp = '<select' + base + '><option value="">Selecione…</option>' + r.o.map(o => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
  else if (r.t === 'socio') inp = '<select' + base + '><option value="">Selecione…</option>' + SOCIOS.map(s => '<option value="' + s.id + '"' + (s.id === v ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select>';
  else if (r.t === 'textarea') inp = '<textarea' + base + '>' + esc(v || '') + '</textarea>';
  else if (r.t === 'date') inp = '<input type="date"' + base + ' value="' + esc(v || '') + '">';
  else if (r.t === 'money') inp = '<input inputmode="decimal"' + base + ' value="' + (v ? fNum(+v, 2) : '') + '" placeholder="0,00">';
  else if (r.t === 'check') return '<label class="chk' + (v ? '' : ' miss') + '" for="' + id + '"><input type="checkbox"' + base + (v ? ' checked' : '') + '>' + esc(r.l) + '</label>';
  else inp = '<input' + base + ' value="' + esc(v || '') + '">';
  return '<label class="fld req' + (filled(r, v) ? '' : ' miss') + '" for="' + id + '"><span>' + esc(r.l) + '</span>' + inp + '</label>';
}
W.DRAWERS.lead = (d) => {
  const l = W.ST.leads.find(x => x.id === d.id); if (!l) return '';
  const ci = sIdx(l.stage);
  const next = d.target || (l.stage === 'Perdido' ? null : STAGES[Math.min(ci + 1, 4)]);
  const showNext = next && next !== l.stage;
  const miss = showNext ? missingFor(l, next) : [];
  const nextReq = showNext ? (next === 'Perdido' ? REQ.Perdido : (REQ[next] || [])) : [];
  const allReq = reqFor(l.stage === 'Perdido' ? (l.lostFrom || 'Leads') : l.stage).filter(r => !nextReq.some(n => n.k === r.k));
  const req2 = showNext ? reqFor(next).filter(r => !filled(r, l.f[r.k]) && !nextReq.some(n => n.k === r.k)) : [];
  return '<div class="dr-h"><div style="flex:1;min-width:0"><div class="eyebrow">Oportunidade · ' + esc(l.empresa) + '</div><h2>' + esc(l.nome) + '</h2><div class="row" style="margin-top:8px">' + stagePill(l.stage) + servTag(l.f.servicoAprovado || l.f.servico) + '<span class="muted" style="font-size:12.5px">' + fBRL(leadVal(l)) + ' · ' + esc(socio(l.resp).nome) + '</span></div></div><button class="ibtn" data-act="closeDrawer" aria-label="Fechar">' + icon('x') + '</button></div>' +
  '<div class="dr-b">' +
    '<div class="path">' + STAGES.slice(0, 5).map((s, i) => '<span class="' + (l.stage === 'Perdido' ? (i <= sIdx(l.lostFrom || 'Leads') ? 'done' : '') : i < ci ? 'done' : i === ci ? 'cur' : '') + '">' + s + '</span>').join('') + '</div>' +
    (showNext ? '<div class="req-box"><h4>' + (next === 'Perdido' ? 'Para marcar como perdido' : 'Para avançar para ' + next) + (miss.length ? ' · faltam ' + miss.length : ' · tudo pronto') + '</h4>' +
      (next === 'Ativação' ? '<p class="muted" style="margin:0;font-size:12.5px">A Ativação só é liberada com o sim verbal do cliente registrado.</p>' : '') +
      req2.concat(nextReq).map(r => fieldInput(r, l.f[r.k], 'data-lf')).join('') +
      '<div class="row"><button class="btn btn-primary" data-act="advance" data-to="' + next + '"' + (miss.length ? ' disabled' : '') + '>' + (next === 'Perdido' ? 'Marcar como perdido' : 'Mover para ' + next) + '</button>' + (d.target ? '<button class="btn btn-ghost" data-act="clearTarget">Cancelar</button>' : '') + '</div></div>' : '') +
    '<div><p class="sec-t">Dados do lead</p><div class="grid-f">' +
      '<label class="fld"><span>Nome do contato</span><input data-lb="nome" value="' + esc(l.nome) + '"></label>' +
      '<label class="fld"><span>Empresa</span><input data-lb="empresa" value="' + esc(l.empresa) + '"></label>' +
      '<label class="fld"><span>Segmento</span><input data-lb="segmento" value="' + esc(l.segmento) + '"></label>' +
      '<label class="fld"><span>Valor estimado (R$)</span><input data-lb="valor" inputmode="decimal" value="' + fNum(l.valor, 2) + '"></label>' +
      '<label class="fld"><span>Responsável</span><select data-lb="resp">' + SOCIOS.map(s => '<option value="' + s.id + '"' + (s.id === l.resp ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select></label>' +
      '<label class="fld"><span>Modelo</span><select data-lb="modelo">' + ['Recorrente', 'Avulso'].map(m => '<option' + (m === l.modelo ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      '<label class="fld"><span>Melhor horário</span><select data-lb="periodo">' + ['Manhã · até 12h', 'Almoço · 12h às 13h30', 'Tarde · até 18h', 'Noite · após 18h'].map(m => '<option' + (m === l.periodo ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      '<label class="fld"><span>Criado em</span><input value="' + fDate(l.criado) + '" disabled></label>' +
    '</div></div>' +
    (allReq.length ? '<div><p class="sec-t">Campos do funil já registrados</p><div class="stack" style="gap:12px">' + allReq.map(r => fieldInput(r, l.f[r.k], 'data-lf')).join('') + '</div></div>' : '') +
    '<div><p class="sec-t">Histórico</p><form class="row" data-submit="addNote" id="noteForm" style="flex-wrap:nowrap;margin-bottom:14px"><input class="inp" id="noteIn" placeholder="Registrar contato, ligação ou observação…" aria-label="Nova anotação"><button class="btn" type="submit">Registrar</button></form><div class="tl">' +
      l.hist.map(h => '<div class="tl-i"><span class="tl-d"></span><div><div class="tl-t">' + esc(h.txt) + '</div><div class="tl-m">' + fDate(h.d) + ' · ' + esc(socio(h.by).nome) + '</div></div></div>').join('') + '</div></div>' +
  '</div>' +
  '<div class="dr-f">' + (l.stage !== 'Perdido' ? '<button class="btn btn-danger" data-act="loseLead">Marcar como perdido</button>' : '<button class="btn" data-act="reopenLead">Reabrir em ' + esc(l.lostFrom || 'Leads') + '</button>') + '<span class="sp"></span><button class="btn" data-act="closeDrawer">Fechar</button></div>';
};
document.addEventListener('change', (ev) => {
  const t = ev.target; if (!t.closest('#drawer') || !W.UI.drawer || W.UI.drawer.type !== 'lead') return;
  const l = W.ST.leads.find(x => x.id === W.UI.drawer.id); if (!l) return;
  if (t.dataset.lf) { const r = [].concat(...Object.values(REQ)).find(x => x.k === t.dataset.lf); l.f[t.dataset.lf] = r && r.t === 'check' ? t.checked : r && r.t === 'money' ? pNum(t.value) : t.value; }
  else if (t.dataset.lb) { l[t.dataset.lb] = t.dataset.lb === 'valor' ? pNum(t.value) : t.value; }
  else return;
  persist(); renderDrawer(); render();
});
A.advance = (b) => { const l = W.ST.leads.find(x => x.id === W.UI.drawer.id); W.UI.drawer.target = null; moveLead(l, b.dataset.to); };
A.clearTarget = () => { W.UI.drawer.target = null; renderDrawer(); };
A.loseLead = () => { W.UI.drawer.target = 'Perdido'; renderDrawer(); $('#drawer .dr-b').scrollTop = 0; };
A.reopenLead = () => { const l = W.ST.leads.find(x => x.id === W.UI.drawer.id); moveLead(l, l.lostFrom || 'Leads'); };
A.addNote = () => {
  const v = $('#noteIn').value.trim(); if (!v) return;
  const l = W.ST.leads.find(x => x.id === W.UI.drawer.id); l.hist.unshift({ d: iso(TODAY), txt: v, by: W.ME }); persist(); renderDrawer();
};
document.addEventListener('submit', (ev) => {
  const f = ev.target; if (f.id === 'noteForm') { ev.preventDefault(); A.addNote(); }
});
A.newLead = () => {
  openModal('Novo lead', '<form id="leadForm" data-submit="saveLead" class="stack" style="gap:12px"><div class="grid-f">' +
    '<label class="fld req"><span>Nome do contato</span><input name="nome" required></label>' +
    '<label class="fld req"><span>Empresa</span><input name="empresa" required></label>' +
    '<label class="fld"><span>Segmento</span><input name="segmento" placeholder="Ex.: Saúde, Varejo"></label>' +
    '<label class="fld"><span>Valor estimado (R$)</span><input name="valor" inputmode="decimal" placeholder="0,00"></label>' +
    '<label class="fld"><span>Contato</span><input name="contato" placeholder="Telefone ou e-mail"></label>' +
    '<label class="fld"><span>Origem</span><select name="origem"><option value="">Selecione…</option>' + ORIGENS.map(o => '<option>' + o + '</option>').join('') + '</select></label>' +
    '<label class="fld"><span>Serviço de interesse</span><select name="servico"><option value="">Ainda não definido</option>' + SERVICOS.map(o => '<option>' + o + '</option>').join('') + '</select></label>' +
    '<label class="fld"><span>Responsável</span><select name="resp">' + SOCIOS.map(s => '<option value="' + s.id + '"' + (s.id === W.ME ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select></label>' +
    '</div><button type="submit" hidden></button></form>',
    '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveLeadBtn">Criar lead</button>');
};
A.saveLeadBtn = () => A.saveLead($('#leadForm'));
A.saveLead = (f) => {
  const g = (n) => f.elements[n].value.trim();
  if (!g('nome') || !g('empresa')) { toast('Preencha nome e empresa.', 'warn'); return; }
  const fx = {}; if (g('contato')) fx.contato = g('contato'); if (g('origem')) fx.origem = g('origem'); if (g('servico')) fx.servico = g('servico');
  const l = { id: uid('l'), nome: g('nome'), empresa: g('empresa'), segmento: g('segmento') || 'Não informado', resp: g('resp'), stage: 'Leads', desde: iso(TODAY), criado: iso(TODAY), valor: pNum(g('valor')), periodo: 'Tarde · até 18h', modelo: 'Avulso', f: fx, hist: [{ d: iso(TODAY), txt: 'Lead criado' + (fx.origem ? ' · origem ' + fx.origem : ''), by: 's1' }] };
  if (fx.origem === 'Indicação') award(l.resp, 'indic', l.empresa);
  W.ST.leads.unshift(l); persist(); closeModal(); render(); toast('Lead criado em Leads');
};
A.exportLeads = () => {
  const rows = [['Nome', 'Empresa', 'Segmento', 'Etapa', 'Valor', 'Responsável', 'Origem', 'Serviço', 'Dias na etapa']].concat(filtered().map(l => [l.nome, l.empresa, l.segmento, l.stage, leadVal(l), socio(l.resp).nome, l.f.origem || '', l.f.servicoAprovado || l.f.servico || '', daysSince(l.desde)]));
  const csv = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
  saveFile('funil-imagine.csv', new Blob([csv], { type: 'text/csv' }));
};

/* ---------- Carteira ---------- */
V.carteira = () => {
  const Cl = W.ST.clientes, rec = Cl.filter(c => c.modelo === 'Recorrente');
  const mrr = rec.reduce((s, c) => s + c.valor, 0), tick = Cl.length ? Cl.reduce((s, c) => s + c.valor, 0) / Cl.length : 0;
  const risk = Cl.filter(c => c.saude !== 'Saudável');
  return ph('wallet', 'Contas', 'Carteira de clientes', Cl.length + ' clientes ativos', '<button class="btn" data-act="go" data-v="comercial">' + icon('funnel', 'ic-sm') + 'Ver funil</button>') +
    '<div class="cols c4" style="margin-bottom:16px">' +
      kpi('Clientes ativos', Cl.length, rec.length + ' recorrentes · ' + (Cl.length - rec.length) + ' avulsos') +
      kpi('Receita recorrente mensal', fBRL(mrr), 'Soma dos contratos mensais') +
      kpi('Ticket médio', fBRL(tick), 'Por cliente da carteira') +
      kpi('Precisam de atenção', risk.length, risk.map(c => esc(c.nome)).join(', ') || 'Nenhum') +
    '</div>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Segmento</th><th>Serviços</th><th>Modelo</th><th class="r">Valor</th><th>Cliente desde</th><th>Responsável</th><th>Saúde da conta</th></tr></thead><tbody>' +
    Cl.map(c => '<tr class="click" data-act="openClient" data-id="' + c.id + '"><td><span class="who"><span class="kit-logo" style="width:30px;height:30px;font-size:11px;border-radius:7px;background:' + c.cor[0] + ';color:' + c.cor[1] + '">' + esc(c.nome.split(' ').map(w => w[0]).slice(0, 2).join('')) + '</span><b>' + esc(c.nome) + '</b></span></td><td>' + esc(c.segmento) + '</td><td><span class="row" style="gap:4px">' + c.servicos.map(servTag).join('') + '</span></td><td>' + c.modelo + '</td><td class="r">' + fBRL(c.valor) + (c.modelo === 'Recorrente' ? '<small class="muted">/mês</small>' : '') + '</td><td>' + fDate(c.desde) + '</td><td><span class="who">' + av(c.resp) + esc(socio(c.resp).nome) + '</span></td><td>' + statusPill(c.saude) + '</td></tr>').join('') +
    '</tbody></table></div></div>';
};
A.openClient = (b) => openDrawer({ type: 'cliente', id: b.dataset.id });
W.DRAWERS.cliente = (d) => {
  const c = W.ST.clientes.find(x => x.id === d.id); if (!c) return '';
  const rec = W.ST.receber.filter(r => r.quem === c.nome), des = W.ST.design.filter(x => x.cliente === c.nome);
  const news = (W.NEWS_LIVE || NEWS).filter(n => (n.seg || []).includes(c.segmento)).slice(0, 5);
  return '<div class="dr-h"><span class="kit-logo" style="width:46px;height:46px;font-size:16px;background:' + c.cor[0] + ';color:' + c.cor[1] + '">' + esc(c.nome.split(' ').map(w => w[0]).slice(0, 2).join('')) + '</span><div style="flex:1;min-width:0"><div class="eyebrow">Cliente · ' + esc(c.segmento) + '</div><h2>' + esc(c.nome) + '</h2></div><button class="ibtn" data-act="closeDrawer" aria-label="Fechar">' + icon('x') + '</button></div>' +
  '<div class="dr-b">' +
    '<dl class="kv"><dt>Serviços</dt><dd><span class="row" style="gap:4px">' + c.servicos.map(servTag).join('') + '</span></dd><dt>Modelo</dt><dd>' + c.modelo + ' · ' + fBRL(c.valor) + (c.modelo === 'Recorrente' ? ' por mês' : '') + '</dd><dt>Cliente desde</dt><dd>' + fDate(c.desde) + '</dd><dt>Responsável</dt><dd>' + esc(socio(c.resp).nome) + '</dd></dl>' +
    '<label class="fld"><span>Saúde da conta</span><select data-cl="saude">' + ['Saudável', 'Atenção', 'Risco'].map(s => '<option' + (s === c.saude ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label>' +
    '<div><p class="sec-t">Financeiro</p>' + (rec.length ? '<table class="tbl"><tbody>' + rec.map(r => '<tr><td>' + esc(r.desc) + '<br><small class="muted">Vence ' + fDate(r.venc) + '</small></td><td class="r">' + fBRL(r.valor) + '</td><td>' + statusPill(r.status) + '</td></tr>').join('') + '</tbody></table>' : '<p class="muted" style="margin:0">Sem lançamentos no período.</p>') + '</div>' +
    '<div><p class="sec-t">Projetos de design</p>' + (des.length ? des.map(x => '<div class="ag-i" style="grid-template-columns:minmax(0,1fr) auto"><span>' + esc(x.peca) + '<br><small class="muted">Prazo ' + fDate(x.prazo) + '</small></span><span class="pill p-sky nodot">' + x.etapa + '</span></div>').join('') : '<p class="muted" style="margin:0">Nenhum projeto em andamento.</p>') + '</div>' +
    '<div><p class="sec-t">Identidade visual</p><div class="row">' + c.cor.map(x => '<span style="width:36px;height:36px;border-radius:8px;background:' + x + ';border:1px solid rgba(255,255,255,.1)" title="' + x + '"></span>').join('') + '<span class="muted" style="font-size:12.5px">' + c.fontes.join(' · ') + '</span></div></div>' +
    (news.length ? '<div><p class="sec-t">Notícias que afetam este cliente</p><div class="news card">' + news.map(n => W.newsItem(n, true)).join('') + '</div></div>' : '') +
  '</div>' +
  '<div class="dr-f"><button class="btn" data-act="clientDesign" data-id="' + c.id + '">' + icon('palette', 'ic-sm') + 'Criar design com o kit</button><button class="btn btn-ghost" data-act="closeDrawer">Fechar</button></div>';
};
document.addEventListener('change', (ev) => {
  const t = ev.target; if (!t.dataset.cl || !W.UI.drawer || W.UI.drawer.type !== 'cliente') return;
  const c = W.ST.clientes.find(x => x.id === W.UI.drawer.id); c[t.dataset.cl] = t.value; persist(); render(); renderDrawer();
});
A.clientDesign = (b) => { closeDrawer(); Editor.newFromKit(b.dataset.id, 'post', 't1'); W.UI.des.sub = 'editor'; go('design'); };
})();
