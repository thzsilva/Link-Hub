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
-- Criar tabela de seções
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  bg_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar section_id aos links (se ainda não existe)
ALTER TABLE links
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_sections_profile ON sections(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_section ON links(section_id);
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Executando migração de seções...');
    await client.query(migrationSQL);
    console.log('✅ Migração de seções concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
