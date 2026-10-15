/* Imagine CRM · Configurações: perfil, sócios, metas, integrações e backup */
(function(){
const W = window;
const V = W.VIEWS = W.VIEWS || {}, A = W.ACT = W.ACT || {}, C = W.CHANGE = W.CHANGE || {};

V.config = () => {
  const S = W.ST, me = socio(W.ME), local = W.Store.mode === 'local', admin = W.Store.isAdmin ? W.Store.isAdmin() : true;
  const mk = W.MKT_LIVE, at = mk && mk.at ? new Date(mk.at) : null;
  return ph('settings', 'Sistema', 'Configurações', local ? 'Modo demonstração · as alterações ficam só neste navegador' : 'Conectado ao Firebase · dados compartilhados entre os sócios') +
  '<div class="cols c2" style="margin-bottom:16px">' +
    cardW('Seu perfil', esc((W.Store.auth.current() || {}).email || ''), '<form id="cfgMe" class="grid-f"><label class="fld"><span>Nome</span><input name="nome" value="' + esc(me.nome) + '"></label><label class="fld"><span>Iniciais</span><input name="ini" maxlength="3" value="' + esc(me.ini) + '"></label></form>' +
      '<div class="row" style="margin-top:12px"><button class="btn btn-primary" data-act="cfgSaveMe">Salvar perfil</button>' + (local ? '' : '<button class="btn btn-ghost" data-act="cfgReset">Trocar minha senha</button>') + '</div>') +
    cardW('Metas e caixa', 'Usados no Início e no Financeiro', '<div class="grid-f"><label class="fld"><span>Meta mensal padrão (R$)</span><input data-chg="cfgMeta" inputmode="decimal" value="' + fNum(S.cfg.metaMes, 2) + '"></label><label class="fld"><span>Saldo em conta hoje (R$)</span><input data-chg="saldo" inputmode="decimal" value="' + fNum(S.saldo, 2) + '"></label></div><p class="muted" style="margin:10px 0 0;font-size:12.5px">A meta de cada mês pode ser ajustada no Financeiro. Os pesos da pontuação ficam em Relatórios › Configurar pontuação.</p>') +
  '</div>' +
  cardW('Sócios', SOCIOS.length + ' com acesso' + (admin ? '' : ' · somente o administrador altera'), '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Situação</th><th></th></tr></thead><tbody>' +
    SOCIOS.map(s => '<tr><td><span class="who">' + av(s.id) + esc(s.nome) + (s.id === W.ME ? ' <small class="muted">(você)</small>' : '') + '</span></td><td>' + esc(s.email || '—') + '</td><td>' + (s.role === 'admin' ? '<span class="pill p-sky nodot">Administrador</span>' : 'Sócio') + '</td><td>' + (local ? '<span class="muted">Demonstração</span>' : s.ativo ? statusPill('Saudável').replace('Saudável', 'Acesso criado') : '<span class="pill p-warn">Aguardando primeiro acesso</span>') + '</td><td class="r">' + (admin && !local && s.id !== W.ME ? '<button class="ibtn" data-act="cfgDelMember" data-email="' + esc(s.email) + '" aria-label="Remover acesso">' + icon('trash', 'ic-sm') + '</button>' : '') + '</td></tr>').join('') + '</tbody></table></div>' +
    (admin && !local ? '<form id="cfgAdd" class="grid-f" style="margin-top:14px;grid-template-columns:repeat(4,minmax(0,1fr))"><label class="fld"><span>Nome</span><input name="nome"></label><label class="fld"><span>E-mail</span><input name="email" type="email"></label><label class="fld"><span>Iniciais</span><input name="ini" maxlength="3"></label><label class="fld"><span>Papel</span><select name="role"><option value="socio">Sócio</option><option value="admin">Administrador</option></select></label></form><div class="row" style="margin-top:10px"><button class="btn btn-primary" data-act="cfgAddMember">' + icon('plus', 'ic-sm') + 'Liberar acesso</button><span class="muted" style="font-size:12.5px">Depois, peça para a pessoa abrir o CRM e escolher “Primeiro acesso” com este e-mail.</span></div>' : '')) +
  '<div class="cols c2" style="margin:16px 0">' +
    cardW('Google Agenda', W.GCal && W.GCal.connected() ? 'Conectado nesta sessão' : 'Cada sócio conecta a própria conta', (local ? '<p class="muted" style="margin:0">Disponível no sistema publicado.</p>' :
      '<label class="fld"><span>ID do cliente OAuth do Google</span><input data-chg="cfgGcal" value="' + esc(S.cfg.gcalClientId || '') + '" placeholder="000000000000-xxxx.apps.googleusercontent.com"' + (admin ? '' : ' disabled') + '></label><p class="muted" style="margin:10px 0;font-size:12.5px">Criado uma única vez no Google Cloud (passo a passo no guia de implantação). Depois, cada sócio clica em Conectar na Agenda.</p>' +
      (S.cfg.gcalClientId ? '<button class="btn" data-act="gcalConnect">' + icon('calendar', 'ic-sm') + (W.GCal.connected() ? 'Reconectar' : 'Conectar meu Google Agenda') + '</button>' : ''))) +
    cardW('Mercado 24h', local ? 'Simulado no modo demonstração' : at ? 'Última atualização: ' + at.toLocaleString('pt-BR') : 'Aguardando a primeira atualização do robô', (local ? '<p class="muted" style="margin:0">No sistema publicado, uma função agendada busca cotações e notícias a cada 10 minutos.</p>' :
      '<p style="margin:0 0 10px">Fontes: ' + esc(((mk && mk.fontes) || ['B3 via Yahoo Finance', 'AwesomeAPI', 'Banco Central (SGS)', 'Portais de notícias por RSS']).join(' · ')) + '</p><button class="btn" data-act="mktRefresh">' + icon('refresh', 'ic-sm') + 'Atualizar agora</button>')) +
  '</div>' +
  cardW('Dados e segurança', 'LGPD', '<div class="stack" style="gap:10px;font-size:13.5px"><span>Os dados ficam no Firestore, com criptografia em repouso e em trânsito. Só e-mails liberados nesta página conseguem ler ou gravar qualquer informação.</span><span>Faça um backup periódico. O arquivo inclui todos os registros, sem as imagens.</span><div class="row"><button class="btn" data-act="cfgBackup">' + icon('download', 'ic-sm') + 'Baixar backup (.json)</button>' + (local ? '<button class="btn btn-ghost" data-act="cfgDemoReset">Restaurar dados de exemplo</button>' : '') + '</div></div>');
};
A.cfgSaveMe = async () => {
  const f = $('#cfgMe'), nome = f.nome.value.trim(), ini = f.ini.value.trim().toUpperCase().slice(0, 3);
  if (!nome) { toast('Informe seu nome.', 'warn'); return; }
  try { if (W.Store.updateMember) await W.Store.updateMember(socio(W.ME).email, { nome, ini: ini || SX.initials(nome) }); const s = socio(W.ME); s.nome = nome; s.ini = ini || SX.initials(nome); $('#meAv').textContent = s.ini; render(); toast('Perfil salvo'); }
  catch (er) { toast('Não foi possível salvar: ' + er.message, 'warn'); }
};
A.cfgReset = async () => { try { await W.Store.auth.reset((W.Store.auth.current() || {}).email); toast('Enviamos um link de troca de senha para o seu e-mail.'); } catch (er) { toast(er.message, 'warn'); } };
A.cfgAddMember = async () => {
  const f = $('#cfgAdd'), email = f.email.value.trim().toLowerCase(), nome = f.nome.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !nome) { toast('Informe nome e um e-mail válido.', 'warn'); return; }
  try { await W.Store.addMember({ email, nome, ini: (f.ini.value.trim() || SX.initials(nome)).toUpperCase().slice(0, 3), role: f.role.value }); W.SOCIOS = W.Store.members(); render(); toast('Acesso liberado para ' + email); }
  catch (er) { toast('Não foi possível liberar: ' + er.message, 'warn'); }
};
A.cfgDelMember = (b) => confirmBox('Remover o acesso de ' + b.dataset.email + '?', 'A pessoa deixa de ver e alterar os dados do CRM. O histórico que ela criou continua salvo.', 'Remover acesso', async () => {
  try { await W.Store.removeMember(b.dataset.email); W.SOCIOS = W.Store.members(); render(); toast('Acesso removido'); } catch (er) { toast(er.message, 'warn'); }
});
C.cfgMeta = (t, ev) => { if (ev.type !== 'change') return; const v = pNum(t.value); if (v > 0) { W.ST.cfg.metaMes = v; persist(); toast('Meta padrão atualizada'); } };
C.cfgGcal = (t, ev) => { if (ev.type !== 'change') return; W.ST.cfg.gcalClientId = t.value.trim(); persist(); render(); toast('ID do Google salvo'); };
A.cfgBackup = () => {
  const copy = JSON.parse(JSON.stringify(W.ST)); delete copy.assets;
  saveFile('imagine-crm-backup-' + iso(TODAY) + '.json', new Blob([JSON.stringify(copy, null, 1)], { type: 'application/json' }));
};
A.cfgDemoReset = () => confirmBox('Restaurar dados de exemplo?', 'Tudo o que foi alterado neste navegador será substituído pelos dados de demonstração.', 'Restaurar', () => W.Store.reset().then(() => location.reload()));
})();
