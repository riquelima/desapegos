import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function Toast({ onNavigateToCart }) {
  const { toast } = useProducts();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
      <div className="bg-primary text-on-primary px-4 py-3 rounded-full shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <span className="font-label-md text-label-md truncate text-white">
            {toast.message}
          </span>
        </div>
        {onNavigateToCart && (
          <button 
            type="button" 
            onClick={onNavigateToCart}
            className="font-label-sm text-secondary-container font-bold whitespace-nowrap hover:underline cursor-pointer"
          >
            Ver
          </button>
        )}
      </div>
    </div>
  );
}
