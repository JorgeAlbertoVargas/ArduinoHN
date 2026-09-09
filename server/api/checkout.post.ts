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
  const lineItems = [];

  for (const item of cartItems) {
    let variantId = item.id;

    if (item.id.includes('gid://')) {
      variantId = item.id.split('/').pop();
    } else if (item.id.startsWith('odoo-') || item.id.startsWith('local-')) {
      // Necesitamos buscar el ID real de Shopify por SKU
      // Si no tenemos SKU en el payload, intentamos usar el ODOO-ID como fallback
      const skuToSearch = item.sku || `ODOO-${item.id.replace('odoo-', '')}`;
      
      try {
        const searchRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
          },
          body: JSON.stringify({
            query: `
              query productBySku($query: String!) {
                products(first: 1, query: $query) {
                  edges {
                    node {
                      variants(first: 1) {
                        edges {
                          node {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: { query: `sku:${skuToSearch}` }
          })
        });
        
        const searchData = await searchRes.json();
        const existingVariant = searchData?.data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node?.id;
        
        if (existingVariant) {
          variantId = existingVariant.split('/').pop();
        } else {
          console.warn(`[Checkout] Producto Odoo no encontrado en Shopify: ${skuToSearch}`);
          throw createError({ statusCode: 400, statusMessage: `El producto ${item.name} aún no está disponible para compra.` });
        }
      } catch (err) {
        console.error('[Checkout] Error buscando variante en Shopify:', err);
        throw createError({ statusCode: 500, statusMessage: 'Error interno conectando con el sistema de inventario.' });
      }
    }

    lineItems.push({
      variant_id: parseInt(variantId),
      quantity: item.quantity
    });
  }

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
