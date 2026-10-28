import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/initialProducts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper';

export default function CatalogScreen({ onSelectProduct, onNavigateToAdmin, onNavigateToFavorites }) {
  const { products, toggleWishlist, isWishlisted, addToCart } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('destaque'); // 'destaque', 'menor', 'maior'

  // Filtragem e ordenação dinâmica
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtro de categoria
    if (selectedCategory !== 'todos') {
      result = result.filter(p => {
        const cat = CATEGORIES.find(c => c.id === selectedCategory);
        if (!cat) return true;
        return (
          p.categorySlug === selectedCategory ||
          p.category?.toLowerCase().includes(cat.label.toLowerCase()) ||
          p.category?.toLowerCase() === cat.slug.toLowerCase()
        );
      });
    }

    // Filtro de busca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Ordenação
    if (sortBy === 'menor') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'maior') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const cycleSort = () => {
    if (sortBy === 'destaque') setSortBy('menor');
    else if (sortBy === 'menor') setSortBy('maior');
    else setSortBy('destaque');
  };

  const getSortLabel = () => {
    if (sortBy === 'menor') return 'Menor Preço';
    if (sortBy === 'maior') return 'Maior Preço';
    return 'Em Destaque';
  };

  return (
    <div className="flex flex-col w-full pb-8 min-h-screen bg-surface">
      {/* Hero Editorial Banner */}
      <section className="relative w-full px-margin pt-4 pb-2 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-label-sm tracking-[0.25em] uppercase text-on-surface-variant/80 mb-0.5">
          Bazar Especial
        </span>
        <h1 
          className="text-[38px] leading-[44px] text-on-surface font-normal select-none"
          style={{ fontFamily: 'Rochester, cursive' }}
        >
          Desapegos Mudança
        </h1>
        <div className="w-10 h-[1.5px] bg-secondary/40 mt-1.5 rounded-full"></div>
      </section>

      {/* Barra de Busca Rápida */}
      <section className="w-full px-margin mt-3 mb-2">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar móveis, fones, luminárias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-9 rounded-full bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Categorias Roláveis em Pílulas */}
      <section className="w-full py-2">
        <div className="flex items-center gap-space-xs overflow-x-auto px-margin no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = cat.id === 'todos' 
              ? products.length 
              : products.filter(p => p.categorySlug === cat.id || p.category?.toLowerCase().includes(cat.label.toLowerCase())).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'opacity-75' : 'text-on-surface-variant'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filtros Rápidos & Ordenação */}
      <section className="w-full px-margin pt-2 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-headline-sm text-[16px] text-on-surface tracking-tight font-semibold">
            {selectedCategory === 'todos' ? 'Todos os Itens' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </span>
          <span className="text-[12px] font-label-md text-on-surface-variant font-normal">
            ({filteredProducts.length})
          </span>
        </div>
      </section>

      {/* Grade de Produtos de 2 Colunas */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-margin text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">storefront</span>
          </div>
          <h3 className="font-headline-sm text-base text-on-surface font-semibold mb-1">
            Bazar em Preparação
          </h3>
          <p className="font-body-sm text-xs text-outline max-w-xs mb-5 leading-relaxed">
            Nenhum item publicado no momento. Novos desapegos serão disponibilizados em breve para compra e retirada!
          </p>
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            Cadastrar Primeiro Desapego
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-margin text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Nenhum item encontrado
          </h3>
          <p className="font-body-sm text-body-sm text-outline max-w-xs mb-4">
            Tente buscar por outro termo ou selecione a categoria "Todos".
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('todos'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md"
          >
            Ver todos os itens
          </button>
        </div>
      ) : (
        <section className="w-full px-margin grid grid-cols-2 gap-gutter pb-6">
          {filteredProducts.map((product) => {
            const isFav = isWishlisted(product.id);
            const coverImage = resolveImageUrl(product.images?.[0], product.category || product.title);
            const isSold = product.status === 'sold';
            const isReserved = product.status === 'reserved';

            return (
              <article
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer relative"
              >
                {/* Imagem do Produto com Aspect 4/5 */}
                <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                  <img
                    alt={product.title}
                    src={coverImage}
                    onError={(e) => handleImageError(e, product.category || product.title)}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isSold ? 'grayscale opacity-60' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Status Badges */}
                  {isSold && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-error text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Vendido
                      </span>
                    </div>
                  )}
                  {isReserved && !isSold && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Reservado
                    </span>
                  )}
                </div>

                {/* Dados do Produto */}
                <div className="p-space-sm flex flex-col flex-1 justify-between gap-space-xs">
                  <div>
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider block truncate">
                      {product.tag || product.category || 'Desapego'}
                    </span>
                    <h2 className="font-body-md text-body-md text-on-surface font-medium truncate mt-0.5">
                      {product.title}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-[10px] text-on-surface-variant">
                        À vista
                      </span>
                      <span className="font-headline-sm text-[15px] leading-tight text-on-surface font-bold tracking-tight">
                        R$ {Number(product.price).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={`Ver detalhes de ${product.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product.id);
                      }}
                      className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center transition-transform active:scale-90 hover:bg-neutral-800"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
