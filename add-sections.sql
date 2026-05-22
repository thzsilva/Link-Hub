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

-- Resultado esperado: Tabela sections criada e coluna section_id adicionada aos links
