/**
 * Utilitário de Otimização e Compressão de Imagens e Vídeos no Navegador
 * Reduz fotos pesadas de celulares (10MB-40MB) para ~200KB-600KB mantendo alta nitidez,
 * garantindo upload ultra-rápido, evitando estouro de limite do Supabase e gerando previews instantâneos.
 */

export async function optimizeImageFile(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82
  } = options;

  // Se não for imagem (ex: vídeo), retorna diretamente com flag
  if (file.type && file.type.startsWith('video/')) {
    const videoThumbnail = await generateVideoThumbnail(file);
    return {
      file,
      previewUrl: videoThumbnail,
      isVideo: true,
      originalSize: file.size,
      optimizedSize: file.size
    };
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Redimensionamento proporcional
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter contexto 2D do canvas'));
      }

      // Suavização de alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Gera preview dataURL
      const previewUrl = canvas.toDataURL('image/jpeg', 0.85);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Falha ao comprimir imagem'));
          }

          const baseName = file.name ? file.name.replace(/\.[^.]+$/, '') : `foto_${Date.now()}`;
          const optimizedFile = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          resolve({
            file: optimizedFile,
            previewUrl,
            isVideo: false,
            originalSize: file.size,
            optimizedSize: blob.size
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('Erro ao carregar imagem para compressão, tentando fallback:', err);
      // Fallback: lê como dataURL simples
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          file,
          previewUrl: e.target.result,
          isVideo: false,
          originalSize: file.size,
          optimizedSize: file.size
        });
      };
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Gera thumbnail a partir de arquivo de vídeo local
 */
export function generateVideoThumbnail(videoFile) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration > 0 ? video.duration / 2 : 0);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(video.videoWidth || 640, 640);
          canvas.height = Math.round(canvas.width * ((video.videoHeight || 360) / (video.videoWidth || 640)));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve('');
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      // Timeout de segurança
      setTimeout(() => {
        resolve('');
      }, 3000);
    } catch {
      resolve('');
    }
  });
}

/**
 * Extrai miniatura e dados de links externos de vídeo (YouTube, Shorts, etc.)
 */
export function getExternalVideoInfo(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // YouTube / Shorts
  // Exemplos: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtube.com/shorts/VIDEO_ID ou https://youtu.be/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: trimmed
    };
  }

  // Outros formatos diretos (ex: mp4, vimeo)
  return {
    type: 'generic',
    videoId: null,
    embedUrl: trimmed,
    thumbnailUrl: '',
    originalUrl: trimmed
  };
}

/**
 * Formata bytes em texto amigável (ex: 450 KB, 2.5 MB)
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
