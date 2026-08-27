// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: '.',
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      nocodbUrl: process.env.NOCODB_URL,
      nocodbToken: process.env.NOCODB_TOKEN,
      nocodbProjectsTable: process.env.NOCODB_PROJECTS_TABLE,
      nocodbOrdersTable: process.env.NOCODB_ORDERS_TABLE,
      nocodbOrderItemsTable: process.env.NOCODB_ORDER_ITEMS_TABLE,
      nocodbProductosTable: process.env.NOCODB_PRODUCTOS_TABLE
    }
  },
  nitro: {
    prerender: {
      failOnError: false
    }
  }
})
