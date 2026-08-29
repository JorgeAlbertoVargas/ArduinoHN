import { useState } from '#imports'

export const useGlobalCurrencyConfig = () => {
  const exchangeRate = useState<number>('exchange-rate', () => 25)
  const isvPercent = useState<number>('isv-percent', () => 15)
  const cai = useState<string>('cai-string', () => '')

  const fetchConfig = async () => {
    try {
      const res = await $fetch<any>('/api/config')
      if (res) {
        if (res.exchangeRate) exchangeRate.value = res.exchangeRate
        if (res.isvPercent !== undefined) isvPercent.value = res.isvPercent
        if (res.cai !== undefined) cai.value = res.cai
      }
    } catch (e) {
      console.error('Error fetching app config', e)
    }
  }

  return {
    exchangeRate,
    isvPercent,
    cai,
    fetchConfig
  }
}
