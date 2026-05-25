#!/bin/bash
export NODE_ENV=production
export API_PORT=${API_PORT:-3001}
export PORT=${PORT:-3001}
export DATABASE_URL=${DATABASE_URL:-postgresql://postgres.zcuehpfnpdaoknywddbh:thzn.av0905@aws-1-us-east-1.pooler.supabase.com:5432/postgres}
export SUPABASE_URL=${SUPABASE_URL:-https://zcuehpfnpdaoknywddbh.supabase.co}
export SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-sb_publishable_yPyNNABFhKQ4Y9C5A_1KiA_loOJPQQZ}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWVocGZucGRhb2tueXdkZGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0Njg4MiwiZXhwIjoyMDk1MDIyODgyfQ.8AD9YOKT0G7FQGDDwqyKHMW56ooZzJXn_hHiYMN2oaU}
export SUPABASE_STORAGE_BUCKET=${SUPABASE_STORAGE_BUCKET:-linkhub}
export CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY:-pk_test_ZnVuLXdlYXNlbC01MC5jbGVyay5hY2NvdW50cy5kZXYk}
export CLERK_SECRET_KEY=${CLERK_SECRET_KEY:-sk_test_AxbDFcD4sPCaZ5pR00DRqRvmDEy44HhdVKZKr4woFr}

node artifacts/api-server/dist/index.mjs
