# Imagine CRM

CRM interno da **Imagine Concept**, de uso exclusivo dos sócios. Reúne comercial (funil Leads → R1 → Mapeamento → Ativação → Convertido), carteira, financeiro, Mercado 24h, calculadoras com HP12C, estúdio de design, relatórios com pontuação entre sócios e agenda com Google Agenda.

- **Site:** Firebase Hosting (`https://imagine-crm-5174b.web.app`)
- **Login:** Firebase Authentication (e-mail e senha, com confirmação por e-mail)
- **Dados:** Cloud Firestore em São Paulo (`southamerica-east1`), sincronizado em tempo real entre os sócios
- **Imagens do estúdio:** Cloud Storage
- **Mercado 24h:** funções agendadas que buscam cotações a cada 10 minutos e notícias a cada 15 minutos, só de fontes gratuitas
- **Publicação:** automática a cada alteração na branch `main` (GitHub Actions)

---

## Implantação passo a passo

Faça uma única vez. Leva cerca de 40 minutos. Quem fizer precisa ser dono da conta Google que vai administrar o projeto (sugestão: caduliam325@gmail.com).

### 1. Criar o projeto no Firebase

1. Acesse <https://console.firebase.google.com> e clique em **Adicionar projeto**.
2. Nome: `imagine-crm`. O Firebase pode acrescentar um sufixo (ex.: `imagine-crm-3f2a1`). **Anote o ID do projeto.**
3. O Google Analytics pode ficar desativado.
4. Na página inicial do projeto, clique no ícone **</>** (Web) para registrar um app. Apelido: `imagine-crm-web`. Marque **Configurar também o Firebase Hosting**. Pode pular os demais passos da tela.
5. Se o ID não for exatamente `imagine-crm`, troque o nome nos arquivos `.firebaserc` e `cors.json` deste repositório.

### 2. Ativar o plano Blaze e o alerta de gastos

As funções agendadas do Mercado 24h exigem o plano Blaze (pago conforme o uso). Para 3 a 4 sócios, o uso costuma ficar dentro da cota gratuita, com custo próximo de zero.

1. No console, clique em **Fazer upgrade** › **Blaze** e vincule um cartão.
2. Crie um alerta de orçamento de **R$ 50/mês**: <https://console.cloud.google.com/billing> › **Orçamentos e alertas**. O alerta só avisa, não bloqueia.

### 3. Ativar o login

1. Acesse **Authentication** › **Começar** › **Método de login** › **E-mail/senha** › Ativar › Salvar.
2. Em **Authentication** › **Configurações** › **Domínios autorizados**, confirme que aparecem `imagine-crm-5174b.web.app` e `imagine-crm-5174b.firebaseapp.com`.
3. Opcional: em **Authentication** › **Modelos**, traduza o e-mail de verificação e o de redefinição de senha para português (ícone de idioma no topo).

### 4. Criar o banco de dados e o armazenamento

1. Acesse **Firestore Database** › **Criar banco de dados** › local **southamerica-east1 (São Paulo)** › **modo de produção**.
2. Acesse **Storage** › **Começar** › modo de produção › mesma região.
3. As regras de segurança são enviadas automaticamente na primeira publicação. Antes disso, nada fica acessível.

### 5. Permitir exportar imagens do estúdio (CORS)

Necessário para exportar em PNG, PDF ou PPTX designs que tenham fotos enviadas.

1. No console do Google Cloud, abra o **Cloud Shell** (ícone `>_` no topo): <https://console.cloud.google.com/?cloudshell=true>.
2. Rode os comandos abaixo, trocando `imagine-crm-5174b` pelo seu ID:

```bash
cat > cors.json <<'EOF'
[{ "origin": ["https://imagine-crm-5174b.web.app", "https://imagine-crm-5174b.firebaseapp.com"], "method": ["GET"], "maxAgeSeconds": 3600 }]
EOF
gsutil cors set cors.json gs://imagine-crm-5174b.firebasestorage.app
```

Se aparecer erro de bucket inexistente, use `gs://imagine-crm-5174b.appspot.com`. O nome correto aparece no topo da página Storage.

### 6. Ligar o GitHub ao Firebase (publicação automática)

1. Acesse <https://console.cloud.google.com/iam-admin/serviceaccounts>, selecione o projeto e clique em **Criar conta de serviço**.
   - Nome: `github-deploy`.
   - Papéis: **Administrador do Firebase**, **Usuário da conta de serviço**, **Administrador do Cloud Functions**, **Administrador do Cloud Scheduler** e **Leitor de uso de serviço** (Service Usage Consumer).
2. Abra a conta criada › **Chaves** › **Adicionar chave** › JSON. Um arquivo será baixado. **Guarde-o com cuidado e nunca o coloque no repositório.**
3. No GitHub, abra o repositório › **Settings** › **Secrets and variables** › **Actions** › **New repository secret** e crie:
   - `FIREBASE_SERVICE_ACCOUNT`: cole todo o conteúdo do arquivo JSON.
   - `FIREBASE_PROJECT_ID`: o ID do projeto.
4. Em **Actions**, rode o fluxo **Publicar no Firebase** (botão **Run workflow**) ou faça qualquer alteração na `main`.

A primeira publicação leva de 5 a 10 minutos. Se pedir para ativar alguma API (Cloud Functions, Cloud Build, Artifact Registry, Cloud Scheduler, Eventarc), ative pelo link do erro e rode de novo.

### 7. Primeiro acesso (Carlos)

1. Abra `https://imagine-crm-5174b.web.app`.
2. Clique em **Primeiro acesso**, informe nome, o e-mail `caduliam325@gmail.com` e uma senha com 8 caracteres ou mais.
3. Confirme pelo link que chega no e-mail (verifique o spam) e entre com e-mail e senha.
4. Nesse primeiro login, o sistema torna Carlos administrador e libera automaticamente:
   - Kauê Moraes: kaueom690@gmail.com
   - João Bernardo: joaobernardodamico@gmail.com
5. Avise os dois para fazerem o mesmo caminho: **Primeiro acesso**, confirmação do e-mail e login.

> Faça o primeiro acesso logo depois da publicação. Só o e-mail do dono consegue iniciar o sistema, e só uma vez.

Para liberar ou remover alguém depois, use **Configurações** › **Sócios** (somente o administrador).

### 8. Google Agenda (opcional, mas recomendado)

1. Acesse <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com> e ative a **Google Calendar API** no mesmo projeto.
2. Em **APIs e serviços** › **Tela de consentimento OAuth**:
   - Tipo **Externo**, nome "Imagine CRM", e-mail de suporte.
   - Em **Usuários de teste**, adicione os três e-mails dos sócios.
   - Mantenha em modo de teste. Assim não é preciso passar pela verificação do Google.
3. Em **Credenciais** › **Criar credenciais** › **ID do cliente OAuth** › **Aplicativo da Web**.
   - Origens JavaScript autorizadas: `https://imagine-crm-5174b.web.app` e `https://imagine-crm-5174b.firebaseapp.com`.
   - Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`).
4. No CRM, como administrador: **Configurações** › **Google Agenda**, cole o ID.
5. Cada sócio vai em **Agenda** › **Conectar Google Agenda** e autoriza a própria conta.

Os compromissos do Google aparecem na Agenda do CRM. Os eventos criados no CRM podem ser enviados ao Google na hora de salvar. A conexão vale por cerca de 1 hora e é renovada com um clique.

---

## Como funciona

### Mercado 24h

As funções ficam em `functions/index.js` e rodam na região de São Paulo.

| Dado | Fonte gratuita | Frequência |
|---|---|---|
| Ibovespa, IBrX 50, ações da B3, ETFs | Yahoo Finance | 10 min |
| S&P 500, Nasdaq, Dow, Europa, Ásia, DXY, Treasury 10 anos | Yahoo Finance | 10 min |
| Petróleo, ouro, minério, soja, Bitcoin | Yahoo Finance | 10 min |
| Dólar, euro, libra (com histórico de 30 dias) | AwesomeAPI | 10 min |
| Selic, CDI, IPCA 12 meses | Banco Central (SGS 432, 4389 e 13522) | 10 min |
| Notícias | RSS: InfoMoney, Money Times, g1, Agência Brasil, Poder360, E-Investidor, Banco Central, CNBC, MarketWatch | 15 min |

Comportamento:

- As notícias são classificadas por tema e por segmento de cliente.
- As mais relevantes (Copom, Selic, Fed, IPCA etc.) ganham destaque.
- Notícias com mais de 3 dias são apagadas.
- Se uma fonte falhar, o último valor conhecido continua aparecendo.
- O botão **Atualizar agora** força uma atualização, com limite de uma por minuto.
- Os alertas de preço cadastrados pelos sócios são verificados a cada atualização.

Para incluir ativos ou portais, edite as listas `YAHOO` e `FEEDS` no começo de `functions/index.js`. Valores do Yahoo podem ter atraso de até 15 minutos em relação à B3.

### Dados e segurança (LGPD)

- Só e-mails liberados **e confirmados** conseguem ler ou gravar dados (`firestore.rules` e `storage.rules`).
- Somente o administrador libera ou remove sócios.
- Os dados ficam no Brasil, com criptografia em repouso e em trânsito (HTTPS obrigatório).
- Cada registro guarda quem fez a última alteração e quando.
- O backup completo em JSON fica em **Configurações** › **Baixar backup**. Faça um backup mensal.
- Para backups automáticos diários do banco, ative-os em **Firestore** › **Recuperação de desastres**.
- Se dois sócios editarem o mesmo registro ao mesmo tempo, vale a última gravação.

### Estrutura

```
index.html               página do app
src/main.js              escolhe Firebase (publicado) ou modo demonstração (sem Firebase)
src/config.js            dono do sistema e sócios iniciais
src/store-firebase.js    login, sincronização em tempo real, imagens, sócios
src/app/                 telas: comercial, carteira, financeiro, mercado, calculadoras, relatórios, agenda
src/app/studio-*.js      estúdio de design (editor de apresentações e artes)
src/styles/              visual
functions/               robôs do Mercado 24h
firestore.rules          regras de acesso ao banco
storage.rules            regras de acesso às imagens
.github/workflows/       publicação automática
```

### Rodar no computador (opcional)

```bash
npm install
npm run dev          # abre em http://localhost:5173 no modo demonstração
```

Para apontar o ambiente local para o Firebase real, copie `.env.example` para `.env` e preencha com os dados de **Configurações do projeto** › **Seus apps** › **Web**.

### Próximos passos previstos

- Integração com WhatsApp (WhatsApp Business Platform / Cloud API).
