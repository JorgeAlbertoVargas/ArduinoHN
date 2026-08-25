<template>
  <div class="cart-page container">
    <h1 class="page-title">Carrito de Compras</h1>
    
    <div v-if="cartItems.length === 0" class="empty-cart glass">
      <h2>Tu carrito está vacío</h2>
      <p>Explora nuestra tienda y encuentra los mejores productos y componentes.</p>
      <NuxtLink to="/store" class="btn btn-primary mt-4">Ir a la Tienda</NuxtLink>
    </div>
    
    <div v-else class="cart-layout">
      <!-- Lista de Productos -->
      <div class="cart-items-section glass">
        <div class="cart-header">
          <span class="header-product">Producto</span>
          <span class="header-price">Precio</span>
          <span class="header-quantity">Cantidad</span>
        </div>
        
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-info">
            <!-- Placeholder para imagen -->
            <div class="item-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <button @click="removeFromCart(item.id)" class="btn-remove">Eliminar</button>
            </div>
          </div>
          <div class="item-price">
            L. {{ item.price.toFixed(2) }}
          </div>
          <div class="item-quantity">
            <div class="quantity-controls">
              <button @click="updateQuantity(item.id, item.quantity - 1)" class="qty-btn">-</button>
              <input type="number" :value="item.quantity" @change="e => updateQuantity(item.id, parseInt((e.target as HTMLInputElement).value))" min="1" class="qty-input" />
              <button @click="updateQuantity(item.id, item.quantity + 1)" class="qty-btn">+</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Resumen de Compra -->
      <div class="cart-summary glass">
        <h2>Resumen del pedido</h2>
        <div class="summary-row">
          <span>Subtotal ({{ cartItemsCount }} productos):</span>
          <span class="summary-value">L. {{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Envío:</span>
          <span class="summary-value">Por calcular</span>
        </div>
        <hr class="summary-divider" />
        <div class="summary-row total-row">
          <span>Total:</span>
          <span class="summary-value">L. {{ cartTotal.toFixed(2) }}</span>
        </div>
        
        <button class="btn btn-accent checkout-btn" @click="proceedToCheckout">
          Proceder al pago
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart';

const { cartItems, removeFromCart, updateQuantity, cartTotal, cartItemsCount } = useCart();

const proceedToCheckout = async () => {
  // Lógica futura para guardar en base de datos PostgreSQL
  try {
    const response = await $fetch('/api/cart', {
      method: 'POST',
      body: {
        items: cartItems.value,
        total: cartTotal.value
      }
    });
    console.log('Respuesta del servidor:', response);
    alert('¡Pedido procesado de prueba! En el futuro esto te llevará a la pasarela de pago y guardará en PostgreSQL.');
  } catch (error) {
    console.error('Error al procesar:', error);
  }
};
</script>

<style scoped>
.cart-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.empty-cart {
  padding: 3rem;
  text-align: center;
}

.empty-cart h2 {
  color: var(--color-secondary);
}

.mt-4 {
  margin-top: 1rem;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

.cart-items-section {
  padding: 1.5rem;
}

.cart-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.cart-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-info {
  display: flex;
  gap: 1rem;
}

.item-image-placeholder {
  width: 80px;
  height: 80px;
  background-color: var(--bg-main);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.item-details h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.btn-remove {
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  text-decoration: underline;
}

.item-price {
  font-weight: 600;
  font-size: 1.1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  width: max-content;
  background-color: var(--bg-card);
}

.qty-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background-color: var(--glass-border);
}

.qty-input {
  width: 40px;
  height: 32px;
  border: none;
  border-left: 1px solid var(--glass-border);
  border-right: 1px solid var(--glass-border);
  text-align: center;
  font-family: inherit;
  color: var(--text-main);
  background: transparent;
  -moz-appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-summary {
  padding: 1.5rem;
  position: sticky;
  top: 140px;
}

.cart-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.summary-value {
  color: var(--text-main);
  font-weight: 500;
}

.summary-divider {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 1.5rem 0;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.total-row .summary-value {
  color: var(--color-primary);
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  margin-top: 1rem;
}

/* Responsividad */
@media (max-width: 992px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 600px) {
  .cart-header {
    display: none; /* Hide header on mobile, stack items instead */
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .item-price {
    font-size: 1.25rem;
    color: var(--color-primary);
  }
  
  .quantity-controls {
    margin-top: 0.5rem;
  }
}
</style>
