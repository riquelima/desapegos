/**
 * Utilitários de Imagem e Fallback Seguro
 * Garante que imagens de domínios inativos ou fotos com erro de carregamento
 * exibam placeholders elegantes baseados na categoria do item, evitando
 * caixas quebradas e textos de alt desformatados no navegador.
 */

const CATEGORY_PLACEHOLDERS = {
  luminarias: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', // luminária minimalista
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', // headphone / tech
  tech: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', // setup gamer / console
  mobiliario: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', // móvel / poltrona / bancada
  acessorios: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', // decor
  default: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' // interior geral
};

// Domínios ou links legados/inativos conhecidos que não resolvem
const DEAD_DOMAINS = [
  'djvaaeggztkhkhsnfjid.supabase.co',
  'your-project-id.supabase.co',
  'photo-1580481077195-c3a821a58875'
];

/**
 * Retorna uma foto representativa de acordo com a categoria ou título
 */
export function getProductPlaceholder(categoryOrTitle = '') {
  const norm = String(categoryOrTitle || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (norm.includes('lumin') || norm.includes('lamp') || norm.includes('luz')) {
    return CATEGORY_PLACEHOLDERS.luminarias;
  }
  if (norm.includes('teclado') || norm.includes('hd') || norm.includes('playstation') || norm.includes('ps4') || norm.includes('patinete') || norm.includes('gamer') || norm.includes('console')) {
    return CATEGORY_PLACEHOLDERS.tech;
  }
  if (norm.includes('audio') || norm.includes('fone') || norm.includes('sound') || norm.includes('som') || norm.includes('caixa')) {
    return CATEGORY_PLACEHOLDERS.audio;
  }
  if (norm.includes('mobil') || norm.includes('mesa') || norm.includes('bancada') || norm.includes('cadeira') || norm.includes('escrivan') || norm.includes('armario')) {
    return CATEGORY_PLACEHOLDERS.mobiliario;
  }
  if (norm.includes('decor') || norm.includes('acessorio') || norm.includes('quadro') || norm.includes('planta') || norm.includes('espelho')) {
    return CATEGORY_PLACEHOLDERS.acessorios;
  }

  return CATEGORY_PLACEHOLDERS.default;
}

/**
 * Resolve a URL da foto. Se a URL for nula, vazia, blob antigo ou apontar para um link morto,
 * entrega diretamente um placeholder visual para evitar requisição de rede inútil e erro visual.
 */
export function resolveImageUrl(url, categoryOrTitle = '') {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getProductPlaceholder(categoryOrTitle);
  }

  const trimmed = url.trim();

  // Bloqueia blob URLs de sessões anteriores que já expiraram
  if (trimmed.startsWith('blob:')) {
    return getProductPlaceholder(categoryOrTitle);
  }

  const isDead = DEAD_DOMAINS.some(domain => trimmed.includes(domain));
  if (isDead) {
    return getProductPlaceholder(categoryOrTitle);
  }

  return trimmed;
}

/**
 * Tratador de erro do evento onError do <img>
 * Impede loop e substitui imagem quebrada por foto reserva elegante
 */
export function handleImageError(event, categoryOrTitle = '') {
  const target = event.currentTarget;
  target.onerror = null;
  target.src = getProductPlaceholder(categoryOrTitle);
}

