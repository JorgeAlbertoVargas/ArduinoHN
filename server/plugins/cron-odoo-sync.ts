import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import { syncOdooCatalog } from '../utils/syncOdooToShopify'

export default defineNitroPlugin((nitroApp) => {
  console.log('[Nitro Plugin] Registrando Cron Job de Sincronización Odoo -> Shopify');

  // Solo ejecutar el cron job si estamos en producción o si se requiere
  // Para pruebas, lo dejamos activo. En un ambiente real, se recomienda usar un manejador de tareas o validar la variable de entorno.
  
  // Ejecutar inmediatamente al inicio (opcional)
  // setTimeout(() => {
  //   syncOdooCatalog().catch(err => console.error(err));
  // }, 10000); // 10 segundos despues de arrancar

  // Ejecutar cada 5 minutos (300,000 ms)
  setInterval(() => {
    syncOdooCatalog().catch(err => console.error('[Cron] Error en sincronización Odoo:', err));
  }, 5 * 60 * 1000);
});
