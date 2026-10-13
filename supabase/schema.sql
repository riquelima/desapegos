-- ========================================================
-- SCHEMA DO SUPABASE: BAZAR DE DESAPEGOS (PROJETO TERRAWAY)
-- ========================================================

-- 1. Criação do Bucket de Storage para fotos dos produtos (Limite: 50MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'desapegos-fotos',
    'desapegos-fotos',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800;

-- 2. Políticas de Storage para o Bucket 'desapegos-fotos'
CREATE POLICY "Leitura pública de fotos do bazar"
ON storage.objects FOR SELECT
USING (bucket_id = 'desapegos-fotos');

CREATE POLICY "Upload de fotos do bazar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'desapegos-fotos');

CREATE POLICY "Atualização de fotos do bazar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'desapegos-fotos');

CREATE POLICY "Exclusão de fotos do bazar"
ON storage.objects FOR DELETE
USING (bucket_id = 'desapegos-fotos');

-- 3. Tabela Principal de Produtos
CREATE TABLE IF NOT EXISTS public.desapegos_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    category_slug TEXT,
    tag TEXT,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    condition TEXT DEFAULT 'semi-new', -- 'new', 'semi-new', 'used'
    condition_label TEXT DEFAULT 'Seminovo / Estado Impecável',
    condition_desc TEXT,
    whatsapp TEXT DEFAULT '5571999088651',
    status TEXT DEFAULT 'available', -- 'available', 'reserved', 'sold'
    images JSONB DEFAULT '[]'::jsonb,
    video JSONB,
    description TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitação de RLS e Políticas
ALTER TABLE public.desapegos_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de desapegos" 
ON public.desapegos_produtos 
FOR SELECT 
USING (true);

CREATE POLICY "Inserção de desapegos" 
ON public.desapegos_produtos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Atualização de desapegos" 
ON public.desapegos_produtos 
FOR UPDATE 
USING (true);

CREATE POLICY "Exclusão de desapegos" 
ON public.desapegos_produtos 
FOR DELETE 
USING (true);

-- 5. Função de atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_desapegos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_desapegos_updated_at
    BEFORE UPDATE ON public.desapegos_produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_desapegos_updated_at();
