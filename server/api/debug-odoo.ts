import { authenticateOdoo } from '../utils/odooApi';

export default defineEventHandler(async (event) => {
  try {
    const uid = await authenticateOdoo();
    return { 
      success: true, 
      message: 'Conexión exitosa a Odoo',
      uid: uid 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: 'Error al conectar con Odoo',
      error: error.message || String(error)
    };
  }
});
