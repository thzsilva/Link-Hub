#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando se o projeto está pronto para deploy..."
echo ""

# Check 1: Node version
echo "📦 Node.js:"
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v16* ]] || [[ $NODE_VERSION == v18* ]] || [[ $NODE_VERSION == v20* ]]; then
  echo -e "${GREEN}✓${NC} $NODE_VERSION (OK)"
else
  echo -e "${RED}✗${NC} $NODE_VERSION (recomendado v16+)"
fi

# Check 2: npm version
echo ""
echo "📦 npm:"
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} $NPM_VERSION"

# Check 3: Git status
echo ""
echo "📂 Git:"
if [[ -z $(git status -s) ]]; then
  echo -e "${GREEN}✓${NC} Working directory clean"
else
  echo -e "${YELLOW}⚠${NC} Uncommitted changes (é ok, mas recomenda fazer commit)"
fi

# Check 4: Frontend build
echo ""
echo "🎨 Frontend Build:"
if [ -f "artifacts/void/package.json" ]; then
  echo -e "${GREEN}✓${NC} artifacts/void/package.json encontrado"
else
  echo -e "${RED}✗${NC} artifacts/void/package.json NÃO encontrado"
fi

# Check 5: Backend build
echo ""
echo "⚙️ Backend Build:"
if [ -f "artifacts/api-server/package.json" ]; then
  echo -e "${GREEN}✓${NC} artifacts/api-server/package.json encontrado"
else
  echo -e "${RED}✗${NC} artifacts/api-server/package.json NÃO encontrado"
fi

# Check 6: Environment variables
echo ""
echo "🔐 Variáveis de Ambiente (.env):"
if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} Arquivo .env encontrado"

  # Check specific vars
  if grep -q "CLERK_PUBLISHABLE_KEY" .env; then
    echo -e "${GREEN}  ✓${NC} CLERK_PUBLISHABLE_KEY configurado"
  else
    echo -e "${RED}  ✗${NC} CLERK_PUBLISHABLE_KEY faltando"
  fi

  if grep -q "DATABASE_URL" .env; then
    echo -e "${GREEN}  ✓${NC} DATABASE_URL configurado"
  else
    echo -e "${RED}  ✗${NC} DATABASE_URL faltando"
  fi

  if grep -q "VITE_API_BASE_URL" .env; then
    echo -e "${GREEN}  ✓${NC} VITE_API_BASE_URL configurado"
  else
    echo -e "${RED}  ✗${NC} VITE_API_BASE_URL faltando"
  fi
else
  echo -e "${RED}✗${NC} Arquivo .env NÃO encontrado"
fi

# Check 7: Vercel config
echo ""
echo "🚀 Configuração Vercel:"
if [ -f "vercel.json" ]; then
  echo -e "${GREEN}✓${NC} vercel.json encontrado"
else
  echo -e "${YELLOW}⚠${NC} vercel.json não encontrado (mas pode ser criado no dashboard)"
fi

if [ -f "vercel-frontend.json" ]; then
  echo -e "${GREEN}✓${NC} vercel-frontend.json encontrado"
else
  echo -e "${YELLOW}⚠${NC} vercel-frontend.json não encontrado"
fi

if [ -f "artifacts/api-server/vercel.json" ]; then
  echo -e "${GREEN}✓${NC} artifacts/api-server/vercel.json encontrado"
else
  echo -e "${YELLOW}⚠${NC} artifacts/api-server/vercel.json não encontrado"
fi

# Check 8: Dependencies
echo ""
echo "📚 Dependências:"
if [ -f "package-lock.json" ]; then
  echo -e "${GREEN}✓${NC} package-lock.json encontrado"
else
  echo -e "${YELLOW}⚠${NC} package-lock.json não encontrado (npm install vai criar)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Projeto está pronto para deploy!"
echo ""
echo "Próximos passos:"
echo "1. Fazer push para GitHub: git push"
echo "2. Acesse vercel.com/new"
echo "3. Siga as instruções em DEPLOY_INSTRUCTIONS.md"
echo ""
