/* Imagine CRM · dados no Firebase (Auth + Firestore + Storage + Functions)
   Cada registro do app vira um documento { j: JSON, c: ordem, u: autor, t: horário }.
   Gravações são agrupadas e só o que mudou é enviado. Mudanças dos outros sócios chegam em tempo real. */
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, updateProfile, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { OWNER, INITIAL_MEMBERS, FUNCTIONS_REGION } from './config.js';

const ARR = ['leads', 'clientes', 'receber', 'pagar', 'projetos', 'design', 'vitrine', 'eventos', 'tarefas', 'pontos', 'docs', 'imgLib', 'alertas', 'relatorios', 'agendaEco'];
const MAPS = { mood: 'mood', assetUrls: 'assets' };
const SINGLE = ['cfg', 'saldo', 'nota'];
const ASC = new Set(['receber', 'pagar', 'eventos', 'alertas', 'agendaEco', 'relatorios']);
const MAX_DOC = 900000;
const sid = () => 'm' + Math.random().toString(36).slice(2, 8);
const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const sorter = (k) => ASC.has(k) ? (a, b) => (a._c || 0) - (b._c || 0) : (a, b) => (b._c || 0) - (a._c || 0);

export function createFirebaseStore(config) {
  const W = window;
  const app = initializeApp(config);
  const auth = getAuth(app);
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
  catch (e) { db = initializeFirestore(app, {}); }
  const storage = getStorage(app);
  const fns = getFunctions(app, FUNCTIONS_REGION);

  let ST = null, members = [], me = null, unsubs = [], saveT = null, writing = false, again = false, signingUp = false;
  const listeners = [];
  const synced = {};
  const sync = (t, k) => W.setSync && W.setSync(t, k);
  const emit = (coll, id) => W.dispatchEvent(new CustomEvent('imagine:remote', { detail: { coll, id } }));
  const email = () => (auth.currentUser && auth.currentUser.email || '').toLowerCase();

  /* ---------- Sócios ---------- */
  async function refreshMembers() {
    const s = await getDocs(collection(db, 'members'));
    members = s.docs.map(d => Object.assign({ email: d.id }, d.data()));
    me = members.find(m => m.email === email()) || me;
    if (W.ST) { W.SOCIOS = api.members(); }
  }

  /* ---------- Primeira instalação: o dono cria o próprio acesso e libera os demais sócios ---------- */
  async function bootstrap(em, u) {
    const setup = await getDoc(doc(db, 'meta', 'setup')).catch(() => null);
    if (setup && setup.exists()) return;
    const own = INITIAL_MEMBERS.find(m => m.email === em) || {};
    const nome = u.displayName || own.nome || em;
    const b = writeBatch(db);
    b.set(doc(db, 'members', em), { nome, ini: own.ini || initials(nome), role: 'admin', sid: sid(), ativo: true, uid: u.uid, criado: serverTimestamp() });
    b.set(doc(db, 'meta', 'setup'), { owner: em, em: serverTimestamp() });
    await b.commit();
    for (const m of INITIAL_MEMBERS) {
      if (m.email === em) continue;
      await setDoc(doc(db, 'members', m.email), { nome: m.nome, ini: m.ini, role: m.role === 'admin' ? 'admin' : 'socio', sid: sid(), ativo: false, criado: serverTimestamp() });
    }
  }

  /* ---------- Carregar ---------- */
  async function load() {
    const em = email(), u = auth.currentUser;
    await u.reload();
    if (!u.emailVerified) {
      try { await sendEmailVerification(u); } catch (er) {}
      await signOut(auth);
      throw new Error('Confirme seu e-mail pelo link que enviamos para ' + em + ' (veja também o spam) e depois entre de novo.');
    }
    await u.getIdToken(true);
    let md = await getDoc(doc(db, 'members', em));
    if (!md.exists() && em === OWNER.toLowerCase()) { await bootstrap(em, u); md = await getDoc(doc(db, 'members', em)); }
    if (!md.exists()) { await signOut(auth); throw new Error('Este e-mail ainda não foi liberado. Peça ao administrador para liberar seu acesso em Configurações.'); }
    await refreshMembers();
    if (!me.ativo || me.uid !== auth.currentUser.uid) { await setDoc(doc(db, 'members', em), { ativo: true, uid: auth.currentUser.uid }, { merge: true }); me.ativo = true; }
    sync('Carregando dados…', 'off');
    ST = { v: 2 };
    await Promise.all(ARR.map(async (k) => {
      const snap = await getDocs(collection(db, k)), m = new Map(), list = [];
      snap.forEach(d => { const j = d.data().j; if (!j) return; try { list.push(JSON.parse(j)); m.set(d.id, j); } catch (er) {} });
      list.sort(sorter(k)); ST[k] = list; synced[k] = m;
    }));
    await Promise.all(Object.entries(MAPS).map(async ([key, coll]) => {
      const snap = await getDocs(collection(db, coll)), m = new Map(), obj = {};
      snap.forEach(d => { const j = d.data().j; if (!j) return; try { obj[d.id] = JSON.parse(j); m.set(d.id, j); } catch (er) {} });
      ST[key] = obj; synced['$' + coll] = m;
    }));
    const meta = await getDoc(doc(db, 'meta', 'state'));
    if (meta.exists() && meta.data().j) { try { Object.assign(ST, JSON.parse(meta.data().j)); synced.$meta = meta.data().j; } catch (er) {} }
    ST.assets = {};
    listen();
    sync('Sincronizado');
    return ST;
  }

  /* ---------- Tempo real ---------- */
  function listen() {
    unsubs.forEach(u => u()); unsubs = [];
    ARR.forEach(k => unsubs.push(onSnapshot(collection(db, k), (snap) => {
      let n = 0;
      snap.docChanges().forEach(ch => {
        if (ch.doc.metadata.hasPendingWrites) return;
        const id = ch.doc.id, m = synced[k] || (synced[k] = new Map()), arr = ST[k] || (ST[k] = []);
        if (ch.type === 'removed') { if (m.has(id)) { m.delete(id); const i = arr.findIndex(x => x.id === id); if (i >= 0) arr.splice(i, 1); n++; emit(k, id); } return; }
        const j = ch.doc.data().j; if (!j || m.get(id) === j) return;
        let o; try { o = JSON.parse(j); } catch (er) { return; }
        m.set(id, j);
        const i = arr.findIndex(x => x.id === id);
        if (i >= 0) arr[i] = o; else { arr.push(o); arr.sort(sorter(k)); }
        n++; emit(k, id);
      });
    }, (er) => console.warn('snapshot', k, er))));
    Object.entries(MAPS).forEach(([key, coll]) => unsubs.push(onSnapshot(collection(db, coll), (snap) => {
      snap.docChanges().forEach(ch => {
        if (ch.doc.metadata.hasPendingWrites) return;
        const id = ch.doc.id, m = synced['$' + coll] || (synced['$' + coll] = new Map()), obj = ST[key] || (ST[key] = {});
        if (ch.type === 'removed') { if (m.has(id)) { m.delete(id); delete obj[id]; emit(key, id); } return; }
        const j = ch.doc.data().j; if (!j || m.get(id) === j) return;
        try { obj[id] = JSON.parse(j); m.set(id, j); emit(key, id); } catch (er) {}
      });
    })));
    unsubs.push(onSnapshot(doc(db, 'meta', 'state'), (d) => {
      if (!d.exists() || d.metadata.hasPendingWrites) return;
      const j = d.data().j; if (!j || j === synced.$meta) return;
      try { Object.assign(ST, JSON.parse(j)); synced.$meta = j; emit('meta', 'state'); } catch (er) {}
    }));
    unsubs.push(onSnapshot(collection(db, 'members'), (snap) => {
      members = snap.docs.map(d => Object.assign({ email: d.id }, d.data()));
      me = members.find(m => m.email === email()) || me;
      W.SOCIOS = api.members();
      if (!members.some(m => m.email === email())) { toast('Seu acesso foi removido pelo administrador.', 'warn'); setTimeout(() => api.auth.signOut().then(() => location.reload()), 2500); }
    }));
    unsubs.push(onSnapshot(doc(db, 'market', 'now'), (d) => {
      if (!d.exists()) return;
      const x = d.data(); W.MKT_LIVE = { groups: x.groups || {}, fontes: x.fontes || [], at: x.at && x.at.toMillis ? x.at.toMillis() : Date.now() };
      W.dispatchEvent(new Event('imagine:market'));
    }, () => {}));
    unsubs.push(onSnapshot(query(collection(db, 'news'), orderBy('ts', 'desc'), limit(150)), (s) => {
      W.NEWS_LIVE = s.docs.map(d => Object.assign({ id: d.id }, d.data()));
      W.dispatchEvent(new Event('imagine:market'));
    }, () => {}));
  }

  /* ---------- Gravar ---------- */
  function schedule(ms) { clearTimeout(saveT); sync('Salvando…', 'off'); saveT = setTimeout(flush, ms == null ? 700 : ms); }
  async function flush() {
    if (!ST || !auth.currentUser) return;
    if (writing) { again = true; return; }
    writing = true;
    const ops = [], t0 = Date.now(), who = email();
    for (const k of ARR) {
      const arr = ST[k] || [], m = synced[k] || (synced[k] = new Map()), seen = new Set();
      arr.forEach((it, i) => {
        if (!it || !it.id) return;
        if (it._c == null) it._c = ASC.has(k) ? t0 + i : t0 - i;
        seen.add(it.id);
        const j = JSON.stringify(it);
        if (m.get(it.id) !== j) ops.push({ t: 'set', coll: k, id: it.id, j, c: it._c, key: k });
      });
      for (const id of m.keys()) if (!seen.has(id)) ops.push({ t: 'del', coll: k, id, key: k });
    }
    for (const [key, coll] of Object.entries(MAPS)) {
      const obj = ST[key] || {}, m = synced['$' + coll] || (synced['$' + coll] = new Map());
      Object.entries(obj).forEach(([id, v]) => { const j = JSON.stringify(v); if (m.get(id) !== j) ops.push({ t: 'set', coll, id, j, c: 0, key: '$' + coll }); });
      for (const id of m.keys()) if (!(id in obj)) ops.push({ t: 'del', coll, id, key: '$' + coll });
    }
    const pick = {}; SINGLE.forEach(k => { if (ST[k] !== undefined) pick[k] = ST[k]; });
    const sj = JSON.stringify(pick);
    if (sj !== synced.$meta) ops.push({ t: 'set', coll: 'meta', id: 'state', j: sj, c: 0, key: '$meta' });
    if (!ops.length) { writing = false; sync('Sincronizado'); return; }
    const big = ops.filter(o => o.t === 'set' && o.j.length > MAX_DOC);
    if (big.length) toast('Um registro ficou grande demais para salvar (' + big.map(o => o.coll).join(', ') + '). Reduza imagens coladas direto no design.', 'warn');
    const todo = ops.filter(o => !(o.t === 'set' && o.j.length > MAX_DOC));
    try {
      for (let i = 0; i < todo.length; i += 400) {
        const b = writeBatch(db);
        todo.slice(i, i + 400).forEach(o => {
          if (o.t === 'set') b.set(doc(db, o.coll, o.id), { j: o.j, c: o.c, u: who, t: serverTimestamp() });
          else b.delete(doc(db, o.coll, o.id));
        });
        await b.commit();
      }
      todo.forEach(o => {
        if (o.key === '$meta') synced.$meta = o.j;
        else { const m = synced[o.key]; if (o.t === 'set') m.set(o.id, o.j); else m.delete(o.id); }
      });
      sync('Sincronizado');
    } catch (er) {
      console.error('Falha ao salvar', er);
      sync(er && er.code === 'permission-denied' ? 'Sem permissão para salvar' : 'Sem conexão · tentando de novo', 'warn');
      if (!er || er.code !== 'permission-denied') setTimeout(() => schedule(0), 5000);
    }
    writing = false;
    if (again) { again = false; schedule(200); }
  }
  W.addEventListener('beforeunload', (e) => { if (saveT || writing) { flush(); } });

  /* ---------- API ---------- */
  const api = {
    mode: 'firebase',
    load,
    save() { schedule(); },
    async putAsset(id, dataURL) {
      try {
        const ext = /^data:image\/png/.test(dataURL) ? 'png' : /^data:image\/webp/.test(dataURL) ? 'webp' : 'jpg';
        const r = ref(storage, 'assets/' + id + '.' + ext);
        await uploadString(r, dataURL, 'data_url');
        const url = await getDownloadURL(r);
        (ST.assetUrls = ST.assetUrls || {})[id] = url;
        schedule(300);
      } catch (er) { console.error('upload', er); toast('Não foi possível enviar uma imagem. Ela fica só neste navegador até você tentar de novo.', 'warn'); }
    },
    async reset() {},
    members: () => members.map(m => ({ id: m.sid || m.email, nome: m.nome || m.email, ini: m.ini || initials(m.nome), email: m.email, role: m.role || 'socio', ativo: !!m.ativo })),
    meId: () => me ? (me.sid || me.email) : '',
    isAdmin: () => !!me && me.role === 'admin',
    async addMember({ email: em, nome, ini, role }) {
      em = em.toLowerCase();
      if (members.some(m => m.email === em)) throw new Error('este e-mail já tem acesso');
      await setDoc(doc(db, 'members', em), { nome, ini: ini || initials(nome), role: role === 'admin' ? 'admin' : 'socio', sid: sid(), ativo: false, criado: serverTimestamp() });
      await refreshMembers();
    },
    async updateMember(em, patch) { await setDoc(doc(db, 'members', String(em).toLowerCase()), patch, { merge: true }); await refreshMembers(); },
    async removeMember(em) { if (String(em).toLowerCase() === email()) throw new Error('você não pode remover o próprio acesso'); await deleteDoc(doc(db, 'members', String(em).toLowerCase())); await refreshMembers(); },
    async refreshMarket() { await httpsCallable(fns, 'atualizarMercadoAgora')({}); },
    auth: {
      current: () => auth.currentUser ? { email: email(), uid: auth.currentUser.uid } : null,
      onChange(cb) { listeners.push(cb); onAuthStateChanged(auth, (u) => { if (!signingUp) cb(u); }); },
      signIn: (e, p) => signInWithEmailAndPassword(auth, e, p),
      async signUp(em, pass, nome) {
        em = em.toLowerCase(); signingUp = true;
        try {
          const cred = await createUserWithEmailAndPassword(auth, em, pass);
          try { await updateProfile(cred.user, { displayName: nome }); } catch (er) {}
          await sendEmailVerification(cred.user);
          await signOut(auth);
        } finally { signingUp = false; }
        return { msg: 'Senha criada. Enviamos um link de confirmação para ' + em + '. Clique nele (veja também o spam) e depois entre com seu e-mail e senha.' };
      },
      reset: (e) => sendPasswordResetEmail(auth, e),
      async signOut() { clearTimeout(saveT); if (ST) await flush(); unsubs.forEach(u => u()); unsubs = []; await signOut(auth); },
      message(er) {
        const c = er && er.code;
        return ({
          'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'Não encontramos esse e-mail. Se é seu primeiro acesso, escolha “Primeiro acesso”.',
          'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 'auth/email-already-in-use': 'Este e-mail já tem senha criada. Use Entrar ou Esqueci minha senha.',
          'auth/weak-password': 'A senha precisa ter pelo menos 8 caracteres.', 'auth/invalid-email': 'E-mail inválido.', 'auth/network-request-failed': 'Sem conexão com a internet.',
          'auth/operation-not-allowed': 'O login por e-mail e senha ainda não foi ativado no Firebase.'
        })[c] || (er && er.message) || 'Algo deu errado. Tente de novo.';
      }
    }
  };
  return api;
}
