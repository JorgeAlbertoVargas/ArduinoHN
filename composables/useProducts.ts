import { computed } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#imports'
import { shopifyFetch } from '~/utils/shopify'

export const useProducts = () => {
  const config = useRuntimeConfig()

  // --- Fetch Shopify Products ---
  const shopifyQuery = `
    query getProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges { node { url } }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `

  const { data: shopifyData, pending: pendingShopify, error: errorShopify } = useAsyncData('shopifyProducts', () => shopifyFetch({ query: shopifyQuery }))

  const formattedShopifyProducts = computed(() => {
    if (!shopifyData.value?.data?.products?.edges) return []
    return shopifyData.value.data.products.edges.map((edge: any) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node
      const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
      return {
        id: variant?.id || node.id,
        productId: node.id,
        title: node.title,
        price: parseFloat(variant?.price?.amount || '0'),
        image: node.images.edges[0]?.node?.url || fallbackImage,
        description: node.description,
        videoUrl: node.videoUrl || null,
        source: 'shopify'
      }
    })
  })

  // --- Fetch NocoDB Local Products ---
  const fetchLocalProducts = async () => {
    const url = `${config.public.nocodbUrl}api/v2/tables/${config.public.nocodbProductosTable}/records?limit=100`
    try {
      const res = await $fetch<any>(url, {
        headers: { 'xc-token': config.public.nocodbToken }
      })
      return res.list || []
    } catch (err) {
      console.error('Error fetching NocoDB products', err)
      return []
    }
  }

  const { data: localData, pending: pendingLocal, error: errorLocal } = useAsyncData('localProducts', fetchLocalProducts)

  const formattedLocalProducts = computed(() => {
    if (!localData.value) return []
    return localData.value.map((item: any) => {
      const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
      return {
        id: `local-${item.Id}`,
        productId: item.Id,
        title: item.Nombre || 'Sin nombre',
        price: parseFloat(item.Precio_Venta || '0'),
        image: item.image_url || fallbackImage,
        description: item.descripcion || '',
        videoUrl: item.video_url || null,
        source: 'local'
      }
    })
  })

  const allProducts = computed(() => {
    return [...formattedLocalProducts.value, ...formattedShopifyProducts.value]
  })

  const pending = computed(() => pendingShopify.value || pendingLocal.value)
  const error = computed(() => errorShopify.value || errorLocal.value)

  return {
    allProducts,
    pending,
    error
  }
}
