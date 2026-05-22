# Deploy em 2 Projetos Separados - Solução Simples

**Data**: 22 de Maio de 2026  
**Estratégia**: Frontend (Vercel) + Backend (Railway/Render)  
**Tempo Estimado**: 30-45 minutos

---

## 🎯 Arquitetura

```
┌────────────────────────────┐
│   Frontend (Vercel)        │
│  artifacts/void/           │
│  - React + TypeScript      │
│  - Framer Motion           │
│  - Tailwind + shadcn/ui    │
└────────────┬───────────────┘
             │
             │ HTTPS API calls
             │ (base URL: https://api.yourdomain.com)
             │
┌────────────▼───────────────┐
│  Backend (Railway/Render)  │
│  artifacts/api-server/     │
│  - Express.js              │
│  - PostgreSQL              │
│  - Supabase Storage        │
└────────────────────────────┘

Authentication: Clerk (shared)
Database: Supabase (shared)
```

---

## 📋 Checklist Rápido

```
✅ Frontend em Vercel:
  [ ] Configurar VITE_API_BASE_URL
  [ ] Deploy frontend
  
✅ Backend em Railway/Render:
  [ ] Criar projeto
  [ ] Configurar environment variables
  [ ] Deploy backend
  [ ] Testar API com curl
  
✅ Conectar:
  [ ] Frontend chama backend API
  [ ] CORS está configurado
  [ ] Autenticação funciona
```

---

## 🚀 Passo 1: Preparar Frontend (Vercel)

### 1.1 Configurar API Base URL

**Arquivo**: `artifacts/void/.env.local`

```env
# API Backend
VITE_API_BASE_URL=http://localhost:8000  # Local
# VITE_API_BASE_URL=https://api.yourdomain.com  # Production

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 1.2 Verificar API Client Setup

O arquivo `lib/api-client-react/src/custom-fetch.ts` já tem suporte para base URL:

```typescript
// Já funciona! Basta configurar .env
setBaseUrl(import.meta.env.VITE_API_BASE_URL);
```

### 1.3 Deploy Frontend

```bash
cd artifacts/void
npm run build
# Vercel detecta e faz deploy automático
```

---

## 🚀 Passo 2: Preparar Backend (Railway/Render)

### 2.1 Escolher Plataforma

**Opção A: Railway** ⭐ (Recomendado - mais simples)
- URL: https://railway.app
- Precio: $5/mês (gratuito no trial)
- Database: Supabase (existente)

**Opção B: Render**
- URL: https://render.com
- Precio: Gratuito (com limites)
- Database: Supabase (existente)

### 2.2 Criar Novo Projeto (Railway)

1. Logar em https://railway.app
2. Click em "New Project"
3. "GitHub Repo" → Selecionar `Link-Hub`
4. Selecionar branch `main`
5. Selecionar diretório: `artifacts/api-server`

### 2.3 Configurar Environment Variables

**No Dashboard do Railway:**

```
DATABASE_URL = postgres://... (copiar de Supabase)
CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
DEMO_MODE = false
NODE_ENV = production
```

### 2.4 Configurar Start Script

**Railway detecta automaticamente:**
```json
// package.json em artifacts/api-server/
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc"
}
```

### 2.5 Deploy

Railway detecta mudanças em GitHub e faz deploy automático. Basta fazer push:

```bash
git add -A
git commit -m "Deploy backend em Railway"
git push origin main
```

Railway build automaticamente (~2 minutos).

---

## 🔗 Passo 3: Conectar Frontend ↔ Backend

### 3.1 Obter URL do Backend

No Dashboard do Railway:
1. Projeto → Domain
2. Copiar URL (ex: `https://my-project-abc123.up.railway.app`)

### 3.2 Configurar URL no Frontend

**Arquivo**: `artifacts/void/.env.production`

```env
VITE_API_BASE_URL=https://my-project-abc123.up.railway.app
```

**Ou configurar no Vercel Dashboard:**
1. Settings → Environment Variables
2. Adicionar:
   ```
   VITE_API_BASE_URL = https://my-project-abc123.up.railway.app
   ```

### 3.3 Testar Conectividade

```bash
# Terminal
curl https://my-project-abc123.up.railway.app/api/healthz

# Response (esperado):
# {"status":"ok"}
```

### 3.4 Verificar CORS

Express já tem CORS habilitado em `app.ts`:

```typescript
app.use(cors({ credentials: true, origin: true }));
```

✅ Funciona com qualquer origem

---

## ✅ Verificação Final

### Passo 1: Testar Backend Direto

```bash
# Testar health check
curl https://api-backend.railway.app/api/healthz
# Response: {"status":"ok"}

# Testar profile endpoint (sem auth, modo demo)
curl https://api-backend.railway.app/api/me
# Response: {profile data}
```

### Passo 2: Testar Frontend Localmente

```bash
cd artifacts/void

# Com backend local
VITE_API_BASE_URL=http://localhost:8000 npm run dev

# Frontend deve chamar backend
# Abrir http://localhost:5173
# Login com Clerk
# Verificar que carrega dados
```

### Passo 3: Testar em Produção

```bash
# Vercel + Railway rodando
# Abrir https://seu-vercel-domain.vercel.app
# Login com Clerk
# Criar novo link
# Verificar que API call vai para Railway
# Verificar dados salvos no Supabase
```

---

## 📊 Arquitetura Final

### Frontend (Vercel)
- URL: `https://seu-app.vercel.app`
- Código: `artifacts/void/`
- Deploy: Automático via GitHub
- Custo: FREE

### Backend (Railway)
- URL: `https://your-project-xxx.up.railway.app`
- Código: `artifacts/api-server/`
- Deploy: Automático via GitHub
- Custo: $5/mês (gratuito no trial)

### Database (Supabase)
- URL: `https://your-project.supabase.co`
- Custo: FREE (até 50GB)

### Total: ~$5/mês (só Railway)

---

## 🔄 Fluxo de Desenvolvimento

### Local:
```bash
# Terminal 1: Backend
cd artifacts/api-server
npm run dev
# Listening on http://localhost:8000

# Terminal 2: Frontend
cd artifacts/void
VITE_API_BASE_URL=http://localhost:8000 npm run dev
# Listening on http://localhost:5173

# Abrir http://localhost:5173
```

### Production (Automático):
```bash
# Fazer commit
git add -A
git commit -m "Changes"
git push origin main

# Vercel + Railway fazem deploy automático
# ~2 minutos depois está em produção
```

---

## 🆘 Troubleshooting

### Problema: "Failed to fetch" no frontend
**Causa**: Frontend não consegue chamar backend API

**Solução**:
1. Verificar `VITE_API_BASE_URL` está correto
2. Verificar que backend está online (tester com curl)
3. Verificar CORS está habilitado no backend
4. Browser console → Network tab → ver erro exato

### Problema: "CORS blocked"
**Solução**: Já está configurado no Express, não deve acontecer

### Problema: Database connection error no backend
**Solução**:
1. Verificar `DATABASE_URL` em Railway
2. Testar conexão: `psql $DATABASE_URL`
3. Garantir que PostgreSQL está ativo no Supabase

### Problema: Vercel build falha
**Solução**:
1. Verificar `VITE_API_BASE_URL` foi adicionado em Vercel
2. Rodar localmente: `npm run build`
3. Checar erro no Vercel logs

---

## 📈 Próximos Passos Opcionais

### After Básico Funciona:
- [ ] Configurar custom domain
- [ ] Configurar HTTPS certificate
- [ ] Configurar monitoring (Sentry)
- [ ] Configurar analytics (Vercel Analytics)
- [ ] Setup CI/CD melhorado

---

## 🎯 Timeline

| Etapa | Ação | Tempo |
|-------|------|-------|
| 1 | Criar Railway project | 5 min |
| 2 | Configurar env vars | 5 min |
| 3 | Deploy backend | 10 min |
| 4 | Testar backend | 5 min |
| 5 | Configure frontend | 5 min |
| 6 | Deploy frontend | 5 min |
| 7 | Teste completo | 5 min |
| **Total** | **2 Projetos Online** | **~40 min** |

---

## ✨ Resultado Final

✅ Frontend rodando em Vercel  
✅ Backend rodando em Railway  
✅ Database em Supabase  
✅ Sincronizados automaticamente via Git  
✅ Deploy automático em ambos  
✅ Fácil de manter e escalar  
✅ Custo mínimo (~$5/mês)

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

---

**Recomendação**: Use Railway para backend. É mais simples e mais barato.

Qualquer dúvida, me avisa! 🚀
