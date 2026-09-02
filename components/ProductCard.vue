<template>
  <div class="product-card glass">
    <div class="product-image" @click="$emit('go-to-product', id)">
      <div v-if="discountPercent" class="discount-badge">
        -{{ discountPercent }}%
      </div>
      <img v-if="image" :src="image" :alt="title" class="product-img" />
      <div v-else class="image-placeholder">SIN IMAGEN</div>
      
      <!-- Iconos Flotantes (Quick View y Wishlist) -->
      <div class="floating-actions">
        <button class="action-btn" title="Vista Rápida" @click.stop="$emit('quick-view')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="action-btn" :class="{ 'active': inWishlist }" title="Añadir a Deseos" @click.stop="toggleWishlistLocally">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="inWishlist ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      
      <!-- Video Play Button -->
      <button class="video-play-btn" title="Ver Video" @click.stop="handlePlayVideo">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
      </button>
      
      <!-- Botón de añadir al carrito que se muestra en hover -->
      <!-- Removed from image overlay -->
    </div>
    <div class="product-info" @click="$emit('go-to-product', id)">
      <h3 class="product-title">{{ title }}</h3>
      <div class="price-container">
        <Transition name="fade" mode="out-in">
          <div v-if="!showUSD" key="local" class="price-wrapper">
            <span v-if="originalPrice" class="original-price text-muted">{{ formatCurrency(Number(originalPrice), userCurrency) }}</span>
            <span class="product-price">{{ formatCurrency(Number(price), userCurrency) }}</span>
          </div>
          <div v-else key="usd" class="price-wrapper">
            <span v-if="originalPrice" class="original-price text-muted">{{ formatUSD(Number(originalPrice), exchangeRate) }}</span>
            <span class="product-price">{{ formatUSD(Number(price), exchangeRate) }}</span>
          </div>
        </Transition>
        <button class="currency-toggle-btn" @click.stop="showUSD = !showUSD" :title="showUSD ? `Ver en ${userCurrency}` : 'Ver en USD'">
          <svg v-if="!showUSD" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span v-else class="currency-text">{{ userCurrency }}</span>
        </button>
      </div>
      <div class="actions-container mt-3">
        <button class="btn btn-primary w-full add-btn" @click.stop="$emit('add-to-cart')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          Añadir al Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWishlist } from '~/composables/useWishlist';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';
import { formatCurrency, formatUSD } from '~/utils/currencyFormatter';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: [Number, String],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: null
  },
  originalPrice: {
    type: [Number, String],
    default: null
  },
  discountPercent: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['add-to-cart', 'quick-view', 'go-to-product', 'play-video']);

const { isInWishlist, toggleWishlist } = useWishlist();
const inWishlist = ref(isInWishlist(props.id));

const { exchangeRate, userCurrency } = useGlobalCurrencyConfig();
const showUSD = ref(false);

watch(() => isInWishlist(props.id), (val) => {
  inWishlist.value = val;
});

const toggleWishlistLocally = () => {
  toggleWishlist({
    id: props.id,
    title: props.title,
    price: Number(props.price),
    image: props.image
  });
  inWishlist.value = isInWishlist(props.id);
};

const handlePlayVideo = () => {
  // Si el producto tiene un video propio se usa ese, sino mostramos la promo animada
  const defaultPromoVideo = 'promo';
  emit('play-video', props.videoUrl || defaultPromoVideo);
};
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--bg-card);
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.product-image {
  height: 250px;
  background-color: white; /* Base clara para las imágenes estilo e-commerce */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.product-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
.image-placeholder {
  color: #999;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Acciones flotantes */
.floating-actions {
  position: absolute;
  top: 10px;
  right: -50px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: right 0.3s ease;
}
.product-card:hover .floating-actions {
  right: 10px;
}
.action-btn {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.action-btn.active {
  color: #e74c3c;
}

/* Video Play Button */
.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}
.video-play-btn:hover {
  background: var(--color-primary);
  transform: translate(-50%, -50%) scale(1.1);
}

/* Botón Añadir al carrito movido a la info */
.actions-container {
  margin-top: 1rem;
}
.add-btn {
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding: 0.8rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
}
.add-btn:hover {
  background-color: var(--color-secondary, #007a6e);
}

/* Info del producto */
.product-info {
  padding: 1.2rem;
  text-align: center;
  background-color: white; /* Para contrastar */
  border-top: 1px solid #f0f0f0;
}
.product-title {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.4rem; /* Fijar altura para 2 líneas */
}
.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.price-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  min-height: 28px;
}
.price-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.currency-toggle-btn {
  background: rgba(0, 168, 150, 0.1);
  border: 1px solid rgba(0, 168, 150, 0.3);
  color: var(--color-primary);
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  margin-left: 5px;
}
.currency-toggle-btn:hover {
  background: var(--color-primary);
  color: white;
}
.currency-text {
  font-size: 0.7rem;
  font-weight: bold;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.original-price {
  text-decoration: line-through;
  font-size: 0.95rem;
}
.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  z-index: 5;
}
.text-muted {
  color: #999;
}
.w-full {
  width: 100%;
}
</style>
