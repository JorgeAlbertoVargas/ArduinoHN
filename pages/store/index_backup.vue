<template>
  <div class="container store-page">
    <div class="store-header text-center">
      <h1>Tienda Virtual</h1>
      <p>Componentes y kits listos para potenciar tus proyectos en todo Honduras y el mundo.</p>
    </div>
    
    <div class="products-grid">
      <ProductCard 
        v-for="product in products" 
        :key="product.id"
        :title="product.title"
        :price="product.price"
        @add-to-cart="addToCart(product)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart';

const products = [
  { id: 1, title: 'Arduino UNO R4 WiFi', price: 950.00 },
  { id: 2, title: 'Kit de Robótica IIoT', price: 2500.00 },
  { id: 3, title: 'Módulo de Sensor Ultrasónico', price: 120.00 },
  { id: 4, title: 'Display OLED 0.96"', price: 180.00 }
];

const cart = useCart();

const addToCart = (product: any) => {
  cart.addToCart({
    id: product.id,
    name: product.title,
    price: product.price,
    quantity: 1
  });
  
  // Opcional: mostrar un feedback más discreto que un alert
  // alert(`Se agregó ${product.title} al carrito.`);
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
</style>
