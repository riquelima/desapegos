import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function BottomNav({ currentRoute, onNavigate }) {
  const { wishlist, cart } = useProducts();

  const isBazarActive = currentRoute === '/' || currentRoute.startsWith('/produto');
  const isAdminActive = currentRoute === '/admin' || currentRoute === '/admin/gerenciar';
  const isWishlistActive = currentRoute === '/favoritos';
  const isCartActive = currentRoute === '/sacola';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
        {/* Tab 1: Catálogo */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
            isBazarActive && !isWishlistActive && !isCartActive
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/70 hover:text-on-surface'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isBazarActive && !isWishlistActive && !isCartActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            storefront
          </span>
          <span className="text-[11px] font-label-md tracking-tight">Catálogo</span>
        </button>

        {/* Tab 2: Favoritos */}
        <button
          type="button"
          onClick={() => onNavigate('/favoritos')}
          className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
            isWishlistActive
              ? 'text-secondary font-bold'
              : 'text-on-surface-variant/70 hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isWishlistActive || wishlist.length > 0 ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-sm">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[11px] font-label-md tracking-tight">Favoritos</span>
        </button>

        {/* Tab 3: Sacola */}
        <button
          type="button"
          onClick={() => onNavigate('/sacola')}
          className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
            isCartActive
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/70 hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isCartActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              shopping_bag
            </span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-sm">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[11px] font-label-md tracking-tight">Sacola</span>
        </button>

        {/* Tab 4: Admin */}
        <button
          type="button"
          onClick={() => onNavigate('/admin')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
            isAdminActive
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/70 hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isAdminActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              add_circle
            </span>
          </div>
          <span className="text-[11px] font-label-md tracking-tight">Cadastrar</span>
        </button>
      </div>
    </nav>
  );
}
