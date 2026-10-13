import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://djvaaeggztkhkhsnfjid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdmFhZWdnenRraGtoc25mamlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTMxMjIsImV4cCI6MjEwNjg4OTEyMn0.tykPy-_yeg06NMc8Y-8_R93QxIuqN7x8urpV6jl09rY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'desapegos-fotos';

/**
 * Faz upload de um arquivo ou blob de imagem para o bucket desapegos-fotos no Supabase
 * @param {File|Blob} fileOrBlob 
 * @returns {Promise<string>} URL pública da foto
 */
export async function uploadProductPhoto(fileOrBlob) {
  try {
    const mimeType = fileOrBlob.type || 'image/jpeg';
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('quicktime')) ext = 'mov';

    const filePath = `produtos/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileOrBlob, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true
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
 * Converte base64 para Blob detectando o tipo MIME automaticamente
 */
export function base64ToBlob(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') return null;

  const match = base64Data.match(/^data:([^;]+);base64,/);
  const contentType = match ? match[1] : 'image/jpeg';
  const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const byteCharacters = atob(base64Clean);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}
