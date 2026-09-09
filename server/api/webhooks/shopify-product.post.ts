import { syncProductToOdoo } from '../../utils/odooApi';

export default defineEventHandler(async (event) => {
  try {
    if (event.method !== 'POST') {
      return createError({ statusCode: 405, message: 'Method Not Allowed' });
    }

    const payload = await readBody(event);
    
    if (!payload || !payload.id) {
      return createError({ statusCode: 400, message: 'Invalid product payload' });
    }

    console.log(`[Webhook Shopify Product] Recibido producto ID: ${payload.id}, Título: ${payload.title}`);

    // Extraer datos del producto de Shopify
    const title = payload.title || '';
    const description = payload.body_html || '';
    
    // Shopify webhook manda variantes, usamos la primera para SKU, precio, y barcode
    const firstVariant = payload.variants && payload.variants.length > 0 ? payload.variants[0] : null;
    
    if (!firstVariant) {
      console.log(`[Webhook Shopify Product] El producto ${payload.id} no tiene variantes, omitiendo sync a Odoo.`);
      return { success: true, message: 'No variants found' };
    }

    const sku = firstVariant.sku;
    if (!sku) {
      console.log(`[Webhook Shopify Product] El producto ${payload.id} no tiene SKU, omitiendo sync a Odoo.`);
      return { success: true, message: 'No SKU found' };
    }

    const price = parseFloat(firstVariant.price || '0');
    // Para el costo, muchas veces en Shopify no viene en el payload estándar del webhook de productos, pero si está mapeado se usa.
    // Odoo lo actualizará solo si le mandamos el valor, así que omitimos si no lo tenemos.
    const barcode = firstVariant.barcode || '';

    // Sincronizar esperando la respuesta (necesario en Cloudflare para no cortar la conexión)
    try {
      console.log(`[Webhook Shopify Product] Sincronizando producto ${sku} hacia Odoo...`);
      await syncProductToOdoo({
        title,
        sku,
        price,
        description,
        barcode
      });
      console.log(`[Webhook Shopify Product] Producto ${sku} sincronizado exitosamente en Odoo.`);
    } catch (err) {
      console.error(`[Webhook Shopify Product] Error sincronizando producto hacia Odoo:`, err);
    }

    return { success: true, message: 'Product webhook processed' };
  } catch (error: any) {
    console.error('[Webhook Shopify Product] Error procesando el webhook:', error);
    return createError({ statusCode: 500, message: 'Internal Server Error' });
  }
});
