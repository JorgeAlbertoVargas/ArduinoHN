<template>
  <div class="history-page container">
    <h1 class="page-title">Historial de Consumo</h1>

    <div v-if="!isAuthenticated" class="alert alert-warning">
      <p>Debes iniciar sesión para ver tu historial de compras.</p>
      <NuxtLink to="/login" class="btn btn-primary mt-3">Iniciar Sesión</NuxtLink>
    </div>

    <div v-else class="history-container glass">
      <div v-if="isLoading" class="loading-state">
        Cargando historial de compras...
      </div>
      <div v-else-if="orders.length === 0" class="empty-state">
        <h2>Aún no tienes compras</h2>
        <p>Visita nuestra tienda para hacer tu primer pedido.</p>
        <NuxtLink to="/store" class="btn btn-accent mt-3">Ir a la Tienda</NuxtLink>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Orden #</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ formatHondurasDateTime(order.date) }}</td>
            <td class="order-id">#{{ order.id }}</td>
            <td>
              <span class="status-badge" :class="order.status.toLowerCase()">
                {{ order.status }}
              </span>
            </td>
            <td class="total-price">L. {{ Number(order.totalPrice).toFixed(2) }}</td>
            <td>
              <NuxtLink :to="`/order/${order.id}`" class="btn-link">Ver Detalles</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { isAuthenticated, fetchUser } = useAuth();
const orders = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  await fetchUser();
  if (isAuthenticated.value) {
    await fetchOrders();
  } else {
    isLoading.value = false;
  }
});

const fetchOrders = async () => {
  try {
    const data = await $fetch<any[]>('/api/orders');
    orders.value = data || [];
  } catch (error) {
    console.error('Error fetching orders', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.history-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
  min-height: calc(100vh - 200px);
}
.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 2rem;
}
.history-container {
  padding: 2rem;
  border-radius: 12px;
  overflow-x: auto;
}
.order-id {
  font-weight: bold;
  color: var(--color-primary);
}
.total-price {
  font-weight: 600;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-badge.completada {
  background-color: #e8f5e9;
  color: #2e7d32;
}
.btn-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border: 1px solid var(--color-secondary);
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-link:hover {
  background-color: var(--color-secondary);
  color: white;
}
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}
.mt-3 { margin-top: 1rem; }
.alert {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
}
.alert-warning {
  border-color: #f39c12;
  color: var(--text-main);
}
</style>
