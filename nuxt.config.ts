// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: '.',
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/seo'
  ],
  site: {
    url: 'https://arduino.hn/',
    name: 'ArduinoHN',
    description: 'Componentes Electrónicos, Robótica y Proyectos Arduino en Honduras.',
    defaultLocale: 'es'
  },
  ogImage: {
    enabled: false
  },
  runtimeConfig: {
    digikeyClientId: process.env.DIGIKEY_CLIENT_ID || 'Aqn5k5kVQRib3UPCJNrAFZaVOVnMSbYOdfYuCk7Dbwd8XdUi',
    digikeyClientSecret: process.env.DIGIKEY_CLIENT_SECRET || '0LOok4SKB7gFWCLh4V3tAQU798GyS6BqSubshJquGAmJ6xtYjAMNOAhpewFWauMN',
    digikeyLocaleSite: process.env.DIGIKEY_LOCALE_SITE || 'US',
    digikeyLocaleLanguage: process.env.DIGIKEY_LOCALE_LANGUAGE || 'es',
    digikeyLocaleCurrency: process.env.DIGIKEY_LOCALE_CURRENCY || 'USD',
    digikeyProfitMargin: Number(process.env.DIGIKEY_PROFIT_MARGIN || 2.00),
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN || 'arduinohn.myshopify.com',
      shopifyToken: process.env.SHOPIFY_STOREFRONT_TOKEN || 'mock_storefront_token_12345',
      nocodbUrl: process.env.NOCODB_URL || 'https://ianocodb.syteccorpia.com/',
      nocodbToken: process.env.NOCODB_TOKEN || 'nc_pat_cTQfsJmbeIoKknRricm6Ch6iLXzcwGt3XlLBRVNh',
      nocodbProjectsTable: process.env.NOCODB_PROJECTS_TABLE || 'movjxf98fu72rx8',
      nocodbOrdersTable: process.env.NOCODB_ORDERS_TABLE || 'moet2c7py49b1cc',
      nocodbOrderItemsTable: process.env.NOCODB_ORDER_ITEMS_TABLE || 'm0dqnot1yjfu8za',
      nocodbProductosTable: process.env.NOCODB_PRODUCTOS_TABLE || 'mgl2cerr4iret4q',
      nocodbUsersTable: process.env.NOCODB_USERS_TABLE || 'mtkdrz1ip3343wb',
      nocodbOffersTable: process.env.NOCODB_OFFERS_TABLE || 'mf2layzwcm11nbo',
      nocodbLoyaltyTransactionsTable: process.env.NOCODB_LOYALTY_TRANSACTIONS_TABLE || 'ms78meprrhlatdg',
      nocodbLoyaltyConfigTable: process.env.NOCODB_LOYALTY_CONFIG_TABLE || 'ma7p4masktlwxaa',
      nocodbProductMatrixTable: process.env.NOCODB_PRODUCT_MATRIX_TABLE || 'm_product_evaluations',
      nocodbFiscalTable: process.env.NOCODB_FISCAL_TABLE || 'm_fiscal_sar_config'
    }
  },
  nitro: {
    preset: 'cloudflare',
    prerender: {
      failOnError: false
    }
  }
})
