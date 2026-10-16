/* Atlas · CRM da Imagine · estrutura e dados de exemplo do protótipo */
(function(){
const W = window;

W.SOCIOS = [
  { id: 's1', nome: 'Carlos Marques', ini: 'CM', email: 'caduliam325@gmail.com', role: 'admin' },
  { id: 's2', nome: 'Kauê Moraes', ini: 'KM', email: 'kaueom690@gmail.com', role: 'socio' },
  { id: 's3', nome: 'João Bernardo', ini: 'JB', email: 'joaobernardodamico@gmail.com', role: 'socio' }
];
W.ME = W.ME || 's1';
W.socio = (id) => SOCIOS.find(s => s.id === id) || { nome: '—', ini: '—' };

W.STAGES = ['Leads', 'R1', 'Mapeamento', 'Ativação', 'Convertido', 'Perdido'];
W.SERVICOS = ['Design', 'Financeiro', 'Design + Financeiro'];
W.ORIGENS = ['Indicação', 'Instagram', 'LinkedIn', 'Tráfego pago', 'Evento', 'Site'];
W.MOTIVOS = ['Preço', 'Timing', 'Concorrente', 'Sem resposta', 'Fora do perfil'];

/* Campos obrigatórios para ENTRAR em cada etapa (acumulativos ao longo do funil) */
W.REQ = {
  'R1': [
    { k: 'contato', l: 'Contato confirmado (telefone ou e-mail)', t: 'text' },
    { k: 'origem', l: 'Origem do lead', t: 'select', o: ORIGENS },
    { k: 'dataR1', l: 'Data da R1', t: 'date' }
  ],
  'Mapeamento': [
    { k: 'dor', l: 'Dor principal do cliente', t: 'textarea' },
    { k: 'servico', l: 'Serviço de interesse', t: 'select', o: SERVICOS }
  ],
  'Ativação': [
    { k: 'simData', l: 'Sim verbal · data', t: 'date' },
    { k: 'simSocio', l: 'Sim verbal · sócio que recebeu', t: 'socio' },
    { k: 'servicoAprovado', l: 'Serviço aprovado', t: 'select', o: SERVICOS },
    { k: 'valor', l: 'Valor acordado (R$)', t: 'money' }
  ],
  'Convertido': [
    { k: 'contrato', l: 'Contrato assinado', t: 'check' },
    { k: 'pagamento', l: 'Forma de pagamento', t: 'select', o: ['Pix', 'Boleto', 'Cartão', 'Transferência'] },
    { k: 'inicio', l: 'Data de início', t: 'date' }
  ],
  'Perdido': [
    { k: 'motivo', l: 'Motivo da perda', t: 'select', o: MOTIVOS }
  ]
};
W.reqFor = (stage) => {
  if (stage === 'Perdido') return REQ['Perdido'];
  const out = [];
  for (const s of STAGES.slice(1, STAGES.indexOf(stage) + 1)) if (REQ[s]) out.push(...REQ[s]);
  return out;
};

W.PTS_LABEL = {
  r1: 'R1 realizada', map: 'Mapeamento concluído', ativ: 'Ativação (sim verbal)', conv: 'Cliente convertido',
  design: 'Projeto de design entregue no prazo', indic: 'Indicação recebida de cliente'
};

/* ---------- Seed ---------- */
W.makeSeed = function(){
  const L = (o) => Object.assign({ id: uid('l'), hist: [], f: {}, periodo: 'Tarde · até 18h', modelo: 'Avulso' }, o);
  const fullTo = (stage, extra) => {
    const f = {};
    if (STAGES.indexOf(stage) >= 1) Object.assign(f, { contato: '(41) 9 9' + Math.floor(100 + Math.random() * 899) + '-' + Math.floor(1000 + Math.random() * 8999), origem: ORIGENS[Math.floor(Math.random() * 4)], dataR1: dOff(-12) });
    if (STAGES.indexOf(stage) >= 2) Object.assign(f, { dor: 'Precisa organizar o caixa e reposicionar a marca para atender empresas maiores.', servico: 'Design + Financeiro' });
    if (STAGES.indexOf(stage) >= 3) Object.assign(f, { simData: dOff(-4), simSocio: 's1', servicoAprovado: 'Design + Financeiro', valor: 0 });
    if (STAGES.indexOf(stage) >= 4) Object.assign(f, { contrato: true, pagamento: 'Pix', inicio: dOff(3) });
    return Object.assign(f, extra || {});
  };
  const leads = [
    L({ nome: 'Mariana Kuster', empresa: 'Café Serra Alta', segmento: 'Alimentação', resp: 's1', stage: 'Leads', desde: dOff(-2), valor: 4800, periodo: 'Manhã · até 12h', f: { origem: 'Instagram' } }),
    L({ nome: 'Rafael Tondo', empresa: 'Tondo Usinagem', segmento: 'Indústria', resp: 's2', stage: 'Leads', desde: dOff(-9), valor: 12000, f: {} }),
    L({ nome: 'Juliana Peretti', empresa: 'Peretti Arquitetura', segmento: 'Serviços', resp: 's3', stage: 'Leads', desde: dOff(-1), valor: 6500, f: { contato: 'juliana@peretti.arq.br', origem: 'Indicação' } }),
    L({ nome: 'Diego Andrade', empresa: 'Andrade Pet Center', segmento: 'Varejo', resp: 's3', stage: 'Leads', desde: dOff(-5), valor: 3900, periodo: 'Almoço · 12h às 13h30', f: {} }),
    L({ nome: 'Camila Rocha', empresa: 'Clínica Alma Odonto', segmento: 'Saúde', resp: 's1', stage: 'R1', desde: dOff(-3), valor: 9600, f: fullTo('R1', { dataR1: dOff(1) }) }),
    L({ nome: 'Eduardo Lins', empresa: 'Rota Sul Logística', segmento: 'Logística', resp: 's2', stage: 'R1', desde: dOff(-8), valor: 22000, f: fullTo('R1', { dataR1: dOff(0) }) }),
    L({ nome: 'Patrícia Moura', empresa: 'Studio Ritmo Pilates', segmento: 'Bem-estar', resp: 's3', stage: 'R1', desde: dOff(-4), valor: 5400, periodo: 'Manhã · até 12h', f: fullTo('R1') }),
    L({ nome: 'Henrique Bassi', empresa: 'Construtora Vértice', segmento: 'Construção', resp: 's1', stage: 'Mapeamento', desde: dOff(-6), valor: 38000, modelo: 'Recorrente', f: fullTo('Mapeamento') }),
    L({ nome: 'Lívia Sartori', empresa: 'Lumen Advocacia', segmento: 'Jurídico', resp: 's3', stage: 'Mapeamento', desde: dOff(-11), valor: 14500, f: fullTo('Mapeamento', { servico: 'Design' }) }),
    L({ nome: 'Gustavo Pires', empresa: 'Agro Pinhais', segmento: 'Agronegócio', resp: 's2', stage: 'Mapeamento', desde: dOff(-2), valor: 45000, modelo: 'Recorrente', f: fullTo('Mapeamento', { servico: 'Financeiro' }) }),
    L({ nome: 'Fernanda Lacerda', empresa: 'Ótica Visão Clara', segmento: 'Varejo', resp: 's3', stage: 'Ativação', desde: dOff(-3), valor: 8900, f: fullTo('Ativação', { valor: 8900, servicoAprovado: 'Design' }) }),
    L({ nome: 'Marcos Vidal', empresa: 'Vidal Contabilidade', segmento: 'Serviços', resp: 's1', stage: 'Ativação', desde: dOff(-1), valor: 2600, modelo: 'Recorrente', f: fullTo('Ativação', { valor: 2600, servicoAprovado: 'Financeiro' }) }),
    L({ nome: 'Ana Beatriz Kremer', empresa: 'Kremer Móveis', segmento: 'Indústria', resp: 's2', stage: 'Convertido', desde: dOff(-20), valor: 18400, f: fullTo('Convertido', { valor: 18400 }) }),
    L({ nome: 'Thiago Mendes', empresa: 'Padaria Trigo Fino', segmento: 'Alimentação', resp: 's3', stage: 'Convertido', desde: dOff(-35), valor: 1900, modelo: 'Recorrente', f: fullTo('Convertido', { valor: 1900, servicoAprovado: 'Financeiro' }) }),
    L({ nome: 'Renata Albuquerque', empresa: 'Bistrô Araucária', segmento: 'Alimentação', resp: 's1', stage: 'Convertido', desde: dOff(-48), valor: 7200, f: fullTo('Convertido', { valor: 7200, servicoAprovado: 'Design' }) }),
    L({ nome: 'Carlos Hoffmann', empresa: 'Hoffmann Auto Peças', segmento: 'Varejo', resp: 's3', stage: 'Perdido', desde: dOff(-15), valor: 11000, f: fullTo('R1', { motivo: 'Preço' }) }),
    L({ nome: 'Beatriz Lemos', empresa: 'Lemos Eventos', segmento: 'Eventos', resp: 's2', stage: 'Perdido', desde: dOff(-22), valor: 6000, f: fullTo('Mapeamento', { motivo: 'Timing' }) })
  ];
  leads.forEach(l => {
    if (l.f.valor === 0) l.f.valor = l.valor;
    l.criado = l.criado || dOff(-daysSince(l.desde) - 6);
    l.hist = [
      { d: l.criado, txt: 'Lead criado · origem ' + (l.f.origem || 'não informada'), by: l.resp },
      ...(STAGES.indexOf(l.stage) > 0 ? [{ d: l.desde, txt: 'Movido para ' + l.stage, by: l.resp }] : [])
    ];
  });

  const clientes = [
    { id: 'c1', nome: 'Kremer Móveis', segmento: 'Indústria', servicos: ['Design', 'Financeiro'], modelo: 'Recorrente', valor: 3800, desde: dOff(-20), resp: 's2', saude: 'Saudável', cor: ['#3B2A1E', '#C9A27A', '#F3EBDD'], fontes: ['Playfair Display', 'IBM Plex Sans'], tom: 'Artesanal, sólido, familiar' },
    { id: 'c2', nome: 'Padaria Trigo Fino', segmento: 'Alimentação', servicos: ['Financeiro'], modelo: 'Recorrente', valor: 1900, desde: dOff(-35), resp: 's3', saude: 'Saudável', cor: ['#5A2E12', '#E9A33B', '#FFF4E0'], fontes: ['DM Serif Display', 'Montserrat'], tom: 'Acolhedor e próximo' },
    { id: 'c3', nome: 'Bistrô Araucária', segmento: 'Alimentação', servicos: ['Design'], modelo: 'Avulso', valor: 7200, desde: dOff(-48), resp: 's1', saude: 'Atenção', cor: ['#1F3B2D', '#B7C9A8', '#F2EEE3'], fontes: ['Playfair Display', 'Montserrat'], tom: 'Sofisticado, regional' },
    { id: 'c4', nome: 'Tecnoponto Sistemas', segmento: 'Tecnologia', servicos: ['Design', 'Financeiro'], modelo: 'Recorrente', valor: 5400, desde: dOff(-140), resp: 's1', saude: 'Saudável', cor: ['#0B1F3A', '#22C1C3', '#E8F7F7'], fontes: ['Archivo', 'IBM Plex Sans'], tom: 'Técnico e direto' },
    { id: 'c5', nome: 'Clínica Vita Derm', segmento: 'Saúde', servicos: ['Design'], modelo: 'Recorrente', valor: 2800, desde: dOff(-95), resp: 's3', saude: 'Risco', cor: ['#3D2C3E', '#D9A5B3', '#FBF1F3'], fontes: ['DM Serif Display', 'IBM Plex Sans'], tom: 'Cuidadoso e elegante' },
    { id: 'c6', nome: 'Grupo Ferraz Imóveis', segmento: 'Imobiliário', servicos: ['Financeiro'], modelo: 'Recorrente', valor: 4200, desde: dOff(-210), resp: 's2', saude: 'Saudável', cor: ['#111827', '#C8A951', '#F5F1E6'], fontes: ['Bebas Neue', 'Montserrat'], tom: 'Confiável, alto padrão' },
    { id: 'c7', nome: 'Estúdio Norte Fitness', segmento: 'Bem-estar', servicos: ['Design'], modelo: 'Avulso', valor: 4600, desde: dOff(-60), resp: 's3', saude: 'Atenção', cor: ['#101010', '#F25C2A', '#FFFFFF'], fontes: ['Bebas Neue', 'IBM Plex Sans'], tom: 'Energético' },
    { id: 'c8', nome: 'Vidal Contabilidade', segmento: 'Serviços', servicos: ['Financeiro'], modelo: 'Recorrente', valor: 2600, desde: dOff(-1), resp: 's1', saude: 'Saudável', cor: ['#0E2152', '#8FB0FF', '#F2F4F8'], fontes: ['Archivo', 'IBM Plex Sans'], tom: 'Sério e claro' }
  ];

  const dIn = (k, day) => iso(new Date(TODAY.getFullYear(), TODAY.getMonth() - k, day));
  const R = (quem, desc, venc, valor, modelo, pago) => ({ id: uid('r'), quem, desc, venc, valor, modelo, status: pago ? 'Pago' : 'Em aberto', pagoEm: pago ? venc : null });
  const Pg = (quem, cat, venc, valor, pago) => ({ id: uid('p'), quem, cat, venc, valor, status: pago ? 'Pago' : 'Em aberto', pagoEm: pago ? venc : null });
  const receber = [], pagar = [];
  const recorr = [['Grupo Ferraz Imóveis', 'Consultoria financeira mensal', 4200, 5], ['Tecnoponto Sistemas', 'Mensalidade design + financeiro', 5400, 4], ['Clínica Vita Derm', 'Gestão de redes sociais', 2800, 3], ['Padaria Trigo Fino', 'Planejamento financeiro mensal', 1900, 1]];
  const avulsos = { 5: ['Estúdio Alfa', 'Logo e cartão de visita', 3200], 4: ['Lumen Advocacia', 'Apresentação institucional', 4500], 3: ['Bistrô Araucária', 'Identidade visual · 50% inicial', 3600], 2: ['Padaria Trigo Fino', 'Embalagens', 2900], 1: ['Estúdio Norte Fitness', 'Identidade visual · 50% inicial', 2300] };
  for (let k = 5; k >= 1; k--) {
    recorr.forEach(([q, d, v, since]) => { if (k <= since) receber.push(R(q, d, dIn(k, 10), v, 'Recorrente', true)); });
    if (avulsos[k]) receber.push(R(avulsos[k][0], avulsos[k][1], dIn(k, 18), avulsos[k][2], 'Avulso', true));
    pagar.push(Pg('Coworking Batel', 'Estrutura', dIn(k, 5), 1800, true), Pg('Adobe Creative Cloud', 'Software', dIn(k, 8), 290, true), Pg('Escritório contábil', 'Serviços', dIn(k, 15), 650, true), Pg('Hospedagem e domínios', 'Software', dIn(k, 20), 120, true));
    if (k <= 3) pagar.push(Pg('Tráfego pago (Meta)', 'Marketing', dIn(k, 12), 900 + (3 - k) * 150, true));
    if (k === 2) pagar.push(Pg('Freelancer motion', 'Terceiros', dIn(k, 22), 1500, true));
  }
  receber.push(
    R('Tecnoponto Sistemas', 'Mensalidade design + financeiro', dOff(-10), 5400, 'Recorrente', true),
    R('Grupo Ferraz Imóveis', 'Consultoria financeira mensal', dOff(-5), 4200, 'Recorrente', true),
    R('Kremer Móveis', 'Mensalidade · parcela 1', dOff(-3), 3800, 'Recorrente', false),
    R('Clínica Vita Derm', 'Gestão de redes sociais', dOff(2), 2800, 'Recorrente', false),
    R('Estúdio Norte Fitness', 'Identidade visual · 50% final', dOff(6), 2300, 'Avulso', false),
    R('Padaria Trigo Fino', 'Planejamento financeiro mensal', dOff(9), 1900, 'Recorrente', false),
    R('Bistrô Araucária', 'Cardápio e sinalização', dOff(14), 3600, 'Avulso', false)
  );
  pagar.push(
    Pg('Adobe Creative Cloud', 'Software', dOff(-8), 290, true), Pg('Coworking Batel', 'Estrutura', dOff(-5), 1800, true),
    Pg('Escritório contábil', 'Serviços', dOff(1), 650, false), Pg('Tráfego pago (Meta)', 'Marketing', dOff(4), 1200, false),
    Pg('Banco de imagens', 'Software', dOff(7), 180, false), Pg('Freelancer motion', 'Terceiros', dOff(12), 1500, false), Pg('Hospedagem e domínios', 'Software', dOff(15), 120, false)
  );
  const projetos = [
    { proj: 'Identidade visual completa', cliente: 'Estúdio Norte Fitness', receita: 4600, horas: 38, custoHora: 55, terceiros: 300 },
    { proj: 'Cardápio e sinalização', cliente: 'Bistrô Araucária', receita: 7200, horas: 64, custoHora: 55, terceiros: 1400 },
    { proj: 'Planejamento financeiro anual', cliente: 'Grupo Ferraz Imóveis', receita: 4200, horas: 22, custoHora: 70, terceiros: 0 },
    { proj: 'Social media mensal', cliente: 'Clínica Vita Derm', receita: 2800, horas: 30, custoHora: 55, terceiros: 180 },
    { proj: 'Rebranding + fluxo de caixa', cliente: 'Tecnoponto Sistemas', receita: 5400, horas: 48, custoHora: 62, terceiros: 400 },
    { proj: 'Fluxo de caixa e precificação', cliente: 'Padaria Trigo Fino', receita: 1900, horas: 12, custoHora: 70, terceiros: 0 }
  ];

  const pontos = [];
  const addP = (dd, s, k, ref) => pontos.push({ id: uid('pt'), d: dOff(dd), socio: s, k, ref });
  addP(-1, 's1', 'ativ', 'Vidal Contabilidade'); addP(-1, 's1', 'map', 'Vidal Contabilidade');
  addP(-3, 's3', 'ativ', 'Ótica Visão Clara'); addP(-3, 's3', 'map', 'Ótica Visão Clara');
  addP(-2, 's2', 'r1', 'Agro Pinhais'); addP(-6, 's1', 'r1', 'Construtora Vértice'); addP(-11, 's3', 'r1', 'Lumen Advocacia');
  addP(-20, 's2', 'conv', 'Kremer Móveis'); addP(-9, 's3', 'design', 'Padaria Trigo Fino'); addP(-4, 's3', 'design', 'Clínica Vita Derm');
  addP(-7, 's1', 'indic', 'Peretti Arquitetura'); addP(-13, 's2', 'r1', 'Rota Sul Logística'); addP(-5, 's3', 'r1', 'Studio Ritmo Pilates');

  const design = [
    { id: uid('d'), cliente: 'Estúdio Norte Fitness', peca: 'Manual de marca', etapa: 'Revisão', prazo: dOff(3), rodada: 2, resp: 's3' },
    { id: uid('d'), cliente: 'Bistrô Araucária', peca: 'Cardápio impresso', etapa: 'Criação', prazo: dOff(6), rodada: 1, resp: 's1' },
    { id: uid('d'), cliente: 'Clínica Vita Derm', peca: 'Posts de novembro (12)', etapa: 'Briefing', prazo: dOff(10), rodada: 0, resp: 's3' },
    { id: uid('d'), cliente: 'Tecnoponto Sistemas', peca: 'Apresentação institucional', etapa: 'Criação', prazo: dOff(2), rodada: 1, resp: 's1' },
    { id: uid('d'), cliente: 'Kremer Móveis', peca: 'Catálogo de produtos', etapa: 'Briefing', prazo: dOff(18), rodada: 0, resp: 's2' },
    { id: uid('d'), cliente: 'Grupo Ferraz Imóveis', peca: 'Relatório financeiro trimestral', etapa: 'Aprovado', prazo: dOff(1), rodada: 2, resp: 's2' },
    { id: uid('d'), cliente: 'Padaria Trigo Fino', peca: 'Embalagem de pães', etapa: 'Entregue', prazo: dOff(-9), rodada: 3, resp: 's3' }
  ];

  const vitrine = [
    { id: uid('v'), titulo: 'Identidade Norte Fitness', cliente: 'Estúdio Norte Fitness', cat: 'Identidade visual', ano: 2026, kit: 'c7', estilo: 'bold' },
    { id: uid('v'), titulo: 'Cardápio Bistrô Araucária', cliente: 'Bistrô Araucária', cat: 'Impressos', ano: 2026, kit: 'c3', estilo: 'serif' },
    { id: uid('v'), titulo: 'Rebranding Tecnoponto', cliente: 'Tecnoponto Sistemas', cat: 'Identidade visual', ano: 2026, kit: 'c4', estilo: 'grid' },
    { id: uid('v'), titulo: 'Campanha Vita Derm', cliente: 'Clínica Vita Derm', cat: 'Social media', ano: 2026, kit: 'c5', estilo: 'soft' },
    { id: uid('v'), titulo: 'Relatório Ferraz T3', cliente: 'Grupo Ferraz Imóveis', cat: 'Apresentações', ano: 2026, kit: 'c6', estilo: 'grid' },
    { id: uid('v'), titulo: 'Embalagens Trigo Fino', cliente: 'Padaria Trigo Fino', cat: 'Embalagens', ano: 2026, kit: 'c2', estilo: 'serif' }
  ];

  const mood = {
    c7: [{ id: uid('m'), t: 'cor', v: '#F25C2A', cap: 'Laranja energia' }, { id: uid('m'), t: 'nota', v: 'Referência: academias boutique de Lisboa e Berlim.\nTipografia condensada, fotos em P&B com 1 cor de destaque.' }, { id: uid('m'), t: 'cor', v: '#101010', cap: 'Preto base' }],
    c3: [{ id: uid('m'), t: 'cor', v: '#1F3B2D', cap: 'Verde araucária' }, { id: uid('m'), t: 'nota', v: 'Pinhão, madeira e linho. Evitar clichês de “rústico”.' }, { id: uid('m'), t: 'cor', v: '#B7C9A8', cap: 'Sálvia' }],
    c4: [{ id: uid('m'), t: 'cor', v: '#22C1C3', cap: 'Ciano' }, { id: uid('m'), t: 'nota', v: 'Grid modular, ícones de linha, sem gradientes.' }]
  };

  const eventos = [];
  const ev = (dd, h, dur, t, tipo, ref) => eventos.push({ id: uid('e'), d: dOff(dd), h, dur, t, tipo, ref });
  for (let i = -3; i <= 4; i++) {
    const wd = pDate(dOff(i)).getDay();
    if (wd === 0 || wd === 6) continue;
    ev(i, 9, 0.5, 'Daily dos sócios', 'int');
  }
  ev(0, 10, 1, 'R1 · Rota Sul Logística', 'r1', 'Eduardo Lins');
  ev(0, 14, 1.5, 'Mapeamento · Construtora Vértice', 'map', 'Henrique Bassi');
  ev(0, 16.5, 0.5, 'Aprovação manual de marca · Norte Fitness', 'des');
  ev(1, 11, 1, 'R1 · Clínica Alma Odonto', 'r1', 'Camila Rocha');
  ev(1, 15, 1, 'Fechamento · Vidal Contabilidade', 'map');
  ev(-1, 14, 1, 'Mapeamento · Agro Pinhais', 'map');
  ev(-2, 10.5, 1, 'Revisão cardápio · Bistrô Araucária', 'des');
  ev(2, 13.5, 1.5, 'Entrega apresentação · Tecnoponto', 'des');
  ev(3, 10, 1, 'R1 · Studio Ritmo Pilates', 'r1');

  const tarefas = [
    { id: uid('t'), t: 'Enviar proposta revisada para Construtora Vértice', ok: false, d: dOff(0), resp: 's1' },
    { id: uid('t'), t: 'Cobrar parcela vencida da Kremer Móveis', ok: false, d: dOff(0), resp: 's2' },
    { id: uid('t'), t: 'Briefing de posts de novembro · Vita Derm', ok: false, d: dOff(1), resp: 's3' },
    { id: uid('t'), t: 'Conciliar extrato de setembro', ok: true, d: dOff(-1), resp: 's1' }
  ];

  return {
    v: 2, leads, clientes, receber, pagar, projetos, pontos, design, vitrine, mood, eventos, tarefas,
    cfg: { pts: { r1: 5, map: 10, ativ: 15, conv: 30, design: 10, indic: 5 }, metaMes: 22000, metas: {} }, saldo: 24300,
    agendaEco: AGENDA_ECO.map(e => ({ id: uid('ae'), d: dOff(e.dd), h: e.h, t: e.t, p: e.p, imp: e.imp })),
    alertas: [
      { id: uid('a'), ativo: 'USD/BRL', cond: 'acima de', valor: 5.6 },
      { id: uid('a'), ativo: 'Ibovespa', cond: 'abaixo de', valor: 135000 }
    ],
    docs: [], nota: ''
  };
};

/* ---------- Mercado (ilustrativo) ---------- */
W.MKT = {
  br: [
    { s: 'Ibovespa', v: 142380, c: 0.84, u: 'pts', d: 0 },
    { s: 'IBrX 100', v: 59870, c: 0.71, u: 'pts', d: 0 },
    { s: 'Small Caps', v: 2215, c: -0.32, u: 'pts', d: 0 },
    { s: 'IFIX', v: 3392, c: 0.12, u: 'pts', d: 0 }
  ],
  intl: [
    { s: 'S&P 500', v: 6612, c: 0.42, u: 'pts', d: 0 },
    { s: 'Nasdaq', v: 22140, c: 0.77, u: 'pts', d: 0 },
    { s: 'Dow Jones', v: 46280, c: 0.18, u: 'pts', d: 0 },
    { s: 'Euro Stoxx 50', v: 5480, c: -0.21, u: 'pts', d: 0 },
    { s: 'DAX', v: 24310, c: -0.15, u: 'pts', d: 0 },
    { s: 'FTSE 100', v: 9380, c: 0.09, u: 'pts', d: 0 },
    { s: 'Nikkei 225', v: 45120, c: 1.12, u: 'pts', d: 0 },
    { s: 'Hang Seng', v: 26050, c: -0.64, u: 'pts', d: 0 }
  ],
  fx: [
    { s: 'USD/BRL', v: 5.418, c: -0.36, u: 'R$', d: 3 },
    { s: 'EUR/BRL', v: 6.302, c: -0.18, u: 'R$', d: 3 },
    { s: 'DXY', v: 98.4, c: 0.11, u: 'pts', d: 1 },
    { s: 'Bitcoin', v: 612400, c: 1.85, u: 'R$', d: 0 }
  ],
  cmd: [
    { s: 'Petróleo Brent', v: 67.8, c: 0.95, u: 'US$', d: 2 },
    { s: 'Ouro', v: 3985, c: 0.28, u: 'US$', d: 0 },
    { s: 'Minério de ferro', v: 104.6, c: -0.44, u: 'US$', d: 1 },
    { s: 'Soja (Chicago)', v: 10.42, c: 0.31, u: 'US$', d: 2 }
  ],
  juros: [
    { s: 'Selic', v: 15.0, c: 0, u: '%', d: 2 },
    { s: 'CDI', v: 14.9, c: 0, u: '%', d: 2 },
    { s: 'IPCA 12m', v: 5.1, c: 0, u: '%', d: 2 },
    { s: 'DI jan/27', v: 14.62, c: -0.04, u: '%', d: 2, abs: true },
    { s: 'Treasury 10 anos', v: 4.08, c: 0.02, u: '%', d: 2, abs: true }
  ],
  acoes: [
    { s: 'PETR4', v: 31.42, c: 1.21, u: 'R$', d: 2 }, { s: 'VALE3', v: 54.18, c: -0.62, u: 'R$', d: 2 },
    { s: 'ITUB4', v: 38.76, c: 0.48, u: 'R$', d: 2 }, { s: 'BBAS3', v: 22.05, c: -0.27, u: 'R$', d: 2 },
    { s: 'WEGE3', v: 42.9, c: 0.94, u: 'R$', d: 2 }, { s: 'ABEV3', v: 12.66, c: 0.16, u: 'R$', d: 2 }
  ]
};
W.NEWS_CATS = ['Todas', 'Bolsa BR', 'Juros e inflação', 'Câmbio', 'Internacional', 'Commodities', 'Empresas', 'Agro'];
W.NEWS = [
  { h: 0, mi: 18, cat: 'Bolsa BR', hot: true, t: 'Ibovespa abre em alta acompanhando o exterior e a melhora das commodities', r: 'Fluxo estrangeiro positivo pelo terceiro pregão seguido; bancos e mineradoras puxam o índice.', seg: [] },
  { h: 0, mi: 41, cat: 'Juros e inflação', hot: true, t: 'Mercado revisa projeção de inflação para baixo no boletim semanal', r: 'Curva de juros futuros cede nos vencimentos curtos; aposta em manutenção da Selic na próxima reunião.', seg: ['Serviços', 'Imobiliário'] },
  { h: 1, mi: 5, cat: 'Câmbio', t: 'Dólar recua frente ao real com apetite por risco global', r: 'Moeda americana opera abaixo de R$ 5,45 após dados de emprego nos EUA.', seg: ['Indústria'] },
  { h: 1, mi: 52, cat: 'Internacional', t: 'Bolsas de Nova York sobem com balanços de tecnologia acima do esperado', r: 'Nasdaq lidera os ganhos; investidores aguardam falas de dirigentes do Fed.', seg: ['Tecnologia'] },
  { h: 2, mi: 30, cat: 'Agro', t: 'Safra de soja deve bater recorde, aponta nova estimativa oficial', r: 'Paraná e Mato Grosso concentram a alta de produtividade; preços seguem pressionados.', seg: ['Agronegócio'] },
  { h: 3, mi: 14, cat: 'Commodities', t: 'Petróleo avança com sinais de corte de produção', r: 'Brent volta a superar US$ 67 o barril; ações de petroleiras reagem.', seg: ['Logística'] },
  { h: 4, mi: 2, cat: 'Empresas', t: 'Varejistas reportam vendas mais fortes no Dia das Crianças', r: 'Setor de brinquedos e eletrônicos lidera; crédito mais caro ainda limita parcelamentos.', seg: ['Varejo'] },
  { h: 5, mi: 40, cat: 'Internacional', t: 'Banco Central Europeu mantém juros e sinaliza cautela', r: 'Euro opera estável; bolsas europeias fecham sem direção única.', seg: [] },
  { h: 7, mi: 10, cat: 'Juros e inflação', t: 'Custo do crédito para pequenas empresas segue elevado, mostra pesquisa', r: 'Capital de giro é a principal demanda; prazo médio dos empréstimos encurta.', seg: ['Alimentação', 'Varejo', 'Serviços'] },
  { h: 9, mi: 25, cat: 'Bolsa BR', t: 'Fundos imobiliários de tijolo ganham espaço com expectativa de juros menores', r: 'IFIX acumula alta no mês; segmentos de logística e lajes corporativas se destacam.', seg: ['Imobiliário'] },
  { h: 12, mi: 0, cat: 'Commodities', t: 'Minério de ferro cai na China com estoques elevados nos portos', r: 'Mineradoras listadas recuam no pré-mercado.', seg: ['Indústria'] },
  { h: 15, mi: 33, cat: 'Empresas', t: 'Setor de saúde privada amplia investimentos em clínicas de especialidade', r: 'Consolidação regional avança; margens melhoram com redução de sinistralidade.', seg: ['Saúde'] }
];
W.AGENDA_ECO = [
  { dd: 1, h: '09:00', t: 'IPCA-15 · prévia da inflação', p: 'Brasil', imp: 3 },
  { dd: 1, h: '09:30', t: 'Vendas no varejo', p: 'EUA', imp: 2 },
  { dd: 2, h: '10:00', t: 'Confiança do consumidor', p: 'Brasil', imp: 1 },
  { dd: 5, h: '18:30', t: 'Decisão de juros · Copom', p: 'Brasil', imp: 3 },
  { dd: 6, h: '15:00', t: 'Decisão de juros · FOMC', p: 'EUA', imp: 3 },
  { dd: 8, h: '09:30', t: 'Payroll · relatório de emprego', p: 'EUA', imp: 3 },
  { dd: 9, h: '09:00', t: 'Produção industrial', p: 'Brasil', imp: 2 }
];
W.LINKS = [
  { t: 'B3 · Cotações e índices', u: 'https://www.b3.com.br' },
  { t: 'Banco Central · Focus e Selic', u: 'https://www.bcb.gov.br' },
  { t: 'Tesouro Direto · Taxas', u: 'https://www.tesourodireto.com.br' },
  { t: 'Receita Federal · CNPJ', u: 'https://www.gov.br/receitafederal' },
  { t: 'Google Agenda', u: 'https://calendar.google.com' },
  { t: 'Google Fonts', u: 'https://fonts.google.com' }
];
})();
