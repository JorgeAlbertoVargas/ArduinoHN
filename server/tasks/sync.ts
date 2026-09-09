import { syncOdooToShopify } from '../utils/syncOdooToShopify';

export default defineTask({
  meta: {
    name: 'sync',
    description: 'Sync Odoo products to Shopify periodically'
  },
  async run({ payload, context }) {
    console.log('[Cron] Ejecutando sincronización en segundo plano (Nitro Task)...');
    try {
      await syncOdooToShopify();
      console.log('[Cron] Sincronización completada con éxito.');
      return { result: 'success' };
    } catch (error) {
      console.error('[Cron] Error en la sincronización:', error);
      return { result: 'error', error };
    }
  }
});
