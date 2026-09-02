<template>
  <div class="digikey-card glass" @click="goToDetail">
    <!-- Header de la tarjeta: Fabricante y Badge de Stock -->
    <div class="card-top-meta">
      <span class="mfr-badge" :title="product.manufacturer">{{ product.manufacturer }}</span>
      <span v-if="product.inStock" class="stock-badge in-stock">
        <span class="stock-dot"></span> {{ product.stock.toLocaleString() }} en stock
      </span>
      <span v-else class="stock-badge out-of-stock">
        Bajo Pedido
      </span>
    </div>

    <!-- Imagen del componente -->
    <div class="card-image-wrapper">
      <img 
        :src="product.image || '/placeholder-chip.svg'" 
        :alt="product.manufacturerPartNumber"
        class="component-img"
        loading="lazy"
        @error="handleImageError"
      />
    </div>

    <!-- Información técnica central -->
    <div class="card-body">
      <div class="mpn-title" :title="product.manufacturerPartNumber">
        {{ product.manufacturerPartNumber }}
      </div>
      <div class="dk-sku">
        SKU: <strong>{{ product.digiKeyPartNumber || product.manufacturerPartNumber }}</strong>
      </div>
      
      <!-- Botón de Datasheet PDF debajo del SKU -->
      <div v-if="product.datasheetUrl" class="datasheet-row">
        <a 
          :href="product.datasheetUrl" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="datasheet-pill-btn"
          title="Abrir Hoja de Datos Oficial (PDF)"
          @click.stop
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Datasheet (PDF)</span>
        </a>
      </div>

      <p class="description-text" :title="product.description">
        {{ product.description }}
      </p>

      <!-- Mini chips de especificaciones -->
      <div v-if="featuredParams.length > 0" class="param-tags">
        <span v-for="(param, idx) in featuredParams" :key="idx" class="param-chip" :title="`${param.name}: ${param.value}`">
          {{ param.name }}: <strong>{{ param.value }}</strong>
        </span>
      </div>
    </div>

    <!-- Footer: Precios y Acciones -->
    <div class="card-footer">
      <div class="pricing-block">
        <div class="main-price">{{ formatCurrency(priceHNL, userCurrency) }}</div>
        <div class="usd-subprice">
          ${{ product.priceUSD.toFixed(2) }} USD / ud
        </div>
        <div v-if="product.minimumOrderQuantity && product.minimumOrderQuantity > 1" class="min-order-tag">
          Pack mín: {{ product.minimumOrderQuantity }} uds ({{ formatCurrency(priceHNL * product.minimumOrderQuantity, userCurrency) }})
        </div>
        <div v-else-if="lowestVolumePriceUSD" class="volume-hint">
          Desde ${{ lowestVolumePriceUSD }} @ mayoreo
        </div>
      </div>

      <div class="actions-row">
        <button 
          class="btn-dk-cart" 
          :title="product.minimumOrderQuantity > 1 ? `Añadir pack de ${product.minimumOrderQuantity} unidades` : 'Añadir al carrito'"
          @click.stop="handleAddToCart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span>{{ product.minimumOrderQuantity > 1 ? `+${product.minimumOrderQuantity}` : 'Agregar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { DigikeyProduct } from '~/composables/useDigikey';
import { useDigikey } from '~/composables/useDigikey';
import { formatCurrency } from '~/utils/currencyFormatter';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

const props = defineProps<{
  product: DigikeyProduct;
}>();

const emit = defineEmits(['add-to-cart']);
const router = useRouter();
const { userCurrency } = useGlobalCurrencyConfig();
const { convertToHNL, addToCart } = useDigikey();

const priceHNL = computed(() => {
  return convertToHNL(props.product.priceUSD);
});

const lowestVolumePriceUSD = computed(() => {
  if (props.product.priceBreaks && props.product.priceBreaks.length > 1) {
    const last = props.product.priceBreaks[props.product.priceBreaks.length - 1];
    return last.unitPriceUSD.toFixed(2);
  }
  return null;
});

const featuredParams = computed(() => {
  if (!props.product.parameters) return [];
  // Filtrar los primeros 2 parámetros relevantes
  return props.product.parameters.slice(0, 2);
});

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder-chip.svg';
};

const goToDetail = () => {
  const identifier = props.product.digiKeyPartNumber || props.product.manufacturerPartNumber;
  router.push(`/semiconductores/${encodeURIComponent(identifier)}`);
};

const handleAddToCart = async () => {
  const qty = props.product.minimumOrderQuantity || 1;
  await addToCart(props.product, qty);
  emit('add-to-cart', props.product);
};
</script>

<style scoped>
.digikey-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card, #111827);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
}

.digikey-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary, #00a896);
  box-shadow: 0 12px 28px rgba(0, 168, 150, 0.15);
}

.card-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 6px;
  gap: 8px;
}

.mfr-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.stock-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.stock-badge.in-stock {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.stock-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
  box-shadow: 0 0 6px #10b981;
}

.stock-badge.out-of-stock {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.card-image-wrapper {
  height: 160px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 12px;
  margin: 6px 12px;
  border-radius: 8px;
}

.component-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.digikey-card:hover .component-img {
  transform: scale(1.05);
}

.datasheet-row {
  margin: 4px 0 8px;
  display: flex;
}

.datasheet-pill-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  font-size: 0.73rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  border: 1px solid rgba(239, 68, 68, 0.3);
  transition: all 0.2s ease;
  width: fit-content;
}

.datasheet-pill-btn:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

.card-body {
  padding: 10px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mpn-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.dk-sku {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  margin-bottom: 6px;
}

.description-text {
  font-size: 0.82rem;
  color: var(--text-muted, #cbd5e1);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
  min-height: 2.2rem;
}

.param-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
}

.param-chip {
  font-size: 0.7rem;
  background: rgba(0, 168, 150, 0.08);
  border: 1px solid rgba(0, 168, 150, 0.2);
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-chip strong {
  color: #00a896;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
  background: rgba(0, 0, 0, 0.15);
}

.pricing-block {
  display: flex;
  flex-direction: column;
}

.main-price {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary, #00a896);
  letter-spacing: -0.5px;
}

.usd-subprice {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
}

.volume-hint {
  color: #38bdf8;
  display: block;
  font-size: 0.7rem;
}

.min-order-tag {
  color: #f59e0b;
  font-size: 0.72rem;
  font-weight: 700;
  display: block;
  margin-top: 2px;
}

.btn-dk-cart {
  background: var(--color-primary, #00a896);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-dk-cart:hover {
  background: var(--color-secondary, #008f80);
  transform: translateY(-1px);
}
</style>
