#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { Pool } = pg;

// Carregar .env manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurado');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: !DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false,
});

const migrationSQL = `
-- Adicionar colunas de customização à tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_id text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS layout_columns integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS custom_primary_color text,
ADD COLUMN IF NOT EXISTS custom_secondary_color text,
ADD COLUMN IF NOT EXISTS background_image_url text,
ADD COLUMN IF NOT EXISTS background_blur integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_sections boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_settings jsonb DEFAULT '{}';

-- Adicionar coluna section_id em links (se necessário)
ALTER TABLE links
ADD COLUMN IF NOT EXISTS section_id uuid;

-- Adicionar coluna updated_at em profiles (se necessário)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Executando migração...');
    await client.query(migrationSQL);
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
