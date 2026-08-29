<template>
  <div class="container store-page">
    <div v-if="pending" class="text-center loading-state">
      <p>Cargando detalles del producto...</p>
    </div>
    <div v-else-if="error || !product" class="text-center error-state">
      <p>Error cargando el producto. Es posible que no exista.</p>
      <NuxtLink to="/store" class="btn btn-primary mt-4">Volver a la Tienda</NuxtLink>
    </div>
    <div v-else class="product-details">
      <div class="product-image-container glass">
        <img v-if="product.image" :src="product.image" :alt="product.title" class="main-image" />
        <div v-else class="placeholder">SIN IMAGEN</div>
      </div>
      
      <div class="product-info-container">
        <h1 class="product-title">{{ product.title }}</h1>
        <div class="price-container" style="display:flex; align-items:center; gap: 1rem; margin-bottom: 2rem;">
          <span v-if="product.originalPrice && !showUSD" class="original-price" style="text-decoration: line-through; color: #999; font-size: 1.4rem;">
            {{ formatCurrency(Number(product.originalPrice)) }}
          </span>
          <span v-if="!showUSD" class="product-price" style="margin-bottom:0;">{{ formatCurrency(Number(product.price)) }}</span>
          
          <span v-if="product.originalPrice && showUSD" class="original-price" style="text-decoration: line-through; color: #999; font-size: 1.4rem;">
            {{ formatUSD(Number(product.originalPrice), exchangeRate) }}
          </span>
          <span v-if="showUSD" class="product-price" style="margin-bottom:0;">{{ formatUSD(Number(product.price), exchangeRate) }}</span>

          <button class="currency-toggle" @click="showUSD = !showUSD" :title="showUSD ? 'Ver en Lempiras' : 'Ver en Dólares'">
            <svg v-if="!showUSD" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span v-else class="currency-symbol" style="font-weight: bold; font-size: 0.9rem;">L.</span>
          </button>

          <span v-if="product.discountPercent" class="badge" style="background-color: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 1rem;">
            -{{ product.discountPercent }}%
          </span>
        </div>
        
        <div class="product-description">
          <h3>Descripción Técnica</h3>
          <p>{{ product.description || 'Sin descripción disponible.' }}</p>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary add-btn" @click="handleAddToCart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Añadir al Carrito
          </button>
          <button class="btn wishlist-btn" :class="{ 'active': inWishlist }" @click="toggleWishlistLocally">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="inWishlist ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {{ inWishlist ? 'Quitar de Deseos' : 'Añadir a Deseos' }}
          </button>
        </div>
        <div class="mt-4">
          <NuxtLink to="/store" class="back-link">← Volver a la Tienda</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCart } from '~/composables/useCart';
import { useWishlist } from '~/composables/useWishlist';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';
import { formatCurrency, formatUSD } from '~/utils/currencyFormatter';
import { shopifyFetch } from '~/utils/shopify';

const route = useRoute();
const idParam = route.params.id as string;
const config = useRuntimeConfig();
const cart = useCart();
const { isInWishlist, toggleWishlist } = useWishlist();
const { exchangeRate } = useGlobalCurrencyConfig();
const showUSD = ref(false);

const isLocal = idParam.startsWith('local-');

const fetchProductData = async () => {
  if (isLocal) {
    const nocodbId = idParam.replace('local-', '');
    const url = `${config.public.nocodbUrl}/api/v2/tables/${config.public.nocodbProductosTable}/records/${nocodbId}`;
    try {
      const res = await $fetch<any>(url, {
        headers: { 'xc-token': config.public.nocodbToken }
      });
      if (res) {
        const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg';
        return {
          id: idParam,
          productId: res.Id,
          title: res.Nombre,
          price: parseFloat(res.Precio_Venta || '0'),
          image: res.image_url || fallbackImage,
          description: res.descripcion || '',
          source: 'local'
        };
      }
    } catch (e) {
      console.error('Error fetching NocoDB product detail', e);
      throw e;
    }
  } else {
    // Fetch from shopify by variant ID
    const query = `
      query getProductByVariant($id: ID!) {
        node(id: $id) {
          ... on ProductVariant {
            id
            price { amount }
            product {
              id
              title
              description
              images(first: 1) { edges { node { url } } }
            }
          }
        }
      }
    `;
    const res = await shopifyFetch({ query, variables: { id: idParam } });
    const variantNode = res?.data?.node;
    if (variantNode) {
      const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg';
      return {
        id: variantNode.id,
        productId: variantNode.product.id,
        title: variantNode.product.title,
        price: parseFloat(variantNode.price.amount),
        image: variantNode.product.images.edges[0]?.node?.url || fallbackImage,
        description: variantNode.product.description,
        source: 'shopify'
      };
    }
  }
  return null;
};

const fetchOffers = async () => {
  try {
    const data = await $fetch<Record<string, { discount: number }>>('/api/admin/offers')
    return data || {}
  } catch (error) {
    return {}
  }
}
const { data: offersData } = await useAsyncData('detailOffers', fetchOffers)

const { data: rawProduct, pending, error } = await useAsyncData(`product-${idParam}`, fetchProductData);

const product = computed(() => {
  if (!rawProduct.value) return null;
  const p = { ...rawProduct.value };
  const offers = offersData.value || {};
  if (offers[p.id]) {
    const discount = offers[p.id].discount;
    p.originalPrice = p.price;
    p.price = p.price * (1 - (discount / 100));
    p.discountPercent = discount;
  }
  return p;
});

const inWishlist = ref(false);

// Esperar a que el producto cargue para verificar wishlist
watch(product, (newVal) => {
  if (newVal) {
    inWishlist.value = isInWishlist(newVal.id);
  }
}, { immediate: true });

const toggleWishlistLocally = () => {
  if (product.value) {
    toggleWishlist({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image: product.value.image
    });
    inWishlist.value = isInWishlist(product.value.id);
  }
};

const handleAddToCart = async () => {
  if (product.value) {
    await cart.addToCart({
      id: product.value.id,
      name: product.value.title,
      price: product.value.price,
      quantity: 1,
      image: product.value.image,
      originalPrice: product.value.originalPrice,
      discountPercent: product.value.discountPercent
    });
    const toast = useToast();
    toast.showToast(`Se agregó ${product.value.title} al carrito.`);
  }
};
</script>

<style scoped>
.store-page {
  padding: 4rem 0;
}
.product-details {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
@media (min-width: 768px) {
  .product-details {
    flex-direction: row;
  }
}
.product-image-container {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  min-height: 400px;
}
.main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}
.placeholder {
  color: #999;
  font-weight: bold;
  font-size: 1.2rem;
}
.product-info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.product-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}
.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 2rem;
}
.product-description {
  margin-bottom: 3rem;
  color: #555;
  line-height: 1.6;
}
.currency-toggle {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin-left: 5px;
}
.currency-toggle:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.product-description h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}
.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.add-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  padding: 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
}
.add-btn:hover {
  background-color: var(--color-secondary, #007a6e);
}
.wishlist-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #333;
  border: 1px solid #ddd;
}
.wishlist-btn:hover {
  background: #f5f5f5;
}
.wishlist-btn.active {
  color: #e74c3c;
  border-color: #e74c3c;
  background: #fdf2f1;
}
.mt-4 {
  margin-top: 2rem;
}
.back-link {
  color: #666;
  text-decoration: underline;
}
.back-link:hover {
  color: var(--color-primary);
}
.loading-state, .error-state {
  padding: 4rem;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
}
.error-state {
  color: #d9534f;
}
</style>
