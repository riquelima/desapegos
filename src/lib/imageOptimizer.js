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
 * Otimiza e comprime arquivo de vídeo local no navegador (Reduz de 60-150MB para ~6-14MB)
 * Redimensiona para resolução mobile 720p/540p com bitrate otimizado.
 */
export async function compressVideoFile(videoFile, onProgress = () => {}) {
  return new Promise((resolve) => {
    if (typeof MediaRecorder === 'undefined') {
      console.warn('MediaRecorder não suportado neste navegador, usando arquivo original');
      return resolve(videoFile);
    }

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    let recorder = null;
    let animationFrameId = null;

    // Timeout de segurança (90s)
    const timeout = setTimeout(() => {
      cleanup();
      console.warn('Tempo limite de compressão de vídeo atingido');
      resolve(videoFile);
    }, 90000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      URL.revokeObjectURL(objectUrl);
      video.pause();
      video.src = '';
    };

    video.onloadedmetadata = () => {
      try {
        let width = video.videoWidth || 720;
        let height = video.videoHeight || 1280;
        const maxDim = 720;

        if (Math.max(width, height) > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        width = width - (width % 2);
        height = height - (height % 2);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });

        let mimeType = 'video/webm;codecs=vp8';
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
          mimeType = 'video/webm;codecs=h264';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        }

        const stream = canvas.captureStream(24);
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1200000
        });

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(chunks, { type: mimeType });

          if (blob.size >= videoFile.size) {
            return resolve(videoFile);
          }

          const compressedFile = new File(
            [blob],
            videoFile.name.replace(/\.[^.]+$/, `_otimizado.${ext}`),
            { type: mimeType, lastModified: Date.now() }
          );
          resolve(compressedFile);
        };

        const draw = () => {
          if (video.paused || video.ended) return;
          ctx.drawImage(video, 0, 0, width, height);
          if (video.duration > 0) {
            const pct = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
            onProgress(pct);
          }
          animationFrameId = requestAnimationFrame(draw);
        };

        video.onplay = () => {
          recorder.start(100);
          draw();
        };

        video.onended = () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          onProgress(100);
          if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
          }
        };

        video.onerror = () => {
          cleanup();
          resolve(videoFile);
        };

        // Tenta aceleração 1.5x para compressão mais ágil
        try {
          video.playbackRate = 1.5;
        } catch {}

        video.play().catch(() => {
          cleanup();
          resolve(videoFile);
        });
      } catch {
        cleanup();
        resolve(videoFile);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(videoFile);
    };
  });
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
