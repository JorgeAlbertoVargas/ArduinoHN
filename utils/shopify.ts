export const shopifyFetch = async ({ query, variables = {} }: { query: string, variables?: any }) => {
  const config = useRuntimeConfig();
  const domain = config.public.shopifyDomain;
  const token = config.public.shopifyToken;

  // Si estamos usando el entorno simulado, retornamos datos de prueba directamente
  if (!domain || domain === 'arduinohn.myshopify.com' || !token) {
    return simulateShopifyResponse({ query, variables });
  }

  // Lógica real de conexión a Shopify (se usará cuando tengas credenciales reales)
  try {
    const response = await $fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: { query, variables }
    });
    return response as any;
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
};

// Función de simulación para poder trabajar sin tener la tienda lista
const simulateShopifyResponse = async ({ query, variables }: { query: string, variables?: any }) => {
  // Simulamos una demora de red
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulamos respuesta para "Obtener Productos"
  if (query.includes('products(first:')) {
    const mockProducts = [];
    const images = [
      'https://placehold.co/600x400/00a896/FFF?text=Arduino+Compatible',
      'https://placehold.co/600x400/2a9d8f/FFF?text=Sensor+Digital',
      'https://placehold.co/600x400/e9c46a/000?text=Motor+DC',
      'https://placehold.co/600x400/e76f51/FFF?text=Display+OLED',
      'https://placehold.co/600x400/264653/FFF?text=Modulo+Bluetooth'
    ];
    
    const realNames = [
      'ESP32 WROOM 32D WiFi+BT', 
      'Arduino Mega 2560 R3', 
      'Raspberry Pi Pico W', 
      'Sensor Infrarrojo TCRT5000', 
      'Pantalla LCD 16x2 I2C'
    ];

    for (let i = 1; i <= 50; i++) {
      const baseName = realNames[i % realNames.length];
      const hasVideo = i % 5 === 0; // 1 in 5 products has a video
      mockProducts.push({
        node: {
          id: `gid://shopify/Product/${i}`,
          title: `${baseName} (V. ${i})`,
          description: `Producto importado de alta calidad. Ideal para proyectos Maker y robótica. Detalle del modelo: 202${i%10}.`,
          videoUrl: hasVideo ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
          images: {
            edges: [{ node: { url: images[i % images.length] } }]
          },
          variants: {
            edges: [
              {
                node: {
                  id: `gid://shopify/ProductVariant/${i}`,
                  price: { amount: (Math.random() * 2000 + 100).toFixed(2), currencyCode: 'HNL' }
                }
              }
            ]
          }
        }
      });
    }

    return {
      data: {
        products: {
          edges: mockProducts
        }
      }
    };
  }

  // Simulamos respuesta para "Crear Carrito"
  if (query.includes('cartCreate')) {
    return {
      data: {
        cartCreate: {
          cart: {
            id: 'gid://shopify/Cart/mock-cart-12345',
            checkoutUrl: 'https://arduinohn.myshopify.com/cart/c/mock-checkout',
            lines: { edges: [] },
            cost: { totalAmount: { amount: '0.00', currencyCode: 'HNL' } }
          }
        }
      }
    };
  }

  // Simulamos respuesta para "Agregar al carrito" o "Actualizar Carrito"
  if (query.includes('cartLinesAdd') || query.includes('cartLinesUpdate') || query.includes('cartLinesRemove')) {
    // Por simplicidad en la simulación, asumimos que sale bien. 
    // El estado del carrito en esta prueba se manejará mejor en el useCart.
    return {
      data: {
        cartLinesAdd: { cart: getMockCart() },
        cartLinesUpdate: { cart: getMockCart() },
        cartLinesRemove: { cart: getMockCart() },
      }
    };
  }

  return { data: null };
};

const getMockCart = () => ({
  id: 'gid://shopify/Cart/mock-cart-12345',
  checkoutUrl: 'https://arduinohn.myshopify.com/cart/c/mock-checkout',
  lines: { edges: [] }, // En simulación local el composable retiene los items
  cost: { totalAmount: { amount: '0.00', currencyCode: 'HNL' } }
});
