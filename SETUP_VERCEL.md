# Setup Vercel - Link-Hub

## 📦 Instalação Local

```bash
npm install --legacy-peer-deps
```

## 🔨 Build

```bash
npm run build
```

## 🚀 Desenvolvimento Local

```bash
npm run dev
```

Acessa:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 🌐 Variáveis de Ambiente - Vercel

No Vercel Dashboard → **Settings** → **Environment Variables**

### Adicione APENAS:

```
VITE_CLERK_PUBLISHABLE_KEY = pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
```

### DELETE qualquer outra variável!
- ❌ `VITE_API_BASE_URL` (se existir)
- ❌ `DATABASE_*` (não vai no Vercel)

---

## 📋 Checklist Antes de Deploy

- [ ] Commit e Push feitos
- [ ] `npm install --legacy-peer-deps` rodou sem erros
- [ ] `npm run build` compilou com sucesso
- [ ] VITE_CLERK_PUBLISHABLE_KEY está no Vercel
- [ ] Nenhuma outra variável de ambiente está no Vercel

---

## 🚢 Deploy no Vercel

1. Vercel detecta automaticamente quando há novo push no GitHub
2. Vai em https://vercel.com → **linkhub-ten-psi** → **Deployments**
3. Espera ficar **Ready** (verde)
4. Testa: https://linkhub-ten-psi.vercel.app/?user=SEUUSERNAME

---

## 🔗 URLs

- **Frontend Produção**: https://linkhub-ten-psi.vercel.app
- **Backend**: https://link-hub-production.up.railway.app
- **Perfil Público**: `https://linkhub-ten-psi.vercel.app/?user=thiago`

---

## ⚠️ Rate Limit Vercel

Se bateu no limite de deployments (3/dia no plano grátis):
- **Opção 1**: Aguarda 24h
- **Opção 2**: Upgrade para Vercel Pro ($20/mês) = ilimitado
