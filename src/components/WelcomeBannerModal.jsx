import React, { useState, useEffect } from 'react';

const STORAGE_KEY_DISMISSED = 'desapegos_welcome_dismissed_v1';

export function WelcomeBannerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-secondary/20 overflow-hidden flex flex-col gap-4 text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Detalhe estético de fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header do Modal com Botão Fechar */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold tracking-wide uppercase">
            <span>✈️</span>
            <span>Bazar de Mudança</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Título Principal com Rochester & Epilogue */}
        <div className="relative z-10">
          <span className="font-body-sm text-[12px] uppercase tracking-widest text-on-surface-variant/80 block mb-1">
            Uma nova jornada começa
          </span>
          <h2 
            className="text-[32px] leading-[36px] text-on-surface font-normal"
            style={{ fontFamily: 'Rochester, cursive' }}
          >
            Do outro lado do mundo! 🌏✨
          </h2>
        </div>

        {/* Copy Emocional & Direta */}
        <div className="relative z-10 flex flex-col gap-3 text-on-surface-variant font-body-md text-[13.5px] leading-relaxed">
          <p>
            Olá! Estou indo para uma <strong>nova fase da minha vida do outro lado do mundo</strong> e, por isso, preciso me desfazer com carinho dos meus móveis, eletrodomésticos e equipamentos de tecnologia que tanto me ajudaram.
          </p>
          <p>
            Tudo está em <strong>perfeito estado de conservação e funcionamento</strong>, muitos itens seminovos e alguns <strong>até na garantia de fábrica</strong> com nota fiscal.
          </p>
          <p className="font-semibold text-secondary">
            É a sua chance de equipar sua casa ou seu setup com itens selecionados a preço de desapego real. Aproveite! 🎉
          </p>
        </div>

        {/* Destaques Rápidos */}
        <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
            <span className="text-secondary text-[18px]">🛡️</span>
            <span className="text-[11px] font-medium text-on-surface leading-tight">
              100% testado & conservado
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
            <span className="text-secondary text-[18px]">🧾</span>
            <span className="text-[11px] font-medium text-on-surface leading-tight">
              Vários na garantia
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
            <span className="text-secondary text-[18px]">📍</span>
            <span className="text-[11px] font-medium text-on-surface leading-tight">
              Retirada rápida no local
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
            <span className="text-secondary text-[18px]">⚡</span>
            <span className="text-[11px] font-medium text-on-surface leading-tight">
              Preço de desapego
            </span>
          </div>
        </div>

        {/* Botão de Ação CTA */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-full bg-primary text-on-primary font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-neutral-800"
          >
            <span>Explorar os Desapegos</span>
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Card Editorial permanente que fica no topo do catálogo
 */
export function WelcomeEditorialCard({ onOpenStory }) {
  return (
    <section className="w-full px-margin my-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary/10 p-4 border border-secondary/25 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
            <span>✈️</span>
            <span>Bazar Mudança Internacional</span>
          </div>
          {onOpenStory && (
            <button
              type="button"
              onClick={onOpenStory}
              className="text-secondary text-[11px] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Ler história</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>

        <div>
          <h3 
            className="text-[22px] leading-tight text-on-surface font-normal"
            style={{ fontFamily: 'Rochester, cursive' }}
          >
            Nova fase do outro lado do mundo! 🌏
          </h3>
          <p className="font-body-sm text-[12.5px] leading-relaxed text-on-surface-variant mt-1">
            Me desfazendo com carinho dos meus móveis, eletros e techs. Tudo em perfeito estado de conservação, funcionando 100% e alguns itens ainda na garantia. <strong>Aproveite as oportunidades!</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-surface-container-high/80 text-[11px] text-on-surface-variant font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
            Itens revisados
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[14px]">verified</span>
            Com garantia
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[14px]">bolt</span>
            Venda direta
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Hook para gerenciar o estado do modal automático
 */
export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(() => {
    // Abre automaticamente uma vez por sessão
    return sessionStorage.getItem(STORAGE_KEY_DISMISSED) !== 'true';
  });

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  return { isOpen, open, close };
}
