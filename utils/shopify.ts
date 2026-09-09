export const shopifyFetch = async ({ query, variables }: { query: string; variables?: any }) => {
  const config = useRuntimeConfig()
  
  const domain = config.public.shopifyDomain
  const token = config.public.shopifyToken
  const apiVersion = '2024-01'
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`

  try {
    const response = await $fetch<any>(endpoint, {
      method: 'POST',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: {
        query,
        variables,
      },
    })
    
    return response
  } catch (error) {
    console.error('Error fetching from Shopify:', error)
    throw error
  }
}
