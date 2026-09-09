import { defineEventHandler, readBody, createError } from 'h3';
import { syncDigikeyProductToShopify } from '../../utils/shopifyAdmin';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { partNumber, productData } = body;

  if (!partNumber && !productData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'partNumber o productData requerido'
    });
  }

  let finalProductData = productData;

  // Si no mandan la data, la obtenemos internamente
  if (!finalProductData && partNumber) {
    try {
      // Usamos el internal $fetch de Nuxt
      const response = await $fetch(`/api/digikey/part/${encodeURIComponent(partNumber)}`);
      finalProductData = (response as any).product;
    } catch (e) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al obtener detalles de DigiKey para sincronizar'
      });
    }
  }

  if (!finalProductData) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado'
    });
  }

  try {
    const priceHNL = body.priceHNL || (finalProductData.priceUSD * 25); // Fallback si no viene el precio

    const variantId = await syncDigikeyProductToShopify(finalProductData, priceHNL);
    
    return {
      success: true,
      variantId
    };
  } catch (error: any) {
    console.error('Error sincronizando con Shopify:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error sincronizando producto'
    });
  }
});
