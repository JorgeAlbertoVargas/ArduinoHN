<template>
  <NuxtLink to="/cart" class="cart-icon-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span v-if="cartItemsCount > 0" class="cart-badge">{{ cartItemsCount }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart';

const { cartItemsCount } = useCart();
</script>

<style scoped>
.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--text-main);
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.cart-icon-wrapper:hover {
  background-color: var(--glass-border);
  color: var(--color-primary);
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-accent);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
}
</style>
