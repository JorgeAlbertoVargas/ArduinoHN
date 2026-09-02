<template>
  <div class="semiconductors-page">
    <!-- Marquesina Hero Profesional de Semiconductores -->
    <SemiconductorsHeroCarousel @filter-select="handleHeroFilter" />

    <!-- Sección de Búsqueda y Filtrado -->
    <div id="search-catalog-section" class="semi-search-section">
      <div class="container hero-container">
        <!-- Buscador Central Avanzado -->
        <div class="search-box-wrapper glass">
          <form class="search-form" @submit.prevent="triggerSearch">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Microcontroller" 
              class="semi-search-input"
            />
            <button v-if="searchQuery" type="button" class="clear-btn" @click="clearSearch" title="Limpiar">
              ✕
            </button>
            <button type="submit" class="btn btn-primary semi-search-btn" :disabled="loading">
              <span v-if="!loading">Buscar</span>
              <span v-else class="loader-spinner"></span>
            </button>
          </form>

          <!-- Filtro rápido de Stock -->
          <div class="search-filters-bar">
            <label class="stock-toggle-label">
              <input type="checkbox" v-model="inStockOnly" @change="triggerSearch" />
              <span>Solo piezas con stock disponible</span>
            </label>
            
            <div class="total-results-tag" v-if="totalCount > 0">
              <span>{{ totalCount.toLocaleString() }} componentes encontrados</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categorías Rápidas de Semiconductores -->
    <div class="container categories-section">
      <div class="categories-scroll">
        <button 
          class="cat-chip" 
          :class="{ active: selectedCategory === '' && !selectedManufacturer }" 
          @click="selectCategory('', 'Microcontroller')"
        >
          <span v-if="selectedCategory === '' && !selectedManufacturer" class="pointer-icon">👉</span>
          <span>Todos / Populares</span>
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          class="cat-chip"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectCategory(cat.id, cat.query)"
        >
          <span v-if="selectedCategory === cat.id" class="pointer-icon">👉</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- Filtro de Fabricantes Principales con Indicador Activo -->
      <div class="mfr-chips-row">
        <span class="mfr-label">Fabricantes Top:</span>
        <button 
          v-for="mfr in topManufacturers" 
          :key="mfr"
          class="mfr-pill"
          :class="{ 'mfr-active': selectedManufacturer === mfr }"
          @click="toggleManufacturer(mfr)"
        >
          <span v-if="selectedManufacturer === mfr" class="mfr-pointer-indicator">👉</span>
          <span>{{ mfr }}</span>
          <span v-if="selectedManufacturer === mfr" class="mfr-close-icon" title="Quitar filtro">✕</span>
        </button>
      </div>

      <!-- Barra Guía de Filtro Activo -->
      <div v-if="selectedManufacturer || selectedCategory" class="active-filter-banner glass">
        <div class="banner-left">
          <span class="banner-hand">👉</span>
          <span class="banner-text">
            Filtrando actualmente por: 
            <strong v-if="selectedManufacturer" class="filter-highlight">Fabricante: {{ selectedManufacturer }}</strong>
            <strong v-if="selectedManufacturer && selectedCategory"> + </strong>
            <strong v-if="selectedCategory" class="filter-highlight">Categoría: {{ getCategoryName(selectedCategory) }}</strong>
          </span>
        </div>
        <button class="clear-filter-badge-btn" @click="resetAllFilters">
          Limpiar filtro ✕
        </button>
      </div>
    </div>

    <!-- Contenido del Catálogo -->
    <div class="container catalog-container">
      <!-- Loading State -->
      <div v-if="loading" class="state-box glass">
        <div class="pulse-chip">
          <img src="/placeholder-chip.svg" alt="Cargando" class="chip-spin" />
        </div>
        <h3>Consultando inventario de semiconductores...</h3>
        <p>Obteniendo stock, fichas técnicas y cotizaciones en tiempo real.</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && products.length === 0" class="state-box glass error-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3>No se pudo cargar la información</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary mt-3" @click="triggerSearch">Reintentar</button>
      </div>

      <!-- Empty State con Sugerencias Claras -->
      <div v-else-if="products.length === 0" class="state-box glass empty-suggestions-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No encontramos componentes para "{{ activeQuery }}"</h3>
        <p>Prueba seleccionando uno de los fabricantes recomendados o una familia popular:</p>
        
        <div class="empty-suggestions-group mt-3">
          <div class="suggestions-label">👉 Elige un fabricante destacado:</div>
          <div class="suggestions-chips">
            <button 
              v-for="mfr in topManufacturers.slice(0, 4)" 
              :key="mfr" 
              class="btn btn-secondary btn-sm suggestion-chip"
              @click="toggleManufacturer(mfr)"
            >
              👉 {{ mfr }}
            </button>
          </div>

          <div class="suggestions-label mt-3">O busca por un integrado popular:</div>
          <div class="suggestions-chips">
            <button class="btn btn-secondary btn-sm suggestion-chip" @click="searchByPopularPart('STM32F401')">STM32F401</button>
            <button class="btn btn-secondary btn-sm suggestion-chip" @click="searchByPopularPart('ESP32')">ESP32</button>
            <button class="btn btn-secondary btn-sm suggestion-chip" @click="searchByPopularPart('NE555')">NE555</button>
            <button class="btn btn-secondary btn-sm suggestion-chip" @click="searchByPopularPart('LM358')">LM358</button>
          </div>
        </div>

        <button class="btn btn-primary mt-4" @click="resetAllFilters">
          Ver Catálogo Completo / Resetear Filtros
        </button>
      </div>

      <!-- Grid de Productos -->
      <div v-else class="catalog-grid">
        <DigikeyProductCard 
          v-for="part in products" 
          :key="part.id" 
          :product="part"
        />
      </div>

      <!-- Paginación -->
      <div v-if="products.length > 0 && totalCount > limit" class="pagination-bar glass">
        <button 
          class="btn btn-secondary page-btn" 
          :disabled="offset === 0 || loading" 
          @click="changePage(offset - limit)"
        >
          ← Anterior
        </button>
        <span class="page-info">
          Mostrando {{ offset + 1 }} - {{ Math.min(offset + products.length, totalCount) }} de {{ totalCount.toLocaleString() }}
        </span>
        <button 
          class="btn btn-secondary page-btn" 
          :disabled="offset + limit >= totalCount || loading" 
          @click="changePage(offset + limit)"
        >
          Siguiente →
        </button>
      </div>

      <!-- Banner Informativo de Beneficios Distribución ArduinoHN -->
      <div class="benefits-card glass mt-5">
        <div class="benefit-item">
          <div class="benefit-icon">🛡️</div>
          <div>
            <h4>100% Original & Trazable</h4>
            <p>Componentes directos de fábricas autorizadas a nivel global, garantizando máxima calidad.</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">📦</div>
          <div>
            <h4>Distribución & Envíos Rápidos</h4>
            <p>Entrega segura y consolidada en cualquier ciudad o departamento de Honduras.</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">📄</div>
          <div>
            <h4>Datasheets & Soporte Técnico</h4>
            <p>Acceso instantáneo a especificaciones técnicas, esquemáticos y modelos CAD para ingeniería.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDigikey, type DigikeyProduct } from '~/composables/useDigikey';
import DigikeyProductCard from '~/components/DigikeyProductCard.vue';
import SemiconductorsHeroCarousel from '~/components/SemiconductorsHeroCarousel.vue';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

const route = useRoute();
const router = useRouter();
const { fetchConfig } = useGlobalCurrencyConfig();
const { loading, error, searchParts, categories } = useDigikey();

const searchQuery = ref((route.query.q as string) || '');
const activeQuery = ref(searchQuery.value || 'Microcontroller');
const inStockOnly = ref(false);
const selectedCategory = ref('');
const selectedManufacturer = ref('');
const products = ref<DigikeyProduct[]>([]);
const totalCount = ref(0);
const offset = ref(0);
const limit = ref(24);

const handleHeroFilter = (query: string) => {
  if (query) {
    searchQuery.value = query;
    const catMatch = categories.find(c => c.query.toLowerCase() === query.toLowerCase());
    if (catMatch) {
      selectedCategory.value = catMatch.id;
    } else {
      selectedCategory.value = '';
    }
  } else {
    searchQuery.value = 'Microcontroller';
    selectedCategory.value = '';
  }
  selectedManufacturer.value = '';
  offset.value = 0;
  executeSearch();
};

const topManufacturers = [
  'STMicroelectronics',
  'Texas Instruments',
  'Microchip',
  'Espressif Systems',
  'NXP Semiconductors',
  'Infineon',
  'Analog Devices',
  'Raspberry Pi'
];

useHead({
  title: 'Semiconductores & Componentes Globales | ArduinoHN',
  meta: [
    {
      name: 'description',
      content: 'Catálogo de semiconductores, microcontroladores y circuitos integrados originales con envíos a todo Honduras.'
    }
  ]
});

const getCategoryName = (catId: string) => {
  const found = categories.find(c => c.id === catId);
  return found ? found.name : catId;
};

const executeSearch = async () => {
  let q = searchQuery.value.trim();
  
  if (selectedManufacturer.value && selectedCategory.value) {
    const cat = categories.find(c => c.id === selectedCategory.value);
    q = `${selectedManufacturer.value} ${cat ? cat.query : ''}`.trim();
  } else if (selectedManufacturer.value) {
    q = selectedManufacturer.value;
  } else if (selectedCategory.value) {
    const cat = categories.find(c => c.id === selectedCategory.value);
    q = cat ? cat.query : selectedCategory.value;
  } else if (!q) {
    q = 'Microcontroller';
  }

  activeQuery.value = q;
  
  const res = await searchParts(q, {
    limit: limit.value,
    offset: offset.value,
    inStockOnly: inStockOnly.value
  });

  products.value = res.products || [];
  totalCount.value = res.totalCount || 0;
};

const triggerSearch = () => {
  offset.value = 0;
  executeSearch();
};

const clearSearch = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  selectedManufacturer.value = '';
  offset.value = 0;
  executeSearch();
};

const selectCategory = (catId: string, query: string) => {
  selectedCategory.value = catId;
  searchQuery.value = query;
  offset.value = 0;
  executeSearch();
};

const toggleManufacturer = (mfr: string) => {
  if (selectedManufacturer.value === mfr) {
    selectedManufacturer.value = '';
    searchQuery.value = selectedCategory.value ? '' : 'Microcontroller';
  } else {
    selectedManufacturer.value = mfr;
    searchQuery.value = mfr;
  }
  offset.value = 0;
  executeSearch();
};

const searchByPopularPart = (mpn: string) => {
  searchQuery.value = mpn;
  selectedCategory.value = '';
  selectedManufacturer.value = '';
  offset.value = 0;
  executeSearch();
};

const resetAllFilters = () => {
  selectedCategory.value = '';
  selectedManufacturer.value = '';
  searchQuery.value = '';
  offset.value = 0;
  executeSearch();
};

const changePage = (newOffset: number) => {
  offset.value = newOffset;
  executeSearch();
  if (import.meta.client) {
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
};

onMounted(async () => {
  await fetchConfig();
  await executeSearch();
});
</script>

<style scoped>
.semiconductors-page {
  min-height: 100vh;
  padding-bottom: 5rem;
}

/* Sección del Buscador */
.semi-search-section {
  background: radial-gradient(circle at 50% -20%, rgba(0, 168, 150, 0.15), transparent 70%),
              linear-gradient(180deg, #090e17 0%, #0f172a 100%);
  padding: 2.25rem 1rem 1.5rem;
  border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

/* Buscador */
.search-box-wrapper {
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.75);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
}

.search-form {
  display: flex;
  align-items: center;
  background: #090e17;
  border: 1px solid rgba(0, 168, 150, 0.4);
  border-radius: 12px;
  padding: 4px 6px;
  gap: 8px;
  transition: border-color 0.2s;
}

.search-form:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.input-icon {
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.semi-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  padding: 10px 4px;
  outline: none;
  font-family: inherit;
}

.semi-search-input::placeholder {
  color: #64748b;
  font-size: 0.92rem;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px 10px;
  font-size: 1rem;
}

.clear-btn:hover {
  color: #ffffff;
}

.semi-search-btn {
  padding: 10px 22px;
  font-weight: 700;
  border-radius: 8px;
  white-space: nowrap;
}

.search-filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 4px 6px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.stock-toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.stock-toggle-label input {
  accent-color: var(--color-primary, #00a896);
  width: 16px;
  height: 16px;
}

/* Categorías y Chips */
.categories-section {
  padding-top: 1.5rem;
  padding-bottom: 0.5rem;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.cat-chip {
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
  color: #cbd5e1;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cat-chip:hover {
  border-color: var(--color-primary, #00a896);
  color: #ffffff;
}

.cat-chip.active {
  background: var(--color-primary, #00a896);
  border-color: var(--color-primary, #00a896);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 168, 150, 0.4);
  font-weight: 700;
}

.pointer-icon {
  display: inline-block;
  font-size: 0.95rem;
  animation: bounceHand 1.2s infinite ease-in-out;
}

.mfr-chips-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 0.82rem;
}

.mfr-label {
  color: #64748b;
  font-weight: 600;
}

.mfr-pill {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  color: #94a3b8;
  padding: 4px 11px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mfr-pill:hover {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

.mfr-pill.mfr-active {
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid #38bdf8;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
}

.mfr-pointer-indicator {
  font-size: 0.9rem;
  display: inline-block;
  animation: bounceHand 1.2s infinite ease-in-out;
}

.mfr-close-icon {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  opacity: 0.8;
}

.mfr-close-icon:hover {
  opacity: 1;
}

/* Banner de Filtro Activo */
.active-filter-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 168, 150, 0.1);
  border: 1px solid rgba(0, 168, 150, 0.3);
  border-radius: 10px;
  padding: 8px 14px;
  margin-top: 14px;
  animation: fadeIn 0.3s ease;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.banner-hand {
  font-size: 1.1rem;
  animation: bounceHand 1.2s infinite ease-in-out;
}

.filter-highlight {
  color: #38bdf8;
  font-weight: 700;
}

.clear-filter-badge-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-badge-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

@keyframes bounceHand {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Catálogo Grid */
.catalog-container {
  padding-top: 1.5rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.5rem;
}

/* Estados */
.state-box {
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 16px;
  max-width: 600px;
  margin: 2rem auto;
}

.state-box h3 {
  font-size: 1.3rem;
  color: #ffffff;
  margin: 1rem 0 0.5rem;
}

.state-box p {
  color: #94a3b8;
  font-size: 0.95rem;
}

.empty-suggestions-box {
  max-width: 680px;
}

.empty-suggestions-group {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--glass-border);
}

.suggestions-label {
  font-size: 0.85rem;
  color: #38bdf8;
  font-weight: 700;
  text-align: left;
  margin-bottom: 8px;
}

.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.suggestion-chip {
  font-size: 0.82rem;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  color: #cbd5e1;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: var(--color-primary);
  color: #ffffff;
  transform: translateY(-1px);
}

.error-box {
  border-color: rgba(239, 68, 68, 0.3);
}

.pulse-chip {
  width: 70px;
  height: 70px;
  margin: 0 auto;
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

.loader-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Paginación */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-top: 2.5rem;
}

.page-info {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Beneficios */
.benefits-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 16px;
  margin-top: 3.5rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 2rem;
  line-height: 1;
}

.benefit-item h4 {
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 0.35rem;
}

.benefit-item p {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.85rem;
  }
  .search-filters-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
