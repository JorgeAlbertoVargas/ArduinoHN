const getOdooConfig = () => {
  const config = useRuntimeConfig();
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
    type: 'consu', 
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

  if (existingIds && existingIds.length > 0) {
    // Update existing
    await rpcCall('object', 'execute_kw', [
      config.db,
      uid,
      config.password,
      'product.template',
      'write',
      [existingIds, odooProductData]
    ]);
    console.log(`[Odoo] Updated product ${productData.sku}`);
    return existingIds[0];
  } else {
    // Create new
    odooProductData.default_code = productData.sku;
    const newId = await rpcCall('object', 'execute_kw', [
      config.db,
      uid,
      config.password,
      'product.template',
      'create',
      [odooProductData]
    ]);
    console.log(`[Odoo] Created new product ${productData.sku}`);
    return newId;
  }
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
