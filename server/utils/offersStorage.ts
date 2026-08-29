import { useRuntimeConfig } from '#imports'
import { fetchNocoDB } from './nocodb'

export interface OfferData {
  [productId: string]: {
    discount: number
  }
}

export const getOffers = async (): Promise<OfferData> => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbOffersTable, '?limit=1000')
    const offers: OfferData = {}
    if (response && response.list) {
      response.list.forEach((row: any) => {
        if (row.product_id && row.discount) {
          offers[row.product_id] = { discount: Number(row.discount) }
        }
      })
    }
    return offers
  } catch (error) {
    console.error('Error reading offers from NocoDB:', error)
    return {}
  }
}

export const saveOffers = async (data: OfferData): Promise<boolean> => {
  const config = useRuntimeConfig()
  try {
    // Para simplificar, obtenemos todas las ofertas existentes y las eliminamos, luego insertamos las nuevas.
    // Opcionalmente, NocoDB v2 permite inserciones/actualizaciones por lotes, pero vaciar e insertar es más fácil para un JSON simple.
    const existing: any = await fetchNocoDB(config.public.nocodbOffersTable, '?limit=1000')
    if (existing && existing.list) {
      for (const row of existing.list) {
        await fetchNocoDB(config.public.nocodbOffersTable, '', {
          method: 'DELETE',
          body: { id: row.id || row.Id } // NocoDB v2 delete format
        })
      }
    }

    // Insertar nuevas ofertas
    for (const [productId, offer] of Object.entries(data)) {
      if (offer.discount > 0) {
        await fetchNocoDB(config.public.nocodbOffersTable, '', {
          method: 'POST',
          body: {
            product_id: productId,
            discount: offer.discount
          }
        })
      }
    }
    return true
  } catch (error) {
    console.error('Error saving offers to NocoDB:', error)
    return false
  }
}

