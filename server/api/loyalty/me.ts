import { defineEventHandler, createError } from 'h3'
import { getUserLoyalty, getLoyaltyConfig } from '../../utils/loyaltyStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = (user as any).id
  const loyaltyData = await getUserLoyalty(userId)
  const config = await getLoyaltyConfig()
  
  let currentTier = 'Bronze'
  if (config.enableTiers) {
    if (loyaltyData.historicalSpent >= config.tiers.goldThreshold) {
      currentTier = 'Gold'
    } else if (loyaltyData.historicalSpent >= config.tiers.silverThreshold) {
      currentTier = 'Silver'
    }
  }

  return {
    points: loyaltyData.points,
    historicalSpent: loyaltyData.historicalSpent,
    currentTier,
    config: {
      earnRate: config.earnRate,
      redemptionValue: config.redemptionValue,
      enableTiers: config.enableTiers
    }
  }
})
