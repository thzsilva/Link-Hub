# Guia de Deployment - Link-Hub

## ❌ Problema Identificado: API Base URL Configuration

O app não consegue acessar o perfil público porque o `VITE_API_BASE_URL` não está configurado corretamente no Vercel.

---

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### **No Vercel Dashboard:**

1. Vá para o projeto **linkhub-api** (ou similar)
2. Clique em **Settings** → **Environment Variables**
3. **REMOVA** ou deixe em branco qualquer `VITE_API_BASE_URL` que esteja configurada
   - Se tiver algo como `VITE_API_BASE_URL=http://localhost:3001` ❌ REMOVA
   - Se tiver algo como `VITE_API_BASE_URL=https://link-hub-production.up.railway.app` ❌ REMOVA

### **Variáveis que DEVEM estar no Vercel:**

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_PROXY_URL=https://link-hub-production.up.railway.app/api/auth
```

### **Não configure:**
- ❌ `VITE_API_BASE_URL` (deve ficar vazio/não existir)
- ❌ Qualquer variável `DATABASE_*` no Vercel (só na API/Railway)

---

## Como Funciona no Vercel:

```
Frontend Request:
GET /api/profile/thzsilva
    ↓
Vercel Rewrites (vercel.json):
/api/:path* → https://link-hub-production.up.railway.app/api/:path*
    ↓
Railway Backend:
GET https://link-hub-production.up.railway.app/api/profile/thzsilva
```

---

## Passos Para Corrigir:

1. **Acessar Vercel Dashboard**
   - https://vercel.com
   - Selecione o projeto **linkhub-ten-psi** (frontend)

2. **Remover VITE_API_BASE_URL**
   - Settings → Environment Variables
   - Procure por `VITE_API_BASE_URL`
   - Se existir, delete ou deixe vazio

3. **Confirmar Outras Variáveis**
   - Mantenha `VITE_CLERK_PUBLISHABLE_KEY` e `VITE_CLERK_PROXY_URL`

4. **Redeploy**
   - Vá para **Deployments**
   - Clique no último deployment
   - Clique em **Redeploy** (sem fazer rebuild)

5. **Testar**
   - Acesse https://linkhub-ten-psi.vercel.app/thzsilva
   - Deveria carregar o perfil agora ✅

---

## Se Ainda Não Funcionar:

Cheque:
1. A database tem o usuário com username=`thzsilva`?
2. O Railway backend está ativo e respondendo?
3. Test: `curl https://link-hub-production.up.railway.app/api/healthz`

