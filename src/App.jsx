import React, { useState, useEffect } from 'react';
import { ProductProvider } from './context/ProductContext';
import CatalogScreen from './pages/CatalogScreen';
import ProductDetailScreen from './pages/ProductDetailScreen';
import AdminLoginScreen from './pages/AdminLoginScreen';
import AdminScreen from './pages/AdminScreen';
import AdminManageScreen from './pages/AdminManageScreen';
import FavoritesScreen from './pages/FavoritesScreen';
import CartScreen from './pages/CartScreen';
import Toast from './components/Toast';

export default function App() {
  // Roteamento baseado em hash com suporte a histórico nativo do navegador
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.replace('#', '') || '/';
    return hash;
  });

  // Autenticação administrativa com persistência
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('desapegos_admin_auth') === 'true';
  });

  // Listener para sincronizar mudanças no hash (botão voltar do celular)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setRoute(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute) => {
    window.location.hash = newRoute;
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLogout = () => {
    localStorage.removeItem('desapegos_admin_auth');
    setIsAdminLoggedIn(false);
    navigateTo('/');
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigateTo('/admin');
  };

  // Identificação da rota ativa
  let currentView = null;
  const isProductDetail = route.startsWith('/produto/');
  const selectedProductId = isProductDetail ? route.replace('/produto/', '') : null;

  if (route === '/' || route === '') {
    currentView = (
      <CatalogScreen
        onSelectProduct={(id) => navigateTo(`/produto/${id}`)}
        onNavigateToAdmin={() => navigateTo('/admin')}
        onNavigateToFavorites={() => navigateTo('/favoritos')}
      />
    );
  } else if (isProductDetail) {
    currentView = (
      <ProductDetailScreen
        productId={selectedProductId}
        onBack={() => navigateTo('/')}
      />
    );
  } else if (route === '/admin' || route === '/login') {
    // Se não estiver logado, exibe tela de login dedicada com e-mail e senha
    if (!isAdminLoggedIn) {
      currentView = (
        <AdminLoginScreen
          onLoginSuccess={handleLoginSuccess}
          onBack={() => navigateTo('/')}
        />
      );
    } else {
      currentView = (
        <AdminScreen
          onBack={() => navigateTo('/')}
          onProductCreated={(id) => navigateTo(`/produto/${id}`)}
          onNavigateToManage={() => navigateTo('/admin/gerenciar')}
          onLogout={handleLogout}
        />
      );
    }
  } else if (route === '/admin/gerenciar') {
    if (!isAdminLoggedIn) {
      currentView = (
        <AdminLoginScreen
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            navigateTo('/admin/gerenciar');
          }}
          onBack={() => navigateTo('/')}
        />
      );
    } else {
      currentView = (
        <AdminManageScreen
          onBack={() => navigateTo('/admin')}
          onNavigateToCreate={() => navigateTo('/admin')}
          onSelectProduct={(id) => navigateTo(`/produto/${id}`)}
          onLogout={handleLogout}
        />
      );
    }
  } else if (route === '/favoritos') {
    currentView = (
      <FavoritesScreen
        onSelectProduct={(id) => navigateTo(`/produto/${id}`)}
        onBack={() => navigateTo('/')}
      />
    );
  } else if (route === '/sacola') {
    currentView = (
      <CartScreen
        onSelectProduct={(id) => navigateTo(`/produto/${id}`)}
        onBack={() => navigateTo('/')}
      />
    );
  } else {
    currentView = (
      <CatalogScreen
        onSelectProduct={(id) => navigateTo(`/produto/${id}`)}
        onNavigateToAdmin={() => navigateTo('/admin')}
        onNavigateToFavorites={() => navigateTo('/favoritos')}
      />
    );
  }

  return (
    <ProductProvider>
      <div className="mobile-app-shell">
        {currentView}
        <Toast onNavigateToCart={() => navigateTo('/sacola')} />
      </div>
    </ProductProvider>
  );
}
