// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: '.',
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN || 'arduinohn.myshopify.com',
      shopifyToken: process.env.SHOPIFY_STOREFRONT_TOKEN || 'mock_storefront_token_12345',
      nocodbUrl: process.env.NOCODB_URL || 'https://ianocodb.syteccorpia.com/',
      nocodbToken: process.env.NOCODB_TOKEN || 'nc_pat_cTQfsJmbeIoKknRricm6Ch6iLXzcwGt3XlLBRVNh',
      nocodbProjectsTable: process.env.NOCODB_PROJECTS_TABLE || 'movjxf98fu72rx8',
      nocodbOrdersTable: process.env.NOCODB_ORDERS_TABLE || 'moet2c7py49b1cc',
      nocodbOrderItemsTable: process.env.NOCODB_ORDER_ITEMS_TABLE || 'm0dqnot1yjfu8za',
      nocodbProductosTable: process.env.NOCODB_PRODUCTOS_TABLE || 'mgl2cerr4iret4q'
    }
  },
  nitro: {
    prerender: {
      failOnError: false
    }
  }
})
