# 🧪 Instruções de Teste - Username Debug

## O que foi feito?

Adicionei 4 endpoints de **debug** ao seu backend para ajudar a identificar exatamente qual é o problema com o username.

Estes endpoints foram adicionados e já foi feito **git push** → O Railway vai atualizar automaticamente em ~2-3 minutos.

---

## 📋 Passo a Passo para Testar

### 1️⃣ Aguarde o Deploy no Railway
- Vá em: https://railway.app → Seu projeto
- Espere até que o status fique **READY** (verde)
- Tempo estimado: 2-3 minutos

### 2️⃣ Abra seu navegador

Você vai testar 4 endpoints. Substitua `[URL]` pela URL do seu Railway:

**Exemplo:** Se sua URL é `https://linkhub-backend.railway.app`

### 3️⃣ Teste cada endpoint nesta ordem

#### ✅ Teste 1: Ambiente
```
https://[URL]/api/debug/env
```
**O que mostra:** Se DATABASE_URL e CLERK_KEY estão configurados no Railway

**Esperado:**
```json
{
  "DATABASE_URL": "✅ Configurado",
  "CLERK_PUBLISHABLE_KEY": "✅ Configurado",
  "CLERK_SECRET_KEY": "✅ Configurado"
}
```

**Se tiver ❌:** A variável não está no Railway. Precisa adicionar.

---

#### ✅ Teste 2: Conexão com Banco
```
https://[URL]/api/debug/db-connection
```
**O que mostra:** Se consegue conectar no Supabase/PostgreSQL

**Esperado:**
```json
{
  "status": "✅ Conexão OK",
  "databaseWorking": true
}
```

**Se tiver erro:** Banco de dados não está acessível
- DATABASE_URL está errado
- Supabase não está rodat
- Firewall bloqueando

---

#### ✅ Teste 3: Autenticação Clerk
```
https://[URL]/api/debug/clerk
```
**O que mostra:** Se Clerk conseguiu identificar você

⚠️ **IMPORTANTE:** Você precisa estar **LOGADO** no seu site (Vercel) no **MESMO NAVEGADOR**

**Esperado:**
```json
{
  "status": "✅ Autenticado",
  "userId": "user_xxxxxxxxxxxxx"
}
```

**Se tiver erro (userId: null):** Clerk não conseguiu autenticar
- Token expirou
- VITE_CLERK_PUBLISHABLE_KEY está errado no Vercel
- CLERK_SECRET_KEY está errado no Railway

---

#### ✅ Teste 4: Update Completo
```
https://[URL]/api/debug/test-profile-update
```
**O que mostra:** Se consegue fazer update no banco completo

⚠️ **IMPORTANTE:** Novamente, precisa estar **LOGADO** no mesmo navegador

**Esperado:**
```json
{
  "status": "✅ Update funcionando",
  "message": "Conseguiu fazer update no banco",
  "profile": { ... dados do seu perfil ... }
}
```

**Se tiver erro:** Há um problema ao fazer update
- Banco de dados não está acessível
- Autenticação falhou
- Permissão de acesso negada

---

## 🔴 O que fazer com os resultados

### Cenário 1: Todos os testes passam (✅)
Se todos retornam OK, o problema está no **FRONTEND (Vercel)**:
1. Abra https://seu-vercel-url
2. F12 → Network tab
3. Tente salvar username
4. Procure o request `PUT /api/me`
5. Verifique:
   - Status do response (200? 400? 401?)
   - Qual é a mensagem de erro exata?

### Cenário 2: Teste 1 falha (❌ DATABASE_URL)
Solução:
1. Railway → Variables
2. Adicionar `DATABASE_URL` com seu Supabase
3. Redeploy

### Cenário 3: Teste 2 falha (❌ Conexão DB)
Solução:
1. Verificar se Supabase está rodando
2. Verificar se DATABASE_URL está correto
3. Railway → Redeploy

### Cenário 4: Teste 3 falha (❌ Clerk)
Solução:
1. Verificar se você está realmente LOGADO
2. F12 → Application → Cookies → procurar `__clerk`
3. Se não tiver, fazer login novamente
4. Fazer logout e login de novo

### Cenário 5: Teste 4 falha (❌ Update)
Solução:
1. Ver qual é o erro exato
2. Se for "unauthorized" → Problema de Clerk
3. Se for "database error" → Problema de conexão
4. Reportar erro exato para debug

---

## 🎯 Resumo Rápido

```bash
# 1. Aguarde deploy (2-3 minutos)

# 2. Teste cada URL em ordem:
https://[URL]/api/debug/env
https://[URL]/api/debug/db-connection
https://[URL]/api/debug/clerk
https://[URL]/api/debug/test-profile-update

# 3. Anote qual FALHA e qual PASSA

# 4. Se todos passam, problema está no Frontend
#    Se algum falha, seguir solução específica acima
```

---

## ⏱️ Próximas ações

1. **Agora:** Aguardar Railway deploy (vá em https://railway.app)
2. **Depois:** Rodar os 4 testes acima
3. **Finalmente:** Reportar qual teste falha ou qual é o erro no Frontend

---

**Status:** ✅ Code pushed para GitHub
**Próximo:** ⏳ Aguardando Railway deploy automático...
