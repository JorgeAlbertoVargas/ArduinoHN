<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content glass">
      <button class="close-btn" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      
      <div class="modal-body" v-if="product">
        <div class="modal-image">
          <img v-if="product.image" :src="product.image" :alt="product.title" />
          <div v-else class="placeholder">SIN IMAGEN</div>
        </div>
        <div class="modal-info">
          <h2>{{ product.title }}</h2>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom: 1rem;">
            <span v-if="product.originalPrice" class="original-price" style="text-decoration: line-through; color: #999; font-size: 1.1rem;">
              HNL {{ Number(product.originalPrice).toFixed(2) }}
            </span>
            <p class="price" style="margin-bottom:0;">HNL {{ Number(product.price).toFixed(2) }}</p>
            <span v-if="product.discountPercent" class="badge" style="background-color: #e74c3c; color: white; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 0.9rem;">
              -{{ product.discountPercent }}%
            </span>
          </div>
          <p class="description">{{ product.description || 'Sin descripción disponible.' }}</p>
          
          <button class="btn btn-primary add-btn" @click="addToCart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Añadir al Carrito
          </button>
          
          <NuxtLink :to="`/store/${product.id}`" class="details-link">
            Ver detalles completos
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'add-to-cart']);

const close = () => {
  emit('close');
};

const addToCart = () => {
  emit('add-to-cart', props.product);
  close();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 90%;
  max-width: 800px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  z-index: 10;
}
.close-btn:hover {
  color: #000;
}
.modal-body {
  display: flex;
  flex-direction: column;
}
@media(min-width: 768px) {
  .modal-body {
    flex-direction: row;
  }
}
.modal-image {
  flex: 1;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.modal-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}
.placeholder {
  color: #aaa;
  font-weight: bold;
}
.modal-info {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.modal-info h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}
.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}
.description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 2rem;
  max-height: 150px;
  overflow-y: auto;
}
.add-btn {
  padding: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  margin-bottom: 1rem;
  border: none;
}
.add-btn:hover {
  background-color: var(--color-secondary, #007a6e);
}
.details-link {
  text-align: center;
  color: var(--color-primary);
  text-decoration: underline;
  font-size: 0.9rem;
}
</style>
