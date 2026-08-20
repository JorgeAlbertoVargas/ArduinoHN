<template>
  <div class="product-card glass">
    <div class="product-image">
      <div class="image-placeholder">IMAGEN DEL PRODUCTO</div>
    </div>
    <div class="product-info">
      <h3 class="product-title">{{ title }}</h3>
      <p class="product-price">HNL {{ price.toFixed(2) }}</p>
      <button class="btn btn-primary w-full" @click="$emit('add-to-cart')">Añadir al Carrito</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease;
}
.product-card:hover {
  transform: translateY(-5px);
}
.product-image {
  height: 200px;
  background-color: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-placeholder {
  color: var(--text-muted);
  font-weight: bold;
  font-size: 0.8rem;
}
.product-info {
  padding: 1.5rem;
}
.product-title {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}
.product-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}
.w-full {
  width: 100%;
}
</style>
