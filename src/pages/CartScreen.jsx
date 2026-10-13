import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function CartScreen({ onSelectProduct, onBack }) {
  const { cart, removeFromCart } = useProducts();

  const total = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const phone = '5571999088651';
  const itemList = cart.map(item => `• ${item.title} (R$ ${Number(item.price).toLocaleString('pt-BR')})`).join('\n');
  const message = `Olá! Gostaria de negociar os seguintes itens do seu bazar de desapegos:\n\n${itemList}\n\n*Valor Total: R$ ${total.toLocaleString('pt-BR')}*\nPodemos combinar a retirada?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pb-32">
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
              Minha Sacola ({cart.length})
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-margin flex flex-col gap-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container text-outline flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
            </div>
            <h3 className="font-headline-sm text-base font-semibold text-on-surface mb-1">
              Sua sacola está vazia
            </h3>
            <p className="font-body-sm text-xs text-outline max-w-xs mb-5">
              Navegue pelo catálogo e adicione itens para fechar um pacote com desconto.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold"
            >
              Ver Itens Disponíveis
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cart.map(item => {
              const cover = item.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';
              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 flex items-center gap-3 shadow-sm"
                >
                  <img
                    src={cover}
                    alt={item.title}
                    onClick={() => onSelectProduct(item.id)}
                    className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-90"
                  />
                  <div className="flex-1 min-w-0" onClick={() => onSelectProduct(item.id)}>
                    <h3 className="font-label-lg text-sm text-on-surface font-semibold truncate cursor-pointer">
                      {item.title}
                    </h3>
                    <p className="font-headline-sm text-sm font-bold text-on-surface">
                      R$ {Number(item.price).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 rounded-full text-outline hover:text-error flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              );
            })}

            {/* Resumo */}
            <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Quantidade de itens</span>
                <span className="font-semibold text-on-surface">{cart.length}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-container-high">
                <span>Total Estimado</span>
                <span className="text-secondary">R$ {total.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ação WhatsApp */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl p-margin pb-3 border-t border-surface-container-high/60 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center gap-2 font-label-lg text-sm font-semibold active:scale-95 transition-all shadow-md hover:brightness-105"
            >
              <span>Negociar Pacote no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
