import React, { useState, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/initialProducts';
import { generateCommercialAd } from '../lib/aiCopywriter';

export default function AdminScreen({ onBack, onProductCreated, onNavigateToManage, onLogout }) {
  const { addProduct, showToast } = useProducts();
  const fileInputRef = useRef(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Mobiliário');
  const [condition, setCondition] = useState('semi-new');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('+55 71 99908-8651');

  // Mídias
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [tempVideoInput, setTempVideoInput] = useState('');

  // Especificações dinâmicas
  const [specs, setSpecs] = useState([
    { key: 'Material', value: 'Madeira maciça nobre' },
    { key: 'Conservação', value: 'Perfeito estado, sem riscos' }
  ]);

  // Upload de arquivos de imagem locais
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });

    showToast(`${files.length} arquivo(s) carregado(s)!`);
  };

  const removeImage = (indexToRemove) => {
    if (images.length === 1) {
      showToast('O produto precisa ter pelo menos 1 imagem');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const setCoverImage = (indexToCover) => {
    setImages(prev => {
      const chosen = prev[indexToCover];
      const rest = prev.filter((_, idx) => idx !== indexToCover);
      return [chosen, ...rest];
    });
    showToast('Foto definida como capa!');
  };

  // Manipulação de especificações
  const addSpecRow = () => {
    setSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const updateSpec = (idx, field, val) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const removeSpecRow = (idx) => {
    setSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  // Sugestão de IA para transformar anotações em anúncio comercial profissional
  const generateAiDescription = async () => {
    if (isGeneratingAi) return;

    setIsGeneratingAi(true);
    showToast('A IA está transformando seu texto em anúncio comercial...');

    try {
      const commercialAd = await generateCommercialAd({
        userInput: description,
        title,
        category,
        price,
        condition
      });

      setDescription(commercialAd);
      showToast('Anúncio comercial gerado com sucesso! ✨');
    } catch (err) {
      console.error('Erro ao gerar com IA:', err);
      showToast('Erro ao contatar a IA. Tente novamente.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Salvar rascunho no localStorage
  const saveDraft = () => {
    const draft = {
      title,
      subtitle,
      category,
      condition,
      originalPrice,
      price,
      description,
      whatsapp,
      specs,
      images
    };
    localStorage.setItem('desapegos_product_draft', JSON.stringify(draft));
    showToast('Rascunho salvo no dispositivo.');
  };

  // Carregar rascunho se existir
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('desapegos_product_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.subtitle) setSubtitle(d.subtitle);
        if (d.category) setCategory(d.category);
        if (d.condition) setCondition(d.condition);
        if (d.originalPrice) setOriginalPrice(d.originalPrice);
        if (d.price) setPrice(d.price);
        if (d.description) setDescription(d.description);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
        if (d.specs) setSpecs(d.specs);
        if (d.images) setImages(d.images);
        showToast('Rascunho carregado!');
      } else {
        showToast('Nenhum rascunho salvo encontrado.');
      }
    } catch {
      showToast('Erro ao carregar rascunho.');
    }
  };

  // Publicar produto
  const handlePublish = (e) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      showToast('Por favor, informe o título do produto');
      return;
    }
    const cleanPrice = parseFloat(price.toString().replace(/\D/g, ''));
    if (!cleanPrice || isNaN(cleanPrice)) {
      showToast('Por favor, informe um valor de venda válido');
      return;
    }

    const cleanOriginalPrice = originalPrice ? parseFloat(originalPrice.toString().replace(/\D/g, '')) : null;

    let conditionLabel = 'Seminovo / Estado Impecável';
    let conditionDesc = 'Pouco usado em estúdio, zero arranhões, higienizado.';
    if (condition === 'new') {
      conditionLabel = 'Novo na Caixa / Lacrado';
      conditionDesc = 'Sem uso prévio, com plástico ou lacre original intacto.';
    } else if (condition === 'used') {
      conditionLabel = 'Com Marcas de Uso Afetuosas';
      conditionDesc = 'Pequenos desgastes visuais estéticos, 100% funcional.';
    }

    // Criar objeto do produto
    const newProduct = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      categorySlug: category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
      tag: category,
      price: cleanPrice,
      originalPrice: cleanOriginalPrice,
      condition,
      conditionLabel,
      conditionDesc,
      whatsapp: whatsapp.replace(/\D/g, '') || '5571999088651',
      images,
      video: videoUrl ? {
        title: 'Demonstração em Vídeo',
        desc: 'Registro audiovisual do item',
        cover: images[0]
      } : null,
      description: description.trim() || 'Item impecável para retirada imediata por motivo de mudança.',
      specs: specs.filter(s => s.key.trim() && s.value.trim()),
      status: 'available'
    };

    const created = addProduct(newProduct);
    localStorage.removeItem('desapegos_product_draft');

    if (onProductCreated) {
      onProductCreated(created.id);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Fixo */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/40 pt-safe">
        <div className="h-16 max-w-md mx-auto px-margin flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Voltar ou Fechar"
              onClick={onBack}
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            <h1 className="font-headline-sm text-[16px] text-on-surface font-semibold truncate ml-1">
              Cadastrar Desapego
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={saveDraft}
              title="Salvar Rascunho"
              className="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:bg-secondary-fixed/30 transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">bookmark_added</span>
            </button>
            {onNavigateToManage && (
              <button
                type="button"
                onClick={onNavigateToManage}
                title="Gerenciar Catálogo"
                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sair do Modo Admin"
                className="w-9 h-9 flex items-center justify-center rounded-full text-outline hover:text-error hover:bg-error/10 transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Formulário Principal */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-36 px-margin">
        <form onSubmit={handlePublish} className="flex flex-col gap-6">

          {/* 1. Mídia do Produto */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                  Mídia do Item
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  A primeira foto será utilizada como capa no bazar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="text-secondary font-label-sm text-[11px] font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                + Link Vídeo
              </button>
            </div>

            {/* Zona de Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative bg-surface-container-lowest border-2 border-dashed border-surface-container-highest rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-surface-container-low active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                </div>
              </div>
              <p className="font-label-lg text-label-lg text-on-surface font-semibold">
                Toque para adicionar fotos do aparelho/móvel
              </p>
              <p className="font-body-sm text-[12px] text-outline mt-0.5">
                Fotos e vídeos da galeria ou câmera (até 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Grade de Fotos Atuais */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-container group shadow-sm border border-surface-container-high/60"
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute top-1.5 left-1.5 bg-primary text-on-primary font-label-sm text-[9px] px-2 py-0.5 rounded-full shadow">
                      Capa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCoverImage(idx)}
                      className="absolute top-1.5 left-1.5 bg-surface/90 text-on-surface font-label-sm text-[9px] px-1.5 py-0.5 rounded shadow hover:bg-primary hover:text-white transition-colors"
                    >
                      Tornar Capa
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-surface/90 text-error flex items-center justify-center shadow hover:bg-error hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Informações Básicas */}
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                Dados Principais
              </h2>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Informações para os compradores encontrarem o produto
              </p>
            </div>

            {/* Título */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="pTitle">
                Título do Desapego *
              </label>
              <input
                id="pTitle"
                type="text"
                placeholder="Ex: Sofá 3 Lugares em Linho Terracota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Subtítulo */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="pSub">
                Subtítulo ou Especificação Curta
              </label>
              <input
                id="pSub"
                type="text"
                placeholder="Ex: Madeira Maciça • Pouquíssimo uso"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">
                Categoria do Bazar
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mobiliário', 'Áudio Premium', 'Luminárias', 'Ergonomia', 'Acessórios', 'Decoração'].map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setCategory(catName)}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all active:scale-95 ${
                      category === catName
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-container-lowest border border-surface-container-high text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>
            </div>

            {/* Condição */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">
                Condição Real do Item
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'semi-new', title: 'Seminovo / Estado Impecável', desc: 'Pouco usado, zero arranhões, limpo e higienizado.' },
                  { id: 'new', title: 'Novo na Caixa / Lacrado', desc: 'Sem uso prévio, com plástico ou caixa original intacta.' },
                  { id: 'used', title: 'Com Marcas de Uso Afetuosas', desc: 'Pequenos desgastes visuais estéticos, 100% funcional.' }
                ].map((cond) => (
                  <label
                    key={cond.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      condition === cond.id
                        ? 'bg-surface-container-high/80 border-primary shadow-sm'
                        : 'bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === cond.id}
                      onChange={() => setCondition(cond.id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {cond.title}
                      </span>
                      <span className="font-body-sm text-[12px] text-outline mt-0.5">
                        {cond.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Preço e Valores */}
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                Preço & Liquidação
              </h2>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Defina valores atrativos para venda rápida por motivo de mudança
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high">
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-[11px] text-outline">
                  Preço Original (De)
                </span>
                <div className="flex items-center h-12 px-3 rounded-xl bg-surface-container text-on-surface">
                  <span className="text-outline text-xs mr-1">R$</span>
                  <input
                    type="number"
                    placeholder="2500"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-transparent text-on-surface text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-[11px] text-secondary font-bold">
                  Valor Bazar (Por) *
                </span>
                <div className="flex items-center h-12 px-3 rounded-xl bg-secondary-fixed/30 border border-secondary/30 text-on-surface">
                  <span className="text-secondary font-bold text-xs mr-1">R$</span>
                  <input
                    type="number"
                    placeholder="1890"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-transparent font-bold text-on-surface text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 4. História & Descrição */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                  História & Descrição
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  Conte como cuidou do item e por que está desapegando
                </p>
              </div>
              <button
                type="button"
                onClick={generateAiDescription}
                disabled={isGeneratingAi}
                className={`text-secondary font-label-sm text-[11px] font-bold flex items-center gap-1.5 bg-secondary-fixed/50 hover:bg-secondary-fixed/70 px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm ${
                  isGeneratingAi ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                <span className={`material-symbols-outlined text-[15px] ${isGeneratingAi ? 'animate-spin' : ''}`}>
                  {isGeneratingAi ? 'sync' : 'magic_button'}
                </span>
                <span>{isGeneratingAi ? 'Gerando anúncio...' : 'Sugestão com IA'}</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-3 border border-surface-container-high">
              <textarea
                rows={5}
                placeholder="Descreva as qualidades, cuidados e o motivo da venda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-on-surface font-body-md text-sm placeholder:text-outline focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </section>

          {/* 5. Especificações Chave */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                  Ficha Técnica & Medidas
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  Dimensões e materiais para o comprador medir o espaço
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high">
                  <input
                    type="text"
                    placeholder="Ex: Medidas"
                    value={spec.key}
                    onChange={(e) => updateSpec(sIdx, 'key', e.target.value)}
                    className="w-5/12 h-10 px-3 bg-surface-container-low rounded-lg font-label-md text-xs text-on-surface focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Ex: 2,10m x 0,90m"
                    value={spec.value}
                    onChange={(e) => updateSpec(sIdx, 'value', e.target.value)}
                    className="w-6/12 h-10 px-3 bg-surface-container-low rounded-lg font-body-md text-xs text-on-surface focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(sIdx)}
                    className="w-8 h-10 flex items-center justify-center text-outline hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSpecRow}
                className="w-full py-2.5 rounded-xl border border-dashed border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Adicionar especificação
              </button>
            </div>
          </section>

          {/* 6. Canal de Negociação WhatsApp */}
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold">
                WhatsApp para Contato
              </h2>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Número que receberá as mensagens diretas de compra
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high flex flex-col gap-2">
              <label className="font-label-md text-xs text-on-surface" htmlFor="sellerNumber">
                WhatsApp com DDD e DDI
              </label>
              <div className="flex items-center h-12 px-3 rounded-xl bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-outline mr-2 text-[20px]">
                  chat
                </span>
                <input
                  id="sellerNumber"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-transparent font-body-md text-sm text-on-surface focus:outline-none"
                />
              </div>
              <p className="font-body-sm text-[11px] text-outline">
                Um botão direto para o seu WhatsApp será gerado na página do item com a mensagem pronta.
              </p>
            </div>
          </section>

        </form>
      </main>

      {/* Modal de Link Externo de Vídeo */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-margin">
          <div className="bg-surface-container-lowest rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                Link do Vídeo
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Cole o link do YouTube Shorts, Reels ou vídeo demonstrativo do produto.
            </p>
            <input
              type="url"
              placeholder="https://youtube.com/shorts/..."
              value={tempVideoInput}
              onChange={(e) => setTempVideoInput(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl(tempVideoInput);
                  setShowVideoModal(false);
                  showToast('Vídeo vinculado com sucesso!');
                }}
                className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra Inferior Fixa de Ação */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-margin py-3 pb-safe">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={saveDraft}
            className="flex-1 h-12 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high active:scale-95 transition-all text-center"
          >
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="flex-[1.6] h-12 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold shadow-md hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">publish</span>
            Publicar no Bazar
          </button>
        </div>
      </div>
    </div>
  );
}
