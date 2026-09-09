import dotenv from 'dotenv';
dotenv.config();

import xmlrpc from 'xmlrpc';

const getOdooConfig = () => {
  return {
    url: process.env.ODOO_URL || 'https://iaodoo.syteccorpia.com',
    db: process.env.ODOO_DB || '',
    username: process.env.ODOO_USERNAME || '',
    password: process.env.ODOO_PASSWORD || ''
  };
};

const createClient = (path) => {
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

const rpcCall = (client, method, params) => {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

async function testOdooConnection() {
  console.log('Testing Odoo connection...');
  const config = getOdooConfig();
  if (!config.db || !config.username || !config.password) {
    console.error('Missing Odoo credentials in .env');
    return;
  }
  
  try {
    const common = createClient('/xmlrpc/2/common');
    const uid = await rpcCall(common, 'authenticate', [
      config.db,
      config.username,
      config.password,
      {}
    ]);
    
    if (uid) {
      console.log('✅ Odoo Authentication successful! UID:', uid);
    } else {
      console.log('❌ Odoo Authentication failed. Check credentials.');
    }
  } catch (error) {
    console.error('❌ Odoo Error:', error);
  }
}

testOdooConnection();
