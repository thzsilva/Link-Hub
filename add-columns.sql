-- Adicionar colunas de customização à tabela profiles
ALTER TABLE profiles
ADD COLUMN theme_id text DEFAULT 'default',
ADD COLUMN layout_columns integer DEFAULT 1,
ADD COLUMN custom_primary_color text,
ADD COLUMN custom_secondary_color text,
ADD COLUMN background_image_url text,
ADD COLUMN background_blur integer DEFAULT 0,
ADD COLUMN show_sections boolean DEFAULT true,
ADD COLUMN section_settings jsonb DEFAULT '{}';

-- Adicionar coluna section_id em links
ALTER TABLE links
ADD COLUMN section_id uuid;

-- Resultado esperado: Colunas adicionadas com sucesso
