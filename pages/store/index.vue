<template>
  <div class="container store-page">
    <div class="store-header text-center">
      <h1>Tienda Virtual</h1>
      <p>Componentes y kits listos para potenciar tus proyectos en todo Honduras y el mundo.</p>
    </div>
    
    <div v-if="pendingShopify || pendingLocal" class="text-center loading-state">
      <p>Cargando catálogo de productos...</p>
    </div>
    <div v-else-if="errorShopify && errorLocal" class="text-center error-state">
      <p>Error cargando productos. Intenta de nuevo más tarde.</p>
    </div>
    
    <div v-else class="products-grid">
      <ProductCard 
        v-for="product in allProducts" 
        :key="product.id"
        :id="product.id"
        :title="product.title"
        :price="product.price"
        :image="product.image"
        :video-url="product.videoUrl"
        @add-to-cart="handleAddToCart(product)"
        @quick-view="openQuickView(product)"
        @go-to-product="goToProduct"
        @play-video="openVideo"
      />
    </div>

    <!-- Modal de Vista Rápida -->
    <QuickViewModal 
      :is-open="isModalOpen" 
      :product="selectedProduct" 
      @close="isModalOpen = false" 
      @add-to-cart="handleAddToCart" 
    />

    <!-- Modal de Video -->
    <VideoModal
      :is-open="isVideoModalOpen"
      :video-url="selectedVideoUrl"
      @close="isVideoModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCart } from '~/composables/useCart';
import { shopifyFetch } from '~/utils/shopify';

const cart = useCart();
const router = useRouter();
const config = useRuntimeConfig();

// Estado del Modal
const isModalOpen = ref(false);
const selectedProduct = ref(null);

const isVideoModalOpen = ref(false);
const selectedVideoUrl = ref<string | null>(null);

const openQuickView = (product: any) => {
  selectedProduct.value = product;
  isModalOpen.value = true;
};

const openVideo = (videoUrl: string) => {
  // Usar la presentación promocional temporalmente en lugar de los videos de prueba
  selectedVideoUrl.value = 'promo';
  isVideoModalOpen.value = true;
};

const goToProduct = (id: string) => {
  router.push(`/store/${id}`);
};

// --- Fetch Shopify Products ---
const query = `
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
`;

const { data: shopifyData, pending: pendingShopify, error: errorShopify } = await useAsyncData('shopifyProducts', () => shopifyFetch({ query }));

const formattedShopifyProducts = computed(() => {
  if (!shopifyData.value?.data?.products?.edges) return [];
  return shopifyData.value.data.products.edges.map((edge: any) => {
    const node = edge.node;
    const variant = node.variants.edges[0]?.node;
    // Fallback URL para Shopify si no tienen imagen subida
    const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg';
    return {
      id: variant?.id || node.id,
      productId: node.id,
      title: node.title,
      price: parseFloat(variant?.price?.amount || '0'),
      image: node.images.edges[0]?.node?.url || fallbackImage,
      description: node.description,
      videoUrl: node.videoUrl || null,
      source: 'shopify'
    };
  });
});

// --- Fetch NocoDB Local Products ---
const fetchLocalProducts = async () => {
  const url = `${config.public.nocodbUrl}/api/v2/tables/${config.public.nocodbProductosTable}/records`;
  try {
    const res = await $fetch<any>(url, {
      headers: { 'xc-token': config.public.nocodbToken }
    });
    return res.list || [];
  } catch (err) {
    console.error('Error fetching NocoDB products', err);
    return [];
  }
};

const { data: localData, pending: pendingLocal, error: errorLocal } = await useAsyncData('localProducts', fetchLocalProducts);

const formattedLocalProducts = computed(() => {
  if (!localData.value) return [];
  return localData.value.map((item: any) => {
    const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg';
    return {
      id: `local-${item.Id}`,
      productId: item.Id,
      title: item.Nombre || 'Sin nombre',
      price: parseFloat(item.Precio_Venta || '0'),
      image: item.image_url || fallbackImage,
      description: item.descripcion || '',
      videoUrl: item.video_url || null,
      source: 'local'
    };
  });
});

// --- Mezclar y Filtrar Productos ---
const route = useRoute();
const allProducts = computed(() => {
  let products = [...formattedLocalProducts.value, ...formattedShopifyProducts.value];
  const q = route.query.q as string;
  if (q) {
    const term = q.toLowerCase();
    products = products.filter(p => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }
  return products;
});

const handleAddToCart = async (product: any) => {
  await cart.addToCart({
    id: product.id,
    name: product.title,
    price: product.price,
    quantity: 1,
    image: product.image
  });
  alert(`Se agregó ${product.title} al carrito.`);
}
</script>

<style scoped>
.store-page {
  padding: 4rem 0;
}
.store-header {
  margin-bottom: 4rem;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
.text-center {
  text-align: center;
}
.loading-state, .error-state {
  padding: 3rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}
.error-state {
  color: #d9534f;
}
</style>
