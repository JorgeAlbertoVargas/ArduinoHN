<template>
  <div class="admin-matrix-container">
    <!-- Breadcrumb & Header -->
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <span>Análisis De Producto</span>
          <span class="separator">/</span>
          <span class="current">Matriz de evaluación de productos</span>
        </div>
        <h1 class="matrix-main-title">1. Matriz de evaluación de productos — ArduinoHN</h1>
      </div>

      <div class="header-actions">
        <div v-if="isEditingExisting" class="editing-mode-pill">
          <span class="pulse-dot"></span>
          <span>Modificando registro existente</span>
        </div>
        <button class="btn btn-secondary" @click="resetToNewEvaluation">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Nueva Evaluación</span>
        </button>
        <button v-if="isEditingExisting" class="btn btn-outline" @click="saveAsNewCopy" :disabled="isSaving" title="Crea un nuevo registro duplicado sin sobreescribir este">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Guardar Copia</span>
        </button>
        <button class="btn btn-primary" @click="saveCurrentEvaluation" :disabled="isSaving">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>{{ isSaving ? 'Guardando...' : (isEditingExisting ? 'Actualizar Cambios' : 'Guardar Evaluación') }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

    <!-- Product Info Bar & Live Status -->
    <div class="product-metadata-card glass">
      <div class="product-inputs-grid">
        <div class="meta-field">
          <label>Nombre del Producto a Evaluar:</label>
          <input type="text" v-model="currentEval.productName" placeholder="Ej. ESP32-S3 WROOM con Pantalla TFT 2.8" class="form-control font-bold" />
        </div>
        <div class="meta-field">
          <label>SKU / Código / Parte:</label>
          <input type="text" v-model="currentEval.sku" placeholder="Ej. ESP32-S3-TFT-28" class="form-control font-mono" />
        </div>
        <div class="meta-field">
          <label>Categoría:</label>
          <input type="text" v-model="currentEval.category" placeholder="Ej. Microcontroladores & Módulos" class="form-control" />
        </div>
        <div class="meta-field">
          <label>Evaluador:</label>
          <input type="text" v-model="currentEval.evaluator" placeholder="Jorge Vargas" class="form-control" />
        </div>
        <div class="meta-field">
          <label>Fecha de Evaluación:</label>
          <input type="date" v-model="currentEval.date" class="form-control date-input" />
        </div>
      </div>

      <!-- Verdict Badge Banner -->
      <div class="verdict-banner">
        <div class="verdict-label-box">Evaluacion Producto:</div>
        <div class="verdict-status-box" :style="{ backgroundColor: activeClassification.color }">
          {{ activeClassification.label }}
        </div>

        <div v-if="!allMandatoryPassed" class="mandatory-fail-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          <span>1 o más filtros obligatorios reprobados</span>
        </div>
      </div>
    </div>

    <!-- Matrix Dual-Grid Layout (matching user screenshot) -->
    <div class="matrix-grid-layout">
      <!-- Left Column: Criterios Ponderados (21 Criterios) -->
      <div class="matrix-column left-column">
        <div class="table-container">
          <table class="matrix-table criteria-table">
            <thead>
              <tr class="table-header-row">
                <th class="col-num">Nº</th>
                <th class="col-criterion">Criterio</th>
                <th class="col-weight">Peso</th>
                <th class="col-check">¿Cumple?</th>
                <th class="col-score">Puntaje obtenido</th>
                <th class="col-notes">Evidencia / comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in currentEval.criteria" :key="c.id" :class="{ 'row-active': c.cumple }">
                <td class="col-num text-center">{{ c.id }}</td>
                <td class="col-criterion font-medium">{{ c.criterio }}</td>
                <td class="col-weight text-center font-bold">{{ c.peso }}%</td>
                <td class="col-check text-center">
                  <input type="checkbox" v-model="c.cumple" class="matrix-checkbox" />
                </td>
                <td class="col-score text-center font-bold" :class="{ 'score-positive': c.cumple }">
                  {{ c.cumple ? c.peso : 0 }}%
                </td>
                <td class="col-notes">
                  <input 
                    type="text" 
                    v-model="c.comentario" 
                    placeholder="Evidencia o nota..." 
                    class="form-control-compact"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" class="total-label font-bold text-center">TOTAL</td>
                <td class="text-center font-bold">100%</td>
                <td class="text-center">
                  <span class="checked-count">{{ checkedCriteriaCount }}/21</span>
                </td>
                <td class="total-score-cell text-center font-bold" :style="{ backgroundColor: activeClassification.color, color: '#ffffff' }">
                  {{ totalScore }}%
                </td>
                <td class="text-muted text-center" style="font-size: 8pt;">
                  Suma ponderada automática
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Right Column: Filtros Obligatorios & Escala de Clasificación -->
      <div class="matrix-column right-column">
        <!-- Top: Filtros Obligatorios -->
        <div class="table-container mb-6">
          <table class="matrix-table filters-table">
            <thead>
              <tr class="table-header-row">
                <th class="col-num">Nº</th>
                <th class="col-filter-name">Filtro obligatorio</th>
                <th class="col-filter-cond">Condición mínima</th>
                <th class="col-check">¿Cumple?</th>
                <th class="col-result">Resultado</th>
                <th class="col-obs">Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in currentEval.mandatoryFilters" :key="f.id" :class="{ 'filter-passed': f.cumple, 'filter-failed': !f.cumple }">
                <td class="col-num text-center">{{ f.id }}</td>
                <td class="col-filter-name font-bold">{{ f.filtro }}</td>
                <td class="col-filter-cond">{{ f.condicion }}</td>
                <td class="col-check text-center">
                  <input type="checkbox" v-model="f.cumple" class="matrix-checkbox" />
                </td>
                <td class="col-result text-center">
                  <span class="result-badge" :class="f.cumple ? 'badge-passed' : 'badge-failed'">
                    {{ f.cumple ? 'Aprobado' : 'Reprobado' }}
                  </span>
                </td>
                <td class="col-obs">
                  <input 
                    type="text" 
                    v-model="f.observacion" 
                    placeholder="Nota..." 
                    class="form-control-compact"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bottom: Escala de Clasificación -->
        <div class="table-container mb-6">
          <table class="matrix-table scale-table">
            <thead>
              <tr class="table-header-row">
                <th class="col-num">Nº</th>
                <th class="col-scale-score">Puntuación</th>
                <th class="col-scale-class">Clasificación</th>
                <th class="col-scale-status">Estado Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="s in classificationScale" 
                :key="s.id"
                :class="{ 'scale-active-row': activeClassification.label === s.label }"
                :style="activeClassification.label === s.label ? { backgroundColor: s.bgLight } : {}"
              >
                <td class="text-center font-bold">{{ s.id }}</td>
                <td class="text-center font-bold">{{ s.min }}-{{ s.max }}</td>
                <td class="font-bold">
                  <span class="scale-color-pill" :style="{ backgroundColor: s.color }"></span>
                  {{ s.label }}
                </td>
                <td class="text-center">
                  <span v-if="activeClassification.label === s.label" class="current-indicator" :style="{ backgroundColor: s.color }">
                    ✓ Calificación Actual ({{ totalScore }}%)
                  </span>
                  <span v-else class="text-muted" style="font-size: 8pt;">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Saved Evaluations History Panel -->
        <div class="history-panel glass">
          <div class="history-panel-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 15"/></svg>
            <h3>Evaluaciones Guardadas en Base de Datos</h3>
            <span class="eval-count-badge">{{ savedEvaluations.length }}</span>
          </div>

          <div v-if="savedEvaluations.length === 0" class="empty-history">
            No hay evaluaciones previas registradas. ¡Guarda tu primera evaluación arriba!
          </div>

          <div v-else class="history-list">
            <div 
              v-for="item in savedEvaluations" 
              :key="item.id" 
              class="history-card"
              :class="{ 'history-card-selected': currentEval.id === item.id }"
              @click="loadEvaluation(item)"
            >
              <div class="history-card-header">
                <span class="history-prod-name">{{ item.productName || 'Sin Nombre' }}</span>
                <span class="history-score-badge" :style="{ backgroundColor: getBadgeColor(item.totalScore) }">
                  {{ item.totalScore }}%
                </span>
              </div>
              <div class="history-card-meta">
                <span>{{ item.sku || 'Sin SKU' }}</span> • <span>{{ item.date }}</span> • <span>{{ item.evaluator || 'Admin' }}</span>
              </div>
              <div class="history-card-footer">
                <span class="history-class-tag" :style="{ color: getBadgeColor(item.totalScore) }">
                  {{ item.classification }}
                </span>
                <button class="delete-btn" @click.stop="removeEvaluation(item.id)" title="Eliminar evaluación">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
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

const isSaving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const savedEvaluations = ref<any[]>([])

const classificationScale = [
  { id: 1, min: 85, max: 100, label: 'Producto Estrella', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.12)' },
  { id: 2, min: 75, max: 84, label: 'Producto Potencial', color: '#0284c7', bgLight: 'rgba(2, 132, 199, 0.12)' },
  { id: 3, min: 65, max: 74, label: 'Producto De Prueba', color: '#eab308', bgLight: 'rgba(234, 179, 8, 0.12)' },
  { id: 4, min: 50, max: 64, label: 'Producto De Riesgo', color: '#f97316', bgLight: 'rgba(249, 115, 22, 0.12)' },
  { id: 5, min: 0, max: 49, label: 'No Recomendado', color: '#ef4444', bgLight: 'rgba(239, 68, 68, 0.12)' }
]

const MASTER_CRITERIA = [
  { id: 1, criterio: 'Resuelve una necesidad real', peso: 10 },
  { id: 2, criterio: 'Buena propuesta de valor', peso: 5 },
  { id: 3, criterio: 'Margen bruto ≥30%', peso: 12 },
  { id: 4, criterio: 'Utilidad neta por unidad ≥$10', peso: 6 },
  { id: 5, criterio: 'Demanda comprobable', peso: 12 },
  { id: 6, criterio: 'Genera recompra', peso: 5 },
  { id: 7, criterio: 'Potencial para construir marca', peso: 4 },
  { id: 8, criterio: 'Difícil de conseguir en Honduras', peso: 8 },
  { id: 9, criterio: 'Competencia local manejable', peso: 5 },
  { id: 10, criterio: 'Potencial de venta cruzada / complementos', peso: 6 },
  { id: 11, criterio: 'Bajo riesgo y costo logístico', peso: 4 },
  { id: 12, criterio: 'Creativos / contenido disponibles', peso: 1 },
  { id: 13, criterio: 'Producto confiable / cumple lo que promete', peso: 4 },
  { id: 14, criterio: 'Proveedor verificado', peso: 3 },
  { id: 15, criterio: 'Proveedor responde rápidamente', peso: 2 },
  { id: 16, criterio: 'Disponibilidad / capacidad de reposición', peso: 2 },
  { id: 17, criterio: 'Producto de temporada', peso: 1 },
  { id: 18, criterio: 'No requiere demostración inicial compleja', peso: 2 },
  { id: 19, criterio: 'Audiencia suficientemente amplia', peso: 4 },
  { id: 20, criterio: 'Baja saturación de proveedores', peso: 2 },
  { id: 21, criterio: 'Coherencia con la identidad ArduinoHN', peso: 2 }
]

const MASTER_FILTERS = [
  { id: 1, filtro: 'Producto confiable', condicion: 'Debe existir evidencia de calidad y funcionamiento' },
  { id: 2, filtro: 'Proveedor confiable', condicion: 'Proveedor verificado y con historial favorable' },
  { id: 3, filtro: 'Margen mínimo', condicion: 'Margen bruto ≥30% recomendado' },
  { id: 4, filtro: 'Costo logístico viable', condicion: 'Envío, peso y volumen compatibles con el margen' },
  { id: 5, filtro: 'Disponibilidad', condicion: 'Proveedor con capacidad razonable de reposición' },
  { id: 6, filtro: 'Legalidad y seguridad', condicion: 'Producto permitido y sin riesgos regulatorios inaceptables' },
  { id: 7, filtro: 'Costo total viable', condicion: 'Producto + envío + impuestos + comisiones + publicidad permitido' },
  { id: 8, filtro: 'Compatibilidad técnica', condicion: 'Especificaciones y compatibilidades claramente identificadas' }
]

const activeMasterCriteria = ref([...MASTER_CRITERIA])
const activeMasterFilters = ref([...MASTER_FILTERS])

const currentEval = ref<any>({
  id: '',
  productName: '',
  sku: '',
  category: '',
  evaluator: 'Jorge Vargas',
  date: new Date().toISOString().split('T')[0],
  criteria: MASTER_CRITERIA.map(c => ({ ...c, cumple: false, comentario: '' })),
  mandatoryFilters: MASTER_FILTERS.map(f => ({ ...f, cumple: false, observacion: '' }))
})

// Calculations
const totalScore = computed(() => {
  if (!currentEval.value.criteria) return 0
  return currentEval.value.criteria.reduce((acc: number, c: any) => acc + (c.cumple ? Number(c.peso) : 0), 0)
})

const checkedCriteriaCount = computed(() => {
  if (!currentEval.value.criteria) return 0
  return currentEval.value.criteria.filter((c: any) => c.cumple).length
})

const allMandatoryPassed = computed(() => {
  if (!currentEval.value.mandatoryFilters || currentEval.value.mandatoryFilters.length === 0) return true
  return currentEval.value.mandatoryFilters.every((f: any) => f.cumple)
})

const activeClassification = computed(() => {
  const score = totalScore.value
  for (const s of classificationScale) {
    if (score >= s.min && score <= s.max) {
      return s
    }
  }
  return classificationScale[4] // No Recomendado
})

const getBadgeColor = (score: number) => {
  if (score >= 85) return '#10b981'
  if (score >= 75) return '#0284c7'
  if (score >= 65) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

onMounted(async () => {
  await fetchUser()
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await loadMatrixData()
})

const loadMatrixData = async () => {
  try {
    const res = await $fetch<any>('/api/admin/product-matrix')
    if (res) {
      if (res.defaultCriteria && res.defaultCriteria.length > 0) {
        activeMasterCriteria.value = res.defaultCriteria
      }
      if (res.defaultMandatoryFilters && res.defaultMandatoryFilters.length > 0) {
        activeMasterFilters.value = res.defaultMandatoryFilters
      }

      savedEvaluations.value = res.evaluations || []
      
      if (savedEvaluations.value.length > 0) {
        loadEvaluation(savedEvaluations.value[0])
      } else {
        initDefaultForm()
      }
    }
  } catch (e) {
    console.error('Error fetching product matrix:', e)
    errorMsg.value = 'Error al cargar datos de la matriz.'
  }
}

const initDefaultForm = () => {
  currentEval.value = {
    id: `eval-${Date.now()}`,
    productName: '',
    sku: '',
    category: '',
    evaluator: 'Jorge Vargas',
    date: new Date().toISOString().split('T')[0],
    criteria: activeMasterCriteria.value.map(c => ({
      id: c.id,
      criterio: c.criterio,
      peso: c.peso,
      cumple: false,
      comentario: ''
    })),
    mandatoryFilters: activeMasterFilters.value.map(f => ({
      id: f.id,
      filtro: f.filtro,
      condicion: f.condicion,
      cumple: false,
      observacion: ''
    }))
  }
}

const loadEvaluation = (item: any) => {
  const criteriaMap = new Map((item.criteria || []).map((c: any) => [c.id, c]))
  const filtersMap = new Map((item.mandatoryFilters || []).map((f: any) => [f.id, f]))

  currentEval.value = {
    id: item.id || `eval-${Date.now()}`,
    productName: item.productName || '',
    sku: item.sku || '',
    category: item.category || '',
    evaluator: item.evaluator || 'Jorge Vargas',
    date: item.date || new Date().toISOString().split('T')[0],
    criteria: activeMasterCriteria.value.map(mc => {
      const existing = criteriaMap.get(mc.id) as any
      return {
        id: mc.id,
        criterio: mc.criterio,
        peso: mc.peso,
        cumple: existing ? Boolean(existing.cumple) : false,
        comentario: existing ? String(existing.comentario || '') : ''
      }
    }),
    mandatoryFilters: activeMasterFilters.value.map(mf => {
      const existing = filtersMap.get(mf.id) as any
      return {
        id: mf.id,
        filtro: mf.filtro,
        condicion: mf.condicion,
        cumple: existing ? Boolean(existing.cumple) : false,
        observacion: existing ? String(existing.observacion || '') : ''
      }
    })
  }
}

const resetToNewEvaluation = () => {
  initDefaultForm()
  successMsg.value = 'Formulario listo con los 21 criterios y 8 filtros obligatorios.'
  setTimeout(() => { successMsg.value = '' }, 2500)
}

const isEditingExisting = computed(() => {
  return savedEvaluations.value.some(e => String(e.id) === String(currentEval.value.id))
})

const saveAsNewCopy = async () => {
  currentEval.value.id = `eval-${Date.now()}`
  currentEval.value.productName = `${currentEval.value.productName} (Copia)`
  await saveCurrentEvaluation()
}

const saveCurrentEvaluation = async () => {
  if (!currentEval.value.productName) {
    errorMsg.value = 'Por favor ingresa el nombre del producto a evaluar.'
    setTimeout(() => { errorMsg.value = '' }, 3500)
    return
  }

  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const wasEditing = isEditingExisting.value

  try {
    const payload = {
      ...currentEval.value,
      totalScore: totalScore.value,
      classification: activeClassification.value.label,
      allMandatoryPassed: allMandatoryPassed.value
    }

    const res: any = await $fetch('/api/admin/product-matrix', {
      method: 'POST',
      body: payload
    })

    if (res && res.evaluation) {
      currentEval.value.id = res.evaluation.id
      // Update saved list
      const idx = savedEvaluations.value.findIndex(e => String(e.id) === String(res.evaluation.id))
      if (idx >= 0) {
        savedEvaluations.value[idx] = res.evaluation
      } else {
        savedEvaluations.value.unshift(res.evaluation)
      }
    }

    if (wasEditing) {
      successMsg.value = `¡Evaluación de "${currentEval.value.productName}" modificada y actualizada correctamente en la base de datos!`
    } else {
      successMsg.value = `¡Nueva evaluación de "${currentEval.value.productName}" guardada en la base de datos!`
    }
    setTimeout(() => { successMsg.value = '' }, 3500)
  } catch (e) {
    errorMsg.value = 'Error al guardar la evaluación en la base de datos.'
  } finally {
    isSaving.value = false
  }
}

const removeEvaluation = async (id: string | number) => {
  if (!confirm('¿Seguro que deseas eliminar esta evaluación guardada?')) return
  try {
    await $fetch('/api/admin/product-matrix', {
      method: 'DELETE',
      body: { id }
    })
    savedEvaluations.value = savedEvaluations.value.filter(e => String(e.id) !== String(id))
    if (currentEval.value.id === id) {
      if (savedEvaluations.value.length > 0) {
        loadEvaluation(savedEvaluations.value[0])
      } else {
        resetToNewEvaluation()
      }
    }
  } catch (e) {
    alert('Error al eliminar evaluación.')
  }
}

useHead({
  title: 'Matriz de Evaluación de Productos - ArduinoHN Admin'
})
</script>

<style scoped>
.admin-matrix-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
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

.matrix-main-title {
  color: var(--text-main);
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.editing-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.3);
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 8pt;
  font-weight: 700;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #0284c7;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
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

.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
}

/* Product Info Card */
.product-metadata-card {
  padding: 20px 24px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}

.product-inputs-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 1fr;
  gap: 14px 18px;
  margin-bottom: 16px;
}

@media (max-width: 1024px) {
  .product-inputs-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .product-inputs-grid {
    grid-template-columns: 1fr;
  }
}

.meta-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-main);
}

/* Gray Textbox Styling */
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

.form-control-compact {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  color: #1e293b;
  border-radius: 4px;
  font-size: 8pt;
  font-family: inherit;
}

:global([data-theme="dark"]) .form-control-compact {
  background-color: #1a202c;
  border-color: rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}

.font-bold {
  font-weight: 700;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Verdict Badge Banner (as in top of user screenshot) */
.verdict-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--glass-border);
}

.verdict-label-box {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  border-radius: 6px;
}

:global([data-theme="dark"]) .verdict-label-box {
  background: #242b35;
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.verdict-status-box {
  padding: 8px 24px;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.05rem;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  min-width: 180px;
  text-align: center;
}

.mandatory-fail-warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 6px;
  animation: pulse 2s infinite;
}

/* Matrix Layout (2 Columns Aligned) */
.matrix-grid-layout {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .matrix-grid-layout {
    grid-template-columns: 1fr;
  }
}

.matrix-column {
  display: flex;
  flex-direction: column;
}

.left-column {
  height: 100%;
}

.left-column .table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-column .criteria-table {
  height: 100%;
}

.right-column {
  gap: 14px;
}

.table-container {
  background: var(--bg-card);
  border: 1px solid rgba(0, 151, 156, 0.35);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}

.table-header-row th {
  background: #d1fae5; /* Greenish/teal header tint as in Excel screenshot */
  color: #064e3b;
  font-weight: 700;
  padding: 6px 8px;
  border: 1px solid #a7f3d0;
  font-size: 8pt;
  text-align: left;
}

:global([data-theme="dark"]) .table-header-row th {
  background: #064e3b;
  color: #d1fae5;
  border-color: #047857;
}

.matrix-table td {
  padding: 4px 6px;
  border: 1px solid #e2e8f0;
  color: var(--text-main);
  vertical-align: middle;
  font-size: 8pt;
}

:global([data-theme="dark"]) .matrix-table td {
  border-color: rgba(255, 255, 255, 0.08);
}

.row-active {
  background-color: rgba(16, 185, 129, 0.04);
}

.matrix-checkbox {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: var(--color-primary, #00979C);
  vertical-align: middle;
}

.score-positive {
  color: #059669;
}

.total-row {
  background: #f8fafc;
  border-top: 2px solid #cbd5e1;
}

:global([data-theme="dark"]) .total-row {
  background: #1e293b;
  border-color: #475569;
}

.total-score-cell {
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.checked-count {
  font-size: 7.5pt;
  font-weight: 600;
  color: var(--text-muted);
}

/* Filters Table */
.col-filter-cond {
  font-size: 7.8pt;
  line-height: 1.2;
}

.result-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 7.5pt;
  font-weight: 700;
}

.badge-passed {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.badge-failed {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.filter-failed {
  background: rgba(239, 68, 68, 0.03);
}

/* Scale Table */
.scale-table th {
  background: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

:global([data-theme="dark"]) .scale-table th {
  background: #1e3a8a;
  color: #dbeafe;
  border-color: #1d4ed8;
}

.scale-color-pill {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.scale-active-row {
  font-weight: 700;
  border: 2px solid #3b82f6 !important;
}

.current-indicator {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 7.5pt;
  font-weight: 700;
}

/* History Panel */
.history-panel {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--bg-card);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--color-primary, #00979C);
}

.history-panel-header h3 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
  flex: 1;
}

.eval-count-badge {
  background: rgba(0, 151, 156, 0.15);
  color: var(--color-primary);
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 7.5pt;
  font-weight: 700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  flex: 1;
}

.history-card {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

:global([data-theme="dark"]) .history-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
}

.history-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.history-card-selected {
  border-color: var(--color-primary) !important;
  background: rgba(0, 151, 156, 0.05);
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.history-prod-name {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-main);
}

.history-score-badge {
  padding: 1px 5px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 7.5pt;
  font-weight: 800;
}

.history-card-meta {
  font-size: 7.5pt;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.history-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-class-tag {
  font-size: 7.5pt;
  font-weight: 700;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
}

.delete-btn:hover {
  color: #ef4444;
}

.empty-history {
  font-size: 8pt;
  color: var(--text-muted);
  text-align: center;
  padding: 12px 8px;
}

.mb-6 {
  margin-bottom: 1.25rem;
}

.text-center {
  text-align: center;
}

.alert {
  padding: 10px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
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
</style>
