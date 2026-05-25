# 🔍 Debug - Problema Username Não Salva

## Passo 1: Verificar variáveis de ambiente no Railway

1. Acesse: https://railway.app → Seu projeto Link-Hub
2. Vá em **Variables**
3. **Verifique se estas estão configuradas:**
   - ✅ `DATABASE_URL` (PostgreSQL/Supabase)
   - ✅ `CLERK_PUBLISHABLE_KEY`
   - ✅ `CLERK_SECRET_KEY`
   - ❌ `DEMO_MODE` (não deve existir ou estar em "false")

**SE NÃO TIVER DATABASE_URL:**
   - Seu backend está em DEMO_MODE
   - Qualquer mudança é temporária e não é salva
   - **Solução**: Adicionar DATABASE_URL em Variables

---

## Passo 2: Verificar logs do Railway

1. No Railway, vá até a aba **Deployments**
2. Clique no deploy mais recente
3. Abra **Logs**
4. Procure por:
   - ❌ "CLERK_PUBLISHABLE_KEY não configurado" → Clerk não está autenticando
   - ❌ "Error connecting to database" → Banco de dados não está acessível
   - ✅ "Server listening on port 3001" → Backend está OK

---

## Passo 3: Usar endpoints de DEBUG

Acesse diretamente estes URLs no seu browser para testar:

### 3a. Verificar Ambiente
```
https://[seu-railway-url]/api/debug/env
```
**Esperado:** Mostra se DATABASE_URL, CLERK_KEY, etc estão configurados

### 3b. Testar Conexão com Banco
```
https://[seu-railway-url]/api/debug/db-connection
```
**Esperado:**
```json
{
  "status": "✅ Conexão OK",
  "databaseWorking": true
}
```

### 3c. Testar Autenticação Clerk
```
https://[seu-railway-url]/api/debug/clerk
```
(Você precisa estar logado no mesmo navegador)

**Esperado:**
```json
{
  "status": "✅ Autenticado",
  "userId": "user_xxxxx"
}
```

### 3d. Testar Health
```
https://[seu-railway-url]/api/healthz
```

**Esperado:** `{"status":"ok"}`

---

## Passo 4: Testar PUT /api/me com debug

Abra o browser console (F12) e rode:

```javascript
fetch("https://[seu-railway-url]/api/me", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer [seu-clerk-token]"  // Se necessário
  },
  body: JSON.stringify({ username: "teste123" })
})
  .then(async r => {
    const data = await r.json();
    console.log("Status:", r.status);
    console.log("Response:", data);
  })
  .catch(e => console.error("Erro:", e));
```

**Se retornar:**
- `401 Unauthorized` → Clerk não autenticou (userId é null)
- `400 Bad Request` + `error` → Validação falhou (ver mensagem)
- `200 OK` + dados → **FUNCIONA!** Problema está no frontend

---

## Passo 5: Checar no Vercel (Frontend)

1. Abra seu site no Vercel
2. Abra F12 → **Network tab**
3. Tente salvar o username
4. Procure o request `PUT /api/me`
5. Verifique:
   - **Status**: Qual é? (200, 400, 401, 500?)
   - **Headers**: Request tem `Authorization` ou `Cookie`?
   - **Body**: Está enviando `{"username": "seu-valor"}`?
   - **Response**: Qual é a mensagem de erro exato?

---

## 🚨 Possíveis Problemas & Soluções

### Problema 1: Backend em DEMO_MODE
**Sintoma:** Salvar username não funciona, mas frontend não mostra erro
**Solução:**
```
Railway → Variables → Adicionar:
DATABASE_URL = [seu PostgreSQL/Supabase]
```
Depois: **Redeploy**

### Problema 2: Clerk não autenticado
**Sintoma:** Erro `401 Unauthorized`
**Solução:**
1. Railway: Verificar `CLERK_SECRET_KEY` está correto
2. Vercel: Verificar `VITE_CLERK_PUBLISHABLE_KEY` está correto
3. Browser: F12 → Application → Cookies → Procurar por `__clerk`
4. Se não tiver: Fazer logout e login novamente

### Problema 3: Validação Zod rejeitando username
**Sintoma:** Erro `400 Bad Request` + mensagem de validação
**Verificação:** Ver exatamente qual é a mensagem no console
**Possíveis regras:**
- Username vazio
- Username com caracteres inválidos
- Username já existe

### Problema 4: CORS bloqueando request
**Sintoma:** Erro `fetch failed` ou `CORS error`
**Solução:** Já está configurado em app.ts com `cors({ credentials: true, origin: true })`
- Se ainda der erro, verificar Railway logs

---

## ✅ Se Tudo Funcionar

1. Salvar username deve funcionar
2. Página pública deve acessível em: `https://seu-dominio/novo-username`
3. E-mail será enviado (se tiver Resend configurado)

---

## 📋 Checklist para Enviar para Debug

Quando for fazer debug, tenha a mão:
- [ ] URL do Railway backend
- [ ] URL do Vercel frontend
- [ ] Seu username novo (que quer testar)
- [ ] Logs do Railway (últimas 50 linhas)
- [ ] Console do browser (F12 → Console)
- [ ] Network tab do browser (F12 → Network)

---

**Próximo passo:** Rodar os testes acima e reportar qual é o erro exato!
