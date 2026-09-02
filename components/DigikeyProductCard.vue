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

    <!-- Imagen del componente estandarizada -->
    <div class="card-image-wrapper">
      <img 
        :src="getComponentImage(product)" 
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
      
      <!-- Fila de Datasheet PDF (altura estandarizada) -->
      <div class="datasheet-row">
        <a 
          v-if="product.datasheetUrl"
          :href="product.datasheetUrl" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="datasheet-pill-btn"
          title="Abrir Hoja de Datos Oficial (PDF)"
          @click.stop
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Datasheet (PDF)</span>
        </a>
        <span v-else class="datasheet-placeholder">
          <span>Especificación directa</span>
        </span>
      </div>

      <p class="description-text" :title="product.description">
        {{ product.description }}
      </p>

      <!-- Mini chips de especificaciones (altura estandarizada) -->
      <div class="param-tags">
        <template v-if="featuredParams.length > 0">
          <span v-for="(param, idx) in featuredParams" :key="idx" class="param-chip" :title="`${param.name}: ${param.value}`">
            {{ param.name }}: <strong>{{ param.value }}</strong>
          </span>
        </template>
        <span v-else class="param-chip-empty">
          Componente grado industrial original
        </span>
      </div>
    </div>

    <!-- Footer: Precios y Acciones (Altura 100% estandarizada e idéntica) -->
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
        <div v-else class="min-order-spacer"></div>
      </div>

      <div class="actions-row">
        <button 
          class="btn-dk-cart" 
          :title="product.minimumOrderQuantity > 1 ? `Añadir pack de ${product.minimumOrderQuantity} unidades` : 'Añadir al carrito'"
          @click.stop="handleAddToCart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
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
import { getComponentImage, getComponentPlaceholder } from '~/utils/componentImage';

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
  return props.product.parameters.slice(0, 2);
});

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = getComponentPlaceholder(props.product);
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
  height: 100%;
  min-height: 480px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--glass-border, rgba(0, 168, 150, 0.15));
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* Efecto Cebra Alternante en Catálogo */
:global(.catalog-grid > .digikey-card:nth-child(even)) {
  background: rgba(248, 250, 252, 0.9);
}

:global(.catalog-grid > .digikey-card:nth-child(odd)) {
  background: #ffffff;
}

/* Hover Estandarizado con Base ArduinoHN */
.digikey-card:hover {
  transform: translateY(-6px);
  border-color: var(--color-primary, #00a896) !important;
  background: linear-gradient(180deg, rgba(0, 168, 150, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%), #ffffff !important;
  box-shadow: 0 16px 32px rgba(0, 168, 150, 0.18), 0 0 0 1px rgba(0, 168, 150, 0.4);
}

.card-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  padding: 8px 14px 4px;
  gap: 8px;
}

.mfr-badge {
  font-size: 0.73rem;
  font-weight: 800;
  color: var(--color-primary, #00a896);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.stock-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.stock-badge.in-stock {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
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
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* Imagen con contenedor idéntico */
.card-image-wrapper {
  height: 155px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 10px;
  margin: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.component-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.digikey-card:hover .component-img {
  transform: scale(1.06);
}

.card-body {
  padding: 8px 14px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mpn-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  height: 1.3rem;
  line-height: 1.3rem;
}

.dk-sku {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 6px;
  height: 1rem;
  line-height: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.datasheet-row {
  height: 28px;
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.datasheet-pill-btn {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  border: 1px solid rgba(239, 68, 68, 0.25);
  transition: all 0.2s ease;
}

.datasheet-pill-btn:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.datasheet-placeholder {
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
}

.description-text {
  font-size: 0.8rem;
  color: var(--text-muted, #475569);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.25rem;
  margin-bottom: 8px;
}

.param-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 48px;
  overflow: hidden;
  margin-top: auto;
}

.param-chip {
  font-size: 0.68rem;
  background: rgba(0, 168, 150, 0.06);
  border: 1px solid rgba(0, 168, 150, 0.18);
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-chip strong {
  color: var(--color-primary, #00a896);
}

.param-chip-empty {
  font-size: 0.68rem;
  color: #94a3b8;
  font-style: italic;
  padding-top: 4px;
}

/* Footer 100% Estandarizado */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 84px;
  padding: 10px 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(241, 245, 249, 0.7);
  transition: background 0.25s ease;
}

.digikey-card:hover .card-footer {
  background: rgba(0, 168, 150, 0.08);
}

.pricing-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
  padding-right: 8px;
}

.main-price {
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--color-primary, #00a896);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.usd-subprice {
  font-size: 0.7rem;
  color: var(--text-muted, #64748b);
  line-height: 1.2;
}

.volume-hint {
  color: #0284c7;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.min-order-tag {
  color: #d97706;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.min-order-spacer {
  height: 0.68rem;
}

.btn-dk-cart {
  background: var(--color-primary, #00a896);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 168, 150, 0.25);
}

.btn-dk-cart:hover {
  background: var(--color-secondary, #008f80);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 168, 150, 0.4);
}
</style>
