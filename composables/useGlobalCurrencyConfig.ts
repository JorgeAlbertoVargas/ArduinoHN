import { useState } from '#imports'

export const useGlobalCurrencyConfig = () => {
  const exchangeRate = useState<number>('exchange-rate', () => 25)

  const fetchConfig = async () => {
    try {
      const res = await $fetch<any>('/api/config')
      if (res && res.exchangeRate) {
        exchangeRate.value = res.exchangeRate
      }
    } catch (e) {
      console.error('Error fetching app config', e)
    }
  }

  return {
    exchangeRate,
    fetchConfig
  }
}
