/* Atlas · CRM da Imagine · armazenamento local (modo demonstração e uso sem servidor) */
(function(){
const W = window;
const KEY = 'imagine.crm.v3', OLD = 'imagine.crm.v2', SKEY = 'imagine.session';

const idb = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    try { const r = indexedDB.open('imagine-crm', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }
    catch (e) { rej(e); }
  }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction('kv', mode), q = fn(t.objectStore('kv')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }));
  return { get: (k) => tx('readonly', s => s.get(k)), set: (k, v) => tx('readwrite', s => s.put(v, k)), del: (k) => tx('readwrite', s => s.delete(k)) };
})();
const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

W.createLocalStore = () => {
  const listeners = [];
  let t, user = LS.get(SKEY, null);
  const sync = (txt, k) => W.setSync && W.setSync(txt, k);
  const S = {
    mode: 'local',
    async load() {
      let st = null;
      try { st = await timeout(idb.get(KEY), 2500); } catch (e) {}
      if (!st) st = LS.get(KEY, null);
      if (!st) { const old = LS.get(OLD, null); if (old && old.v) st = old; }
      if (!st || !st.v) st = makeSeed();
      (st.imgLib || []).forEach(m => { if (m.src && m.src.startsWith('data:image/') && !m.src.startsWith('data:image/svg')) { const id = uid('a'); (st.assets = st.assets || {})[id] = m.src; m.src = 'as:' + id; } });
      sync('Salvo neste navegador');
      return st;
    },
    save(st) {
      clearTimeout(t); sync('Salvando…', 'off');
      t = setTimeout(async () => {
        try { await timeout(idb.set(KEY, st), 4000); sync('Salvo neste navegador'); }
        catch (e) { const ok = LS.set(KEY, st); sync(ok ? 'Salvo neste navegador' : 'Sem espaço no navegador para salvar', ok ? '' : 'warn'); }
      }, 400);
    },
    putAsset() {},
    async reset() { try { await idb.del(KEY); } catch (e) {} LS.del(KEY); LS.del(OLD); },
    members() { return SOCIOS; },
    meId() { return 's1'; },
    async refreshMarket() { toast('No modo demonstração o mercado é simulado.'); },
    auth: {
      current: () => user,
      onChange(cb) { listeners.push(cb); setTimeout(() => cb(user), 0); },
      async signIn(email) { user = { email, uid: 'local' }; LS.set(SKEY, user); listeners.forEach(f => f(user)); },
      async signUp(email, pass, nome) { return this.signIn(email); },
      async reset() { throw new Error('No modo demonstração não há envio de e-mail.'); },
      async signOut() { user = null; LS.del(SKEY); },
      message: (er) => er.message
    }
  };
  return S;
};
})();
