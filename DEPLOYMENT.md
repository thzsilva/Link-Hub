# 🚀 Link-Hub Deployment Guide

## 📋 Visão Geral

Link-Hub é um monorepo com:
- **Frontend**: React + Vite + TypeScript (em `artifacts/void`)
- **Backend**: Express.js + TypeScript (em `artifacts/api-server`)
- **Database**: Supabase PostgreSQL
- **Auth**: Clerk
- **Deploy**: Vercel (frontend) + Railway (backend)

---

## 🔧 Pré-requisitos

- Git
- Node.js 18+
- Conta Vercel
- Conta Railway
- Conta Supabase
- Conta Clerk

---

## 📱 Frontend (Vercel)

### Configuração

1. **Acesse** https://vercel.com
2. **Importe** o repositório GitHub
3. **Configure** Environment Variables:
   ```
   VITE_API_BASE_URL=https://[BACKEND_URL].railway.app
   VITE_CLERK_PUBLISHABLE_KEY=[seu_valor]
   ```
4. **Deploy**

### URL
- Production: `https://void-[random].vercel.app`

---

## 🔌 Backend (Railway)

### Configuração

1. **Acesse** https://railway.app
2. **Crie** novo projeto → "Deploy from GitHub repo"
3. **Selecione** Link-Hub repository
4. **Configure** Variables (Settings → Variables):
   ```
   NODE_ENV=production
   API_PORT=3001
   PORT=3001
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_STORAGE_BUCKET=linkhub
   CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   ```

5. **Deploy** clicando em "Deploy"

### Build & Start
- **Build**: Automático via Nixpacks
- **Start**: `node artifacts/api-server/dist/index.mjs` (via Procfile)
- **Health Check**: GET `/api/healthz` → `{"status":"ok"}`

### URL
- Production: `https://[nome].railway.app`

---

## 🧪 Testes Locais

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Build backend
npm run build -w=artifacts/api-server

# Build frontend
npm run build -w=artifacts/void

# Rodar servidor local
npm run dev
```

---

## 📊 Arquitetura

```
Link-Hub/
├── artifacts/
│   ├── void/              # Frontend React + Vite
│   │   ├── src/
│   │   ├── dist/          # Build output
│   │   └── package.json
│   │
│   ├── api-server/        # Backend Express
│   │   ├── src/
│   │   │   ├── index.ts   # Entry point
│   │   │   ├── app.ts     # Express app
│   │   │   └── routes/    # API endpoints
│   │   ├── dist/          # Build output
│   │   └── package.json
│   │
│   └── workspace-core/    # Shared code
│       └── packages/
│
├── lib/                   # Shared libraries
├── Procfile               # Railway start command
├── package.json           # Root workspace
└── tsconfig.json
```

---

## 🔐 Variáveis de Ambiente

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)
```
NODE_ENV=development
API_PORT=3001
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=linkhub
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 🐛 Troubleshooting

### Backend 502 Bad Gateway
- ✅ Verifique se todas as variáveis estão configuradas no Railway
- ✅ Verifique logs: Railway → Logs
- ✅ Teste o health check: `curl https://[url]/api/healthz`

### Frontend npm install falha
- ✅ Certifique-se que `.npmrc` contém `legacy-peer-deps=true`
- ✅ Limpe cache: `npm cache clean --force`
- ✅ Delete `node_modules` e `package-lock.json`, rode `npm install`

### Erro 401 em API calls
- ✅ Verifique se `CLERK_PUBLISHABLE_KEY` está correto
- ✅ Verifique se `CLERK_SECRET_KEY` está no backend
- ✅ Verifique se o frontend está passando tokens corretamente

---

## ✅ Checklist de Deploy

- [ ] Backend online e respondendo em `/api/healthz`
- [ ] Frontend buildando sem erros
- [ ] Variáveis de ambiente configuradas (Frontend + Backend)
- [ ] API_BASE_URL frontend aponta para backend correto
- [ ] Login com Clerk funcionando
- [ ] Criar link testado end-to-end
- [ ] Database persistindo dados corretamente

---

## 📝 Próximas Ações

1. **Backend (Railway)**
   - Abra https://railway.app → seu projeto
   - Verifique se está RUNNING
   - Configure todas as variáveis em Settings → Variables
   - Clique Redeploy

2. **Frontend (Vercel)**
   - Abra https://vercel.com → seu projeto
   - Verifique Environment Variables
   - Adicione `VITE_API_BASE_URL=[URL_Railway]`
   - Clique Redeploy

3. **Teste**
   - Acesse frontend: `https://void-[...].vercel.app`
   - Faça login com Clerk
   - Crie um link
   - Verifique se aparece no dashboard

---

**Última atualização**: 2026-05-25
