import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://djvaaeggztkhkhsnfjid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdmFhZWdnenRraGtoc25mamlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTMxMjIsImV4cCI6MjEwNjg4OTEyMn0.tykPy-_yeg06NMc8Y-8_R93QxIuqN7x8urpV6jl09rY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'desapegos-fotos';

/**
 * Faz upload de um arquivo ou blob de imagem para o bucket desapegos-fotos
 * @param {File|Blob} file 
 * @param {string} fileName 
 * @returns {Promise<string>} URL pública da foto
 */
export async function uploadProductPhoto(file, customName) {
  try {
    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `produtos/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload de foto para o Supabase Storage:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Falha ao obter URL pública:', err);
    throw err;
  }
}

/**
 * Converte base64 para Blob para facilitar upload no Supabase Storage
 */
export function base64ToBlob(base64Data, contentType = 'image/jpeg') {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
