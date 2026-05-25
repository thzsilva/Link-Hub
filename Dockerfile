FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package*.json* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build
RUN npm run build -w=artifacts/api-server

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
ENV PORT=3001
ENV API_PORT=3001
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres
ENV SUPABASE_URL=https://zcuehpfnpdaoknywddbh.supabase.co
ENV SUPABASE_ANON_KEY=sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ
ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU
ENV SUPABASE_STORAGE_BUCKET=linkhub
ENV CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr

CMD ["node", "artifacts/api-server/dist/index.mjs"]
