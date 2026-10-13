import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function FavoritesScreen({ onSelectProduct, onBack }) {
  const { products, wishlist, toggleWishlist } = useProducts();
  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/40">
        <div className="h-16 max-w-md mx-auto px-margin flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
            <h1 className="font-headline-sm text-[16px] text-on-surface font-semibold">
              Meus Favoritos ({favoriteProducts.length})
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-margin flex flex-col gap-3">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 text-secondary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">favorite_border</span>
            </div>
            <h3 className="font-headline-sm text-base font-semibold text-on-surface mb-1">
              Nenhum item salvo ainda
            </h3>
            <p className="font-body-sm text-xs text-outline max-w-xs mb-5">
              Toque no coração dos produtos que você gostou no catálogo para salvar aqui.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold"
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-gutter">
            {favoriteProducts.map(product => {
              const coverImage = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer relative"
                >
                  <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                    <img
                      alt={product.title}
                      src={coverImage}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface/85 backdrop-blur-md text-secondary flex items-center justify-center transition-all active:scale-90 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="p-space-sm flex flex-col flex-1 justify-between gap-1">
                    <h2 className="font-body-md text-sm text-on-surface font-medium truncate">
                      {product.title}
                    </h2>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">
                      R$ {Number(product.price).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
