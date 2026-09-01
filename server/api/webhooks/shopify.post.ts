export default defineEventHandler(async (event) => {
  try {
    // 1. Validar que la petición sea POST
    if (event.method !== 'POST') {
      return createError({ statusCode: 405, message: 'Method Not Allowed' });
    }

    // Opcional: Aquí iría la lógica para validar el HMAC de Shopify (x-shopify-hmac-sha256)
    // para asegurar que el webhook realmente viene de tu tienda.
    // const hmac = getHeader(event, 'x-shopify-hmac-sha256');

    // 2. Leer el cuerpo de la orden
    const order = await readBody(event);
    
    if (!order || !order.id) {
      return createError({ statusCode: 400, message: 'Invalid order payload' });
    }

    console.log(`[Webhook Shopify] Recibida nueva orden ID: ${order.id}`);

    const lineItems = order.line_items || [];

    // Guardar en NocoDB
    const config = useRuntimeConfig();
    const nocodbUrl = config.public.nocodbUrl?.replace(/\/$/, '');
    const nocodbToken = config.public.nocodbToken;
    const nocodbOrdersTable = config.public.nocodbOrdersTable;
    const nocodbOrderItemsTable = config.public.nocodbOrderItemsTable;

    if (nocodbUrl && nocodbToken && nocodbOrdersTable) {
      try {
        console.log(`[Webhook Shopify] Guardando orden en NocoDB...`);
        const totalAmount = order.total_price || (order.cost && order.cost.totalAmount && order.cost.totalAmount.amount) || '0.00';
        const itemsSummary = lineItems.map((i: any) => `${i.quantity}x ${i.title || i.name}`).join(', ');
        
        const orderRes = await $fetch<any>(`${nocodbUrl}/api/v2/tables/${nocodbOrdersTable}/records`, {
          method: 'POST',
          headers: {
            'xc-token': nocodbToken,
            'Content-Type': 'application/json'
          },
          body: {
            order_id: String(order.id),
            total_amount: parseFloat(totalAmount),
            items_summary: itemsSummary || 'Sin items',
            status: 'Recibida'
          }
        });
        console.log('[Webhook Shopify] Orden guardada en NocoDB exitosamente.');
        
        // Guardar Order Items para cumplir con 1FN
        if (nocodbOrderItemsTable && orderRes && orderRes.Id) {
           console.log(`[Webhook Shopify] Guardando ${lineItems.length} items en Order_Items...`);
           for (const item of lineItems) {
             try {
                await $fetch(`${nocodbUrl}/api/v2/tables/${nocodbOrderItemsTable}/records`, {
                  method: 'POST',
                  headers: {
                    'xc-token': nocodbToken,
                    'Content-Type': 'application/json'
                  },
                  body: {
                    order_id: orderRes.Id,
                    quantity: parseInt(item.quantity || '1', 10),
                    price: parseFloat(item.price || '0.00')
                    // Aquí, idealmente también buscaríamos el ID del producto en la BD para insertarlo en producto_id
                  }
                });
             } catch (itemErr) {
                console.error('[Webhook Shopify] Error guardando item en NocoDB:', itemErr);
             }
           }
        }
      } catch (dbErr) {
        console.error('[Webhook Shopify] Error guardando en NocoDB:', dbErr);
      }
    } else {
      console.warn('[Webhook Shopify] Credenciales de NocoDB incompletas. No se guardará en BD.');
    }


    // Array para separar los items de DigiKey
    const digikeyItems = [];

    // 3. Analizar los SKUs para decidir a qué proveedor van
    for (const item of lineItems) {
      const sku = item.sku || '';
      
      // LOGICA DE ENRUTAMIENTO HÍBRIDO:
      // Shopify y su App de AutoDS se encargan automáticamente del fulfillment de productos de AutoDS.
      // Aquí, en ArduinoHN, solo interceptamos los SKUs de DigiKey (DK-) para rutearlos manualmente por API.
      if (sku.toUpperCase().startsWith('DK-') || sku.toUpperCase().includes('ARDUINO') || sku.toUpperCase().includes('SENSOR')) {
        digikeyItems.push(item);
      }
    }

    // 4. Procesar el envío a DigiKey
    if (digikeyItems.length > 0) {
      console.log(`[Webhook Shopify] Enviando ${digikeyItems.length} items a DigiKey API...`);
      // Llamada interna a nuestro handler de DigiKey
      try {
        await $fetch('/api/digikey/order', {
          method: 'POST',
          body: {
            orderId: order.id,
            shippingAddress: order.shipping_address,
            items: digikeyItems
          }
        });
        console.log('[Webhook Shopify] Orden enviada a DigiKey exitosamente.');
      } catch (err) {
        console.error('[Webhook Shopify] Error comunicando con DigiKey:', err);
      }
    }

    // Nota: No es necesario procesar AutoDS aquí. 
    // La App de AutoDS instalada en Shopify detectará los SKUs correspondientes y los procesará automáticamente.

    return { success: true, message: 'Order processed and routed correctly' };
  } catch (error: any) {
    console.error('[Webhook Shopify] Error procesando el webhook:', error);
    return createError({ statusCode: 500, message: 'Internal Server Error' });
  }
});
