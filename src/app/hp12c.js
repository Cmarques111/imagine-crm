/* Calculadora financeira no estilo HP12C · RPN, TVM, fluxo de caixa */
(function(){
const W = window;
const S = { x: 0, y: 0, z: 0, t: 0, entry: null, lift: true, lastFin: false, lastX: 0,
  n: 0, i: 0, pv: 0, pmt: 0, fv: 0, beg: false, cf: [], err: '' };

const fin = {
  fvf(n, i, pv, pmt, beg) { // FV dado o resto
    if (i === 0) return -(pv + pmt * n);
    const a = Math.pow(1 + i, n), b = beg ? 1 + i : 1;
    return -(pv * a + pmt * b * (a - 1) / i);
  },
  pvf(n, i, pmt, fv, beg) {
    if (i === 0) return -(fv + pmt * n);
    const a = Math.pow(1 + i, n), b = beg ? 1 + i : 1;
    return -(fv + pmt * b * (a - 1) / i) / a;
  },
  pmtf(n, i, pv, fv, beg) {
    if (n === 0) return NaN;
    if (i === 0) return -(pv + fv) / n;
    const a = Math.pow(1 + i, n), b = beg ? 1 + i : 1;
    return -(fv + pv * a) / (b * (a - 1) / i);
  },
  nf(i, pv, pmt, fv, beg) {
    if (i === 0) return pmt === 0 ? NaN : -(pv + fv) / pmt;
    const c = pmt * (beg ? 1 + i : 1) / i;
    const a = (c - fv) / (pv + c);
    if (!(a > 0)) return NaN;
    const n = Math.log(a) / Math.log(1 + i);
    return Math.ceil(n - 1e-9); // a HP arredonda n para cima
  },
  res(r, n, pv, pmt, fv, beg) {
    if (Math.abs(r) < 1e-12) return pv + pmt * n + fv;
    const a = Math.pow(1 + r, n);
    return pv * a + pmt * (beg ? 1 + r : 1) * (a - 1) / r + fv;
  },
  solveRate(f) {
    // varredura + bissecção: robusto para fluxos convencionais
    let lo = -0.99, prev = f(lo), best = NaN;
    const steps = [];
    for (let r = -0.99; r <= 5; r += r < 0.5 ? 0.0025 : 0.05) steps.push(r);
    for (let k = 1; k < steps.length; k++) {
      const r = steps[k], v = f(r);
      if (isFinite(v) && isFinite(prev) && (v === 0 || (v > 0) !== (prev > 0))) {
        let a = steps[k - 1], b = r, fa = prev;
        for (let it = 0; it < 200; it++) {
          const m = (a + b) / 2, fm = f(m);
          if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m;
        }
        best = (a + b) / 2;
        if (best > -0.5) return best;
      }
      prev = v;
    }
    return best;
  },
  npv(i, cf) { return cf.reduce((s, c, k) => s + c / Math.pow(1 + i, k), 0); }
};
W.FIN = fin;

const fmt = (v) => {
  if (!isFinite(v)) return 'Error';
  if (Math.abs(v) >= 1e10) return v.toExponential(6).replace('.', ',');
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtR = (v) => !isFinite(v) ? '—' : (Math.abs(v) >= 1e7 ? v.toExponential(2).replace('.', ',') : v.toLocaleString('pt-BR', { maximumFractionDigits: 4 }));

function endEntry(){ if (S.entry !== null) { S.entry = null; } }
function push(){ S.t = S.z; S.z = S.y; S.y = S.x; }
function setX(v){ S.x = v; }
function drop(){ S.y = S.z; S.z = S.t; }

function key(k){
  S.err = '';
  const isDigit = /^[0-9]$/.test(k) || k === '.';
  if (isDigit) {
    if (S.entry === null) { if (S.lift) push(); S.entry = ''; }
    if (k === '.' && S.entry.includes('.')) return render();
    if (S.entry.replace('-', '').length >= 12) return render();
    S.entry += k;
    S.x = parseFloat(S.entry === '.' ? '0' : S.entry) || 0;
    S.lastFin = false;
    return render();
  }
  const finKeys = ['n', 'i', 'PV', 'PMT', 'FV'];
  if (k === 'CHS') {
    if (S.entry !== null) { S.entry = S.entry.startsWith('-') ? S.entry.slice(1) : '-' + S.entry; S.x = parseFloat(S.entry) || 0; }
    else { S.x = -S.x; S.lift = true; }
    return render();
  }
  if (k === 'BS') { // apagar dígito
    if (S.entry !== null) { S.entry = S.entry.slice(0, -1); S.x = parseFloat(S.entry) || 0; if (!S.entry || S.entry === '-') { S.entry = null; S.x = 0; S.lift = false; } }
    else { S.x = 0; S.lift = false; }
    return render();
  }
  endEntry();
  const bin = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b, 'yˣ': (a, b) => Math.pow(a, b) };
  const un = { '1/x': a => 1 / a, '√x': a => Math.sqrt(a), 'LN': a => Math.log(a), 'eˣ': a => Math.exp(a), 'x²': a => a * a };
  if (bin[k]) {
    S.lastX = S.x; S.x = bin[k](S.y, S.x); drop(); S.lift = true; S.lastFin = false;
  } else if (un[k]) {
    S.lastX = S.x; S.x = un[k](S.x); S.lift = true; S.lastFin = false;
  } else if (k === '%') { S.lastX = S.x; S.x = S.y * S.x / 100; S.lift = true; S.lastFin = false; }
  else if (k === 'Δ%') { S.lastX = S.x; S.x = (S.x - S.y) / S.y * 100; S.lift = true; S.lastFin = false; }
  else if (k === 'ENTER') { push(); S.lift = false; S.lastFin = false; }
  else if (k === 'x↔y') { const a = S.x; S.x = S.y; S.y = a; S.lift = true; }
  else if (k === 'R↓') { const a = S.x; S.x = S.y; S.y = S.z; S.z = S.t; S.t = a; S.lift = true; }
  else if (k === 'CLx') { S.x = 0; S.lift = false; }
  else if (k === 'CLR FIN') { S.n = S.i = S.pv = S.pmt = S.fv = 0; S.cf = []; S.lastFin = false; }
  else if (k === 'CLR') { Object.assign(S, { x: 0, y: 0, z: 0, t: 0, n: 0, i: 0, pv: 0, pmt: 0, fv: 0, cf: [], lift: false, lastFin: false }); }
  else if (k === 'BEG/END') { S.beg = !S.beg; }
  else if (k === '12×') { S.x = S.x * 12; S.n = S.x; S.lift = true; S.lastFin = true; }
  else if (k === '12÷') { S.x = S.x / 12; S.i = S.x; S.lift = true; S.lastFin = true; }
  else if (k === 'CF₀') { S.cf = [S.x]; S.lift = true; S.lastFin = false; }
  else if (k === 'CFⱼ') { if (!S.cf.length) S.cf = [0]; S.cf.push(S.x); S.lift = true; S.lastFin = false; }
  else if (k === 'NPV') { const v = fin.npv(S.i / 100, S.cf); S.lift && push(); S.x = v; S.lift = true; }
  else if (k === 'IRR') {
    const r = fin.solveRate(rr => fin.npv(rr, S.cf));
    if (!isFinite(r)) S.err = 'Error 3 · sem TIR para este fluxo';
    else { S.lift && push(); S.x = r * 100; S.i = S.x; }
    S.lift = true;
  }
  else if (finKeys.includes(k)) {
    const reg = { n: 'n', i: 'i', PV: 'pv', PMT: 'pmt', FV: 'fv' }[k];
    if (!S.lastFin) { S[reg] = S.x; S.lastFin = true; S.lift = true; }
    else {
      const i = S.i / 100; let v;
      if (k === 'FV') v = fin.fvf(S.n, i, S.pv, S.pmt, S.beg);
      else if (k === 'PV') v = fin.pvf(S.n, i, S.pmt, S.fv, S.beg);
      else if (k === 'PMT') v = fin.pmtf(S.n, i, S.pv, S.fv, S.beg);
      else if (k === 'n') v = fin.nf(i, S.pv, S.pmt, S.fv, S.beg);
      else { const r = fin.solveRate(rr => fin.res(rr, S.n, S.pv, S.pmt, S.fv, S.beg)); v = isFinite(r) ? r * 100 : NaN; }
      if (!isFinite(v)) S.err = 'Error 5 · verifique sinais e valores';
      else { push(); S.x = v; S[reg] = v; }
      S.lift = true;
    }
    return render();
  }
  if (!finKeys.includes(k) && k !== '12×' && k !== '12÷') S.lastFin = false;
  return render();
}

const KEYS = [
  ['n', 'fin'], ['i', 'fin'], ['PV', 'fin'], ['PMT', 'fin'], ['FV', 'fin'], ['CHS', ''],
  ['7', 'num'], ['8', 'num'], ['9', 'num'], ['÷', 'op'], ['yˣ', ''], ['1/x', ''],
  ['4', 'num'], ['5', 'num'], ['6', 'num'], ['×', 'op'], ['%', ''], ['Δ%', ''],
  ['1', 'num'], ['2', 'num'], ['3', 'num'], ['−', 'op'], ['√x', ''], ['x↔y', ''],
  ['0', 'num'], ['.', 'num'], ['ENTER', 'ent'], ['+', 'op'], ['R↓', ''],
  ['CF₀', 'fin'], ['CFⱼ', 'fin'], ['NPV', 'fin'], ['IRR', 'fin'], ['12×', ''], ['12÷', ''],
  ['CLx', 'cl'], ['CLR FIN', 'cl'], ['CLR', 'cl'], ['BEG/END', ''], ['LN', ''], ['eˣ', '']
];
const TIPS = { n: 'Número de períodos', i: 'Taxa por período (%)', PV: 'Valor presente', PMT: 'Parcela', FV: 'Valor futuro', CHS: 'Trocar sinal',
  '12×': 'Anos × 12 → n', '12÷': 'Taxa anual ÷ 12 → i', 'CF₀': 'Fluxo inicial', 'CFⱼ': 'Próximo fluxo', NPV: 'VPL com i', IRR: 'TIR',
  'CLR FIN': 'Limpa registros financeiros', CLR: 'Limpa tudo', 'BEG/END': 'Pagamento no início ou fim', 'R↓': 'Rolar pilha' };

function render(){
  const el = $('#hp'); if (!el || el.hidden) return;
  const xs = S.entry !== null ? (S.entry || '0').replace('.', ',') : fmt(S.x);
  $('#hpX').textContent = S.err || xs;
  $('#hpX').style.color = S.err ? '#F4A3A2' : '';
  $('#hpSt').innerHTML = '<span>Y ' + fmtR(S.y) + '</span><span>Z ' + fmtR(S.z) + '</span><span>T ' + fmtR(S.t) + '</span><span class="' + (S.beg ? 'on' : '') + '">' + (S.beg ? 'BEGIN' : 'END') + '</span>';
  $('#hpRegs').innerHTML = [['n', S.n], ['i %', S.i], ['PV', S.pv], ['PMT', S.pmt], ['FV', S.fv]].map(r => '<div><span>' + r[0] + '</span><b>' + fmtR(r[1]) + '</b></div>').join('') +
    (S.cf.length ? '<div style="grid-column:1/-1"><span>Fluxos (' + S.cf.length + ')</span><b>' + S.cf.map(fmtR).join(' · ') + '</b></div>' : '');
}

function build(){
  const el = $('#hp');
  el.innerHTML = '<div class="hp-h" id="hpDrag"><b>HP12C · IMAGINE</b><small>RPN</small><span class="sp"></span>' +
    '<button class="ibtn" id="hpHelp" aria-label="Como usar">' + icon('book') + '</button>' +
    '<button class="ibtn" id="hpClose" aria-label="Fechar calculadora">' + icon('x') + '</button></div>' +
    '<div class="hp-disp"><div class="hp-st" id="hpSt"></div><div class="hp-x" id="hpX">0,00</div></div>' +
    '<div class="hp-keys">' + KEYS.map(([k, c]) => '<button class="hk ' + c + '" data-k="' + esc(k) + '" title="' + esc(TIPS[k] || k) + '">' + esc(k) + '</button>').join('') + '</div>' +
    '<div class="hp-regs" id="hpRegs"></div>';
  el.addEventListener('pointerdown', () => { W.HP_ACTIVE = true; });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (b) key(b.dataset.k);
  });
  $('#hpClose').onclick = () => HP.toggle(false);
  $('#hpHelp').onclick = () => openModal('Como usar a HP12C', helpHTML(), '');
  // arrastar
  const h = $('#hpDrag'); let sx, sy, ox, oy, drag = false;
  h.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    drag = true; const r = el.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; h.setPointerCapture(e.pointerId);
  });
  h.addEventListener('pointermove', (e) => {
    if (!drag) return;
    el.style.left = clamp(ox + e.clientX - sx, 0, innerWidth - 120) + 'px';
    el.style.top = clamp(oy + e.clientY - sy, 0, innerHeight - 60) + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto';
  });
  h.addEventListener('pointerup', () => { drag = false; });
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#hp')) W.HP_ACTIVE = false; });
  document.addEventListener('keydown', (e) => {
    if (!W.HP_ACTIVE || el.hidden) return;
    if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷', 'Enter': 'ENTER', ',': '.', '.': '.', 'Backspace': 'BS', '%': '%' };
    if (/^[0-9]$/.test(e.key)) { key(e.key); e.preventDefault(); }
    else if (map[e.key]) { key(map[e.key]); e.preventDefault(); }
  });
}

function helpHTML(){
  return '<p style="margin:0">A calculadora funciona em notação polonesa reversa, como a HP12C: digite o primeiro número, aperte <b>ENTER</b>, digite o segundo e aperte a operação.</p>' +
  '<div class="card"><div class="card-b"><p class="sec-t">Exemplo · financiamento</p><p style="margin:0" class="muted">R$ 50.000 em 36 meses a 1,5% ao mês. Qual a parcela?</p>' +
  '<p class="mono" style="margin:10px 0 0">50000 PV · 36 n · 1.5 i · 0 FV · PMT → −1.807,62</p></div></div>' +
  '<div class="card"><div class="card-b"><p class="sec-t">Exemplo · TIR de um projeto</p><p class="mono" style="margin:0">10000 CHS CF₀ · 3000 CFⱼ · 4000 CFⱼ · 5000 CFⱼ · IRR → 8,90</p></div></div>' +
  '<p class="muted" style="margin:0">Regra das teclas financeiras: logo depois de digitar um número, a tecla <b>guarda</b> o valor. Apertada depois de outra tecla financeira, ela <b>calcula</b>. Entradas e saídas de caixa têm sinais opostos (use CHS). Pelo teclado do computador: números, + − × ÷, Enter e Backspace.</p>';
}

W.HP = {
  key, state: S,
  toggle(on){
    const el = $('#hp');
    if (!el.innerHTML) build();
    el.hidden = on === undefined ? !el.hidden : !on;
    $$('[data-act="toggleHP"]').forEach(b => b.classList.toggle('on', !el.hidden));
    if (!el.hidden) { W.HP_ACTIVE = true; render(); }
  }
};
})();
