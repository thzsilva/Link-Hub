# ✅ Deployment Checklist - Link-Hub

## 📊 Status do Projeto

✅ **Código**: Sem problemas, pronto para deploy
✅ **Dependências**: Configuradas corretamente
✅ **Build**: Testado localmente e funcionando
✅ **Documentação**: Consolidada em `DEPLOYMENT.md`

---

## 🔧 Setup Railway Backend (5 minutos)

### 1️⃣ Acesse Railway
- Abra: https://railway.app
- Faça login com GitHub

### 2️⃣ Crie o Projeto
- Clique: **+ New Project**
- Selecione: **Deploy from GitHub repo**
- Procure e selecione: **Link-Hub**
- Branch: **main**
- Clique: **Deploy**

### 3️⃣ Configure as Variáveis
- Após criar, vá à aba: **Variables**
- Clique: **Add Variable** (repita para cada linha abaixo)

```
NODE_ENV = production
API_PORT = 3001
PORT = 3001
DATABASE_URL = postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL = https://zcuehpfnpdaoknywddbh.supabase.co
SUPABASE_ANON_KEY = sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU
SUPABASE_STORAGE_BUCKET = linkhub
CLERK_PUBLISHABLE_KEY = pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY = sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr
```

### 4️⃣ Aguarde Deploy
- Status muda para **READY** (verde) em ~3 minutos
- Note a URL: `https://[seu-nome].railway.app`

### 5️⃣ Teste o Backend
```bash
curl https://[seu-nome].railway.app/api/healthz
# Esperado: {"status":"ok"}
```

---

## 🎨 Setup Vercel Frontend (5 minutos)

### 1️⃣ Acesse Vercel
- Abra: https://vercel.com
- Faça login com GitHub

### 2️⃣ Crie o Projeto
- Clique: **Import Project** (ou **Add New** → **Project**)
- Procure e selecione: **Link-Hub**
- Clique: **Import**

### 3️⃣ Configure o Build
- **Framework**: Vercel auto-detecta (Vite)
- Clique: **Deploy**
- Aguarde ~2 minutos

### 4️⃣ Configure as Variáveis
- Após deploy, vá: **Settings** → **Environment Variables**
- Adicione:
  ```
  VITE_API_BASE_URL = https://[URL_DO_RAILWAY].railway.app
  VITE_CLERK_PUBLISHABLE_KEY = pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
  ```

### 5️⃣ Redeploy
- Vá: **Deployments**
- Clique no último deploy → **...** → **Redeploy**
- Aguarde ~1 minuto

---

## 🧪 Teste End-to-End

1. **Abra o frontend**
   - URL: `https://void-[random].vercel.app`

2. **Faça login**
   - Clique: **Entrar**
   - Use conta Clerk

3. **Crie um link**
   - Go para: **Dashboard** → **Links**
   - Clique: **+ Novo Link**
   - Preencha dados
   - Clique: **Salvar**

4. **Verifique banco de dados**
   - O link deve aparecer na lista
   - Está salvo no PostgreSQL ✅

---

## 📝 URLs Finais

- **Frontend**: `https://void-[random].vercel.app`
- **Backend**: `https://[nome].railway.app`
- **Health Check**: `https://[nome].railway.app/api/healthz`

---

## ❌ Se der erro

### Backend 502 Bad Gateway
1. Verifique se **todas as variáveis** estão em Railway
2. Clique: **Redeploy**
3. Aguarde 2-3 minutos
4. Teste novamente: `curl https://[url]/api/healthz`

### Frontend npm install falha
1. Vercel deve usar `.npmrc` automaticamente
2. Se não funcionar, contate suporte Vercel

### Login não funciona
1. Verifique `VITE_CLERK_PUBLISHABLE_KEY` no frontend
2. Verifique `CLERK_SECRET_KEY` no backend
3. Se precisa redeployar, click **Redeploy** em ambos

---

**Tempo total estimado**: ~10-15 minutos
**Status**: Pronto para deployar 🚀
