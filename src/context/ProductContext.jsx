import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { supabase, uploadProductPhoto, base64ToBlob } from '../lib/supabaseClient';
import { resolveImageUrl, getProductPlaceholder } from '../lib/imageHelper';

const ProductContext = createContext(null);

const STORAGE_KEY_PRODUCTS = 'desapegos_bazar_products_v3';
const STORAGE_KEY_WISHLIST = 'desapegos_bazar_wishlist_v3';
const STORAGE_KEY_CART = 'desapegos_bazar_cart_v3';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => {
            const rawImages = Array.isArray(p.images) ? p.images : [];
            const safeImages = rawImages.length > 0
              ? rawImages.map(img => resolveImageUrl(img, p.category || p.title))
              : [getProductPlaceholder(p.category || p.title)];
            return {
              ...p,
              images: safeImages
            };
          });
        }
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

  // Sincronizar catálogo local para o Supabase quando o banco estiver vazio
  const syncLocalProductsToSupabase = async (items) => {
    try {
      const payloads = items.map(p => ({
        title: p.title || 'Item Bazar',
        subtitle: p.subtitle || null,
        category: p.category || 'Mobiliário',
        category_slug: p.categorySlug || 'mobiliario',
        tag: p.tag || p.category,
        price: Number(p.price) || 0,
        original_price: p.originalPrice ? Number(p.originalPrice) : null,
        condition: p.condition || 'semi-new',
        condition_label: p.conditionLabel || 'Seminovo / Estado Impecável',
        condition_desc: p.conditionDesc || '',
        whatsapp: p.whatsapp || '5571999088651',
        status: p.status || 'available',
        images: Array.isArray(p.images) ? p.images : [],
        video: p.video || null,
        description: p.description || '',
        specs: Array.isArray(p.specs) ? p.specs : []
      }));

      const { data, error } = await supabase
        .from('desapegos_produtos')
        .insert(payloads)
        .select();

      if (error) {
        console.error('Erro na sincronização com Supabase:', error);
        setProducts(items);
      } else if (data && data.length > 0) {
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
        showToast(`${mapped.length} produtos sincronizados com o novo banco Supabase! ✨`);
      }
    } catch (e) {
      console.error('Falha geral na sincronização:', e);
      setProducts(items);
    }
  };

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
        const mapped = data.map(item => {
          const rawImages = Array.isArray(item.images) ? item.images : [];
          const safeImages = rawImages.length > 0
            ? rawImages.map(img => resolveImageUrl(img, item.category || item.title))
            : [getProductPlaceholder(item.category || item.title)];

          return {
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
            images: safeImages,
            video: item.video,
            description: item.description,
            specs: Array.isArray(item.specs) ? item.specs : [],
            createdAt: item.created_at
          };
        });

        setProducts(mapped);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(mapped));
      } else {
        // Se o Supabase estiver vazio, verifica se há produtos salvos no localStorage para migrar
        const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (stored) {
          try {
            const localList = JSON.parse(stored);
            if (Array.isArray(localList) && localList.length > 0) {
              console.log('Migrando catálogo do cache local para o novo banco Supabase...', localList.length);
              await syncLocalProductsToSupabase(localList);
              return;
            }
          } catch (e) {
            console.warn('Erro ao ler cache local para migração:', e);
          }
        }
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
      // Faz upload de cada foto para o Bucket 'desapegos-fotos' no Supabase
      for (const item of newProduct.images || []) {
        if (item instanceof Blob || (typeof File !== 'undefined' && item instanceof File)) {
          const publicUrl = await uploadProductPhoto(item);
          finalImages.push(publicUrl);
        } else if (item && typeof item === 'object' && item.file) {
          const publicUrl = await uploadProductPhoto(item.file);
          finalImages.push(publicUrl);
        } else if (typeof item === 'string' && item.startsWith('data:image/')) {
          try {
            const blob = base64ToBlob(item);
            const publicUrl = await uploadProductPhoto(blob);
            finalImages.push(publicUrl);
          } catch (uploadErr) {
            console.error('Erro no upload de foto base64:', uploadErr);
            finalImages.push(item);
          }
        } else if (typeof item === 'string') {
          finalImages.push(item);
        }
      }

      // Upload do arquivo de vídeo se houver
      let finalVideo = null;
      if (newProduct.video) {
        let videoUrl = newProduct.video.url || null;

        const videoRawFile = newProduct.videoFile || newProduct.video.file;
        if (videoRawFile instanceof Blob || (typeof File !== 'undefined' && videoRawFile instanceof File)) {
          showToast('Enviando vídeo para o Supabase Storage...');
          videoUrl = await uploadProductPhoto(videoRawFile);
        }

        let videoCover = newProduct.video.cover || finalImages[0] || null;
        if (videoCover && typeof videoCover === 'string' && videoCover.startsWith('data:image/')) {
          try {
            const coverBlob = base64ToBlob(videoCover);
            videoCover = await uploadProductPhoto(coverBlob);
          } catch (covErr) {
            console.warn('Falha no upload de miniatura do vídeo:', covErr);
            videoCover = finalImages[0] || null;
          }
        }

        if (videoUrl) {
          finalVideo = {
            title: newProduct.video.title || 'Demonstração em Vídeo',
            desc: newProduct.video.desc || 'Registro audiovisual do item',
            url: videoUrl,
            cover: videoCover || finalImages[0] || null
          };
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
        video: finalVideo,
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
        throw new Error(error.message || 'Falha na inserção no banco');
      }

      const created = {
        ...newProduct,
        id: String(data.id),
        images: finalImages,
        createdAt: data.created_at
      };

      setProducts(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Falha geral ao publicar:', err);
      throw err;
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

  // 4. Atualizar fotos de um produto existente (upload de novas fotos)
  const updateProductImages = async (id, newImages) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, images: newImages } : p));
    showToast('Fotos atualizadas com sucesso! 📸');

    try {
      await supabase
        .from('desapegos_produtos')
        .update({ images: newImages })
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar fotos no Supabase:', err);
    }
  };

  // 5. Deletar Produto no Supabase
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
        updateProductImages,
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
