/* Estúdio Imagine · área separada do CRM para artes, apresentações e marcas */
(function(){
const W = window;
const A = W.ACT = W.ACT || {}, C = W.CHANGE = W.CHANGE || {};
const DSTAGES = ['Briefing', 'Criação', 'Revisão', 'Aprovado', 'Entregue'];
const U = () => W.UI.des;
const root = () => $('#studio');
const docs = () => (W.ST.docs = W.ST.docs || []);
const cliKit = (nome) => W.ST.clientes.find(c => c.nome === nome);
const ago = (t) => { const s = Math.max(0, (Date.now() - (t || 0)) / 1000); if (s < 60) return 'agora'; if (s < 3600) return 'há ' + Math.floor(s / 60) + ' min'; if (s < 86400) return 'há ' + Math.floor(s / 3600) + ' h'; const d = Math.floor(s / 86400); return d === 1 ? 'ontem' : 'há ' + d + ' dias'; };
const NAV = [['home', 'home', 'Início'], ['modelos', 'layout', 'Modelos'], ['projetos', 'kanban', 'Produção'], ['marcas', 'brand', 'Marcas'], ['mood', 'image', 'Moodboards'], ['vitrine', 'star', 'Vitrine']];
const CREATE = [['apres', 'Apresentação'], ['post', 'Post'], ['story', 'Story'], ['retrato', 'Carrossel'], ['a4', 'Documento'], ['linkedin', 'Banner'], ['cartao', 'Cartão'], ['youtube', 'Capa de vídeo']];
const kitPickHTML = (k) => '<label class="st-kit">' + icon('brand', 'ic-sm') + '<span>Kit</span><select data-chg="stKit" aria-label="Kit de marca dos modelos">' + SX.kits().map(x => '<option value="' + x.id + '"' + (x.id === k ? ' selected' : '') + '>' + esc(x.nome) + '</option>').join('') + '</select></label>';
const shape = (fmt) => { const f = SX.FORMATS[fmt]; const r = f.w / f.h, w = r >= 1 ? 30 : Math.round(30 * r), h = r >= 1 ? Math.round(30 / r) : 30; return '<i class="st-shape" style="width:' + w + 'px;height:' + Math.max(8, h) + 'px"></i>'; };

/* ---------- Abrir e fechar ---------- */
function show() {
  const R = root(); if (!R) return;
  R.hidden = false; document.body.classList.add('in-studio');
  if (!U().sub) U().sub = 'home';
  render();
}
function hide() { const R = root(); if (!R) return; R.hidden = true; document.body.classList.remove('in-studio'); }
function render() {
  const R = root(); if (!R || R.hidden) return;
  if (U().sub === 'editor') {
    if (!Editor.doc) { U().sub = 'home'; return render(); }
    if (!R.querySelector('#sxEd') || R.dataset.doc !== Editor.doc.id) { R.innerHTML = '<div class="st-edroot" id="stEd"></div>'; R.dataset.doc = Editor.doc.id; Editor.mount($('#stEd')); }
    return;
  }
  R.dataset.doc = '';
  const keep = R.querySelector('.st-main') ? R.querySelector('.st-main').scrollTop : 0;
  R.innerHTML = '<div class="st-shell"><aside class="st-side">' +
    '<div class="st-brand">' + markSVG(34, '#F2F4F8', '#8FB0FF', 'Imagine Concept') + '<span><b>Estúdio</b><small>Imagine Concept</small></span></div>' +
    '<button class="st-create" data-act="stCreate">' + icon('plus', 'ic-sm') + 'Criar design</button>' +
    '<nav class="st-nav" aria-label="Estúdio">' + NAV.map(([k, ic, l]) => '<button class="' + (U().sub === k ? 'on' : '') + '" data-act="stNav" data-v="' + k + '">' + icon(ic, 'ic-sm') + '<span>' + l + '</span>' + (k === 'projetos' ? '<em>' + W.ST.design.filter(p => p.etapa !== 'Entregue').length + '</em>' : '') + '</button>').join('') + '</nav>' +
    '<span class="sp"></span><button class="st-back" data-act="go" data-v="inicio">' + icon('chevL', 'ic-sm') + 'Voltar ao CRM</button></aside>' +
    '<main class="st-main" id="stMain">' + ({ home, modelos, projetos, marcas, mood, vitrine }[U().sub] || home)() + '</main></div>';
  const m = R.querySelector('.st-main'); if (m) m.scrollTop = keep;
  if (U().sub === 'projetos') bindProj();
}

/* ---------- Início do estúdio ---------- */
function docCard(d) {
  const f = SX.fmtOf(d), pg = d.pages[0], w = 260, h = 150;
  return '<article class="st-dc"><button class="st-dcpv" data-act="stOpen" data-id="' + d.id + '" aria-label="Abrir ' + esc(d.nome) + '">' + (pg ? SX.preview(pg, d, w, h) : '') + '</button>' +
    '<div class="st-dcb"><div style="min-width:0"><b title="' + esc(d.nome) + '">' + esc(d.nome) + '</b><small>' + esc(f.l) + ' · ' + d.pages.length + ' pág. · editado ' + ago(d.upd) + '</small></div>' +
    '<button class="ibtn" data-act="stDocMenu" data-id="' + d.id + '" aria-label="Opções">' + icon('dots', 'ic-sm') + '</button></div></article>';
}
function deckCard(d, kid) {
  const K = SX.roles(SX.kitOf(kid)), f = SX.FORMATS.apres;
  const key = 'deck|' + kid + '|' + d.id;
  W._stPv = W._stPv || new Map();
  if (!W._stPv.has(key)) { const pgs = d.pages.slice(0, 4).map(([k, t]) => SX.makeLayout(k, K, f, t)); SX.measure(f, pgs); W._stPv.set(key, '<span class="st-mosaic">' + SX.preview(pgs[0], f, 300, 169) + '<span class="st-mos3">' + pgs.slice(1).map(p => SX.preview(p, f, 96, 54)).join('') + '</span></span>'); }
  return '<button class="st-deck" data-act="stDeck" data-id="' + d.id + '">' + W._stPv.get(key) + '<span><b>' + esc(d.nome) + '</b><small>' + d.pages.length + ' páginas · ' + esc(d.desc) + '</small></span></button>';
}
function home() {
  const q = (U().q || '').toLowerCase(), g = U().grp || 'all', kid = U().tkit || 'ic';
  const list = docs().filter(d => (!q || d.nome.toLowerCase().includes(q)) && (g === 'all' || SX.fmtOf(d).g === g)).sort((a, b) => (b.upd || 0) - (a.upd || 0));
  const prod = W.ST.design.filter(p => p.etapa !== 'Entregue').sort((a, b) => a.prazo > b.prazo ? 1 : -1).slice(0, 5);
  const h = new Date().getHours();
  return '<section class="st-hero"><div class="st-hero-in"><span class="st-eyebrow">' + (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ' · Estúdio Imagine</span><h1>O que vamos criar hoje?</h1>' +
    '<label class="st-search">' + icon('zoomIn', 'ic-sm') + '<input type="search" data-chg="stQ" value="' + esc(U().q || '') + '" placeholder="Buscar nos seus designs" aria-label="Buscar designs"></label>' +
    '<div class="st-formats">' + CREATE.map(([k, l]) => '<button class="st-fmt" data-act="stNew" data-v="' + k + '"><span class="st-fmtic">' + shape(k) + '</span><b>' + l + '</b><small>' + SX.FORMATS[k].w + '×' + SX.FORMATS[k].h + '</small></button>').join('') +
    '<button class="st-fmt" data-act="stCustom"><span class="st-fmtic">' + icon('custom') + '</span><b>Personalizado</b><small>Qualquer tamanho</small></button></div></div></section>' +
    '<section class="st-sec"><div class="st-sech"><h2>Comece com uma apresentação pronta</h2>' + kitPickHTML(kid) + '<button class="btn btn-sm btn-ghost" data-act="stNav" data-v="modelos">Ver todos os modelos</button></div>' +
    '<div class="st-row">' + SX.DECKS.map(d => deckCard(d, kid)).join('') + '</div></section>' +
    '<div class="st-cols"><section class="st-sec"><div class="st-sech"><h2>Seus designs</h2><div class="seg" role="group">' + [['all', 'Todos'], ['apres', 'Apresentações'], ['social', 'Redes sociais'], ['doc', 'Documentos'], ['custom', 'Personalizados']].map(([k, l]) => '<button data-act="stGrp" data-v="' + k + '" class="' + (g === k ? 'on' : '') + '">' + l + '</button>').join('') + '</div></div>' +
    (list.length ? '<div class="st-docs">' + list.map(docCard).join('') + '</div>' : '<div class="st-empty">' + icon('palette') + '<b>' + (q ? 'Nenhum design encontrado para “' + esc(q) + '”.' : 'Nenhum design ainda') + '</b><span>Escolha um formato acima ou comece com uma apresentação pronta.</span></div>') + '</section>' +
    '<aside class="st-sec st-aside"><div class="st-sech"><h2>Em produção</h2><button class="btn btn-sm btn-ghost" data-act="stNav" data-v="projetos">Quadro</button></div>' +
    (prod.length ? prod.map(p => { const late = p.prazo < iso(TODAY); return '<div class="st-prod"><span class="st-dot" style="background:' + ((cliKit(p.cliente) || {}).cor || ['', '#8FB0FF'])[1] + '"></span><div><b>' + esc(p.peca) + '</b><small>' + esc(p.cliente) + ' · ' + p.etapa + '</small></div><span class="' + (late ? 'neg' : 'muted') + '">' + fDateS(p.prazo) + '</span>' + (p.doc && docs().some(d => d.id === p.doc) ? '<button class="btn btn-sm" data-act="stOpen" data-id="' + p.doc + '">Abrir</button>' : '') + '</div>'; }).join('') : '<div class="st-empty sm">Nada em produção.</div>') +
    '<div class="st-tips"><b>Atalhos do editor</b><span><kbd>T</kbd> texto · <kbd>R</kbd> retângulo · <kbd>C</kbd> círculo · <kbd>L</kbd> linha</span><span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> nova página · <kbd>Ctrl</kbd>+<kbd>D</kbd> duplicar</span><span><kbd>Alt</kbd> + arrastar duplica · <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>P</kbd> apresentar</span></div></aside></div>';
}

/* ---------- Modelos ---------- */
function modelos() {
  const kid = U().tkit || 'ic', K = SX.roles(SX.kitOf(kid)), f = SX.FORMATS.apres;
  W._stPv = W._stPv || new Map();
  const pv = (key, make, fmt, w, h) => { if (!W._stPv.has(key)) { const pg = make(); SX.measure(fmt, [pg]); W._stPv.set(key, SX.preview(pg, fmt, w, h)); } return W._stPv.get(key); };
  return '<div class="st-pageh"><div><span class="st-eyebrow">Biblioteca</span><h1>Modelos</h1><p>Todos os modelos usam as cores e fontes do kit escolhido.</p></div>' + kitPickHTML(kid) + '</div>' +
    '<section class="st-sec"><div class="st-sech"><h2>Apresentações completas</h2></div><div class="st-grid3">' + SX.DECKS.map(d => deckCard(d, kid)).join('') + '</div></section>' +
    '<section class="st-sec"><div class="st-sech"><h2>Layouts de slide</h2><span class="muted">Clique para começar uma apresentação a partir do layout</span></div><div class="st-grid4">' +
    Object.entries(SX.LAYOUTS).map(([k, L]) => '<button class="st-lay" data-act="stLayout" data-v="' + k + '">' + pv('lay|' + kid + '|' + k, () => SX.makeLayout(k, K, f), f, 240, 135) + '<span>' + L.nome + '</span></button>').join('') + '</div></section>' +
    '<section class="st-sec"><div class="st-sech"><h2>Redes sociais e documentos</h2></div><div class="st-grid4">' +
    SX.SOCIAL.map(s => { const fm = SX.FORMATS[s.fmt]; return '<button class="st-lay" data-act="stSocial" data-v="' + s.id + '"><div class="st-laybox">' + pv('soc|' + kid + '|' + s.id, () => SX.makeSocial(s, K), fm, 200, 160) + '</div><span>' + esc(s.nome) + ' <small>' + fm.l + '</small></span></button>'; }).join('') + '</div></section>';
}

/* ---------- Produção (quadro de projetos) ---------- */
function projetos() {
  const P = W.ST.design;
  return '<div class="st-pageh"><div><span class="st-eyebrow">Fluxo de criação</span><h1>Produção</h1><p>Do briefing à entrega. Arraste os cartões entre as etapas.</p></div><button class="btn btn-primary" data-act="newProj">' + icon('plus', 'ic-sm') + 'Novo projeto</button></div>' +
    '<div class="board"><div class="board-in" style="grid-auto-columns:minmax(230px,1fr)">' + DSTAGES.map(s => {
      const ls = P.filter(p => p.etapa === s);
      return '<div class="stage ' + (s === 'Entregue' ? 'won' : '') + '"><div class="chev">' + s + ' <span class="n">(' + ls.length + ')</span></div>' +
        '<div class="drop" data-dstage="' + s + '" style="padding-top:12px">' + (ls.map(p => {
          const late = p.etapa !== 'Entregue' && p.prazo < iso(TODAY), k = cliKit(p.cliente), d = p.doc && docs().find(x => x.id === p.doc);
          return '<article class="dcard" draggable="true" data-id="' + p.id + '">' + (d ? '<button class="st-dcmini" data-act="stOpen" data-id="' + d.id + '" aria-label="Abrir arte">' + SX.preview(d.pages[0], d, 200, 90) + '</button>' : '') +
            '<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b style="font-size:13.5px">' + esc(p.peca) + '</b>' + av(p.resp) + '</div>' +
            '<div class="row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:' + (k ? k.cor[1] : '#8FB0FF') + '"></span><span class="muted" style="font-size:12.5px">' + esc(p.cliente) + '</span></div>' +
            '<div class="lc-row"><span class="' + (late ? 'neg' : '') + '">' + icon('calendar', 'ic-sm') + ' ' + fDateS(p.prazo) + (late ? ' · atrasado' : '') + '</span><span class="round-dots" title="Rodadas de revisão: ' + p.rodada + ' de 3">' + [1, 2, 3].map(n => '<i class="' + (n <= p.rodada ? 'on' : '') + '"></i>').join('') + '</span></div>' +
            '<div class="row" style="gap:4px">' + (d ? '' : '<button class="btn btn-sm" data-act="projArt" data-id="' + p.id + '">' + icon('palette', 'ic-sm') + 'Criar arte</button>') + (s === 'Revisão' ? '<button class="btn btn-sm btn-ghost" data-act="addRound" data-id="' + p.id + '">+ Rodada</button>' : '') + '</div>' +
            '<select class="inp lc-move" style="height:30px;font-size:12px" data-chg="projMove" data-id="' + p.id + '" aria-label="Mover projeto"><option value="">Mover para…</option>' + DSTAGES.filter(x => x !== s).map(x => '<option>' + x + '</option>').join('') + '</select>' +
          '</article>';
        }).join('') || '<div class="empty" style="padding:18px 6px;font-size:12.5px">Arraste um projeto para cá</div>') + '</div></div>';
    }).join('') + '</div></div>' +
    '<p class="muted" style="font-size:12.5px;margin-top:10px">Projeto entregue até o prazo soma ' + W.ST.cfg.pts.design + ' pontos para o responsável. As bolinhas marcam até 3 rodadas de revisão.</p>';
}
function bindProj() {
  let id = null;
  $$('#studio .dcard').forEach(c => c.addEventListener('dragstart', (e) => { id = c.dataset.id; try { e.dataTransfer.setData('text/plain', id); } catch (er) {} }));
  $$('#studio .drop[data-dstage]').forEach(d => {
    d.addEventListener('dragover', (e) => { e.preventDefault(); d.classList.add('over'); });
    d.addEventListener('dragleave', () => d.classList.remove('over'));
    d.addEventListener('drop', (e) => { e.preventDefault(); d.classList.remove('over'); if (id) moveProj(id, d.dataset.dstage); id = null; });
  });
}
function moveProj(id, to) {
  const p = W.ST.design.find(x => x.id === id); if (!p || p.etapa === to) return;
  let msg = 'Projeto movido para ' + to;
  if (to === 'Entregue' && p.etapa !== 'Entregue' && iso(TODAY) <= p.prazo) { const pts = award(p.resp, 'design', p.cliente); msg += ' · entregue no prazo, +' + pts + ' pts'; }
  if (to === 'Revisão' && p.rodada < 1) p.rodada = 1;
  p.etapa = to; persist(); render(); toast(msg);
}
C.projMove = (t, ev) => { if (ev.type === 'change' && t.value) moveProj(t.dataset.id, t.value); };
A.addRound = (b) => { const p = W.ST.design.find(x => x.id === b.dataset.id); p.rodada = Math.min(3, p.rodada + 1); persist(); render(); if (p.rodada === 3) toast('Última rodada de revisão incluída no escopo', 'warn'); };
A.projArt = (b) => {
  const p = W.ST.design.find(x => x.id === b.dataset.id), c = cliKit(p.cliente);
  openModal('Criar arte para “' + p.peca + '”', '<p class="muted" style="margin:0">Escolha o formato. A arte já abre com o kit de ' + esc(p.cliente) + ' e fica ligada a este projeto.</p><div class="st-fmtgrid">' + CREATE.map(([k, l]) => '<button class="st-fmt" data-act="projArtGo" data-id="' + p.id + '" data-v="' + k + '"><span class="st-fmtic">' + shape(k) + '</span><b>' + l + '</b></button>').join('') + '</div>', '');
  W._projKit = c ? c.id : 'ic';
};
A.projArtGo = (b) => {
  const p = W.ST.design.find(x => x.id === b.dataset.id), fmt = b.dataset.v;
  const d = Editor.create(fmt, { kit: W._projKit, nome: p.peca + ' · ' + p.cliente, deck: fmt === 'apres' ? SX.DECKS[0] : null });
  p.doc = d.id; persist(); closeModal(); openEditor(d.id);
};
A.newProj = () => openModal('Novo projeto de design', '<form id="projForm" data-submit="saveProj" class="grid-f">' +
  '<label class="fld req"><span>Peça ou entrega</span><input name="peca" required placeholder="Ex.: Posts de dezembro"></label>' +
  '<label class="fld req"><span>Cliente</span><select name="cliente">' + W.ST.clientes.map(c => '<option>' + esc(c.nome) + '</option>').join('') + '</select></label>' +
  '<label class="fld"><span>Prazo</span><input type="date" name="prazo" value="' + dOff(7) + '"></label>' +
  '<label class="fld"><span>Responsável</span><select name="resp">' + SOCIOS.map(s => '<option value="' + s.id + '"' + (s.id === W.ME ? ' selected' : '') + '>' + esc(s.nome) + '</option>').join('') + '</select></label>' +
  '<label class="fld" style="grid-column:1/-1"><span>Arte vinculada (opcional)</span><select name="doc"><option value="">Nenhuma</option>' + docs().map(d => '<option value="' + d.id + '">' + esc(d.nome) + '</option>').join('') + '</select></label><button type="submit" hidden></button></form>',
  '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveProjBtn">Criar projeto</button>');
A.saveProjBtn = () => A.saveProj($('#projForm'));
A.saveProj = (f) => {
  const g = n => f.elements[n].value.trim(); if (!g('peca')) { toast('Informe a peça.', 'warn'); return; }
  W.ST.design.unshift({ id: uid('d'), peca: g('peca'), cliente: g('cliente'), prazo: g('prazo') || dOff(7), resp: g('resp'), etapa: 'Briefing', rodada: 0, doc: g('doc') || null });
  persist(); closeModal(); render(); toast('Projeto criado em Briefing');
};

/* ---------- Marcas ---------- */
const FONTS_ALL = () => SX.FONTS;
function marcas() {
  const own = SX.kitOf('ic');
  const card = (c, isOwn) => '<article class="st-kitcard"><div class="st-kittop" style="background:' + c.c[0] + '">' + (isOwn ? markSVG(52, '#F2F4F8', '#8FB0FF') : '<span class="kit-logo" style="background:' + c.c[1] + ';color:' + c.c[0] + ';font-family:\'' + c.f[0] + '\'">' + esc(SX.initials(c.nome)) + '</span>') + '<b style="font-family:\'' + c.f[0] + '\';color:' + (c.c[2] || '#fff') + '">' + esc(c.nome) + '</b></div>' +
    '<div class="st-kitsw">' + c.c.map(x => '<button data-act="copyHex" data-c="' + x + '" style="background:' + x + '" title="Copiar ' + x + '" aria-label="Copiar cor ' + x + '"></button>').join('') + '</div>' +
    '<div class="st-kitf"><span style="font-family:\'' + c.f[0] + '\';font-size:19px;font-weight:700">' + esc(c.f[0]) + '</span><span class="muted" style="font-family:\'' + (c.f[1] || c.f[0]) + '\'">' + esc(c.f[1] || c.f[0]) + ' · texto</span></div>' +
    '<div class="st-kitact">' + (isOwn ? '<span class="muted" style="font-size:12px">Kit oficial da Imagine</span>' : '<button class="btn btn-sm btn-ghost" data-act="editKit" data-id="' + c.id + '">Editar kit</button>') + '<span class="sp"></span><button class="btn btn-sm" data-act="kitDesign" data-id="' + c.id + '">' + icon('palette', 'ic-sm') + 'Criar com este kit</button></div></article>';
  return '<div class="st-pageh"><div><span class="st-eyebrow">Identidades</span><h1>Marcas</h1><p>Cores, fontes e logos de cada cliente, prontos para usar no editor.</p></div></div>' +
    '<div class="st-kits">' + card(own, true) + SX.kits().slice(1).map(c => card(c, false)).join('') + '</div>';
}
A.copyHex = (b) => { const c = b.dataset.c; try { navigator.clipboard.writeText(c).then(() => toast('Cor ' + c + ' copiada'), () => toast(c)); } catch (e) { toast(c); } };
A.kitDesign = (b) => { openModal('Criar design', '<div class="st-fmtgrid">' + CREATE.map(([k, l]) => '<button class="st-fmt" data-act="kitDesignGo" data-kit="' + b.dataset.id + '" data-v="' + k + '"><span class="st-fmtic">' + shape(k) + '</span><b>' + l + '</b></button>').join('') + '</div>', ''); };
A.kitDesignGo = (b) => { const fmt = b.dataset.v, kit = b.dataset.kit, t = SX.SOCIAL.find(s => s.fmt === fmt); const d = Editor.create(fmt, { kit, deck: fmt === 'apres' ? SX.DECKS[2] : null, tpl: fmt !== 'apres' ? t : null, nome: SX.kitOf(kit).nome + ' · ' + SX.FORMATS[fmt].l }); closeModal(); openEditor(d.id); };
A.editKit = (b) => {
  const c = W.ST.clientes.find(x => x.id === b.dataset.id);
  openModal('Kit de marca · ' + c.nome, '<form id="kitForm" class="stack" style="gap:12px"><div class="grid-f">' + ['Principal (fundo escuro)', 'Destaque', 'Apoio (texto claro)', 'Secundária', 'Extra'].map((l, i) => '<label class="fld"><span>' + l + '</span><input type="color" name="c' + i + '" value="' + SX.toHex(c.cor[i] || (i > 2 ? SX.mix(c.cor[0], c.cor[1], i === 3 ? 0.22 : 0.5) : '#888888')) + '" style="padding:2px;height:40px"></label>').join('') +
    '<label class="fld"><span>Fonte de títulos</span><select name="f0">' + FONTS_ALL().map(f => '<option' + (f === c.fontes[0] ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></label>' +
    '<label class="fld"><span>Fonte de texto</span><select name="f1">' + FONTS_ALL().map(f => '<option' + (f === c.fontes[1] ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></label></div>' +
    '<label class="fld"><span>Tom de voz</span><input name="tom" value="' + esc(c.tom || '') + '"></label></form>',
    '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="saveKit" data-id="' + c.id + '">Salvar kit</button>');
};
A.saveKit = (b) => {
  const c = W.ST.clientes.find(x => x.id === b.dataset.id), f = $('#kitForm');
  c.cor = [0, 1, 2, 3, 4].map(i => f['c' + i].value); c.fontes = [f.f0.value, f.f1.value]; c.tom = f.tom.value.trim();
  W._stPv && W._stPv.clear(); persist(); closeModal(); render(); if (typeof W.render === 'function' && W.UI.tab !== 'design') W.render(); toast('Kit de ' + c.nome + ' atualizado');
};

/* ---------- Moodboards ---------- */
function mood() {
  const k = W.ST.clientes.find(c => c.id === U().kit) || W.ST.clientes[0];
  if (!k) return '<div class="st-empty">Cadastre clientes para criar moodboards.</div>';
  const items = W.ST.mood[k.id] || [];
  return '<div class="st-pageh"><div><span class="st-eyebrow">Referências</span><h1>Moodboards</h1><p>Imagens, cores e notas que guiam cada projeto. As imagens também aparecem nos Uploads do editor.</p></div></div>' +
    '<div class="toolbar"><select class="inp" style="width:auto;height:36px" data-chg="moodKit" aria-label="Cliente do moodboard">' + W.ST.clientes.map(c => '<option value="' + c.id + '"' + (c.id === k.id ? ' selected' : '') + '>' + esc(c.nome) + '</option>').join('') + '</select>' +
    '<span class="sp"></span><label class="btn" for="moodFile">' + icon('upload', 'ic-sm') + 'Enviar imagens</label><input type="file" id="moodFile" accept="image/*" multiple hidden data-chg="moodFile">' +
    '<label class="btn" style="gap:6px">' + icon('palette', 'ic-sm') + 'Cor <input type="color" data-chg="moodColor" value="#8FB0FF" aria-label="Adicionar cor" style="width:26px;height:22px;border:0;background:none;padding:0"></label>' +
    '<button class="btn" data-act="moodNote">' + icon('note', 'ic-sm') + 'Nota</button></div>' +
    (items.length ? '<div class="mood">' + items.map(m => '<div class="mtile">' +
      (m.t === 'img' ? '<img src="' + SX.src(m.v) + '" alt="Referência visual">' : m.t === 'cor' ? '<div class="mswatch" style="background:' + m.v + ';color:' + (SX.lum(m.v) > 0.55 ? '#111' : '#fff') + '">' + esc(m.v.toUpperCase()) + '</div>' : '<div class="mnote">' + esc(m.v) + '</div>') +
      (m.cap ? '<div class="cap">' + esc(m.cap) + '</div>' : '') +
      '<button class="rm" data-act="moodRm" data-id="' + m.id + '" aria-label="Remover">' + icon('x', 'ic-sm') + '</button></div>').join('') + '</div>'
      : '<div class="st-empty">' + icon('image') + '<b>O moodboard de ' + esc(k.nome) + ' está vazio</b><span>Envie imagens, cores ou notas de referência.</span></div>');
}
W.lum = SX.lum;
C.moodKit = (t, ev) => { if (ev.type === 'change') { U().kit = t.value; render(); } };
C.moodColor = (t, ev) => { if (ev.type !== 'change') return; const k = U().kit || (W.ST.clientes[0] || {}).id; (W.ST.mood[k] = W.ST.mood[k] || []).unshift({ id: uid('m'), t: 'cor', v: t.value, cap: '' }); persist(); render(); };
C.moodFile = async (t, ev) => {
  if (ev.type !== 'change') return; const k = U().kit || (W.ST.clientes[0] || {}).id; const files = [...t.files]; t.value = '';
  for (const f of files) { try { const im = await readImage(f, 1600); (W.ST.mood[k] = W.ST.mood[k] || []).unshift({ id: uid('m'), t: 'img', v: SX.asset(im.src), w: im.w, h: im.h, cap: f.name }); } catch (e) {} }
  persist(); render(); toast(files.length + ' referência' + (files.length > 1 ? 's adicionadas' : ' adicionada'));
};
A.moodNote = () => openModal('Nova nota no moodboard', '<label class="fld"><span>Texto</span><textarea id="moodNoteIn" style="min-height:120px" placeholder="Ex.: tipografia condensada, fotos em preto e branco…"></textarea></label>', '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="moodNoteSave">Adicionar</button>');
A.moodNoteSave = () => { const v = $('#moodNoteIn').value.trim(); if (!v) return; const k = U().kit || (W.ST.clientes[0] || {}).id; (W.ST.mood[k] = W.ST.mood[k] || []).unshift({ id: uid('m'), t: 'nota', v }); persist(); closeModal(); render(); };
A.moodRm = (b) => { const k = U().kit || (W.ST.clientes[0] || {}).id; W.ST.mood[k] = (W.ST.mood[k] || []).filter(m => m.id !== b.dataset.id); persist(); render(); };

/* ---------- Vitrine ---------- */
function vthumbHTML(v) {
  if (v.img) return '<img src="' + SX.src(v.img) + '" alt="">';
  const k = W.ST.clientes.find(c => c.id === v.kit) || { cor: ['#0E2152', '#8FB0FF', '#F2F4F8'], fontes: ['Archivo', 'IBM Plex Sans'], nome: v.cliente };
  const [a, b, c] = k.cor, f = k.fontes[0], ini = SX.initials(k.nome);
  return {
    bold: '<div style="position:absolute;inset:0;background:' + a + '"></div><div style="position:absolute;right:-12%;bottom:-20%;width:70%;aspect-ratio:1;border-radius:50%;background:' + b + '"></div><div style="position:absolute;left:9%;top:14%;font:400 64px/0.9 \'' + f + '\',sans-serif;color:' + c + ';letter-spacing:1px">' + esc(k.nome.split(' ')[0].toUpperCase()) + '</div><div style="position:absolute;left:9%;bottom:12%;width:30%;height:5px;background:' + b + '"></div>',
    serif: '<div style="position:absolute;inset:0;background:' + c + '"></div><div style="position:absolute;inset:9%;border:1.5px solid ' + a + '"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:400 38px/1.05 \'' + f + '\',serif;color:' + a + '">' + esc(k.nome) + '</div><div style="position:absolute;left:50%;bottom:16%;transform:translateX(-50%);width:44px;height:44px;border-radius:50%;background:' + b + '"></div>',
    grid: '<div style="position:absolute;inset:0;background:' + a + ';background-image:linear-gradient(' + b + '22 1px,transparent 1px),linear-gradient(90deg,' + b + '22 1px,transparent 1px);background-size:24px 24px"></div><div style="position:absolute;left:10%;top:16%;width:58px;height:58px;border-radius:12px;background:' + b + ';display:grid;place-items:center;font:700 22px \'' + f + '\',sans-serif;color:' + a + '">' + esc(ini) + '</div><div style="position:absolute;left:10%;bottom:16%;right:10%;font:700 24px/1.1 \'' + f + '\',sans-serif;color:' + c + '">' + esc(v.titulo) + '</div>',
    soft: '<div style="position:absolute;inset:0;background:' + c + '"></div><div style="position:absolute;left:8%;top:10%;width:56%;height:80%;border-radius:120px 120px 12px 12px;background:' + b + '"></div><div style="position:absolute;right:8%;top:18%;width:30%;font:400 26px/1.1 \'' + f + '\',serif;color:' + a + '">' + esc(k.nome.split(' ').slice(-2).join(' ')) + '</div><div style="position:absolute;right:8%;bottom:14%;width:30%;height:3px;background:' + a + '"></div>'
  }[v.estilo || 'grid'];
}
function vitrine() {
  const cats = ['Todas'].concat([...new Set(W.ST.vitrine.map(v => v.cat))]), vc = U().vcat || 'Todas';
  const list = W.ST.vitrine.filter(v => vc === 'Todas' || v.cat === vc);
  return '<div class="st-pageh"><div><span class="st-eyebrow">Portfólio interno</span><h1>Vitrine</h1><p>Trabalhos entregues, para consulta dos sócios. Envie capas pelo menu Exportar do editor.</p></div></div>' +
    '<div class="subnav">' + cats.map(c => '<button class="' + (vc === c ? 'on' : '') + '" data-act="vcat" data-v="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>' +
    (list.length ? '<div class="vit">' + list.map(v => '<article class="vcard"><button class="vthumb" data-act="vOpen" data-id="' + v.id + '" style="border:0;padding:0;cursor:zoom-in;width:100%" aria-label="Ampliar ' + esc(v.titulo) + '">' + vthumbHTML(v) + '</button><div class="vbody"><b>' + esc(v.titulo) + '</b><div class="row" style="justify-content:space-between"><span class="muted" style="font-size:12.5px">' + esc(v.cliente) + ' · ' + v.ano + '</span><span class="tag">' + esc(v.cat) + '</span></div></div></article>').join('') + '</div>' : '<div class="st-empty">' + icon('star') + '<b>Vitrine vazia</b><span>No editor, use Exportar › Enviar capa à vitrine.</span></div>');
}
A.vcat = (b) => { U().vcat = b.dataset.v; render(); };
A.vOpen = (b) => {
  const v = W.ST.vitrine.find(x => x.id === b.dataset.id), d = v.doc && docs().find(x => x.id === v.doc);
  openModal(v.titulo, '<div class="vthumb" style="border-radius:10px;aspect-ratio:auto;min-height:360px">' + (v.img ? '<img src="' + SX.src(v.img) + '" alt="" style="object-fit:contain;background:var(--panel-3)">' : vthumbHTML(v)) + '</div><p class="muted" style="margin:0">' + esc(v.cliente) + ' · ' + esc(v.cat) + ' · ' + v.ano + '</p>',
    '<button class="btn btn-danger" data-act="vDel" data-id="' + v.id + '">Remover da vitrine</button>' + (d ? '<button class="btn" data-act="stOpenModal" data-id="' + d.id + '">Abrir design</button>' : '') + '<button class="btn" data-act="closeModal">Fechar</button>', true);
};
A.vDel = (b) => { W.ST.vitrine = W.ST.vitrine.filter(v => v.id !== b.dataset.id); persist(); closeModal(); render(); };

/* ---------- Ações do estúdio ---------- */
function openEditor(id) { if (Editor.open(id)) { U().sub = 'editor'; const R = root(); R.innerHTML = ''; render(); } }
A.stNav = (b) => { U().sub = b.dataset.v; closePop(); render(); const m = $('#studio .st-main'); if (m) m.scrollTop = 0; };
A.stOpen = (b) => { closePop(); openEditor(b.dataset.id); };
A.stOpenModal = (b) => { closeModal(); openEditor(b.dataset.id); };
A.stNew = (b) => { const d = Editor.create(b.dataset.v, { kit: U().tkit || 'ic' }); closePop(); openEditor(d.id); };
A.stDeck = (b) => { const deck = SX.DECKS.find(d => d.id === b.dataset.id), kit = U().tkit || 'ic'; const d = Editor.create('apres', { deck, kit, nome: deck.nome + (kit !== 'ic' ? ' · ' + SX.kitOf(kit).nome : '') }); openEditor(d.id); };
A.stLayout = (b) => { const kit = U().tkit || 'ic', d = Editor.create('apres', { kit, nome: 'Apresentação sem título' }); d.pages = [SX.makeLayout(b.dataset.v, SX.roles(SX.kitOf(kit)), d)]; SX.measure(d); persist(); openEditor(d.id); };
A.stSocial = (b) => { const t = SX.SOCIAL.find(s => s.id === b.dataset.v), kit = U().tkit || 'ic'; const d = Editor.create(t.fmt, { kit, tpl: t, nome: t.nome }); openEditor(d.id); };
A.stGrp = (b) => { U().grp = b.dataset.v; render(); };
C.stQ = (t, ev) => { if (ev.type !== 'input') return; U().q = t.value; render(); const i = $('#studio [data-chg="stQ"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
C.stKit = (t, ev) => { if (ev.type === 'change') { U().tkit = t.value; render(); } };
A.stCustom = () => openModal('Tamanho personalizado', '<form id="stCustomF" class="grid-f"><label class="fld"><span>Largura (px)</span><input name="w" inputmode="numeric" value="1200"></label><label class="fld"><span>Altura (px)</span><input name="h" inputmode="numeric" value="800"></label></form>', '<button class="btn btn-ghost" data-act="closeModal">Cancelar</button><button class="btn btn-primary" data-act="stCustomGo">Criar design</button>');
A.stCustomGo = () => { const f = $('#stCustomF'), w = Math.round(pNum(f.w.value)), h = Math.round(pNum(f.h.value)); if (!(w >= 50 && h >= 50 && w <= 8000 && h <= 8000)) { toast('Use medidas entre 50 e 8000 px.', 'warn'); return; } const d = Editor.create('custom', { w, h, kit: U().tkit || 'ic' }); closeModal(); openEditor(d.id); };
A.stCreate = (b) => openPop(b, 'Criar design', CREATE.map(([k, l]) => [shape(k) + ' <span>' + l + ' <small class="muted">' + SX.FORMATS[k].w + '×' + SX.FORMATS[k].h + '</small></span>', () => A.stNew({ dataset: { v: k } })]).concat([[icon('custom', 'ic-sm') + ' Tamanho personalizado', A.stCustom]]));
A.stDocMenu = (b) => {
  const d = docs().find(x => x.id === b.dataset.id);
  openPop(b, d.nome, [
    [icon('palette', 'ic-sm') + ' Abrir', () => openEditor(d.id)],
    [icon('play', 'ic-sm') + ' Apresentar', () => { if (Editor.open(d.id)) { U().sub = 'editor'; root().innerHTML = ''; render(); setTimeout(() => Editor.present(0, 'full'), 60); } }],
    [icon('copy', 'ic-sm') + ' Fazer uma cópia', () => { const c = JSON.parse(JSON.stringify(d)); c.id = uid('doc'); c.nome += ' (cópia)'; c.upd = c.criado = Date.now(); delete c._c; docs().unshift(c); persist(); render(); toast('Cópia criada'); }],
    [icon('trash', 'ic-sm') + ' Excluir', () => confirmBox('Excluir “' + d.nome + '”?', 'O design será removido para todos os sócios.', 'Excluir', () => { W.ST.docs = docs().filter(x => x.id !== d.id); persist(); render(); toast('Design excluído'); })]
  ]);
};

W.addEventListener('imagine:remote', () => { if (!root() || root().hidden) return; if (U().sub !== 'editor') { const a = document.activeElement; if (a && a.closest && a.closest('#studio') && a.matches('input,textarea,select')) return; render(); } });

W.Studio = {
  show, hide, render,
  toggle(on) { if (on) show(); else hide(); },
  home() { U().sub = 'home'; const R = root(); if (R) R.innerHTML = ''; render(); },
  createPop() { const b = $('#studio .st-create'); if (b) A.stCreate(b); },
  open: openEditor
};
})();
