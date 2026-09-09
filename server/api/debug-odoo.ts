import { authenticateOdoo } from '../utils/odooApi';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    const uid = await authenticateOdoo();
    return { 
      success: true, 
      message: 'Conexión exitosa a Odoo',
      uid: uid,
      configDump: {
        odooUrl: !!config.odooUrl,
        odooDb: !!config.odooDb,
        odooUsername: !!config.odooUsername,
        odooPassword: !!config.odooPassword
      }
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: 'Error al conectar con Odoo',
      error: error.message || String(error),
      debug: {
        envKeys: Object.keys(process.env).filter(k => k.includes('ODOO')),
        configDump: {
          odooUrl: config.odooUrl,
          odooDb: config.odooDb ? 'SET' : 'EMPTY',
          odooUsername: config.odooUsername ? 'SET' : 'EMPTY',
          odooPassword: config.odooPassword ? 'SET' : 'EMPTY'
        }
      }
    };
  }
});
