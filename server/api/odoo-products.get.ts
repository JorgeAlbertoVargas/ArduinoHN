import { getProductsFromOdoo } from '../utils/odooApi'

export default defineEventHandler(async (event) => {
  try {
    const products = await getProductsFromOdoo(50)
    return {
      success: true,
      products
    }
  } catch (error: any) {
    console.error('Error fetching Odoo products:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch products from Odoo'
    }
  }
})
