import { defineEventHandler } from 'h3'
import { syncOdooCatalog } from '../utils/syncOdooToShopify'

export default defineEventHandler(async (event) => {
  try {
    await syncOdooCatalog();
    return { success: true, message: 'Sincronización Odoo -> Shopify finalizada.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
})
