import { shopifyFetch } from '~/utils/shopify'

export const useShopify = () => {
  const getProducts = async (first = 10) => {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `
    
    try {
      const { data } = await shopifyFetch({ query, variables: { first } })
      if (!data || !data.products) {
        return []
      }
      return data.products.edges.map((edge: any) => edge.node)
    } catch (error) {
      console.error('Failed to get products', error)
      return []
    }
  }

  return {
    getProducts
  }
}
