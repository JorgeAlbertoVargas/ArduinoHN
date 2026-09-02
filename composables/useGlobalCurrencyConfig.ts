import { useState } from '#imports'

export const useGlobalCurrencyConfig = () => {
  const exchangeRate = useState<number>('exchange-rate', () => 25)
  const userCurrency = useState<string>('user-currency', () => 'HNL')
  const userCountry = useState<string>('user-country', () => 'Honduras')
  const isvPercent = useState<number>('isv-percent', () => 15)
  const cai = useState<string>('cai-string', () => '')

  const fetchConfig = async () => {
    try {
      // 1. Intentar obtener la configuración local de NocoDB/BD
      const res = await $fetch<any>('/api/config').catch(() => null)
      if (res) {
        // Fallback exchange rate
        if (res.exchangeRate && !exchangeRate.value) exchangeRate.value = res.exchangeRate
        if (res.isvPercent !== undefined) isvPercent.value = res.isvPercent
        if (res.cai !== undefined) cai.value = res.cai
      }

      // 2. Detectar ubicación y moneda dinámicamente si estamos en el cliente
      if (import.meta.client) {
        try {
          const geoRes = await $fetch<any>('https://ipapi.co/json/')
          if (geoRes && geoRes.currency && geoRes.country_name) {
            userCurrency.value = geoRes.currency
            userCountry.value = geoRes.country_name

            // 3. Obtener la tasa de cambio real desde USD a la moneda local
            const rateRes = await $fetch<any>('https://open.er-api.com/v6/latest/USD')
            if (rateRes && rateRes.rates && rateRes.rates[geoRes.currency]) {
              exchangeRate.value = rateRes.rates[geoRes.currency]
            }
          }
        } catch (geoError) {
          console.error('Error fetching geolocation or exchange rates', geoError)
        }
      }
    } catch (e) {
      console.error('Error fetching app config', e)
    }
  }

  return {
    exchangeRate,
    userCurrency,
    userCountry,
    isvPercent,
    cai,
    fetchConfig
  }
}
