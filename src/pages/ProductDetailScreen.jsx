import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';

export default function ProductDetailScreen({ productId, onBack }) {
  const { products, toggleWishlist, isWishlisted, addToCart } = useProducts();
  const product = products.find(p => p.id === productId) || products[0];

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'specs'
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-margin text-center">
        <h2 className="text-xl font-bold mb-2">Produto não encontrado</h2>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-primary text-on-primary rounded-full"
        >
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  const isFav = isWishlisted(product.id);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'];

  const hasVideo = Boolean(product.video);
  const totalSlides = images.length + (hasVideo ? 1 : 0);

  // Formatação do link do WhatsApp
  const phone = (product.whatsapp || '5571999088651').replace(/\D/g, '');
  const message = `Olá! Vi o anúncio no seu Bazar de Desapegos e tenho interesse no item: *${product.title}* (R$ ${Number(product.price).toLocaleString('pt-BR')}). Ainda está disponível?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Compartilhamento nativo ou fallback
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Confira este desapego: ${product.title} por R$ ${product.price}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Fixo de Navegação Superior */}
      <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/40 shadow-sm">
        <div className="h-16 max-w-md mx-auto px-margin flex items-center justify-between">
          <button
            type="button"
            aria-label="Voltar ao catálogo"
            onClick={onBack}
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_back_ios_new
            </span>
          </button>

          <h1 className="font-headline-sm text-[16px] tracking-tight text-on-surface font-semibold truncate max-w-[200px]">
            Detalhes do Produto
          </h1>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Compartilhar"
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <button
              type="button"
              aria-label="Favoritar"
              onClick={() => toggleWishlist(product.id)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                isFav ? 'text-secondary' : 'text-on-surface hover:text-secondary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Rolável */}
      <main className="flex flex-col relative w-full pt-20 pb-32">
        {/* Galeria de Mídia Interativa */}
        <section className="relative w-full px-margin">
          {/* Container Principal da Mídia (Aspect 4:5 luxury framing) */}
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-high shadow-md">
            {/* Imagens do Carrossel */}
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.title} - foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Slide de Vídeo (se houver) */}
            {hasVideo && (
              <div
                className={`absolute inset-0 transition-opacity duration-500 bg-primary-container text-on-primary ${
                  activeSlide === images.length ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <img
                  src={product.video.cover || images[0]}
                  alt="Prévia do vídeo"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-space-lg text-center">
                  <button
                    type="button"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="w-16 h-16 rounded-full bg-secondary text-on-secondary shadow-xl flex items-center justify-center active:scale-90 transition-transform mb-space-sm group"
                  >
                    <span
                      className="material-symbols-outlined text-[34px] ml-1 group-hover:scale-110 transition-transform"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isVideoPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <span className="font-headline-sm text-headline-sm text-surface font-semibold">
                    {product.video.title || 'Vídeo Hands-on'}
                  </span>
                  <p className="font-body-sm text-body-sm text-surface-container-high mt-1 max-w-[220px]">
                    {isVideoPlaying ? 'Demonstração em reprodução' : product.video.desc || 'Confira detalhes e acabamento real'}
                  </p>
                </div>
              </div>
            )}

            {/* Badge de Paginação Flutuante */}
            <div className="absolute bottom-3 right-3 z-20 bg-surface/85 backdrop-blur-md px-3 py-1 rounded-full text-on-surface font-label-md text-label-md shadow-sm border border-white/20">
              <span>{activeSlide + 1}</span> / {totalSlides}
            </div>

            {/* Status Tag sobre a imagem */}
            {product.status && product.status !== 'available' && (
              <div className="absolute top-3 left-3 z-20">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md ${
                  product.status === 'sold' ? 'bg-error' : 'bg-amber-600'
                }`}>
                  {product.status === 'sold' ? 'Item Vendido' : 'Item Reservado'}
                </span>
              </div>
            )}
          </div>

          {/* Fita de Miniaturas (Thumbnails) */}
          <div className="flex items-center gap-space-xs mt-3 overflow-x-auto pb-1 no-scrollbar">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Miniatura ${idx + 1}`}
                className={`thumb-btn relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high transition-all ${
                  activeSlide === idx
                    ? 'ring-2 ring-primary opacity-100 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

            {hasVideo && (
              <button
                type="button"
                onClick={() => setActiveSlide(images.length)}
                aria-label="Vídeo do produto"
                className={`thumb-btn relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-primary-container text-on-primary transition-all flex flex-col items-center justify-center ${
                  activeSlide === images.length
                    ? 'ring-2 ring-primary opacity-100 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px] text-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_circle
                </span>
                <span className="font-label-sm text-[9px] uppercase tracking-wider text-surface-container-lowest mt-0.5">
                  Vídeo
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Título & Bloco de Preço */}
        <section className="px-margin mt-5 flex flex-col">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">
            {product.category || 'Mobiliário & Bazar'}
          </span>
          <h2 className="font-headline-lg text-[26px] leading-tight text-on-surface font-semibold mt-0.5">
            {product.title}
          </h2>
          {product.subtitle && (
            <span className="font-label-md text-label-md text-on-surface-variant font-medium mt-0.5">
              {product.subtitle}
            </span>
          )}

          {/* Cartão de Preço & Condições */}
          <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-[28px] font-bold text-on-surface tracking-tight">
                R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-outline line-through text-sm">
                  R$ {Number(product.originalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              <span className="ml-auto bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold uppercase">
                Liquidação
              </span>
            </div>

            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1.5">
              ou em até <span className="font-semibold text-on-surface">10x de R$ {(product.price / 10).toFixed(2).replace('.', ',')}</span> sem juros
            </p>

            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-surface-container-highest text-on-surface-variant font-body-sm text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                location_on
              </span>
              <span>Retirada imediata no local ou frete a combinar</span>
            </div>
          </div>

          {/* Condição do Item */}
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40">
            <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[13px] font-semibold text-on-surface">
                {product.conditionLabel || 'Seminovo / Estado Impecável'}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                {product.conditionDesc || 'Pouco uso, revisado e higienizado.'}
              </span>
            </div>
          </div>
        </section>

        {/* Abas Editoriais: Descrição / Especificações */}
        <section className="px-margin flex flex-col mt-6">
          {/* Seletor de Abas */}
          <div className="flex items-center bg-surface-container p-1 rounded-full w-full">
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`flex-1 py-2 rounded-full font-label-md text-label-md transition-all ${
                activeTab === 'desc'
                  ? 'bg-surface text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Descrição & História
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`flex-1 py-2 rounded-full font-label-md text-label-md transition-all ${
                activeTab === 'specs'
                  ? 'bg-surface text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Ficha Técnica
            </button>
          </div>

          {/* Aba 1: Descrição */}
          {activeTab === 'desc' && (
            <div className="mt-4 flex flex-col">
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/40">
                <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface mb-2">
                  História do Desapego
                </h3>
                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {product.description || 'Produto de alta qualidade disponível para venda rápida por motivo de mudança.'}
                </div>
              </div>
            </div>
          )}

          {/* Aba 2: Especificações */}
          {activeTab === 'specs' && (
            <div className="mt-4 flex flex-col">
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/40 overflow-hidden">
                <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface mb-3">
                  Especificações do Produto
                </h3>
                {Array.isArray(product.specs) && product.specs.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {product.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className={`flex justify-between items-center py-2.5 px-3 rounded-xl ${
                          sIdx % 2 === 0 ? 'bg-surface-container-low' : 'bg-transparent'
                        }`}
                      >
                        <span className="font-body-md text-[13px] text-on-surface-variant">
                          {spec.key || spec.property}
                        </span>
                        <span className="font-label-md text-[13px] text-on-surface font-semibold text-right ml-2">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body-sm text-outline text-sm py-2">
                    Nenhuma especificação adicional cadastrada.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Conversion Action Bar com WhatsApp */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl p-margin pb-safe border-t border-surface-container-high/60 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-space-md">
          {/* Preço Total Resumo */}
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
              VALOR DO ITEM
            </span>
            <span className="font-headline-sm text-[20px] font-bold text-on-surface leading-tight">
              R$ {Number(product.price).toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Botão Oficial WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-13 py-3.5 px-4 bg-[#25D366] text-white rounded-full flex items-center justify-center gap-2 font-label-lg text-label-lg active:scale-95 transition-all shadow-md hover:brightness-105"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 2C6.496 2 2 6.485 2 12.019c0 1.997.585 3.86 1.597 5.43L2 22l4.711-1.543a10.007 10.007 0 005.32 1.562c5.535 0 10.031-4.485 10.031-10.019C22.062 6.485 17.566 2 12.031 2zm5.836 14.199c-.244.686-1.22 1.258-1.706 1.306-.453.045-1.045.066-3.376-.899-2.73-1.13-4.48-3.905-4.616-4.086-.135-.181-1.106-1.472-1.106-2.806s.698-1.992.946-2.261c.247-.27.54-.338.72-.338.181 0 .362.002.519.01.168.009.393-.064.614.469.228.55.776 1.895.845 2.034.068.139.113.3.023.481-.091.18-.135.292-.27.451-.136.158-.285.353-.408.473-.135.133-.276.277-.118.549.157.271.703 1.157 1.507 1.874 1.037.925 1.91 1.213 2.181 1.348.271.135.43.113.589-.068.158-.18.677-.788.857-1.059.181-.271.362-.226.61-.135.249.09 1.58.745 1.851.881.272.135.452.203.52.316.068.113.068.654-.176 1.34z"></path>
            </svg>
            <span className="whitespace-nowrap font-semibold">Chamar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
