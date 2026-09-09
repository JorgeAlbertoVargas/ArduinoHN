export default defineEventHandler(async (event) => {
  try {
    console.log('[Odoo Webhook] Notificación recibida desde Odoo. Iniciando sincronización...');
    
    // Ejecutar la sincronización
    // En Nuxt 3 / H3, pasamos la promesa sin await o usamos event.waitUntil si el entorno lo soporta
    syncOdooToShopify().catch(err => {
      console.error('[Odoo Webhook] Error en background sync:', err);
    });

    return { 
      success: true, 
      message: 'Sincronización disparada correctamente' 
    };
  } catch (error: any) {
    console.error('[Odoo Webhook] Error al procesar el webhook:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error processing webhook'
    });
  }
});
