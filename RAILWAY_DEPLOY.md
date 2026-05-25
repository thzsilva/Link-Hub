# 🚂 Railway Backend Deployment Guide

## Por que Railway?

✅ **Node.js/Express perfeito**
✅ **Deploy automático via GitHub**
✅ **Uptime garantido (sem cold starts)**
✅ **Banco de dados incluído**
✅ **Muito mais simples que Vercel**

---

## 📋 Passo-a-Passo (5 minutos)

### Passo 1: Abrir Railway Dashboard

1. Acesse: **https://railway.app**
2. Clique em **"Login with GitHub"**
3. Autorize o Railway no seu GitHub

### Passo 2: Criar Novo Projeto

1. Clique em **"+ New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure por **"Link-Hub"** e selecione

### Passo 3: Configurar Variáveis de Ambiente

1. Na aba **"Variables"**, adicione:

```
DATABASE_URL=postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://zcuehpfnpdaoknywddbh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU
SUPABASE_STORAGE_BUCKET=linkhub
CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr
NODE_ENV=production
API_PORT=3000
```

### Passo 4: Configurar Build & Start

Na aba **"Settings"**, em **"Build"**:

- **Root Directory**: `/` (deixar vazio)
- **Build Command**: `npm install --legacy-peer-deps && npm run build -w=artifacts/api-server`
- **Start Command**: `node artifacts/api-server/dist/index.mjs`

### Passo 5: Deploy!

Clique em **"Deploy"** e aguarde. Vai levar ~2-3 minutos.

Quando estiver pronto, você verá uma URL como:
```
https://link-hub-prod-random.railway.app
```

---

## ✅ Verificação

Após o deploy estar READY:

```bash
# Teste o health check
curl https://link-hub-prod-random.railway.app/api/healthz

# Resposta esperada:
# {"status":"ok"}
```

---

## 🔗 Próximo Passo: Atualizar Frontend

Após obter a URL do Railway, você precisa atualizar o Frontend com essa URL:

1. Vá para **Vercel Dashboard** → **linkhub-frontend**
2. **Settings** → **Environment Variables**
3. Atualize: `VITE_API_BASE_URL=https://link-hub-prod-random.railway.app`
4. Clique em **"Redeploy"**

---

## 🐛 Troubleshooting

### Deploy falha com erro de build

**Solução**: Verifique se o `npm install --legacy-peer-deps` passando. Adicione `npm ci` antes se necessário.

### Status 502 Bad Gateway

**Solução**: App ainda está iniciando. Aguarde 1-2 minutos. Verifique logs em Railway → "Logs".

### Erro: "Cannot find module"

**Solução**: Verifique que o Start Command está exatamente assim:
```
node artifacts/api-server/dist/index.mjs
```

---

## 📊 Monitoramento

No Dashboard do Railway, você pode ver:

- **Logs em tempo real**: Railway → "Logs"
- **Uso de CPU/Memória**: Railway → "Metrics"
- **Status**: "READY" = tudo ok, "FAILED" = erro no boot

---

## 🎉 Done!

Seu backend agora está:
- ✅ Rodando 24/7 no Railway
- ✅ Conectado ao Supabase PostgreSQL
- ✅ Com Clerk auth funcionando
- ✅ Pronto para produção

Qualquer dúvida, consulte os logs no Railway Dashboard!
