# 🚂 Railway Deploy - 5 Minutos (Sem Código!)

## Passo 1: Ir para Railway

Abra em uma aba: https://railway.app

Clique em **"Login"** → **"Continue with GitHub"**

## Passo 2: Criar Projeto

Depois de logado:

1. Clique em **"+ New Project"** (botão azul)
2. Selecione **"Deploy from GitHub repo"**
3. Procure por **"Link-Hub"** e clique
4. Selecione a branch **"main"**
5. Clique em **"Deploy"**

## Passo 3: Adicionar Variáveis de Ambiente

Enquanto o projeto está buildando:

1. Clique na aba **"Variables"** (ou Settings → Variables)
2. Clique em **"Add Variable"** e preencha assim:

```
KEY: DATABASE_URL
VALUE: postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

Clique **Add** e repita para cada uma:

```
KEY: SUPABASE_URL
VALUE: https://zcuehpfnpdaoknywddbh.supabase.co

KEY: SUPABASE_ANON_KEY
VALUE: sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ

KEY: SUPABASE_SERVICE_ROLE_KEY
VALUE: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU

KEY: SUPABASE_STORAGE_BUCKET
VALUE: linkhub

KEY: CLERK_PUBLISHABLE_KEY
VALUE: pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk

KEY: CLERK_SECRET_KEY
VALUE: sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr

KEY: NODE_ENV
VALUE: production
```

## Passo 4: Aguardar Deploy

O Railway vai:
1. Baixar o código do GitHub ✅
2. Instalar dependências ✅
3. Fazer build do backend ✅
4. Iniciar o servidor ✅

Leva **2-3 minutos**.

Na aba **"Deployments"**, você verá um ✅ verde quando terminar.

## Passo 5: Copiar a URL

Após o deploy estar **READY**:

1. Procure por uma URL como: `https://link-hub-something-random.railway.app`
2. **Copie essa URL**

## Passo 6: Atualizar o Frontend

Agora você precisa dizer ao frontend onde está o backend:

1. Abra: https://vercel.com
2. Vá para o projeto **linkhub-frontend**
3. Clique em **Settings** (canto superior direito)
4. Procure por **Environment Variables**
5. Encontre a variável **VITE_API_BASE_URL**
6. Mude o valor de `http://localhost:3001` para a URL do Railway que você copiou
7. Clique em **Save**
8. Clique em **Deployments** (aba)
9. Na versão mais recente, clique no menu **...** → **Redeploy**

## Passo 7: Testar!

Agora teste:

1. Abra: https://linkhub-frontend-chi.vercel.app
2. Faça **login** (criar conta ou login)
3. Acesse o **dashboard**
4. Crie um **novo link**
5. Se aparecer na lista = **DEU CERTO!** 🎉

---

## 🆘 Problemas?

### "Build falha"
- Espere mais alguns minutos (pode estar ainda configurando)
- Verifique o log clicando em "View Logs" (aba Logs)

### "502 Bad Gateway"
- O servidor ainda está iniciando
- Aguarde 2 minutos e recarregue

### "Falha ao criar link"
- Verifique que a URL do backend no Vercel está correta
- Redeploye o frontend após mudar

---

**Pronto! Seu Link-Hub está 100% online!** 🚀
