import dotenv from 'dotenv';
dotenv.config();

const url = process.env.ODOO_URL || 'https://iaodoo.syteccorpia.com';
const db = process.env.ODOO_DB;
const user = process.env.ODOO_USERNAME;
const pass = process.env.ODOO_PASSWORD;

async function testJsonRpc() {
  console.log('Testing Odoo JSON-RPC...');
  
  try {
    const authRes = await fetch(`${url}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
            service: "common",
            method: "authenticate",
            args: [db, user, pass, {}]
        },
        id: 1
      })
    });
    
    const authData = await authRes.json();
    console.log('Auth response:', authData);
    
    if (authData.result) {
      const uid = authData.result;
      console.log('✅ Authenticated via JSON-RPC! UID:', uid);
      
      // Test search
      const searchRes = await fetch(`${url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
              service: "object",
              method: "execute_kw",
              args: [db, uid, pass, "res.partner", "search", [[["id", ">", 0]]]]
          },
          id: 2
        })
      });
      const searchData = await searchRes.json();
      console.log('Search response:', searchData.result ? `Found ${searchData.result.length} partners` : searchData);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testJsonRpc();
