<template>
  <div class="container store-page">
    <div class="store-header text-center">
      <h1>Ofertas del Mes</h1>
      <p>Aprovecha nuestros descuentos especiales por tiempo limitado.</p>
    </div>
    
    <div v-if="pendingProducts || pendingOffers" class="text-center loading-state">
      <p>Cargando ofertas...</p>
    </div>
    <div v-else-if="errorProducts || errorOffers" class="text-center error-state">
      <p>Error cargando ofertas. Intenta de nuevo más tarde.</p>
    </div>
    
    <div v-else-if="dealProducts.length === 0" class="text-center empty-state">
      <p>No hay ofertas disponibles en este momento. ¡Vuelve pronto!</p>
      <NuxtLink to="/store" class="btn btn-primary mt-4">Explorar Tienda</NuxtLink>
    </div>

    <div v-else class="products-grid">
      <ProductCard 
        v-for="product in dealProducts" 
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'
import { useProducts } from '~/composables/useProducts'

const cart = useCart()
const router = useRouter()

// Modals
const isModalOpen = ref(false)
const selectedProduct = ref(null)
const isVideoModalOpen = ref(false)
const selectedVideoUrl = ref<string | null>(null)

const openQuickView = (product: any) => {
  selectedProduct.value = product
  isModalOpen.value = true
}

const openVideo = (videoUrl: string) => {
  selectedVideoUrl.value = 'promo'
  isVideoModalOpen.value = true
}

const goToProduct = (id: string) => {
  router.push(`/store/${id}`)
}

const handleAddToCart = async (product: any) => {
  await cart.addToCart({
    id: product.id,
    name: product.title,
    price: product.price, // Already discounted
    quantity: 1,
    image: product.image,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent
  })
  alert(`Se agregó ${product.title} al carrito.`)
}

// Fetch Data
const { allProducts, pending: pendingProducts, error: errorProducts } = useProducts()

const fetchOffers = async () => {
  try {
    const data = await $fetch<Record<string, { discount: number }>>('/api/admin/offers')
    return data || {}
  } catch (error) {
    return {}
  }
}

const { data: offersData, pending: pendingOffers, error: errorOffers } = useAsyncData('currentOffers', fetchOffers)

const dealProducts = computed(() => {
  if (!allProducts.value || !offersData.value) return []
  
  const offers = offersData.value
  const deals = []

  for (const product of allProducts.value) {
    if (offers[product.id]) {
      const discount = offers[product.id].discount
      const originalPrice = product.price
      const newPrice = originalPrice * (1 - (discount / 100))
      
      deals.push({
        ...product,
        price: newPrice, // Override price with discounted price
        originalPrice: originalPrice,
        discountPercent: discount
      })
    }
  }
  
  return deals
})
</script>

<style scoped>
.store-page { padding: 4rem 0; }
.store-header { margin-bottom: 4rem; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.text-center { text-align: center; }
.loading-state, .error-state, .empty-state { padding: 3rem; background-color: var(--bg-card); border-radius: 8px; border: 1px solid var(--glass-border); }
.error-state { color: #d9534f; }
.mt-4 { margin-top: 1rem; }
</style>
