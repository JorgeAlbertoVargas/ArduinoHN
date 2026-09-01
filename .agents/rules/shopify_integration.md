# ArduinoHN - Integración con Shopify y NocoDB

## Contexto del Proyecto
ArduinoHN es una plataforma construida en Nuxt.js/Vue que se integra con **Shopify** (como CMS/Backend de eCommerce) y **NocoDB** (como base de datos central de operaciones).

## Arquitectura de la Integración

### 1. Frontend (Catálogo y Carrito)
- Se utiliza la **Storefront API (GraphQL)** de Shopify.
- El archivo principal para las llamadas a la API es `utils/shopify.ts`.
- Los composables `useProducts.ts` y `useCart.ts` consumen esta API para mostrar productos y manejar el carrito de compras del usuario.
- **Modo Simulación:** Si las variables de entorno de Shopify (`SHOPIFY_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`) no están configuradas correctamente o apuntan al dominio por defecto (`arduinohn.myshopify.com`), `utils/shopify.ts` devolverá datos simulados localmente para facilitar el desarrollo (Mockups de ESP32, Arduino, etc.).

### 2. Backend (Órdenes y Webhooks)
- El flujo de Checkout se delega a Shopify.
- Una vez completada una orden en Shopify, se dispara un **Webhook** hacia nuestro endpoint: `server/api/webhooks/shopify.post.ts`.
- **Procesamiento de Webhooks (El Orquestador):**
  1. Recibe el payload JSON de la orden desde Shopify.
  2. **Guarda en NocoDB:** Registra la orden en la tabla `Orders` y sus respectivos ítems en la tabla `Order_Items` (cumpliendo 1FN) para historial y lealtad.
  3. **Ruteo logístico hacia proveedores (Realizado por ArduinoHN):** 
     - Es el backend de ArduinoHN el que lee los SKUs y se encarga de comunicarse con las APIs de los proveedores.
     - Si el SKU de un ítem comienza con `DK-` o contiene ciertas palabras clave (ARDUINO, SENSOR), ArduinoHN envía la orden a la API de **DigiKey**.
     - Si no cumple esa condición (o empieza con `ADS-`), ArduinoHN la enruta hacia **AutoDS** u otros proveedores.

## Directrices para el Agente (AI)
- **NO crear tablas o colecciones de productos en bases de datos locales para el frontend.** El maestro de productos es y siempre será Shopify.
- Al modificar flujos de compras, ten en cuenta que el carrito y los productos se consultan *on the fly* vía GraphQL a Shopify.
- Cualquier lógica de post-venta (inventario, lealtad de usuarios, reenvío a proveedores) debe implementarse interceptando los webhooks en el backend y apoyándose en NocoDB como fuente de verdad operacional.
