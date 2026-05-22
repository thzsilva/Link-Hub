# Deploy em 2 Projetos Vercel Separados

**Data**: 22 de Maio de 2026  
**Solução**: Frontend + Backend, ambos em Vercel  
**Tempo Estimado**: 20 minutos  
**Custo**: FREE

---

## 🎯 Arquitetura

```
┌──────────────────────────────────┐
│  Vercel Projeto #1 (Frontend)    │
│  artifacts/void/                 │
│  https://link-hub.vercel.app     │
└────────────────┬─────────────────┘
                 │
                 │ API calls
                 │ https://link-hub-api.vercel.app
                 │
┌────────────────▼─────────────────┐
│  Vercel Projeto #2 (Backend)     │
│  artifacts/api-server/           │
│  https://link-hub-api.vercel.app │
└──────────────────────────────────┘

Database: Supabase (compartilhado)
Authentication: Clerk (compartilhado)
```

---

## ✅ Checklist Rápido

```
[ ] Projeto 1: Frontend no Vercel
[ ] Projeto 2: Backend no Vercel
[ ] Configurar API URL no frontend
[ ] Testar integração
[ ] Tudo online!
```

---

## 🚀 Passo 1: Deploy Frontend (Vercel Projeto #1)

### 1.1 Criar Novo Projeto Vercel

1. Logar em https://vercel.com
2. Click em "Add New" → "Project"
3. Selecionar repo `Link-Hub`
4. **Framework Preset**: Vite
5. **Root Directory**: `artifacts/void`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist/public`

### 1.2 Configurar Environment Variables

**No Vercel Dashboard → Settings → Environment Variables:**

```
VITE_CLERK_PUBLISHABLE_KEY = pk_test_...
VITE_API_BASE_URL = https://link-hub-api.vercel.app
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

### 1.3 Deploy

Click em "Deploy" → Vercel faz tudo automático (~1 min)

**Resultado**:
- Frontend online em `https://link-hub.vercel.app` ✅
- Ou seu custom domain

---

## 🚀 Passo 2: Deploy Backend (Vercel Projeto #2)

### 2.1 Criar Novo Projeto Vercel para Backend

1. Logar em https://vercel.com
2. Click em "Add New" → "Project"
3. Selecionar repo `Link-Hub`
4. **Framework Preset**: Other → Node.js
5. **Root Directory**: `artifacts/api-server`
6. **Build Command**: `npm run build`
7. **Start Command**: `node dist/index.js`

### 2.2 Configurar Environment Variables

**No Vercel Dashboard → Settings → Environment Variables:**

```
DATABASE_URL = postgres://... (de Supabase)
CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
DEMO_MODE = false
NODE_ENV = production
PORT = 3000 (Vercel ignora, mas coloca mesmo)
```

Obter DATABASE_URL do Supabase:
1. Supabase Dashboard → Settings → Database
2. Connection string (URI)
3. Copiar a string com password

### 2.3 Adicionar Suporte a Vercel Functions

**Arquivo**: `artifacts/api-server/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@database_url",
    "CLERK_PUBLISHABLE_KEY": "@clerk_publishable_key",
    "CLERK_SECRET_KEY": "@clerk_secret_key"
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "index.js"
    }
  ]
}
```

### 2.4 Deploy

Click em "Deploy" → Vercel faz tudo automático (~2 min)

**Resultado**:
- Backend online em `https://link-hub-api.vercel.app` ✅

---

## 🔗 Passo 3: Conectar Frontend ao Backend

### 3.1 Atualizar Frontend com URL do Backend

Após backend estar online:

**No Vercel Dashboard (Projeto #1 - Frontend):**
1. Settings → Environment Variables
2. Editar `VITE_API_BASE_URL`
3. Mudar de `http://localhost:8000` para `https://link-hub-api.vercel.app`
4. Click "Save"
5. Vercel faz re-deploy automático (~1 min)

### 3.2 Ou Adicionar em Tempo de Deploy

Se quiser adicionar antes de fazer push:

**Arquivo**: `artifacts/void/.env.production`

```env
VITE_API_BASE_URL=https://link-hub-api.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## ✅ Testar Integração

### 1. Testar Backend Direto

```bash
curl https://link-hub-api.vercel.app/api/healthz

# Response (esperado):
# {"status":"ok"}
```

### 2. Testar Frontend

1. Abrir `https://link-hub.vercel.app`
2. Login com Clerk
3. Ver se carrega "Overview" → Dashboard Stats
4. Criar novo link
5. Verificar que salva (API call foi pro backend)

### 3. Verificar no Browser Console

1. Abrir DevTools (F12)
2. Network tab
3. Criar novo link
4. Verificar request vai para `https://link-hub-api.vercel.app/api/links`

---

## 📊 Domínios Finais

| Recurso | URL |
|---------|-----|
| Frontend | `https://link-hub.vercel.app` |
| Backend API | `https://link-hub-api.vercel.app` |
| Database | Supabase (interno) |

Ou seus custom domains se configurar.

---

## 🔄 Fluxo de Desenvolvimento & Deploy

### Local:
```bash
# Terminal 1: Backend
cd artifacts/api-server
npm run dev
# Listening on http://localhost:3000

# Terminal 2: Frontend
cd artifacts/void
VITE_API_BASE_URL=http://localhost:3000 npm run dev
# Listening on http://localhost:5173
```

### Production (Automático):
```bash
git add -A
git commit -m "My changes"
git push origin main

# Vercel detecta mudanças em:
# - artifacts/void/ → Deploy frontend
# - artifacts/api-server/ → Deploy backend

# ~2-3 minutos depois está online!
```

---

## 🚀 Checklist de Deploy

```
[ ] 1. Criar Projeto Vercel #1 (Frontend)
     [ ] Selecionar artifacts/void como root
     [ ] Adicionar VITE_* variables
     [ ] Deploy OK?
     
[ ] 2. Criar Projeto Vercel #2 (Backend)
     [ ] Selecionar artifacts/api-server como root
     [ ] Adicionar DATABASE_URL e CLERK keys
     [ ] Deploy OK?
     
[ ] 3. Testar Backend
     [ ] curl /api/healthz retorna ok
     [ ] curl /api/me retorna dados
     
[ ] 4. Atualizar Frontend URL
     [ ] Adicionar VITE_API_BASE_URL correto
     [ ] Frontend re-deploy
     
[ ] 5. Teste Final
     [ ] Login no frontend
     [ ] Criar novo link
     [ ] Verificar que salvou
     [ ] Ver perfil público
```

---

## ⏱️ Timeline

| Passo | Ação | Tempo |
|-------|------|-------|
| 1 | Criar projeto Frontend | 3 min |
| 2 | Deploy Frontend | 2 min |
| 3 | Criar projeto Backend | 3 min |
| 4 | Deploy Backend | 2 min |
| 5 | Configurar URLs | 2 min |
| 6 | Testar tudo | 3 min |
| **Total** | **2 Projetos Online** | **~15 min** |

---

## 💰 Custo

- **Frontend (Vercel)**: FREE ✅
- **Backend (Vercel)**: FREE ✅
- **Database (Supabase)**: FREE (até 50GB) ✅
- **Total**: **FREE** 🎉

---

## 🆘 Troubleshooting

### Problema: "Failed to fetch" no frontend
**Causa**: Frontend não consegue chamar backend

**Debug**:
1. Browser DevTools → Network tab
2. Ver URL da request → é `https://link-hub-api.vercel.app/api/...`?
3. Se não, verificar `VITE_API_BASE_URL` no Vercel

**Solução**:
```bash
# No Vercel Dashboard (Frontend Project):
Settings → Environment Variables → VITE_API_BASE_URL
```

### Problema: "CORS error"
**Solução**: Já está configurado no Express. Não deve acontecer.

Se acontecer, verificar `artifacts/api-server/src/app.ts`:
```typescript
app.use(cors({ credentials: true, origin: true }));
```

### Problema: Backend Deploy falha
**Checklist**:
1. [ ] DATABASE_URL está correto?
2. [ ] CLERK keys foram adicionadas?
3. [ ] package.json tem build script?
4. [ ] dist/ folder existe?

Ver logs no Vercel Dashboard.

### Problema: Frontend carrega mas dados vazios
**Causa**: API call está sendo bloqueada ou retornando erro

**Debug**:
```bash
curl https://link-hub-api.vercel.app/api/me

# Se retornar erro, verificar logs do backend:
# Vercel Dashboard → Backend Project → Logs
```

---

## 🎯 Próximos Passos (Opcionais)

Após tudo rodando:

### Custom Domains
```
link-hub.vercel.app → seu-dominio.com
link-hub-api.vercel.app → api.seu-dominio.com
```

Configurar em Vercel Dashboard → Domains

### Monitoring
- Vercel Analytics (frontend)
- Sentry (backend) para errors
- LogRocket (frontend UX)

### CI/CD Melhorado
- Vercel Preview Deployments (PRs)
- Automated tests antes de deploy

---

## 📚 Documentação

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deploy Express no Vercel](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## ✨ Resultado Final

✅ Frontend em Vercel (FREE)  
✅ Backend em Vercel (FREE)  
✅ Automático com Git  
✅ Escala infinita  
✅ Custo ZERO  

Isso é muito melhor que Railway! Tudo em um lugar. 🚀

---

**PRÓXIMO PASSO**: Comece agora! Crie o Projeto #1 no Vercel.
