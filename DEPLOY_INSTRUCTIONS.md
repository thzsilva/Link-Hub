# 🚀 Link-Hub Deploy Instructions

## Arquitetura

- **Frontend**: Vercel Project 1 - `artifacts/void`
- **Backend API**: Vercel Project 2 - `artifacts/api-server`
- **Repositório**: Monorepo único no GitHub

## Pré-requisitos

✅ Conta Vercel criada e conectada ao GitHub
✅ Repositório GitHub com as mudanças commitadas
✅ Variáveis de ambiente configuradas

---

## 📋 Passo 1: Deploy do Backend (API)

### 1.1 Criar novo projeto Vercel para Backend

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Selecione seu repositório `Link-Hub`
3. Configure:
   - **Project Name**: `linkhub-api`
   - **Root Directory**: `/` (deixar vazio ou padrão)
   - **Framework Preset**: `Other` (pois é Express.js)
   - **Build Command**: `npm install --legacy-peer-deps && npm run build -w=artifacts/api-server`
   - **Output Directory**: `artifacts/api-server/dist`
   - **Install Command**: `npm install --legacy-peer-deps`

### 1.2 Adicionar Variáveis de Ambiente

No dashboard do projeto, vá para **Settings → Environment Variables** e adicione:

```bash
# Banco de Dados (Supabase)
DATABASE_URL=postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres

# Supabase
SUPABASE_URL=https://zcuehpfnpdaoknywddbh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU
SUPABASE_STORAGE_BUCKET=linkhub

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr

# Configuração
NODE_ENV=production
API_PORT=3001
```

### 1.3 Deploy

Clique em **Deploy** e aguarde ✅

**Nota a URL do seu backend, ex**: `https://linkhub-api.vercel.app`

---

## 📋 Passo 2: Deploy do Frontend

### 2.1 Atualizar projeto existente ou criar novo

**Opção A** (Recomendado): Atualizar o projeto existente
1. Acesse [linkhub-frontend-chi.vercel.app](https://linkhub-frontend-chi.vercel.app) no Vercel
2. Vá para **Settings**
3. Configure conforme abaixo

**Opção B**: Criar novo projeto
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Selecione seu repositório

### 2.2 Configurar Build & Output

**Settings → General**:
- **Build Command**: `npm install --legacy-peer-deps && npm run build -w=artifacts/void`
- **Output Directory**: `artifacts/void/dist`
- **Install Command**: `npm install --legacy-peer-deps`

### 2.3 Adicionar Variáveis de Ambiente

**Settings → Environment Variables**:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk

# 🔴 IMPORTANTE: Usar a URL do seu backend (do Passo 1)
VITE_API_BASE_URL=https://linkhub-api.vercel.app

VITE_CLERK_PROXY_URL=/api/webhooks/clerk
```

### 2.4 Deploy

Clique em **Redeploy** e aguarde ✅

---

## ✅ Verificação Final

### Teste o Frontend
```bash
# 1. Acesse o frontend
https://linkhub-frontend-chi.vercel.app

# 2. Faça login (criar conta)
# 3. Acesse o dashboard
# 4. Verifique se carrega dados do backend (links, fotos, etc)
```

### Teste o Backend
```bash
# Faça uma requisição ao health check
curl https://linkhub-api.vercel.app/api/healthz

# Resposta esperada:
# {"status":"ok"}
```

### Teste a Integração
1. Crie um novo link no dashboard
2. Verifique se salva no banco de dados Supabase
3. Atualize a página - o link deve aparecer

---

## 🔗 Conexão Frontend ↔ Backend

O frontend agora aponta para o backend via variável:
- **Production**: `VITE_API_BASE_URL=https://linkhub-api.vercel.app`
- **Local Dev**: `VITE_API_BASE_URL=http://localhost:3001`

Isso é configurado automaticamente em `App.tsx`:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@workspace/api-client-react'"

**Solução**: Adicione ao build command:
```bash
npm install --legacy-peer-deps && npm run build -w=lib/api-client-react && npm run build -w=artifacts/void
```

### Erro: "CORS blocking requests"

**Solução**: Verificar que o backend tem CORS habilitado (já configurado em `app.ts`)

### Erro: "401 Unauthorized na API"

**Solução**: 
1. Verificar que `CLERK_SECRET_KEY` está configurado no backend
2. Verificar que `VITE_CLERK_PUBLISHABLE_KEY` está no frontend
3. Fazer logout e login novamente

### Erro: "Build timeout no Vercel"

**Solução**: Aumentar timeout no `vercel.json`:
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build -w=artifacts/void",
  "functions": {
    "*.js": {
      "maxDuration": 60
    }
  }
}
```

---

## 📊 URLs Finais

- **Frontend**: `https://linkhub-frontend-chi.vercel.app`
- **Backend API**: `https://linkhub-api.vercel.app`
- **Banco de Dados**: Supabase (nuvem)
- **Autenticação**: Clerk (nuvem)
- **Storage**: Supabase Storage

---

## 🚀 Próximos Passos

1. ✅ Testar login/signup
2. ✅ Testar criação de links
3. ✅ Testar upload de fotos
4. ✅ Compartilhar perfil público
5. ✅ Customizar tema e cores
6. 🎯 Configurar domínio customizado (opcional)
7. 🎯 Adicionar analytics (opcional)

---

## 📞 Suporte

Se tiver problemas:
1. Verificar logs no Vercel Dashboard
2. Verificar variáveis de ambiente
3. Testar localmente com `npm run dev`
4. Verificar console do navegador (F12)
