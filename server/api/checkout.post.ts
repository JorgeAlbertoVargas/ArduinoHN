import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { cartItems } = body;

  if (!cartItems || !cartItems.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty' });
  }

  const domain = process.env.SHOPIFY_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!domain || !token) {
    throw createError({ statusCode: 500, statusMessage: 'Shopify Admin credentials missing' });
  }

  // Construir las líneas del draft order
  const lineItems = cartItems.map((item: any) => {
    // Si item.id tiene formato gid://, extraer el ID numérico
    const variantId = item.id.includes('gid://') ? item.id.split('/').pop() : item.id;
    
    return {
      variant_id: parseInt(variantId),
      quantity: item.quantity
    };
  });

  try {
    // Crear el Draft Order via REST API
    const response = await fetch(`https://${domain}/admin/api/2024-01/draft_orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        draft_order: {
          line_items: lineItems,
          use_customer_default_address: false
        }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Error creating Draft Order:', data.errors);
      throw createError({ statusCode: 400, statusMessage: 'Error creando Draft Order' });
    }

    return {
      success: true,
      checkoutUrl: data.draft_order.invoice_url
    };

  } catch (error) {
    console.error('Draft Order Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
