<template>
  <div class="coupons-page container">
    <h1 class="page-title">Mi Lealtad y Cupones</h1>

    <div v-if="!isAuthenticated" class="alert alert-warning">
      <p>Debes iniciar sesión para ver tus Puntos Arduino y cupones disponibles.</p>
      <NuxtLink to="/login" class="btn btn-primary mt-3">Iniciar Sesión</NuxtLink>
    </div>

    <div v-else>
      <div class="loyalty-dashboard">
        <div class="balance-card glass">
          <div class="balance-header">
            <h3>Puntos Arduino</h3>
            <span class="tier-badge" :class="currentTier.toLowerCase()">Nivel {{ currentTier }}</span>
          </div>
          <div class="balance-amount">
            <span class="points">{{ points }}</span>
            <span class="pts-label">pts</span>
          </div>
          <p class="balance-value">
            Equivale a <strong>L. {{ pointsValue.toFixed(2) }}</strong> de descuento en tu próxima compra.
          </p>
        </div>

        <div class="info-card glass">
          <h3>¿Cómo funciona?</h3>
          <ul>
            <li>Ganas <strong>1 punto</strong> por cada <strong>L. {{ config.earnRate }}</strong> que inviertes.</li>
            <li>Cada punto equivale a <strong>L. {{ config.redemptionValue }}</strong> de descuento.</li>
            <li>Los puntos solo aplican para productos que no están en oferta.</li>
            <li>No ganas puntos sobre la parte de la compra pagada con puntos.</li>
          </ul>
          <NuxtLink to="/store" class="btn btn-accent mt-3">Ir a comprar</NuxtLink>
        </div>
      </div>

      <h2 class="section-title">Historial de Puntos</h2>
      <div class="history-table-container glass">
        <div v-if="isLoadingHistory" class="loading-state">
          Cargando historial...
        </div>
        <div v-else-if="transactions.length === 0" class="empty-state">
          No tienes transacciones de puntos todavía.
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Orden #</th>
              <th>Puntos Usados</th>
              <th>Puntos Ganados</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ formatHondurasDateTime(tx.date) }}</td>
              <td>
                <NuxtLink :to="`/order/${tx.orderId}`" class="order-link">{{ tx.orderId }}</NuxtLink>
              </td>
              <td class="used-points">
                <span v-if="tx.usedPoints > 0">-{{ tx.usedPoints }}</span>
                <span v-else>-</span>
              </td>
              <td class="earned-points">
                <span v-if="tx.earnedPoints > 0">+{{ tx.earnedPoints }}</span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useLoyalty } from '~/composables/useLoyalty';

const { isAuthenticated, fetchUser } = useAuth();
const { points, currentTier, config, fetchLoyalty } = useLoyalty();

const transactions = ref<any[]>([]);
const isLoadingHistory = ref(false);

const pointsValue = computed(() => points.value * (config.value?.redemptionValue || 1));

onMounted(async () => {
  await fetchUser();
  if (isAuthenticated.value) {
    await fetchLoyalty();
    await fetchHistory();
  }
});

const fetchHistory = async () => {
  isLoadingHistory.value = true;
  try {
    const data = await $fetch<any>('/api/loyalty/history');
    if (data && data.transactions) {
      transactions.value = data.transactions;
    }
  } catch (e) {
    console.error('Error fetching history', e);
  } finally {
    isLoadingHistory.value = false;
  }
};
</script>

<style scoped>
.coupons-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
  min-height: calc(100vh - 200px);
}
.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.5rem;
  color: var(--text-main);
  margin-top: 3rem;
  margin-bottom: 1.5rem;
}
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
.mt-3 {
  margin-top: 1rem;
}
.loyalty-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.balance-card, .info-card {
  padding: 2rem;
  border-radius: 12px;
}
.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.balance-header h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 1.2rem;
}
.tier-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}
.tier-badge.bronze { background-color: #cd7f32; }
.tier-badge.silver { background-color: #c0c0c0; color: #333; }
.tier-badge.gold { background-color: #ffd700; color: #333; }

.balance-amount {
  margin-bottom: 1rem;
}
.points {
  font-size: 4rem;
  font-weight: 800;
  color: #f39c12;
  line-height: 1;
}
.pts-label {
  font-size: 1.5rem;
  color: var(--text-muted);
  margin-left: 0.5rem;
}
.balance-value {
  font-size: 1.1rem;
  color: var(--text-main);
}

.info-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}
.info-card ul {
  padding-left: 1.5rem;
  color: var(--text-main);
  line-height: 1.6;
}
.info-card li {
  margin-bottom: 0.5rem;
}

.history-table-container {
  overflow-x: auto;
  border-radius: 12px;
}
.used-points {
  color: #e74c3c;
  font-weight: bold;
}
.earned-points {
  color: #2e7d32;
  font-weight: bold;
}
.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}
.order-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
.order-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .loyalty-dashboard {
    grid-template-columns: 1fr;
  }
}
</style>
