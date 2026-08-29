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
            <div class="item-image-placeholder">
              <img v-if="item.image" :src="item.image" :alt="item.name" style="max-width: 100%; border-radius: 8px;" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <button @click="removeFromCart(item.id)" class="btn-remove">Eliminar</button>
            </div>
          </div>
          <div class="item-price">
            <div v-if="item.originalPrice" class="original-price text-muted" style="text-decoration: line-through; font-size: 0.85rem;">
              L. {{ item.originalPrice.toFixed(2) }}
            </div>
            <div>L. {{ item.price.toFixed(2) }}</div>
            <div v-if="item.discountPercent" class="discount-badge" style="font-size: 0.75rem; color: #e74c3c; font-weight: bold; margin-top: 4px;">
              ¡Ahorras {{ item.discountPercent }}%!
            </div>
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
          <span>Envío e Impuestos:</span>
          <span class="summary-value">Calculados en Checkout</span>
        </div>
        <div v-if="cartSavings > 0" class="summary-row savings-row" style="color: #2e7d32; font-weight: 600;">
          <span>Ahorro por ofertas:</span>
          <span class="summary-value" style="color: #2e7d32;">- L. {{ cartSavings.toFixed(2) }}</span>
        </div>

        <div v-if="isAuthenticated && points > 0" class="loyalty-box">
          <label class="points-toggle" :class="{ 'disabled-toggle': eligibleForPointsTotal === 0 }">
            <input type="checkbox" v-model="usePoints" :disabled="eligibleForPointsTotal === 0" />
            <span class="toggle-text">
              Usar mis {{ points }} puntos (Descuento: L. {{ pointsValue.toFixed(2) }})
            </span>
          </label>
          <div v-if="eligibleForPointsTotal === 0" class="points-warning">
            Los puntos no aplican a productos que ya están en oferta.
          </div>
          <div v-else-if="usePoints && eligibleForPointsTotal < pointsValue" class="points-warning">
            El descuento se limitó a L. {{ eligibleForPointsTotal.toFixed(2) }} (solo aplicable a productos sin oferta).
          </div>
        </div>
        <div v-if="usePoints" class="summary-row savings-row" style="color: #f39c12; font-weight: 600;">
          <span>Descuento por Puntos:</span>
          <span class="summary-value" style="color: #f39c12;">- L. {{ (cartTotal - finalTotal).toFixed(2) }}</span>
        </div>

        <hr class="summary-divider" />
        <div class="summary-row total-row">
          <span>Total Estimado:</span>
          <span class="summary-value">L. {{ finalTotal.toFixed(2) }}</span>
        </div>
        
        <div v-if="isAuthenticated" class="earn-points-banner">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ¡Ganarás {{ pointsToEarn }} Puntos Arduino con esta compra!
        </div>
        
        <button class="btn btn-accent checkout-btn" @click="proceedToCheckout" disabled>
          Proceder al pago seguro
        </button>
        <button class="btn btn-secondary simulate-btn" @click="simulateWebhook" :disabled="isSimulating">
          {{ isSimulating ? 'Simulando...' : 'Simular Compra' }}
        </button>
        <p class="checkout-note">Estamos probando el carrito.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCart } from '~/composables/useCart';
import { useLoyalty } from '~/composables/useLoyalty';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';

const { cartItems, removeFromCart, updateQuantity, cartTotal, cartSavings, cartItemsCount, checkoutUrl, clearCart } = useCart();
const { points, fetchLoyalty, config } = useLoyalty();
const { isAuthenticated } = useAuth();
const toast = useToast();

onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchLoyalty();
  }
});

const eligibleForPointsTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    if (!item.originalPrice) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);
});

const pointsValue = computed(() => {
  return points.value * (config.value?.redemptionValue || 1);
});

const usePoints = ref(false);

const finalTotal = computed(() => {
  let total = cartTotal.value;
  if (usePoints.value) {
    const discount = Math.min(eligibleForPointsTotal.value, pointsValue.value);
    total -= discount;
  }
  return total;
});

const pointsToEarn = computed(() => {
  if (!config.value || config.value.earnRate <= 0) return 0;
  return Math.floor(finalTotal.value / config.value.earnRate);
});

const proceedToCheckout = () => {
  if (checkoutUrl.value) {
    window.location.href = checkoutUrl.value;
  } else {
    toast.showToast('El proceso de pago no está disponible temporalmente. Por favor, intenta de nuevo más tarde.', 4000);
  }
};

const isSimulating = ref(false);

const simulateWebhook = async () => {
  if (cartItems.value.length === 0) {
    toast.showToast('El carrito está vacío.');
    return;
  }
  
  isSimulating.value = true;
  try {
    const orderPayload = {
      id: Math.floor(Math.random() * 1000000).toString(),
      total_price: finalTotal.value.toString(),
      line_items: cartItems.value.map(item => ({
        sku: item.name.includes('Arduino') ? 'DK-MOCK' : 'ADS-MOCK',
        title: item.name,
        quantity: item.quantity,
        price: item.price.toString()
      })),
      loyalty: {
        usedPoints: usePoints.value ? Math.ceil((cartTotal.value - finalTotal.value) / config.value.redemptionValue) : 0,
        earnedPoints: pointsToEarn.value,
        totalSpent: finalTotal.value,
        pointsDiscountValue: usePoints.value ? (cartTotal.value - finalTotal.value) : 0
      }
    };

    const response = await $fetch('/api/loyalty/process-order', {
      method: 'POST',
      body: orderPayload
    });
    
    toast.showToast('¡Simulación completada! ' + (response as any).message, 5000);
    clearCart();
    await fetchLoyalty();
    usePoints.value = false;
  } catch (err) {
    console.error(err);
    toast.showToast('Error al simular la orden. Revisa la consola.', 5000);
  } finally {
    isSimulating.value = false;
  }
};
</script>

<style scoped>
.cart-page { padding-top: 2rem; padding-bottom: 4rem; }
.page-title { font-size: 2rem; color: var(--color-primary); margin-bottom: 1.5rem; }
.empty-cart { padding: 3rem; text-align: center; }
.empty-cart h2 { color: var(--color-secondary); }
.mt-4 { margin-top: 1rem; }
.cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; }
.cart-items-section { padding: 1.5rem; }
.cart-header { display: grid; grid-template-columns: 2fr 1fr 1fr; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border); font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
.cart-item { display: grid; grid-template-columns: 2fr 1fr 1fr; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--glass-border); }
.cart-item:last-child { border-bottom: none; padding-bottom: 0; }
.item-info { display: flex; gap: 1rem; }
.item-image-placeholder { width: 80px; height: 80px; background-color: var(--bg-main); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
.item-details h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-main); }
.btn-remove { background: none; border: none; color: #d9534f; cursor: pointer; font-size: 0.85rem; padding: 0; text-decoration: underline; }
.item-price { font-weight: 600; font-size: 1.1rem; }
.quantity-controls { display: flex; align-items: center; border: 1px solid var(--glass-border); border-radius: 4px; width: max-content; background-color: var(--bg-card); }
.qty-btn { background: none; border: none; width: 32px; height: 32px; cursor: pointer; font-size: 1.2rem; color: var(--text-main); display: flex; align-items: center; justify-content: center; }
.qty-btn:hover { background-color: var(--glass-border); }
.qty-input { width: 40px; height: 32px; border: none; border-left: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); text-align: center; font-family: inherit; color: var(--text-main); background: transparent; -moz-appearance: textfield; }
.qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cart-summary { padding: 1.5rem; position: sticky; top: 140px; }
.cart-summary h2 { font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-muted); }
.summary-value { color: var(--text-main); font-weight: 500; }
.summary-divider { border: none; border-top: 1px solid var(--glass-border); margin: 1.5rem 0; }
.total-row { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.total-row .summary-value { color: var(--color-primary); }
.checkout-btn { width: 100%; padding: 14px; font-size: 1.1rem; margin-top: 1rem; }
.checkout-btn:disabled { background-color: #cccccc !important; border-color: #cccccc !important; color: #666666 !important; cursor: not-allowed; opacity: 0.7; }
.simulate-btn { width: 100%; padding: 14px; font-size: 1.1rem; margin-top: 1rem; cursor: pointer; background-color: #f97316; color: white; border: 1px solid #f97316; }
.simulate-btn:hover:not(:disabled) { background-color: #ea580c; }
.simulate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.checkout-note { text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem; }
.loyalty-box { background: rgba(243, 156, 18, 0.1); border: 1px solid rgba(243, 156, 18, 0.3); padding: 12px; border-radius: 8px; margin: 15px 0; }
.points-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.points-toggle.disabled-toggle { opacity: 0.5; cursor: not-allowed; }
.toggle-text { font-size: 0.9rem; color: #b9770e; font-weight: 500; }
.points-warning { font-size: 0.8rem; color: #d35400; margin-top: 8px; font-weight: 500; }
.earn-points-banner { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 15px; background: rgba(0, 151, 156, 0.1); color: var(--color-primary); padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
@media (max-width: 992px) { .cart-layout { grid-template-columns: 1fr; } .cart-summary { position: static; } }
@media (max-width: 600px) { .cart-header { display: none; } .cart-item { grid-template-columns: 1fr; gap: 1rem; } .item-price { font-size: 1.25rem; color: var(--color-primary); } .quantity-controls { margin-top: 0.5rem; } }
</style>
