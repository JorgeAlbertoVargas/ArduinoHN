<template>
  <div class="part-detail-page container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb-nav">
      <NuxtLink to="/semiconductores" class="breadcrumb-link">← Volver al Catálogo de Semiconductores</NuxtLink>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="detail-loading glass">
      <div class="pulse-chip">
        <img src="/placeholder-chip.svg" alt="Cargando" class="chip-spin" />
      </div>
      <h2>Cargando especificaciones técnicas...</h2>
      <p>Obteniendo datos técnicos de ingeniería en tiempo real.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !product" class="detail-error glass">
      <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <h2>No se encontró el componente</h2>
      <p>{{ error || 'El número de parte solicitado no está disponible en el catálogo de semiconductores.' }}</p>
      <NuxtLink to="/semiconductores" class="btn btn-primary mt-4">Explorar otros componentes</NuxtLink>
    </div>

    <!-- Content -->
    <div v-else class="part-layout">
      <!-- Columna Izquierda: Imagen, Datasheet y Specs -->
      <div class="left-col">
        <div class="product-gallery-card glass">
          <div class="gallery-image-wrapper">
            <img 
              :src="product.image || '/placeholder-chip.svg'" 
              :alt="product.manufacturerPartNumber"
              class="main-part-img"
              @error="handleImageError"
            />
          </div>
          <div class="gallery-badges">
            <span class="status-pill active">{{ product.status }}</span>
            <span class="status-pill rohs">{{ product.rohsStatus }}</span>
            <span v-if="product.packaging" class="status-pill pkg">Empaque: {{ product.packaging }}</span>
          </div>
        </div>

        <!-- Tarjeta de Datasheet Oficial -->
        <div v-if="product.datasheetUrl" class="datasheet-card glass">
          <div class="ds-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="ds-info">
            <h4>Hoja de Datos Oficial (Datasheet)</h4>
            <p>Documento técnico del fabricante con diagramas de pines, curvas eléctricas y encapsulado.</p>
          </div>
          <a 
            :href="product.datasheetUrl" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-secondary ds-download-btn"
          >
            Ver PDF ↗
          </a>
        </div>

        <!-- Tabla de Especificaciones Paramétricas -->
        <div class="specs-card glass">
          <h3 class="section-heading">Especificaciones Técnicas</h3>
          <div v-if="product.parameters && product.parameters.length > 0" class="specs-table">
            <div 
              v-for="(param, idx) in product.parameters" 
              :key="idx" 
              class="spec-row"
            >
              <span class="spec-name">{{ param.name }}</span>
              <span class="spec-value">{{ param.value }}</span>
            </div>
          </div>
          <p v-else class="text-muted">Consulte el datasheet para detalles técnicos adicionales.</p>
        </div>
      </div>

      <!-- Columna Derecha: Cabecera, Stock, Escala de Precios y Compra -->
      <div class="right-col">
        <div class="purchase-box glass">
          <!-- Fabricante y MPN -->
          <div class="mfr-tag">{{ product.manufacturer }}</div>
          <h1 class="part-mpn">{{ product.manufacturerPartNumber }}</h1>
          <div class="part-sku">Código / SKU: <strong>{{ product.digiKeyPartNumber || product.manufacturerPartNumber }}</strong></div>
          <p class="part-desc">{{ product.detailedDescription || product.description }}</p>

          <!-- Stock y Disponibilidad -->
          <div class="stock-panel" :class="{ 'in-stock': product.inStock }">
            <div class="stock-status-line">
              <span class="stock-indicator-dot"></span>
              <strong>{{ product.inStock ? 'Stock Inmediato Disponible' : 'Bajo Pedido de Fábrica' }}</strong>
            </div>
            <div class="stock-count">
              {{ product.stock.toLocaleString() }} unidades listas para despacho
            </div>
            <div v-if="product.leadTimeWeeks" class="lead-time">
              Tiempo estimado de resurtido de fábrica: {{ product.leadTimeWeeks }} semanas.
            </div>
          </div>

          <!-- Selector de Cantidad y Precio Dinámico -->
          <div class="pricing-calculator">
            <div class="unit-price-display">
              <span class="price-hnl-big">{{ formatCurrency(unitPriceHNL, userCurrency) }}</span>
              <span class="price-usd-sub">${{ currentUnitPriceUSD.toFixed(2) }} USD / unidad</span>
            </div>

            <!-- Escala de Precios por Volumen -->
            <div v-if="product.priceBreaks && product.priceBreaks.length > 0" class="volume-tiers-box">
              <div class="tiers-title">Precios por Volumen (Descuentos de Mayoreo):</div>
              <table class="tiers-table">
                <thead>
                  <tr>
                    <th>Cantidad</th>
                    <th>Precio USD</th>
                    <th>Precio HNL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(tier, idx) in product.priceBreaks" 
                    :key="idx"
                    :class="{ active: quantity >= tier.breakQuantity }"
                  >
                    <td>≥ {{ tier.breakQuantity.toLocaleString() }}</td>
                    <td>${{ tier.unitPriceUSD.toFixed(2) }}</td>
                    <td>{{ formatCurrency(convertToHNL(tier.unitPriceUSD), userCurrency) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Aviso de Lote Mínimo -->
            <div v-if="product.minimumOrderQuantity && product.minimumOrderQuantity > 1" class="min-qty-notice">
              📦 Pedido mínimo requerido: <strong>{{ product.minimumOrderQuantity }} unidades</strong>.
            </div>

            <!-- Cantidad y Botón Comprar -->
            <div class="add-cart-action-bar">
              <div class="quantity-picker">
                <button class="qty-btn" @click="decreaseQuantity">-</button>
                <input 
                  type="number" 
                  v-model.number="quantity" 
                  :min="product.minimumOrderQuantity || 1" 
                  :max="product.stock > 0 ? product.stock : 9999" 
                  class="qty-input" 
                />
                <button class="qty-btn" @click="increaseQuantity">+</button>
              </div>

              <button class="btn btn-primary add-to-cart-btn" @click="handleAddToCart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <span>Añadir al Carrito (Total: {{ formatCurrency(totalHNL, userCurrency) }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDigikey, type DigikeyProduct } from '~/composables/useDigikey';
import { formatCurrency } from '~/utils/currencyFormatter';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

const route = useRoute();
const partNumber = route.params.partNumber as string;

const { fetchConfig, userCurrency } = useGlobalCurrencyConfig();
const { loading, error, getPartDetails, convertToHNL, addToCart } = useDigikey();

const product = ref<DigikeyProduct | null>(null);
const quantity = ref(1);

const currentUnitPriceUSD = computed(() => {
  if (!product.value) return 0;
  if (!product.value.priceBreaks || product.value.priceBreaks.length === 0) {
    return product.value.priceUSD;
  }
  // Encontrar el tramo de precio adecuado según la cantidad
  const tiers = [...product.value.priceBreaks].sort((a, b) => b.breakQuantity - a.breakQuantity);
  const matched = tiers.find(t => quantity.value >= t.breakQuantity);
  return matched ? matched.unitPriceUSD : product.value.priceUSD;
});

const unitPriceHNL = computed(() => {
  return convertToHNL(currentUnitPriceUSD.value);
});

const totalHNL = computed(() => {
  return unitPriceHNL.value * quantity.value;
});

const increaseQuantity = () => {
  quantity.value += 1;
};

const decreaseQuantity = () => {
  const min = product.value?.minimumOrderQuantity || 1;
  if (quantity.value > min) {
    quantity.value -= 1;
  }
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder-chip.svg';
};

const handleAddToCart = async () => {
  if (!product.value) return;
  await addToCart(product.value, quantity.value);
};

onMounted(async () => {
  await fetchConfig();
  if (partNumber) {
    product.value = await getPartDetails(partNumber);
    if (product.value?.minimumOrderQuantity) {
      quantity.value = product.value.minimumOrderQuantity;
    }
  }
});

useHead(() => ({
  title: product.value 
    ? `${product.value.manufacturerPartNumber} - ${product.value.manufacturer} | ArduinoHN`
    : 'Detalle de Componente | ArduinoHN',
  meta: [
    {
      name: 'description',
      content: product.value?.description || 'Especificaciones técnicas y compra de semiconductores.'
    }
  ]
}));
</script>

<style scoped>
.part-detail-page {
  padding-top: 2rem;
  padding-bottom: 5rem;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.breadcrumb-link {
  color: var(--color-primary, #00a896);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}

.breadcrumb-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.part-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* Columna Izquierda */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-gallery-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--bg-card, #111827);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-image-wrapper {
  width: 100%;
  height: 320px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.main-part-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.gallery-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-pill.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pill.rohs {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.status-pill.pkg {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.datasheet-card {
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.05);
}

.ds-info {
  flex: 1;
}

.ds-info h4 {
  font-size: 0.95rem;
  color: #ffffff;
  margin-bottom: 2px;
}

.ds-info p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.ds-download-btn {
  white-space: nowrap;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
}

.specs-card {
  padding: 1.5rem;
  border-radius: 16px;
}

.section-heading {
  font-size: 1.15rem;
  color: #ffffff;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.specs-table {
  display: flex;
  flex-direction: column;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
}

.spec-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.spec-name {
  color: #94a3b8;
  font-weight: 500;
}

.spec-value {
  color: #ffffff;
  font-weight: 600;
}

/* Columna Derecha */
.purchase-box {
  padding: 2rem;
  border-radius: 16px;
  position: sticky;
  top: 100px;
}

.mfr-tag {
  color: #38bdf8;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.part-mpn {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin: 4px 0 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.part-sku {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.part-desc {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.stock-panel {
  padding: 1rem;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  margin-bottom: 1.5rem;
}

.stock-panel.in-stock {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.stock-status-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #10b981;
}

.stock-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.stock-count {
  font-size: 0.85rem;
  color: #cbd5e1;
  margin-top: 4px;
}

.lead-time {
  font-size: 0.8rem;
  color: #f59e0b;
  margin-top: 4px;
}

/* Precios y Carrito */
.pricing-calculator {
  border-top: 1px solid var(--glass-border);
  padding-top: 1.5rem;
}

.unit-price-display {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.price-hnl-big {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--color-primary, #00a896);
  letter-spacing: -0.5px;
}

.price-usd-sub {
  font-size: 0.9rem;
  color: #94a3b8;
}

.volume-tiers-box {
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
}

.min-qty-notice {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
  font-size: 0.82rem;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.tiers-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.tiers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.tiers-table th {
  text-align: left;
  color: #64748b;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tiers-table td {
  padding: 5px 8px;
  color: #cbd5e1;
}

.tiers-table tr.active {
  background: rgba(0, 168, 150, 0.15);
  font-weight: 700;
  color: #00a896;
}

.add-cart-action-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quantity-picker {
  display: flex;
  align-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: #090e17;
  height: 48px;
}

.qty-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 40px;
  height: 100%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.qty-input {
  width: 50px;
  height: 100%;
  border: none;
  background: transparent;
  color: #ffffff;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  outline: none;
}

.add-to-cart-btn {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Loading y Error */
.detail-loading, .detail-error {
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 16px;
  max-width: 600px;
  margin: 2rem auto;
}

.pulse-chip {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.chip-spin {
  width: 100%;
  height: 100%;
  animation: floatChip 2s infinite ease-in-out;
}

@keyframes floatChip {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 900px) {
  .part-layout {
    grid-template-columns: 1fr;
  }
  .purchase-box {
    position: static;
  }
}
</style>
