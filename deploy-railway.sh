#!/bin/bash

# Deploy Link-Hub Backend to Railway
# Usage: RAILWAY_TOKEN=your_token bash deploy-railway.sh

set -e

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ RAILWAY_TOKEN não foi definido"
  echo "Usage: RAILWAY_TOKEN=seu_token bash deploy-railway.sh"
  exit 1
fi

echo "🚂 Iniciando deploy no Railway..."
echo ""

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
  echo "📦 Instalando Railway CLI..."
  npm install -g @railway/cli
fi

# Set token
export RAILWAY_TOKEN=$RAILWAY_TOKEN

# Check auth
echo "🔐 Verificando autenticação..."
if ! railway whoami &>/dev/null; then
  echo "❌ Token inválido ou expirado"
  echo "Gere um novo em: https://railway.app/account/tokens"
  exit 1
fi

USER=$(railway whoami)
echo "✅ Autenticado como: $USER"
echo ""

# Create or link project
echo "📋 Procurando projeto existente..."
PROJECT_ID=$(railway projects --json 2>/dev/null | jq -r '.[] | select(.name=="linkhub-backend") | .id' || echo "")

if [ -z "$PROJECT_ID" ]; then
  echo "📝 Criando novo projeto: linkhub-backend"
  railway project create linkhub-backend
  PROJECT_ID=$(railway projects --json | jq -r '.[] | select(.name=="linkhub-backend") | .id')
else
  echo "✅ Projeto encontrado: $PROJECT_ID"
fi

echo ""
echo "🔧 Configurando variáveis de ambiente..."

# Add environment variables
railway variables set \
  DATABASE_URL="postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres" \
  SUPABASE_URL="https://zcuehpfnpdaoknywddbh.supabase.co" \
  SUPABASE_ANON_KEY="sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU" \
  SUPABASE_STORAGE_BUCKET="linkhub" \
  CLERK_PUBLISHABLE_KEY="pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk" \
  CLERK_SECRET_KEY="sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr" \
  NODE_ENV="production"

echo "✅ Variáveis de ambiente configuradas!"
echo ""

echo "🚀 Iniciando deploy..."
railway up --detach

echo ""
echo "✅ Deploy iniciado!"
echo ""
echo "📝 Verifique o status em: https://railway.app"
echo ""
echo "⏳ Aguarde 2-3 minutos para o build completar..."
echo ""
echo "🔗 Após o deploy, você verá uma URL como: https://seu-projeto.railway.app"
echo ""
