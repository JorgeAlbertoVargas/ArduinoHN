import dotenv from 'dotenv';
dotenv.config();

const url = process.env.ODOO_URL || 'https://iaodoo.syteccorpia.com';
const db = process.env.ODOO_DB;
const user = process.env.ODOO_USERNAME;
const pass = process.env.ODOO_PASSWORD;

const rpcCall = async (service, method, args) => {
  const response = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Math.floor(Math.random() * 1000)
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
};

async function testOdooField() {
  try {
    const uid = await rpcCall('common', 'authenticate', [db, user, pass, {}]);
    
    const fields = await rpcCall('object', 'execute_kw', [
      db, uid, pass, 'ir.model.fields', 'search_read',
      [[['model', '=', 'product.template'], ['name', 'in', ['is_storable', 'detailed_type']]]],
      { fields: ['name', 'selection'] }
    ]);
    
    console.log('Fields found:', fields);
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testOdooField();
