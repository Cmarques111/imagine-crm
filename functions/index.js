/* Imagine CRM · robôs do Mercado 24h
   - mercado: cotações a cada 10 minutos (Yahoo Finance, AwesomeAPI, Banco Central)
   - noticias: manchetes a cada 15 minutos (RSS de portais brasileiros e internacionais)
   - atualizarMercadoAgora: botão "Atualizar agora" do CRM (só para sócios liberados) */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions, logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { XMLParser } = require('fast-xml-parser');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: 'southamerica-east1', memory: '256MiB', timeoutSeconds: 120, maxInstances: 2 });

const UA = { 'User-Agent': 'Mozilla/5.0 (ImagineCRM; +https://firebase.google.com)', Accept: '*/*' };
async function get(url, type) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(url, { headers: UA, signal: ctl.signal });
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return type === 'text' ? r.text() : r.json();
  } finally { clearTimeout(to); }
}

/* ---------------- Cotações ---------------- */
// s = nome mostrado no CRM (mantém os mesmos nomes do protótipo), y = símbolo no Yahoo
const YAHOO = {
  br: [
    { s: 'Ibovespa', y: '^BVSP', u: 'pts', d: 0 },
    { s: 'IBrX 50', y: '^IBX50', u: 'pts', d: 0 },
    { s: 'Small Caps (SMAL11)', y: 'SMAL11.SA', u: 'R$', d: 2 },
    { s: 'IFIX (XFIX11)', y: 'XFIX11.SA', u: 'R$', d: 2 }
  ],
  intl: [
    { s: 'S&P 500', y: '^GSPC', u: 'pts', d: 0 },
    { s: 'Nasdaq', y: '^IXIC', u: 'pts', d: 0 },
    { s: 'Dow Jones', y: '^DJI', u: 'pts', d: 0 },
    { s: 'Euro Stoxx 50', y: '^STOXX50E', u: 'pts', d: 0 },
    { s: 'DAX', y: '^GDAXI', u: 'pts', d: 0 },
    { s: 'FTSE 100', y: '^FTSE', u: 'pts', d: 0 },
    { s: 'Nikkei 225', y: '^N225', u: 'pts', d: 0 },
    { s: 'Hang Seng', y: '^HSI', u: 'pts', d: 0 }
  ],
  fx: [
    { s: 'DXY', y: 'DX-Y.NYB', u: 'pts', d: 1 },
    { s: 'Bitcoin', y: 'BTC-BRL', u: 'R$', d: 0 }
  ],
  cmd: [
    { s: 'Petróleo Brent', y: 'BZ=F', u: 'US$', d: 2 },
    { s: 'Ouro', y: 'GC=F', u: 'US$', d: 0 },
    { s: 'Minério de ferro', y: 'TIO=F', u: 'US$', d: 1 },
    { s: 'Soja (Chicago)', y: 'ZS=F', u: 'US¢', d: 0 }
  ],
  juros: [
    { s: 'Treasury 10 anos', y: '^TNX', u: '%', d: 2, abs: true }
  ],
  acoes: ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3', 'ABEV3', 'BBDC4', 'B3SA3', 'ITSA4', 'PRIO3', 'SUZB3', 'MGLU3'].map(t => ({ s: t, y: t + '.SA', u: 'R$', d: 2 }))
};

async function yahoo(item) {
  const j = await get('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(item.y) + '?range=1mo&interval=1d');
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r) throw new Error('sem dados ' + item.y);
  const m = r.meta, ts = r.timestamp || [], cl = ((r.indicators.quote || [])[0] || {}).close || [];
  const pts = ts.map((t, i) => [t, cl[i]]).filter(p => p[1] != null);
  const v = m.regularMarketPrice != null ? m.regularMarketPrice : (pts.length ? pts[pts.length - 1][1] : null);
  if (v == null) throw new Error('sem preço ' + item.y);
  const day = (t) => new Date(t * 1000).toISOString().slice(0, 10);
  let prev = null;
  if (pts.length) {
    const last = pts[pts.length - 1];
    prev = day(last[0]) === day(m.regularMarketTime || last[0]) ? (pts[pts.length - 2] || [])[1] : last[1];
  }
  if (prev == null) prev = m.chartPreviousClose;
  const spark = pts.slice(-30).map(p => +p[1].toFixed(4));
  if (spark.length && spark[spark.length - 1] !== v) spark.push(+v.toFixed(4));
  const c = prev ? (item.abs ? v - prev : (v / prev - 1) * 100) : null;
  return { s: item.s, v: +v.toFixed(4), c: c == null ? null : +c.toFixed(3), u: item.u, d: item.d, abs: !!item.abs, spark, at: (m.regularMarketTime || 0) * 1000 };
}

async function awesome() {
  const j = await get('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL');
  const one = (k, s) => j[k] ? { s, v: +(+j[k].bid).toFixed(4), c: +(+j[k].pctChange).toFixed(3), u: 'R$', d: 3, at: +j[k].timestamp * 1000 } : null;
  const out = [one('USDBRL', 'USD/BRL'), one('EURBRL', 'EUR/BRL'), one('GBPBRL', 'GBP/BRL')].filter(Boolean);
  // histórico de 30 dias para os mini-gráficos
  await Promise.all(out.map(async (t) => {
    try {
      const code = t.s.replace('/', '-');
      const h = await get('https://economia.awesomeapi.com.br/json/daily/' + code + '/30');
      t.spark = h.map(x => +(+x.bid).toFixed(4)).reverse();
    } catch (e) { /* sem histórico, o CRM mostra só o valor */ }
  }));
  return out;
}

async function sgs(code, s) {
  const j = await get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados/ultimos/12?formato=json');
  const vals = j.map(x => +String(x.valor).replace(',', '.'));
  const v = vals[vals.length - 1], p = vals[vals.length - 2];
  return { s, v, c: p != null ? +(v - p).toFixed(2) : 0, u: '%', d: 2, abs: true, spark: vals, ref: j[j.length - 1].data };
}

async function atualizarMercado() {
  const groups = {}, erros = [];
  const tasks = [];
  for (const [g, list] of Object.entries(YAHOO)) {
    groups[g] = [];
    list.forEach((it, i) => tasks.push(yahoo(it).then(t => { groups[g][i] = t; }).catch(e => erros.push(it.y + ': ' + e.message))));
  }
  let fx = [], juros = [];
  tasks.push(awesome().then(r => { fx = r; }).catch(e => erros.push('AwesomeAPI: ' + e.message)));
  tasks.push(Promise.all([
    sgs(432, 'Selic').catch(e => { erros.push('Selic: ' + e.message); return null; }),
    sgs(4389, 'CDI').catch(e => { erros.push('CDI: ' + e.message); return null; }),
    sgs(13522, 'IPCA 12m').catch(e => { erros.push('IPCA: ' + e.message); return null; })
  ]).then(r => { juros = r.filter(Boolean); }));
  await Promise.all(tasks);
  for (const g of Object.keys(groups)) groups[g] = groups[g].filter(Boolean);
  groups.fx = fx.concat(groups.fx);
  groups.juros = juros.concat(groups.juros);

  // se uma fonte falhar, mantém o último valor conhecido daquele ativo
  const ref = db.doc('market/now');
  const old = (await ref.get()).data();
  if (old && old.groups) {
    for (const [g, list] of Object.entries(old.groups)) {
      const cur = groups[g] || (groups[g] = []);
      list.forEach(t => { if (!cur.some(x => x.s === t.s)) cur.push(Object.assign({}, t, { velho: true })); });
    }
  }
  await ref.set({
    groups,
    fontes: ['B3 e bolsas internacionais via Yahoo Finance', 'Câmbio via AwesomeAPI', 'Selic, CDI e IPCA via Banco Central (SGS)'],
    erros: erros.slice(0, 20),
    at: admin.firestore.FieldValue.serverTimestamp()
  });
  if (erros.length) logger.warn('Mercado com falhas parciais', erros);
  await verificarAlertas(groups);
  return { ok: true, erros: erros.length };
}

/* Alertas de preço cadastrados pelos sócios: marca os que dispararam */
async function verificarAlertas(groups) {
  const all = [].concat(...Object.values(groups));
  const snap = await db.collection('alertas').get();
  const b = db.batch(); let n = 0;
  snap.forEach(d => {
    let a; try { a = JSON.parse(d.data().j); } catch (e) { return; }
    const t = all.find(x => x.s === a.ativo); if (!t) return;
    const hit = a.cond === 'acima de' ? t.v > a.valor : t.v < a.valor;
    if (hit && !a.hit) { a.hit = Date.now(); b.update(d.ref, { j: JSON.stringify(a), t: admin.firestore.FieldValue.serverTimestamp(), u: 'robo-mercado' }); n++; }
  });
  if (n) await b.commit();
}

/* ---------------- Notícias ---------------- */
const FEEDS = [
  { src: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/' },
  { src: 'InfoMoney · Mercados', url: 'https://www.infomoney.com.br/mercados/feed/' },
  { src: 'Money Times', url: 'https://www.moneytimes.com.br/feed/' },
  { src: 'g1 Economia', url: 'https://g1.globo.com/rss/g1/economia/' },
  { src: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml' },
  { src: 'Poder360 Economia', url: 'https://www.poder360.com.br/economia/feed/' },
  { src: 'E-Investidor', url: 'https://einvestidor.estadao.com.br/feed/' },
  { src: 'Banco Central', url: 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/noticias' },
  { src: 'CNBC (EUA)', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', intl: true },
  { src: 'MarketWatch (EUA)', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', intl: true }
];
const CATS = [
  ['Juros e inflação', /\b(selic|copom|juros|ipca|infla[cç][aã]o|igp-?m|focus|di futuro|curva de juros|tesouro direto|banco central|bc\b|fed|fomc|interest rate|inflation|treasury)/i],
  ['Câmbio', /\b(d[oó]lar|c[aâ]mbio|real se|euro|moeda|dollar|currency|forex)/i],
  ['Commodities', /\b(petr[oó]leo|brent|wti|ouro|min[eé]rio|commodit|cobre|oil|gold|opep|opec)/i],
  ['Agro', /\b(agro|soja|milho|caf[eé]|safra|boi|gado|a[cç][uú]car|algod[aã]o|conab|trigo)/i],
  ['Bolsa BR', /\b(ibovespa|b3\b|bolsa brasileira|ibov|ifix|small caps|a[cç][oõ]es brasileiras)/i],
  ['Empresas', /\b(lucro|balan[cç]o|resultado trimestral|dividendos|jcp|ipo|fus[aã]o|aquisi[cç][aã]o|recupera[cç][aã]o judicial|petrobras|vale|ita[uú]|bradesco|magalu|weg|ambev|earnings)/i],
  ['Internacional', /\b(eua|estados unidos|china|europa|wall street|nasdaq|s&p|dow jones|trump|biden|jap[aã]o|alemanha|global|world|stocks|nyse)/i]
];
const HOT = /\b(copom|selic|fomc|fed (corta|eleva|mant)|recorde|dispara|despenca|derrete|tomba|crise|default|ipca|payroll|decis[aã]o de juros|rate (cut|hike))/i;
const SEG = [
  [/\b(varejo|consumo|vendas no varejo|black friday)/i, 'Varejo'], [/\b(agro|soja|milho|safra|boi|caf[eé])/i, 'Agronegócio'],
  [/\b(ind[uú]stria|produ[cç][aã]o industrial|manufatura)/i, 'Indústria'], [/\b(im[oó]ve|constru[cç][aã]o|imobili|financiamento habitacional)/i, 'Imobiliário'],
  [/\b(tecnologia|startup|ia\b|intelig[eê]ncia artificial|big techs?|software)/i, 'Tecnologia'], [/\b(log[ií]stica|frete|transporte|portos?|combust[ií]ve)/i, 'Logística'],
  [/\b(sa[uú]de|hospita|farmac|planos de sa[uú]de)/i, 'Saúde'], [/\b(servi[cç]os|pib de servi[cç]os)/i, 'Serviços'], [/\b(educa[cç][aã]o|ensino)/i, 'Educação']
];
const strip = (s) => String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#8217;/g, '’').replace(/&#82(20|21);/g, '"').replace(/\s+/g, ' ').trim();
const txt = (v) => v == null ? '' : typeof v === 'object' ? (v['#text'] || v.__cdata || '') : String(v);

async function lerFeed(f) {
  const xml = await get(f.url, 'text');
  const p = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata' }).parse(xml);
  const items = (p.rss && p.rss.channel && [].concat(p.rss.channel.item || [])) || (p.feed && [].concat(p.feed.entry || [])) || [];
  return items.slice(0, 30).map(it => {
    const t = strip(txt(it.title)), link = typeof it.link === 'object' ? (it.link['@_href'] || txt(it.link)) : txt(it.link);
    const r = strip(txt(it.description || it.summary || it['content:encoded'])).slice(0, 280);
    const ts = Date.parse(txt(it.pubDate || it.published || it.updated || it['dc:date'])) || Date.now();
    const all = t + ' ' + r;
    const cat = f.intl ? 'Internacional' : ((CATS.find(([, re]) => re.test(all)) || ['Bolsa BR'])[0]);
    const seg = SEG.filter(([re]) => re.test(all)).map(x => x[1]);
    return { t, r, url: link, ts, cat, hot: HOT.test(t), seg, src: f.src };
  }).filter(n => n.t && n.url);
}

async function atualizarNoticias() {
  const res = await Promise.allSettled(FEEDS.map(lerFeed));
  const news = [], erros = [];
  res.forEach((r, i) => r.status === 'fulfilled' ? news.push(...r.value) : erros.push(FEEDS[i].src + ': ' + r.reason.message));
  const lim = Date.now() - 3 * 864e5, seen = new Set();
  const fresh = news.filter(n => n.ts > lim && n.ts < Date.now() + 36e5).filter(n => {
    const k = n.t.toLowerCase().slice(0, 70); if (seen.has(k)) return false; seen.add(k); return true;
  });
  const b = db.batch();
  fresh.slice(0, 400).forEach(n => b.set(db.collection('news').doc(crypto.createHash('sha1').update(n.url).digest('hex').slice(0, 20)), n));
  await b.commit();
  // limpa notícias com mais de 3 dias
  const old = await db.collection('news').where('ts', '<', lim).limit(400).get();
  if (!old.empty) { const d = db.batch(); old.forEach(x => d.delete(x.ref)); await d.commit(); }
  if (erros.length) logger.warn('Feeds com falha', erros);
  return { ok: true, total: fresh.length, erros: erros.length };
}

/* ---------------- Gatilhos ---------------- */
exports.mercado = onSchedule({ schedule: 'every 10 minutes', timeZone: 'America/Sao_Paulo' }, async () => { await atualizarMercado(); });
exports.noticias = onSchedule({ schedule: 'every 15 minutes', timeZone: 'America/Sao_Paulo' }, async () => { await atualizarNoticias(); });
exports.atualizarMercadoAgora = onCall(async (req) => {
  const em = req.auth && req.auth.token && req.auth.token.email;
  if (!em) throw new HttpsError('unauthenticated', 'Entre no CRM primeiro.');
  const m = await db.doc('members/' + em.toLowerCase()).get();
  if (!m.exists) throw new HttpsError('permission-denied', 'Acesso não liberado.');
  const ref = db.doc('meta/robo'), last = (await ref.get()).data();
  if (last && last.manual && Date.now() - last.manual.toMillis() < 60000) return { ok: true, espera: true };
  await ref.set({ manual: admin.firestore.Timestamp.now() }, { merge: true });
  const [a, b] = await Promise.all([atualizarMercado(), atualizarNoticias()]);
  return { ok: true, mercado: a, noticias: b };
});
