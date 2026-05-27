/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Inicialização do Supabase utilizando as variáveis de ambiente
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!envUrl || !envKey) {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(envUrl, envKey, {
      auth: {
        persistSession: false
      }
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return null;
  }
}

// SQL Script para o usuário rodar no Supabase Editor para configurar as tabelas facilmente
export const SUPABASE_SQL_CREATION_SCRIPT = `-- SQL para criar as tabelas no Supabase SQL Editor

-- 1. Tabela de Repasses do Estado
CREATE TABLE IF NOT EXISTS repasses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ano TEXT NOT NULL UNIQUE,
  valor NUMERIC NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Repasses Mais Saúde
CREATE TABLE IF NOT EXISTS mais_saude (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ano TEXT NOT NULL UNIQUE,
  valor NUMERIC NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Downloads / Documentação
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tamanho INTEGER NOT NULL,
  url TEXT NOT NULL,
  is_local BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar o RLS (Row Level Security) para segurança opcional
ALTER TABLE repasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mais_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas públicas simples (já que o painel é sem login administrativo padrão)
CREATE POLICY "Leitura pública livre" ON repasses FOR SELECT USING (true);
CREATE POLICY "Escrita pública livre" ON repasses FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública livre" ON repasses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Deleção pública livre" ON repasses FOR DELETE USING (true);

CREATE POLICY "Leitura pública livre" ON mais_saude FOR SELECT USING (true);
CREATE POLICY "Escrita pública livre" ON mais_saude FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública livre" ON mais_saude FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Deleção pública livre" ON mais_saude FOR DELETE USING (true);

CREATE POLICY "Leitura pública livre" ON downloads FOR SELECT USING (true);
CREATE POLICY "Escrita pública livre" ON downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Deleção pública livre" ON downloads FOR DELETE USING (true);
CREATE POLICY "Atualização pública livre" ON downloads FOR UPDATE USING (true) WITH CHECK (true);

-- IMPORTANTE:
-- O Bucket "documentos" deve estar criado no Storage como "Public".
-- As políticas abaixo garantem que você possa fazer upload e deletar arquivos via aplicação:

-- Permitir upload público no bucket documentos
CREATE POLICY "Permitir upload publico" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documentos');

-- Permitir deleção pública no bucket documentos
CREATE POLICY "Permitir delecao publica" ON storage.objects
  FOR DELETE USING (bucket_id = 'documentos');

-- Permitir leitura pública (redundante se o bucket for público, mas boa prática)
CREATE POLICY "Permitir leitura publica" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos');
`;
