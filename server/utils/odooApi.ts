import xmlrpc from 'xmlrpc';

const getOdooConfig = () => {
  return {
    url: process.env.ODOO_URL || 'https://iaodoo.syteccorpia.com',
    db: process.env.ODOO_DB || '',
    username: process.env.ODOO_USERNAME || '',
    password: process.env.ODOO_PASSWORD || ''
  };
};

// Helper to create a client
const createClient = (path: string) => {
  const config = getOdooConfig();
  const urlObj = new URL(config.url);
  const clientOptions = {
    host: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: path
  };
  
  if (urlObj.protocol === 'https:') {
    return xmlrpc.createSecureClient(clientOptions);
  }
  return xmlrpc.createClient(clientOptions);
};

// Promisify xmlrpc call
const rpcCall = (client: any, method: string, params: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error: any, value: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

export async function authenticateOdoo() {
  const config = getOdooConfig();
  if (!config.db || !config.username || !config.password) {
    throw new Error('Odoo credentials are not fully configured in environment variables');
  }
  
  const common = createClient('/xmlrpc/2/common');
  const uid = await rpcCall(common, 'authenticate', [
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
  const models = createClient('/xmlrpc/2/object');
  
  // 1. Check if product exists
  const searchParams = [
    config.db,
    uid,
    config.password,
    'product.template',
    'search',
    [[['default_code', '=', productData.sku]]]
  ];
  
  const existingIds = await rpcCall(models, 'execute_kw', searchParams);
  
  const odooProductData: any = {
    name: productData.title,
    list_price: productData.price,
    type: 'consu', // Or 'product' depending on inventory valuation
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
    await rpcCall(models, 'execute_kw', [
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
    // We also need to set default_code for creation
    odooProductData.default_code = productData.sku;
    const newId = await rpcCall(models, 'execute_kw', [
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
  const models = createClient('/xmlrpc/2/object');
  
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
  
  const existingIds = await rpcCall(models, 'execute_kw', searchParams);
  
  const odooPartnerData: any = {
    name: customerData.name,
    email: customerData.email,
  };
  
  if (customerData.phone) {
    odooPartnerData.phone = customerData.phone;
  }

  if (existingIds && existingIds.length > 0) {
    await rpcCall(models, 'execute_kw', [
      config.db, uid, config.password, 'res.partner', 'write',
      [existingIds, odooPartnerData]
    ]);
    console.log(`[Odoo] Updated customer ${customerData.email}`);
    return existingIds[0];
  } else {
    const newId = await rpcCall(models, 'execute_kw', [
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
  const models = createClient('/xmlrpc/2/object');
  
  // Create the Sale Order first
  const orderId = await rpcCall(models, 'execute_kw', [
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
      const prodIds = await rpcCall(models, 'execute_kw', [
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
      // Si Odoo requiere product_id y no lo encontramos, deberíamos crearlo al vuelo o usar un genérico.
      // Aquí intentaremos buscar o crear un genérico, o dejar que Odoo lo rechace si es mandatorio.
      // (En muchas versiones de Odoo product_id es obligatorio en sale.order.line)
      console.warn(`[Odoo] Producto con SKU ${item.sku} no encontrado en Odoo, enviando linea sin product_id.`);
    }

    await rpcCall(models, 'execute_kw', [
      config.db, uid, config.password, 'sale.order.line', 'create',
      [lineData]
    ]);
  }
  
  return orderId;
}
