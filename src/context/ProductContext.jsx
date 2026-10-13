import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { supabase, uploadProductPhoto, base64ToBlob } from '../lib/supabaseClient';

const ProductContext = createContext(null);

const STORAGE_KEY_PRODUCTS = 'desapegos_bazar_products_real_v1';
const STORAGE_KEY_WISHLIST = 'desapegos_bazar_wishlist_real_v1';
const STORAGE_KEY_CART = 'desapegos_bazar_cart_real_v1';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar do cache local:', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Lista de desejos / favoritos
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sacola
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Toast global
  const [toast, setToast] = useState({ visible: false, message: '', type: 'default' });

  // 1. Carregar produtos do Supabase em tempo real
  const fetchProductsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('desapegos_produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Aviso do Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map(item => ({
          id: String(item.id),
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          categorySlug: item.category_slug,
          tag: item.tag,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : null,
          condition: item.condition,
          conditionLabel: item.condition_label,
          conditionDesc: item.condition_desc,
          whatsapp: item.whatsapp || '5571999088651',
          status: item.status || 'available',
          images: Array.isArray(item.images) ? item.images : [],
          video: item.video,
          description: item.description,
          specs: Array.isArray(item.specs) ? item.specs : [],
          createdAt: item.created_at
        }));

        setProducts(mapped);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(mapped));
      } else {
        setProducts([]);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromSupabase();
  }, []);

  // Persistir produtos localmente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Erro ao salvar produtos no localStorage:', e);
    }
  }, [products]);

  // Persistir wishlist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Erro ao salvar favoritos:', e);
    }
  }, [wishlist]);

  // Persistir sacola
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao salvar sacola:', e);
    }
  }, [cart]);

  const showToast = (message, type = 'default') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2600);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removido dos favoritos' : 'Adicionado aos favoritos ❤️');
      return updated;
    });
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
    showToast(`${product.title} adicionado à sacola`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // 2. Adicionar Produto no Supabase & Bucket de Fotos
  const addProduct = async (newProduct) => {
    showToast('Processando publicação e fotos...');

    let finalImages = [];
    try {
      // Faz upload de cada foto para o Bucket 'desapegos-fotos' no Supabase se for base64
      for (const img of newProduct.images || []) {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          try {
            const blob = base64ToBlob(img);
            const publicUrl = await uploadProductPhoto(blob);
            finalImages.push(publicUrl);
          } catch (uploadErr) {
            console.error('Erro no upload de foto, mantendo local:', uploadErr);
            finalImages.push(img);
          }
        } else {
          finalImages.push(img);
        }
      }

      // Inserção no banco Supabase
      const payload = {
        title: newProduct.title,
        subtitle: newProduct.subtitle || null,
        category: newProduct.category,
        category_slug: newProduct.categorySlug || 'geral',
        tag: newProduct.tag || newProduct.category,
        price: Number(newProduct.price),
        original_price: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
        condition: newProduct.condition || 'semi-new',
        condition_label: newProduct.conditionLabel || 'Seminovo / Estado Impecável',
        condition_desc: newProduct.conditionDesc || '',
        whatsapp: newProduct.whatsapp || '5571999088651',
        status: newProduct.status || 'available',
        images: finalImages,
        video: newProduct.video || null,
        description: newProduct.description || '',
        specs: newProduct.specs || []
      };

      const { data, error } = await supabase
        .from('desapegos_produtos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar produto no Supabase:', error);
        // Fallback local se falhar conexão
        const fallbackId = Date.now().toString();
        const localProduct = { ...newProduct, id: fallbackId, images: finalImages };
        setProducts(prev => [localProduct, ...prev]);
        showToast('Produto publicado localmente!');
        return localProduct;
      }

      const created = {
        ...newProduct,
        id: String(data.id),
        images: finalImages,
        createdAt: data.created_at
      };

      setProducts(prev => [created, ...prev]);
      showToast('Produto publicado e fotos salvas no Supabase!');
      return created;
    } catch (err) {
      console.error('Falha geral ao publicar:', err);
      const fallbackId = Date.now().toString();
      const localProduct = { ...newProduct, id: fallbackId, images: finalImages };
      setProducts(prev => [localProduct, ...prev]);
      showToast('Produto publicado no dispositivo!');
      return localProduct;
    }
  };

  // 3. Atualizar Status no Supabase
  const updateProductStatus = async (id, newStatus) => {
    // Atualização otimista no estado
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    const labels = {
      available: 'Disponível',
      reserved: 'Marcado como Reservado',
      sold: 'Marcado como Vendido'
    };
    showToast(labels[newStatus] || 'Status atualizado');

    try {
      await supabase
        .from('desapegos_produtos')
        .update({ status: newStatus })
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar status no Supabase:', err);
    }
  };

  // 4. Deletar Produto no Supabase
  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Item removido do bazar.');

    try {
      await supabase
        .from('desapegos_produtos')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao deletar no Supabase:', err);
    }
  };

  const resetToSampleData = async () => {
    await fetchProductsFromSupabase();
    showToast('Catálogo sincronizado com o Supabase!');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        wishlist,
        cart,
        toast,
        showToast,
        toggleWishlist,
        isWishlisted,
        addToCart,
        removeFromCart,
        addProduct,
        deleteProduct,
        updateProductStatus,
        resetToSampleData,
        refreshProducts: fetchProductsFromSupabase
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
