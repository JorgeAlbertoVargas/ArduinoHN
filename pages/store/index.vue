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
        :original-price="product.originalPrice"
        :discount-percent="product.discountPercent"
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
import { useProducts } from '~/composables/useProducts';

const cart = useCart();
const router = useRouter();
const route = useRoute();

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

const { allProducts: fetchedProducts, pending: pendingProducts, error: errorProducts } = useProducts();

const fetchOffers = async () => {
  try {
    const data = await $fetch<Record<string, { discount: number }>>('/api/admin/offers')
    return data || {}
  } catch (error) {
    return {}
  }
}
const { data: offersData } = await useAsyncData('storeOffers', fetchOffers)

const pendingShopify = pendingProducts;
const pendingLocal = false; // Combined above
const errorShopify = errorProducts;
const errorLocal = false; // Combined above

// --- Mezclar y Filtrar Productos ---
const allProducts = computed(() => {
  let products = fetchedProducts.value;
  const offers = offersData.value || {};

  products = products.map((product: any) => {
    if (offers[product.id]) {
      const discount = offers[product.id].discount;
      const originalPrice = product.price;
      const newPrice = originalPrice * (1 - (discount / 100));
      return {
        ...product,
        price: newPrice,
        originalPrice: originalPrice,
        discountPercent: discount
      };
    }
    return product;
  });

  const q = route.query.q as string;
  if (q) {
    const term = q.toLowerCase();
    products = products.filter((p: any) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }
  return products;
});

const handleAddToCart = async (product: any) => {
  await cart.addToCart({
    id: product.id,
    name: product.title,
    price: product.price,
    quantity: 1,
    image: product.image,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent
  });
  const toast = useToast();
  toast.showToast(`Se agregó ${product.title} al carrito.`);
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
