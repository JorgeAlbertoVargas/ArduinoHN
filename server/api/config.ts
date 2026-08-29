import { defineEventHandler } from 'h3'
import { getLoyaltyConfig } from '../utils/loyaltyStorage'

export default defineEventHandler(async () => {
  // Solo exponer configuraciones públicas
  const config = await getLoyaltyConfig()
  return {
    exchangeRate: config.exchangeRate || 25
  }
})
