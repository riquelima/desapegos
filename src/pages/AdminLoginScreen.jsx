import React, { useState } from 'react';

export default function AdminLoginScreen({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Validação das credenciais definidas pelo usuário
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanEmail === 'henrique@email.com' && cleanPassword === '230891') {
        localStorage.setItem('desapegos_admin_auth', 'true');
        setLoading(false);
        onLoginSuccess();
      } else {
        setLoading(false);
        setError('E-mail ou senha incorretos.');
      }
    }, 400);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface px-margin pt-safe pb-safe">
      {/* Top Header */}
      <div className="h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
        </button>
        <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline">
          Acesso Restrito
        </span>
        <div className="w-10"></div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-8">
        {/* Ícone e Título */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg mb-4">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h1 className="font-headline-md text-[24px] font-bold text-on-surface">
            Área do Administrador
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant mt-1">
            Entre com suas credenciais para gerenciar e cadastrar produtos no bazar.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Campo de E-mail */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-xs text-on-surface font-semibold" htmlFor="loginEmail">
              E-mail
            </label>
            <div className="flex items-center h-12 px-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-2 text-[20px]">
                mail
              </span>
              <input
                id="loginEmail"
                type="email"
                placeholder="henrique@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent font-body-md text-sm text-on-surface focus:outline-none"
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-xs text-on-surface font-semibold" htmlFor="loginPass">
              Senha
            </label>
            <div className="flex items-center h-12 px-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-2 text-[20px]">
                lock
              </span>
              <input
                id="loginPass"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent font-body-md text-sm text-on-surface focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-full bg-primary text-on-primary font-label-lg text-sm font-semibold shadow-md hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="text-xs">Autenticando...</span>
            ) : (
              <>
                <span>Acessar Painel</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Voltar ao Catálogo */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-outline hover:text-on-surface underline"
          >
            Voltar para o catálogo de desapegos
          </button>
        </div>
      </div>
    </div>
  );
}
