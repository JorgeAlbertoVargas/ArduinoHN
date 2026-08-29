<template>
  <div class="order-detail-page container">
    <div class="page-header">
      <h1 class="page-title">Detalles de Orden</h1>
      <NuxtLink to="/history" class="btn btn-secondary">← Volver al Historial</NuxtLink>
    </div>

    <div v-if="isLoading" class="loading-state">
      Cargando factura...
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else-if="order" class="invoice-card glass">
      <div class="invoice-header">
        <div class="order-header-info">
          <h2>Pedido #{{ order.id }}</h2>
          <p class="date">{{ formatHondurasDateTime(order.date) }}</p>
          <p v-if="order.cai" class="cai-text"><strong>CAI:</strong> {{ order.cai }}</p>
        </div>
        <div class="status-badge" :class="order.status.toLowerCase()">
          {{ order.status }}
        </div>
      </div>

      <div class="invoice-items">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in order.items" :key="index">
              <td>
                <div class="item-info">
                  <span class="item-title">{{ item.title }}</span>
                  <span v-if="item.originalPrice" class="item-discount-note">Oferta aplicada</span>
                </div>
              </td>
              <td class="text-left">{{ item.quantity }}</td>
              <td class="text-left">{{ formatCurrency(Number(item.price)) }}</td>
              <td class="text-left font-bold">{{ formatCurrency(Number(item.price) * Number(item.quantity)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="invoice-summary">
        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ formatCurrency(Number(order.subtotal)) }}</span>
          </div>
          <div v-if="order.loyalty && order.loyalty.usedPoints > 0" class="summary-row discount">
            <span>Descuento por Puntos ({{ order.loyalty.usedPoints }} pts):</span>
            <span>- {{ formatCurrency(Number(order.loyalty.pointsDiscountValue)) }}</span>
          </div>
          <div class="summary-row">
            <span>ISV:</span>
            <span>{{ formatCurrency(Number(order.isv || 0)) }}</span>
          </div>
          <hr class="divider" />
          <div class="summary-row total">
            <span>Total Pagado:</span>
            <span>{{ formatCurrency(Number(order.totalPrice)) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="order.loyalty && order.loyalty.earnedPoints > 0" class="loyalty-footer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ¡Ganaste {{ order.loyalty.earnedPoints }} Puntos Arduino con esta compra!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { formatCurrency } from '~/utils/currencyFormatter';
import { formatHondurasDateTime } from '~/utils/dateFormatter';

const route = useRoute();
const { isAuthenticated, fetchUser } = useAuth();
const order = ref<any>(null);
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  await fetchUser();
  if (isAuthenticated.value) {
    const id = route.params.id;
    if (id) {
      await fetchOrderDetails(id as string);
    } else {
      error.value = 'ID de orden no proporcionado.';
      isLoading.value = false;
    }
  } else {
    error.value = 'Debes iniciar sesión para ver los detalles.';
    isLoading.value = false;
  }
});

const fetchOrderDetails = async (id: string) => {
  try {
    const data = await $fetch<any>(`/api/orders/${id}`);
    if (data) {
      order.value = data;
    }
  } catch (e: any) {
    console.error('Error fetching order', e);
    error.value = e.data?.statusMessage || 'No se pudo encontrar la orden.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.order-detail-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
  min-height: calc(100vh - 200px);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0;
}
.invoice-card {
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1.5rem;
}
.invoice-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-main);
  font-size: 1.8rem;
}
.date {
  color: var(--text-muted);
  margin: 0;
}
.cai-text {
  color: var(--text-muted);
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}
.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}
.status-badge.completada {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.item-info {
  display: flex;
  flex-direction: column;
}
.item-title {
  font-weight: 500;
}
.item-discount-note {
  font-size: 0.8rem;
  color: #e74c3c;
  margin-top: 4px;
}
.text-left { text-align: left; }
.font-bold { font-weight: 600; }

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}
.summary-box {
  width: 350px;
  background: var(--bg-main);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}
.summary-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  margin-bottom: 0.8rem;
  color: var(--text-main);
  gap: 1rem;
}
.summary-row span:last-child {
  white-space: nowrap;
  text-align: left;
}
.summary-row.discount {
  color: #f39c12;
  font-weight: 500;
}
.divider {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 1rem 0;
}
.summary-row.total {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0;
}

.loyalty-footer {
  background-color: rgba(0, 151, 156, 0.1);
  color: var(--color-primary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
}

.alert {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
}
.alert-error {
  border-color: #e74c3c;
  color: #c0392b;
}

@media (max-width: 600px) {
  .invoice-card { padding: 1.5rem; }
  .invoice-header { flex-direction: column; gap: 1rem; }
  .invoice-summary { justify-content: center; }
  .summary-box { width: 100%; }
}
</style>
