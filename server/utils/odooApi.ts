const getOdooConfig = () => {
  let config;
  try {
    config = useRuntimeConfig();
  } catch (e) {
    config = {
      odooUrl: process.env.NUXT_ODOO_URL,
      odooDb: process.env.NUXT_ODOO_DB,
      odooUsername: process.env.NUXT_ODOO_USERNAME,
      odooPassword: process.env.NUXT_ODOO_PASSWORD
    };
  }

  return {
    url: config.odooUrl || 'https://iaodoo.syteccorpia.com',
    db: config.odooDb || '',
    username: config.odooUsername || '',
    password: config.odooPassword || ''
  };
};

// Reemplazamos xmlrpc por fetch nativo apuntando a /jsonrpc
const rpcCall = async (service: string, method: string, args: any[]) => {
  const config = getOdooConfig();
  
  const response = await fetch(`${config.url}/jsonrpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: service,
        method: method,
        args: args
      },
      id: Math.floor(Math.random() * 1000000)
    })
  });

  if (!response.ok) {
    throw new Error(`Odoo API HTTP error: ${response.status}`);
  }

  const data: any = await response.json();
  
  if (data.error) {
    throw new Error(`Odoo RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result;
};

export async function authenticateOdoo() {
  const config = getOdooConfig();
  if (!config.db || !config.username || !config.password) {
    throw new Error('Odoo credentials are not fully configured in environment variables');
  }
  
  const uid = await rpcCall('common', 'authenticate', [
    config.db,
    config.username,
    config.password,
    {}
  ]);
  
  if (!uid) {
    throw new Error('Odoo Authentication failed');
  }
  
  return uid;
}

export async function syncProductToOdoo(productData: {
  title: string;
  sku: string;
  price: number;
  cost?: number;
  description?: string;
  barcode?: string;
  qty?: number;
}) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  // 1. Check if product exists
  const searchParams = [
    config.db,
    uid,
    config.password,
    'product.template',
    'search',
    [[['default_code', '=', productData.sku]]]
  ];
  
  const existingIds = await rpcCall('object', 'execute_kw', searchParams);
  
  const odooProductData: any = {
    name: productData.title,
    list_price: productData.price,
    type: 'consu', // En Odoo 19 el tipo es 'consu' (Goods)
    is_storable: true, // Esta bandera es la que activa el inventario en Odoo 19+
  };
  
  if (productData.cost !== undefined) {
    odooProductData.standard_price = productData.cost;
  }
  if (productData.description) {
    odooProductData.description_sale = productData.description;
  }
  if (productData.barcode) {
    odooProductData.barcode = productData.barcode;
  }

  let templateId = null;

  if (existingIds && existingIds.length > 0) {
    templateId = existingIds[0];
    await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'product.template', 'write',
      [templateId, odooProductData]
    ]);
    console.log(`[Odoo] Updated product ${productData.sku}`);
  } else {
    odooProductData.default_code = productData.sku;
    templateId = await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'product.template', 'create',
      [odooProductData]
    ]);
    console.log(`[Odoo] Created new product ${productData.sku}`);
  }

  // 2. Sincronizar Inventario si viene especificado
  if (productData.qty !== undefined && templateId) {
    try {
      // Necesitamos el ID de la variante (product.product) asociada a este template
      const productIds = await rpcCall('object', 'execute_kw', [
        config.db, uid, config.password, 'product.product', 'search',
        [[['product_tmpl_id', '=', templateId]]]
      ]);
      
      if (productIds && productIds.length > 0) {
        const productId = productIds[0];
        
        // Buscar la ubicación de stock principal por defecto (tipo interna)
        const locationIds = await rpcCall('object', 'execute_kw', [
          config.db, uid, config.password, 'stock.location', 'search',
          [[['usage', '=', 'internal']]]
        ]);
        
        if (locationIds && locationIds.length > 0) {
          const locationId = locationIds[0];
          
          // Crear un ajuste de inventario (stock.quant)
          const quantId = await rpcCall('object', 'execute_kw', [
            config.db, uid, config.password, 'stock.quant', 'create',
            [{
              product_id: productId,
              location_id: locationId,
              inventory_quantity: productData.qty
            }]
          ]);
          
          // Aplicar el ajuste
          await rpcCall('object', 'execute_kw', [
            config.db, uid, config.password, 'stock.quant', 'action_apply_inventory',
            [[quantId]]
          ]);
          
          console.log(`[Odoo] Inventario ajustado a ${productData.qty} para el SKU ${productData.sku}`);
        }
      }
    } catch (stockErr) {
      console.error(`[Odoo] Error ajustando inventario para ${productData.sku}:`, stockErr);
    }
  }

  return templateId;
}

export async function syncCustomerToOdoo(customerData: {
  name: string;
  email: string;
  phone?: string;
}) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  if (!customerData.email) {
    throw new Error('Customer email is required to sync to Odoo');
  }

  const searchParams = [
    config.db,
    uid,
    config.password,
    'res.partner',
    'search',
    [[['email', '=', customerData.email]]]
  ];
  
  const existingIds = await rpcCall('object', 'execute_kw', searchParams);
  
  const odooPartnerData: any = {
    name: customerData.name,
    email: customerData.email,
  };
  
  if (customerData.phone) {
    odooPartnerData.phone = customerData.phone;
  }

  if (existingIds && existingIds.length > 0) {
    await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'res.partner', 'write',
      [existingIds, odooPartnerData]
    ]);
    console.log(`[Odoo] Updated customer ${customerData.email}`);
    return existingIds[0];
  } else {
    const newId = await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'res.partner', 'create',
      [odooPartnerData]
    ]);
    console.log(`[Odoo] Created new customer ${customerData.email}`);
    return newId;
  }
}

export async function createSaleOrderInOdoo(orderData: {
  partner_id: number;
  order_reference: string;
  line_items: Array<{
    title: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
}) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  // 1. Verificar si el pedido ya existe para evitar duplicados
  const existingOrderIds = await rpcCall('object', 'execute_kw', [
    config.db, uid, config.password, 'sale.order', 'search',
    [[['client_order_ref', '=', orderData.order_reference]]]
  ]);

  if (existingOrderIds && existingOrderIds.length > 0) {
    console.log(`[Odoo] Sale Order already exists for ref ${orderData.order_reference}. Skipping creation.`);
    return existingOrderIds[0];
  }

  // Create the Sale Order first
  const orderId = await rpcCall('object', 'execute_kw', [
    config.db, uid, config.password, 'sale.order', 'create',
    [{
      partner_id: orderData.partner_id,
      client_order_ref: orderData.order_reference,
    }]
  ]);
  
  console.log(`[Odoo] Created Sale Order ${orderId} for ref ${orderData.order_reference}`);

  // Create Sale Order Lines
  for (const item of orderData.line_items) {
    let product_id = false;
    
    // Attempt to find product by sku
    if (item.sku) {
      const prodIds = await rpcCall('object', 'execute_kw', [
        config.db, uid, config.password, 'product.product', 'search',
        [[['default_code', '=', item.sku]]]
      ]);
      if (prodIds && prodIds.length > 0) {
        product_id = prodIds[0];
      }
    }
    
    const lineData: any = {
      order_id: orderId,
      name: item.title || item.sku || 'Producto',
      product_uom_qty: item.quantity,
      price_unit: item.price,
    };
    
    if (product_id) {
      lineData.product_id = product_id;
    } else {
      console.warn(`[Odoo] Producto con SKU ${item.sku} no encontrado en Odoo, enviando linea sin product_id.`);
    }

    await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'sale.order.line', 'create',
      [lineData]
    ]);
  }
  
  return orderId;
}

export async function getProductsFromOdoo(limit = 50) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();

  try {
    const searchParams = [
      config.db,
      uid,
      config.password,
      'product.template',
      'search_read',
      [[['type', '=', 'consu']]], // Goods
      {
        fields: ['id', 'name', 'list_price', 'default_code', 'description_sale', 'qty_available', 'image_512', 'description', 'product_properties'],
        limit: limit
      }
    ];
    return await rpcCall('object', 'execute_kw', searchParams);
  } catch (error) {
    console.warn('[Odoo] Failed to fetch with qty_available, trying fallback without it.', error);
    // Fallback without qty_available which sometimes causes issues if stock module is not fully configured on templates
    const fallbackParams = [
      config.db,
      uid,
      config.password,
      'product.template',
      'search_read',
      [[['type', '=', 'consu']]],
      {
        fields: ['id', 'name', 'list_price', 'default_code', 'description_sale', 'image_512', 'description', 'product_properties'],
        limit: limit
      }
    ];
    return await rpcCall('object', 'execute_kw', fallbackParams);
  }
}

// =======================================================================
// AUTOMATIZACIÓN DE FLUJO DE VENTAS (SHOPIFY -> ODOO)
// =======================================================================

export async function confirmSaleOrder(orderId: number) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  try {
    await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'sale.order', 'action_confirm',
      [[orderId]]
    ]);
    console.log(`[Odoo] Confirmed Sale Order ${orderId}`);
    return true;
  } catch (e) {
    console.error(`[Odoo] Error confirming Sale Order ${orderId}:`, e);
    return false;
  }
}

export async function validateDeliveryForSaleOrder(orderId: number) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  try {
    // 1. Encontrar los pickings (entregas) vinculados a la orden
    const pickingIds = await rpcCall('object', 'execute_kw', [
      config.db, uid, config.password, 'stock.picking', 'search',
      [[['sale_id', '=', orderId], ['state', 'not in', ['done', 'cancel']]]]
    ]);
    
    if (!pickingIds || pickingIds.length === 0) {
      console.log(`[Odoo] No pending deliveries found for Sale Order ${orderId}`);
      return false;
    }
    
    for (const pickingId of pickingIds) {
      // 2. Validar el picking
      const result = await rpcCall('object', 'execute_kw', [
        config.db, uid, config.password, 'stock.picking', 'button_validate',
        [[pickingId]]
      ]);
      
      // Si Odoo devuelve un wizard para transferencia inmediata
      if (result && typeof result === 'object' && result.res_model === 'stock.immediate.transfer') {
        const wizardId = await rpcCall('object', 'execute_kw', [
          config.db, uid, config.password, 'stock.immediate.transfer', 'create',
          [{ pick_ids: [[6, 0, [pickingId]]] }]
        ]);
        
        await rpcCall('object', 'execute_kw', [
          config.db, uid, config.password, 'stock.immediate.transfer', 'process',
          [[wizardId]]
        ]);
        console.log(`[Odoo] Processed Immediate Transfer for delivery ${pickingId}`);
      } else if (result && typeof result === 'object' && result.res_model === 'stock.backorder.confirmation') {
         // Si falta stock y Odoo pregunta por Backorder, lo rechazamos para forzar la validación de lo disponible
         // O bien lo validamos creando backorder. Por ahora asumiremos que se entrega lo que hay
         console.warn(`[Odoo] Backorder wizard returned for picking ${pickingId}. Manual intervention might be required.`);
      } else {
        console.log(`[Odoo] Validated delivery ${pickingId} for Sale Order ${orderId}`);
      }
    }
    return true;
  } catch (e) {
    console.error(`[Odoo] Error validating delivery for Sale Order ${orderId}:`, e);
    return false;
  }
}

export async function createInvoiceForSaleOrder(orderId: number) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  try {
     const invoiceIds = await rpcCall('object', 'execute_kw', [
        config.db, uid, config.password, 'sale.order', '_create_invoices',
        [[orderId], { final: true }]
     ]);
     
     if (invoiceIds && invoiceIds.length > 0) {
        console.log(`[Odoo] Created Draft Invoice ${invoiceIds[0]} for Sale Order ${orderId}`);
        return invoiceIds[0];
     }
  } catch (e) {
     console.error(`[Odoo] Error creating invoice for Sale Order ${orderId}:`, e);
  }
  return null;
}

export async function postInvoice(invoiceId: number) {
  const config = getOdooConfig();
  const uid = await authenticateOdoo();
  
  try {
     await rpcCall('object', 'execute_kw', [
        config.db, uid, config.password, 'account.move', 'action_post',
        [[invoiceId]]
     ]);
     console.log(`[Odoo] Posted (Confirmed) Invoice ${invoiceId}`);
     return true;
  } catch (e) {
     console.error(`[Odoo] Error posting invoice ${invoiceId}:`, e);
     return false;
  }
}
