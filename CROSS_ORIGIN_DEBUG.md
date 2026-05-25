# 🔐 Debug - Clerk Token Cross-Origin (Domínios Diferentes)

## O Problema Identificado

**Frontend:** `https://linkhub-ten-psi.vercel.app/`
**Backend:** `https://link-hub-production.up.railway.app/`

São **domínios diferentes**, então cookies não são enviados automaticamente.

✅ **Solução:** O frontend JÁ está configurado para enviar token Bearer do Clerk no header `Authorization`!

## O que fazer agora?

### Passo 1: Aguarde o deploy (Railway)
- Vá em: https://railway.app
- Aguarde até status ficar **READY** (verde)
- Tempo: 2-3 minutos

### Passo 2: Faça login no Frontend
1. Abra: https://linkhub-ten-psi.vercel.app/
2. Clique em **Entrar**
3. Complete o login

### Passo 3: Teste o novo endpoint `/api/debug/headers`

Abra em uma **ABA NOVA** (enquanto está logado) e teste:

```
https://link-hub-production.up.railway.app/api/debug/headers
```

**Esperado:**
```json
{
  "method": "GET",
  "headers": {
    "authorization": "✅ Presente",
    "content-type": "application/json",
    "origin": "https://linkhub-ten-psi.vercel.app"
  },
  "authObject": { "userId": "user_xxxxx", ... },
  "userId": "user_xxxxx",
  "message": "✅ userId presente"
}
```

**Se tiver ❌ userId ausente:**
- O token do Clerk não está sendo validado
- Pode ser que `CLERK_SECRET_KEY` no Railway esteja errado

---

## 📋 Checklist de Debug

| Teste | Endpoint | Esperado |
|-------|----------|----------|
| 1. Env vars | `/api/debug/env` | DATABASE_URL ✅, CLERK_SECRET_KEY ✅ |
| 2. Headers | `/api/debug/headers` | authorization ✅, userId presente |
| 3. DB Conexão | `/api/debug/db-connection` | status ✅ Conexão OK |
| 4. Clerk Auth | `/api/debug/clerk` | status ✅ Autenticado, userId presente |
| 5. Profile Update | `/api/debug/test-profile-update` | status ✅ Update funcionando |

---

## 🎯 Se tudo passar

Depois de confirmar que os 5 testes passam:

1. Abra: https://linkhub-ten-psi.vercel.app/dashboard/customization
2. Mude o username para algo novo (ex: `thiago`)
3. Clique em **Salvar**
4. **DEVE FUNCIONAR!** ✅

---

## 🚨 Se algo falhar

### Se `/api/debug/headers` retorna userId null

**Causa 1: CLERK_SECRET_KEY errado**
- Railway → Variables → Procure `CLERK_SECRET_KEY`
- Verifique se está **exatamente igual** ao seu .env.local
- Se diferente, corrija
- **Redeploy**

**Causa 2: Token expirou**
- Faça logout e login de novo
- Teste novamente

**Causa 3: Clerk não está ativo no backend**
- Verifique se `CLERK_PUBLISHABLE_KEY` está em Railway
- Sem ele, Clerk fica em modo "null" (sem autenticação)

---

## ✅ Após confirmar funcionamento

1. Teste salvar o username
2. Se funcionar, **problema RESOLVIDO!** 🎉
3. Próximos passos: fazer testes em produção

---

**Last updated:** Deploy contínuo ativo
**Status:** Aguardando seu teste dos endpoints acima
