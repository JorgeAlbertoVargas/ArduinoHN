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
    const url = `${config.public.nocodbUrl}api/v2/tables/${config.public.nocodbProductosTable}/records?limit=4`
    try {
      const res = await $fetch<any>(url, {
        headers: { 'xc-token': config.public.nocodbToken },
        timeout: 5000
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

  // --- Fetch Odoo Products ---
  const { data: odooData, pending: pendingOdoo, error: errorOdoo, refresh: refreshOdooData } = useAsyncData('odooProducts', () => $fetch('/api/odoo-products'))

  const formattedOdooProducts = computed(() => {
    if (!odooData.value?.success || !odooData.value?.products) return []
    
    // Filtramos basados en las Propiedades (checkbox "Mostrar en Web") o Notas Internas
    const publishedProducts = odooData.value.products.filter((item: any) => {
      // 1. Buscamos en las propiedades dinámicas (la casilla que creaste)
      if (item.product_properties && Array.isArray(item.product_properties)) {
        const mostrarEnWebProp = item.product_properties.find(
          (prop: any) => prop.string === 'Mostrar en Web'
        );
        if (mostrarEnWebProp) {
          return mostrarEnWebProp.value === true;
        }
      }

      // 2. Como método de respaldo, seguimos usando las Notas Internas
      if (!item.description) return false;
      const notes = item.description.toLowerCase();
      if (notes.includes('no publicar')) return false;
      if (notes.includes('publicar')) return true;
      
      return false;
    });

    return publishedProducts.map((item: any) => {
      const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
      let imageUrl = fallbackImage
      if (item.image_512 && typeof item.image_512 === 'string') {
        imageUrl = `data:image/jpeg;base64,${item.image_512}`
      }
      
      return {
        id: `odoo-${item.id}`,
        productId: item.id.toString(),
        title: item.name || 'Sin nombre',
        price: parseFloat(item.list_price || '0'),
        image: imageUrl,
        description: item.description_sale || '',
        videoUrl: null,
        source: 'odoo',
        sku: item.default_code,
        stock: item.qty_available
      }
    })
  })

  const allProducts = computed(() => {
    const testOpta = {
      id: 'local-test-opta',
      productId: 'test-opta',
      title: 'Arduino Opta WiFi',
      price: 9920.00, // Equivale a aprox. $400.00 USD (calculado a ~24.8 HNL)
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTed5LdpObUAvP14-1U6TQCHDTR5ZrOIojeJguDFp700g&s=10',
      description: 'Micro PLC Industrial con conectividad WiFi y Bluetooth, ideal para automatización industrial y robótica. Programable mediante diagramas de escalera.',
      videoUrl: null,
      source: 'local'
    }
    return [testOpta, ...formattedOdooProducts.value, ...formattedLocalProducts.value, ...formattedShopifyProducts.value]
  })

  const pending = computed(() => pendingShopify.value || pendingLocal.value || pendingOdoo.value)
  const error = computed(() => errorShopify.value || errorLocal.value || errorOdoo.value)

  // Función para forzar la actualización de los datos de Odoo
  const refreshOdoo = () => refreshOdooData()

  return {
    allProducts,
    pending,
    error,
    refreshOdoo
  }
}
