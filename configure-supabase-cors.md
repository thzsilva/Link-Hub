# Configurar CORS do Supabase Storage

## Problema
Imagens do Supabase Storage não carregam no navegador por causa de CORS.

## Solução - Configurar pelo Dashboard

### Passo 1: Acessar Supabase Dashboard
1. Ir para https://app.supabase.com
2. Selecionar seu projeto
3. Ir para **Storage** → **Buckets**

### Passo 2: Configurar o Bucket "linkhub"
1. Clique no bucket "linkhub"
2. Vá para a aba **Settings**
3. Procure por "CORS" ou "Cross-Origin"
4. Adicione as seguintes origens:
   ```
   http://localhost:3000
   http://localhost:3001
   http://192.168.0.123:3000
   https://seu-dominio-producao.com
   ```

### Passo 3: Garantir Bucket Público
1. Na aba **Settings**, certifique-se que **"Make bucket public"** está marcado
2. Salve as alterações

## Solução Alternativa - Usar API

Se preferir fazer via API:

```bash
# 1. Instale o Supabase CLI
npm install -g @supabase/cli

# 2. Faça login
supabase login

# 3. Configure CORS via arquivo
# Crie um arquivo cors.json com:
{
  "allowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://seu-dominio.com"
  ]
}

# 4. Aplique via CLI
supabase storage cors update linkhub --cors-json cors.json
```

## Verificação

Após configurar, teste:

```javascript
// No console do navegador:
fetch('https://zcuehpfnpdaoknywddbh.supabase.co/storage/v1/object/public/linkhub/uploads/SEU_ARQUIVO.jpg')
  .then(r => r.blob())
  .then(blob => console.log('✅ CORS funciona!', blob.size))
  .catch(e => console.error('❌ Erro CORS:', e));
```

## Headers Necessários

O navegador envia automaticamente:
```
Origin: http://localhost:3000
```

Supabase deve responder com:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Max-Age: 3600
```

## Teste Rápido

Se mesmo assim não funcionar, use um proxy temporário:

```javascript
// Em vez de:
<img src="https://supabase.../image.jpg" />

// Use:
<img src="/api/proxy-image?url=https://supabase.../image.jpg" />
```

Veja o arquivo `proxy-image-endpoint.ts` para implementação.
