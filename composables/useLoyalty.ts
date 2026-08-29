import { useState } from '#imports'

export const useLoyalty = () => {
  const points = useState<number>('loyalty-points', () => 0)
  const historicalSpent = useState<number>('loyalty-historical', () => 0)
  const currentTier = useState<string>('loyalty-tier', () => 'Bronze')
  const config = useState<any>('loyalty-config', () => ({
    earnRate: 100,
    redemptionValue: 1,
    enableTiers: false
  }))
  
  const fetchLoyalty = async () => {
    try {
      const res = await $fetch<any>('/api/loyalty/me')
      if (res) {
        points.value = res.points || 0
        historicalSpent.value = res.historicalSpent || 0
        currentTier.value = res.currentTier || 'Bronze'
        config.value = res.config
      }
    } catch (e) {
      console.log('Error fetching loyalty, user might not be logged in', e)
    }
  }

  return {
    points,
    historicalSpent,
    currentTier,
    config,
    fetchLoyalty
  }
}
