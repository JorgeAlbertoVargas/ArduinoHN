<template>
  <div class="admin-matrix-config-container">
    <!-- Breadcrumb & Header -->
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <span>Análisis De Producto</span>
          <span class="separator">/</span>
          <span class="current">Ajustes de Criterios & Filtros</span>
        </div>
        <h1 class="matrix-config-title">Ajustes de Criterios & Filtros Maestros</h1>
        <p class="matrix-config-subtitle">Personaliza los criterios, pesos ponderados y filtros obligatorios utilizados en la Matriz de Evaluación de Productos.</p>
      </div>

      <div class="header-actions">
        <NuxtLink to="/admin/product-matrix" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
          <span>Ir a la Matriz</span>
        </NuxtLink>
        <button class="btn btn-outline" @click="restoreDefaults">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>Restaurar Valores por Defecto</span>
        </button>
        <button class="btn btn-primary" @click="saveConfiguration" :disabled="isSaving">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>{{ isSaving ? 'Guardando...' : 'Guardar Configuración' }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

    <!-- Tab Navigation -->
    <div class="config-tabs-nav">
      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeTab === 'criteria' }"
        @click="activeTab = 'criteria'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
        <span>Criterios Ponderados ({{ criteriaList.length }})</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeTab === 'filters' }"
        @click="activeTab = 'filters'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Filtros Obligatorios ({{ filtersList.length }})</span>
      </button>
    </div>

    <!-- TAB 1: CRITERIOS PONDERADOS -->
    <div v-show="activeTab === 'criteria'" class="tab-content-panel">
      <!-- Weight Summary Banner -->
      <div class="weight-summary-card glass" :class="totalWeight === 100 ? 'weight-ok' : 'weight-warning'">
        <div class="weight-info">
          <div class="weight-label">Suma Total de Pesos Ponderados:</div>
          <div class="weight-score">{{ totalWeight }}%</div>
        </div>
        <div class="weight-status-text">
          <span v-if="totalWeight === 100" class="status-ok-badge">✓ Ponderación Perfecta (100%)</span>
          <span v-else class="status-warn-badge">⚠️ La suma debe ser exactamente 100% (Actual: {{ totalWeight }}%)</span>
        </div>
      </div>

      <div class="table-container glass">
        <table class="config-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-id">Nº</th>
              <th class="col-name">Descripción del Criterio</th>
              <th class="col-weight">Peso (%)</th>
              <th class="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in criteriaList" :key="item.id">
              <td class="col-id text-center font-bold">{{ index + 1 }}</td>
              <td class="col-name">
                <input 
                  type="text" 
                  v-model="item.criterio" 
                  placeholder="Descripción del criterio..." 
                  class="form-control"
                />
              </td>
              <td class="col-weight text-center">
                <div class="input-weight-wrapper">
                  <input 
                    type="number" 
                    v-model.number="item.peso" 
                    min="0" 
                    max="100" 
                    class="form-control text-center font-bold"
                  />
                  <span class="pct-addon">%</span>
                </div>
              </td>
              <td class="col-actions text-center">
                <button class="delete-btn" @click="removeCriterion(index)" title="Eliminar criterio">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="text-center font-bold" colspan="2">TOTAL PONDERADO</td>
              <td class="text-center font-bold" :class="totalWeight === 100 ? 'text-success' : 'text-danger'">
                {{ totalWeight }}%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="table-footer-actions">
          <button class="btn btn-add" @click="addCriterion">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span>Agregar Nuevo Criterio</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: FILTROS OBLIGATORIOS -->
    <div v-show="activeTab === 'filters'" class="tab-content-panel">
      <div class="table-container glass">
        <table class="config-table">
          <thead>
            <tr class="table-header-row filters-header">
              <th class="col-id">Nº</th>
              <th class="col-filter-name">Filtro Obligatorio</th>
              <th class="col-filter-cond">Condición Mínima Requerida</th>
              <th class="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(f, index) in filtersList" :key="f.id">
              <td class="col-id text-center font-bold">{{ index + 1 }}</td>
              <td class="col-filter-name">
                <input 
                  type="text" 
                  v-model="f.filtro" 
                  placeholder="Nombre del filtro..." 
                  class="form-control font-bold"
                />
              </td>
              <td class="col-filter-cond">
                <input 
                  type="text" 
                  v-model="f.condicion" 
                  placeholder="Condición requerida para aprobar..." 
                  class="form-control"
                />
              </td>
              <td class="col-actions text-center">
                <button class="delete-btn" @click="removeFilter(index)" title="Eliminar filtro">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer-actions">
          <button class="btn btn-add" @click="addFilter">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span>Agregar Nuevo Filtro Obligatorio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { isAdmin, fetchUser } = useAuth()
const router = useRouter()

const activeTab = ref<'criteria' | 'filters'>('criteria')
const isSaving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const criteriaList = ref<any[]>([])
const filtersList = ref<any[]>([])
const defaultCriteria = ref<any[]>([])
const defaultMandatoryFilters = ref<any[]>([])

const totalWeight = computed(() => {
  return criteriaList.value.reduce((acc, c) => acc + (Number(c.peso) || 0), 0)
})

onMounted(async () => {
  await fetchUser()
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await loadConfig()
})

const loadConfig = async () => {
  try {
    const res = await $fetch<any>('/api/admin/product-matrix?action=config')
    if (res) {
      criteriaList.value = JSON.parse(JSON.stringify(res.criteria || []))
      filtersList.value = JSON.parse(JSON.stringify(res.mandatoryFilters || []))
      defaultCriteria.value = res.defaultCriteria || []
      defaultMandatoryFilters.value = res.defaultMandatoryFilters || []
    }
  } catch (e) {
    errorMsg.value = 'Error al cargar la configuración de criterios.'
  }
}

const addCriterion = () => {
  const nextId = criteriaList.value.length > 0 ? Math.max(...criteriaList.value.map(c => c.id || 0)) + 1 : 1
  criteriaList.value.push({
    id: nextId,
    criterio: '',
    peso: 0
  })
}

const removeCriterion = (index: number) => {
  if (confirm('¿Eliminar este criterio de la lista?')) {
    criteriaList.value.splice(index, 1)
  }
}

const addFilter = () => {
  const nextId = filtersList.value.length > 0 ? Math.max(...filtersList.value.map(f => f.id || 0)) + 1 : 1
  filtersList.value.push({
    id: nextId,
    filtro: '',
    condicion: ''
  })
}

const removeFilter = (index: number) => {
  if (confirm('¿Eliminar este filtro obligatorio?')) {
    filtersList.value.splice(index, 1)
  }
}

const restoreDefaults = () => {
  if (!confirm('¿Restaurar los 21 criterios y 8 filtros a los valores originales de fábrica?')) return
  criteriaList.value = JSON.parse(JSON.stringify(defaultCriteria.value))
  filtersList.value = JSON.parse(JSON.stringify(defaultMandatoryFilters.value))
  successMsg.value = 'Valores por defecto cargados en el editor. Haz clic en Guardar Configuración para aplicar.'
  setTimeout(() => { successMsg.value = '' }, 4000)
}

const saveConfiguration = async () => {
  if (totalWeight.value !== 100) {
    if (!confirm(`La suma de pesos es ${totalWeight.value}% (recomendado: 100%). ¿Deseas guardar de todos modos?`)) {
      return
    }
  }

  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await $fetch('/api/admin/product-matrix?action=config', {
      method: 'POST',
      body: {
        __isMasterConfig: true,
        criteria: criteriaList.value,
        mandatoryFilters: filtersList.value
      }
    })

    successMsg.value = '¡Configuración maestra de criterios y filtros guardada correctamente!'
    setTimeout(() => { successMsg.value = '' }, 3500)
  } catch (e) {
    errorMsg.value = 'Error al guardar la configuración maestra.'
  } finally {
    isSaving.value = false
  }
}

useHead({
  title: 'Ajustes de Criterios & Filtros - ArduinoHN Admin'
})
</script>

<style scoped>
.admin-matrix-config-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 0.35rem;
}

.admin-breadcrumb a {
  color: var(--color-primary, #00979c);
  text-decoration: none;
}

.admin-breadcrumb .separator {
  opacity: 0.5;
}

.admin-breadcrumb .current {
  font-weight: 600;
  color: var(--text-main);
}

.matrix-config-title {
  color: var(--text-main);
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.matrix-config-subtitle {
  color: var(--text-muted, #64748b);
  font-size: 0.88rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-main);
}

.btn-outline:hover {
  background: rgba(0, 151, 156, 0.08);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Tabs */
.config-tabs-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  font-family: var(--font-family);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(0, 151, 156, 0.05);
}

.tab-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 151, 156, 0.25);
}

/* Weight Summary Card */
.weight-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--glass-border);
}

.weight-ok {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.weight-warning {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}

.weight-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.weight-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
}

.weight-score {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-primary, #00979c);
}

.status-ok-badge {
  font-weight: 700;
  color: #10b981;
  font-size: 0.88rem;
}

.status-warn-badge {
  font-weight: 700;
  color: #ef4444;
  font-size: 0.88rem;
}

/* Table */
.table-container {
  background: var(--bg-card);
  border: 1px solid rgba(0, 151, 156, 0.35);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.config-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-row th {
  background: linear-gradient(135deg, var(--color-primary, #00979C) 0%, #007e82 100%);
  color: #ffffff;
  font-weight: 700;
  padding: 10px 14px;
  font-size: 0.85rem;
  text-align: left;
}

.table-header-row.filters-header th {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
}

.config-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--glass-border);
  vertical-align: middle;
}

.col-id {
  width: 50px;
}

.col-weight {
  width: 140px;
}

.col-actions {
  width: 80px;
}

.col-filter-name {
  width: 35%;
}

.col-filter-cond {
  width: 55%;
}

/* Inputs */
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #1e293b;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

:global([data-theme="dark"]) .form-control {
  background-color: #242b35;
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.form-control:focus {
  outline: none;
  background-color: #ffffff;
  border-color: var(--color-primary, #00979C);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

.input-weight-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 100px;
}

.pct-addon {
  font-weight: 700;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.total-row {
  background: #f8fafc;
  border-top: 2px solid #cbd5e1;
  font-size: 0.95rem;
}

:global([data-theme="dark"]) .total-row {
  background: #1e293b;
  border-color: #475569;
}

.text-success {
  color: #10b981;
}

.text-danger {
  color: #ef4444;
}

.table-footer-actions {
  padding: 14px 18px;
  background: rgba(0, 151, 156, 0.03);
  border-top: 1px solid var(--glass-border);
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 151, 156, 0.1);
  color: var(--color-primary);
  border: 1px dashed var(--color-primary);
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
  font-size: 0.88rem;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 700;
}
</style>
