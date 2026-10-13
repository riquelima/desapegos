import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function AdminManageScreen({ onBack, onNavigateToCreate, onSelectProduct, onLogout }) {
  const { products, updateProductStatus, deleteProduct, resetToSampleData } = useProducts();

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pb-10">
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
            <h1 className="font-headline-sm text-[16px] text-on-surface font-semibold truncate">
              Gerenciar ({products.length})
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Novo
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sair do Modo Admin"
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Lista de Itens com Controles Rápidos */}
      <main className="flex-1 flex flex-col p-margin gap-3">
        <p className="font-body-sm text-xs text-on-surface-variant">
          Alterne status de venda ou exclua itens do catálogo com um toque:
        </p>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2">inventory</span>
            <p className="font-body-md text-sm text-outline">Nenhum produto cadastrado no bazar.</p>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={onNavigateToCreate}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-full shadow-sm hover:bg-neutral-800"
              >
                Cadastrar Item
              </button>
              <button
                type="button"
                onClick={resetToSampleData}
                className="px-4 py-2 bg-surface-container text-on-surface text-xs font-semibold rounded-full"
              >
                Sincronizar Supabase
              </button>
            </div>
          </div>
        ) : (
          products.map(prod => {
            const cover = prod.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';
            const status = prod.status || 'available';

            return (
              <div
                key={prod.id}
                className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cover}
                    alt={prod.title}
                    onClick={() => onSelectProduct(prod.id)}
                    className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-90"
                  />
                  <div className="flex-1 min-w-0" onClick={() => onSelectProduct(prod.id)}>
                    <h3 className="font-label-lg text-sm text-on-surface font-semibold truncate cursor-pointer">
                      {prod.title}
                    </h3>
                    <p className="font-headline-sm text-sm font-bold text-secondary">
                      R$ {Number(prod.price).toLocaleString('pt-BR')}
                    </p>
                    <span className="text-[10px] text-outline uppercase">
                      {prod.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir "${prod.title}" do bazar?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="w-8 h-8 rounded-full text-outline hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Controles de Status: Disponível | Reservado | Vendido */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-surface-container-high">
                  <span className="text-[10px] uppercase tracking-wider text-outline font-semibold mr-1">
                    Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => updateProductStatus(prod.id, 'available')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      status === 'available'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Disponível
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProductStatus(prod.id, 'reserved')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      status === 'reserved'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Reservado
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProductStatus(prod.id, 'sold')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      status === 'sold'
                        ? 'bg-error text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Vendido
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="pt-4 pb-2 text-center">
          <button
            type="button"
            onClick={() => {
              resetToSampleData();
            }}
            className="text-xs text-outline underline hover:text-on-surface"
          >
            Sincronizar com o Banco de Dados
          </button>
        </div>
      </main>
    </div>
  );
}
