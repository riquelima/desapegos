/**
 * Serviço de Inteligência Artificial para Copywriting Comercial
 * Utiliza o modelo MiniMax-Text-01 com a chave configurada
 */

const API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || 'sk-cp-meaN0PHZdGi3-5gZffia9b6PyDIh27vyk54LwG6gw965dFLWoIHowFo19rTqoHdbxhaQezJlMMBgTEYhNni51sJnMWCcPHIKtCg4GRY-pGMmrXarNIxxGQA';
const API_URL = import.meta.env.VITE_MINIMAX_API_URL || 'https://api.minimax.io/v1/chat/completions';

export async function generateCommercialAd({
  userInput = '',
  title = '',
  category = '',
  price = '',
  condition = 'semi-new'
}) {
  const conditionMap = {
    'new': 'Novo na caixa / Lacrado',
    'semi-new': 'Seminovo / Estado impecável',
    'used': 'Com marcas leves de uso, 100% funcional'
  };

  const conditionText = conditionMap[condition] || 'Excelente estado';

  const systemPrompt = `Você é um copywriter de elite especializado em vendas de móveis, eletrônicos e objetos de alto padrão para bazares de desapego e mudança de residência.
Sua missão: Transformar as anotações ou rascunho do vendedor em um anúncio comercial atraente, persuasivo, transparente e muito agradável de ler.

Diretrizes obrigatórias:
1. Destaque os pontos fortes da peça, conforto, design e cuidados que o dono teve.
2. Mencione com elegância e naturalidade o motivo da venda (mudança de residência com otimização de espaço).
3. Transmita total transparência quanto ao estado real de conservação (${conditionText}).
4. Estruture o texto em 2 ou 3 parágrafos curtos e bem espaçados, perfeitos para leitura em tela de celular.
5. NÃO inclua saudações como "Aqui está o anúncio", NUNCA use aspas englobando todo o texto, e NUNCA adicione títulos como "Anúncio:".
6. Retorne ESTRITAMENTE o texto final pronto para ser publicado na página do produto.`;

  const userPrompt = `DADOS DO PRODUTO:
- Título: ${title || 'Item do bazar'}
- Categoria: ${category || 'Geral'}
- Condição: ${conditionText}
${price ? `- Valor do desapego: R$ ${price}` : ''}

TEXTO / ANOTAÇÕES DO VENDEDOR:
"${userInput || 'Item bem cuidado de uso pessoal, em ótimo estado, sendo vendido por motivo de mudança.'}"

Por favor, reescreva e aprimore este texto transformando-o no texto comercial final de venda.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro na resposta da API MiniMax:', errText);
      throw new Error(`Erro na API (${response.status})`);
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('Nenhum texto retornado pela IA');
    }

    // Remove eventuais aspas externas se houver
    return generatedText.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('Falha ao gerar anúncio com IA:', error);
    throw error;
  }
}
