import { useRuntimeConfig } from '#imports'
import { fetchNocoDB } from './nocodb'

export interface WeightedCriterion {
  id: number;
  criterio: string;
  peso: number; // percentage (e.g. 10 for 10%)
  cumple: boolean;
  comentario: string;
}

export interface MandatoryFilter {
  id: number;
  filtro: string;
  condicion: string;
  cumple: boolean;
  observacion: string;
}

export interface ProductEvaluation {
  id: string | number;
  productName: string;
  sku?: string;
  category?: string;
  evaluator?: string;
  date: string;
  totalScore: number;
  classification: string;
  status: 'aprobado' | 'reprobado' | 'en_revision';
  allMandatoryPassed: boolean;
  criteria: WeightedCriterion[];
  mandatoryFilters: MandatoryFilter[];
  generalNotes?: string;
}

export const DEFAULT_CRITERIA: Omit<WeightedCriterion, 'cumple' | 'comentario'>[] = [
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

export const DEFAULT_MANDATORY_FILTERS: Omit<MandatoryFilter, 'cumple' | 'observacion'>[] = [
  { id: 1, filtro: 'Producto confiable', condicion: 'Debe existir evidencia de calidad y funcionamiento' },
  { id: 2, filtro: 'Proveedor confiable', condicion: 'Proveedor verificado y con historial favorable' },
  { id: 3, filtro: 'Margen mínimo', condicion: 'Margen bruto ≥30% recomendado' },
  { id: 4, filtro: 'Costo logístico viable', condicion: 'Envío, peso y volumen compatibles con el margen' },
  { id: 5, filtro: 'Disponibilidad', condicion: 'Proveedor con capacidad razonable de reposición' },
  { id: 6, filtro: 'Legalidad y seguridad', condicion: 'Producto permitido y sin riesgos regulatorios inaceptables' },
  { id: 7, filtro: 'Costo total viable', condicion: 'Producto + envío + impuestos + comisiones + publicidad permitido' },
  { id: 8, filtro: 'Compatibilidad técnica', condicion: 'Especificaciones y compatibilidades claramente identificadas' }
]

// Master configurable criteria and filters
let activeMasterCriteria: Omit<WeightedCriterion, 'cumple' | 'comentario'>[] = [...DEFAULT_CRITERIA]
let activeMasterFilters: Omit<MandatoryFilter, 'cumple' | 'observacion'>[] = [...DEFAULT_MANDATORY_FILTERS]

export const getMasterConfig = async () => {
  const config = useRuntimeConfig()
  const tableId = (config.public as any).nocodbProductMatrixTable || 'm_product_evaluations'
  
  try {
    const response: any = await fetchNocoDB(tableId, '?where=(product_name,eq,__MASTER_CONFIG__)&limit=1')
    if (response && response.list && response.list.length > 0) {
      const row = response.list[0]
      if (row.criteria_data) {
        activeMasterCriteria = typeof row.criteria_data === 'string' ? JSON.parse(row.criteria_data) : row.criteria_data
      }
      if (row.filters_data) {
        activeMasterFilters = typeof row.filters_data === 'string' ? JSON.parse(row.filters_data) : row.filters_data
      }
    }
  } catch (error) {
    console.warn('Error fetching master config from NocoDB, using in-memory defaults:', error)
  }

  return {
    criteria: activeMasterCriteria,
    mandatoryFilters: activeMasterFilters
  }
}

export const saveMasterConfig = async (configData: { criteria?: any[]; mandatoryFilters?: any[] }) => {
  if (configData.criteria && Array.isArray(configData.criteria)) {
    activeMasterCriteria = configData.criteria.map((c, idx) => ({
      id: c.id || idx + 1,
      criterio: c.criterio || '',
      peso: Number(c.peso) || 0
    }))
  }
  if (configData.mandatoryFilters && Array.isArray(configData.mandatoryFilters)) {
    activeMasterFilters = configData.mandatoryFilters.map((f, idx) => ({
      id: f.id || idx + 1,
      filtro: f.filtro || '',
      condicion: f.condicion || ''
    }))
  }

  const config = useRuntimeConfig()
  const tableId = (config.public as any).nocodbProductMatrixTable || 'm_product_evaluations'

  try {
    const response: any = await fetchNocoDB(tableId, '?where=(product_name,eq,__MASTER_CONFIG__)&limit=1')
    const payload = {
      product_name: '__MASTER_CONFIG__',
      sku: 'CONFIG',
      category: 'System',
      evaluator: 'System',
      evaluation_date: new Date().toISOString().split('T')[0],
      total_score: 100,
      classification: 'Config',
      status: 'aprobado',
      all_mandatory_passed: true,
      criteria_data: JSON.stringify(activeMasterCriteria),
      filters_data: JSON.stringify(activeMasterFilters),
      general_notes: 'Criterios y filtros maestros configurados'
    }

    if (response && response.list && response.list.length > 0) {
      const recordId = response.list[0].Id || response.list[0].id
      await fetchNocoDB(tableId, '', {
        method: 'PATCH',
        body: { Id: recordId, id: recordId, ...payload }
      })
    } else {
      await fetchNocoDB(tableId, '', {
        method: 'POST',
        body: payload
      })
    }
  } catch (error) {
    console.warn('Error saving master config to NocoDB (saved in memory):', error)
  }

  return {
    criteria: activeMasterCriteria,
    mandatoryFilters: activeMasterFilters
  }
}

// In-memory cache of evaluations
let inMemoryEvaluations: ProductEvaluation[] = [
  {
    id: 'demo-1',
    productName: 'Arduino Uno R4 WiFi',
    sku: 'ARD-UNO-R4-WIFI',
    category: 'Placas de Desarrollo',
    evaluator: 'Jorge Vargas',
    date: new Date().toISOString().split('T')[0],
    totalScore: 92,
    classification: 'Producto Estrella',
    status: 'aprobado',
    allMandatoryPassed: true,
    criteria: DEFAULT_CRITERIA.map(c => ({
      ...c,
      cumple: c.id !== 17, // cumple la mayoria
      comentario: c.id === 1 ? 'Alta demanda por proyectos estudiantiles y maker' : ''
    })),
    mandatoryFilters: DEFAULT_MANDATORY_FILTERS.map(f => ({
      ...f,
      cumple: true,
      observacion: 'Cumple con todos los estándares oficiales'
    })),
    generalNotes: 'Excelente producto para el catálogo principal de ArduinoHN.'
  }
]

export const normalizeEvaluation = (evalData: any): ProductEvaluation => {
  const criteriaMap = new Map((evalData.criteria || []).map((c: any) => [c.id, c]))
  const filtersMap = new Map((evalData.mandatoryFilters || []).map((f: any) => [f.id, f]))

  const fullCriteria: WeightedCriterion[] = DEFAULT_CRITERIA.map(dc => {
    const existing = criteriaMap.get(dc.id) as any
    return {
      id: dc.id,
      criterio: dc.criterio,
      peso: dc.peso,
      cumple: existing ? Boolean(existing.cumple) : false,
      comentario: existing ? String(existing.comentario || '') : ''
    }
  })

  const fullFilters: MandatoryFilter[] = DEFAULT_MANDATORY_FILTERS.map(df => {
    const existing = filtersMap.get(df.id) as any
    return {
      id: df.id,
      filtro: df.filtro,
      condicion: df.condicion,
      cumple: existing ? Boolean(existing.cumple) : false,
      observacion: existing ? String(existing.observacion || '') : ''
    }
  })

  const totalScore = fullCriteria.reduce((acc, c) => acc + (c.cumple ? c.peso : 0), 0)
  const allMandatoryPassed = fullFilters.every(f => f.cumple)
  const classInfo = getClassificationFromScore(totalScore)

  return {
    id: evalData.id || `eval-${Date.now()}`,
    productName: evalData.productName || '',
    sku: evalData.sku || '',
    category: evalData.category || '',
    evaluator: evalData.evaluator || 'Jorge Vargas',
    date: evalData.date || new Date().toISOString().split('T')[0],
    totalScore,
    classification: classInfo.label,
    status: allMandatoryPassed && totalScore >= 65 ? 'aprobado' : 'reprobado',
    allMandatoryPassed,
    criteria: fullCriteria,
    mandatoryFilters: fullFilters,
    generalNotes: evalData.generalNotes || ''
  }
}

export const getClassificationFromScore = (score: number) => {
  if (score >= 85) return { label: 'Producto Estrella', color: '#10b981', badgeClass: 'estrella' }
  if (score >= 75) return { label: 'Producto Potencial', color: '#0284c7', badgeClass: 'potencial' }
  if (score >= 65) return { label: 'Producto De Prueba', color: '#eab308', badgeClass: 'prueba' }
  if (score >= 50) return { label: 'Producto De Riesgo', color: '#f97316', badgeClass: 'riesgo' }
  return { label: 'No Recomendado', color: '#ef4444', badgeClass: 'no-recomendado' }
}

export const getAllEvaluations = async (): Promise<ProductEvaluation[]> => {
  const config = useRuntimeConfig()
  const tableId = (config.public as any).nocodbProductMatrixTable || 'm_product_evaluations'
  
  try {
    const response: any = await fetchNocoDB(tableId, '?sort=-CreatedAt&limit=100')
    if (response && response.list && response.list.length > 0) {
      const list = response.list.map((row: any) => normalizeEvaluation({
        id: row.Id || row.id,
        productName: row.product_name,
        sku: row.sku,
        category: row.category,
        evaluator: row.evaluator,
        date: row.evaluation_date || row.date,
        totalScore: Number(row.total_score || 0),
        classification: row.classification,
        status: row.status,
        allMandatoryPassed: Boolean(row.all_mandatory_passed),
        criteria: row.criteria_data ? (typeof row.criteria_data === 'string' ? JSON.parse(row.criteria_data) : row.criteria_data) : [],
        mandatoryFilters: row.filters_data ? (typeof row.filters_data === 'string' ? JSON.parse(row.filters_data) : row.filters_data) : [],
        generalNotes: row.general_notes
      }))
      return list
    }
  } catch (error) {
    console.warn('Error fetching evaluations from NocoDB, using in-memory data:', error)
  }
  
  return inMemoryEvaluations.map(e => normalizeEvaluation(e))
}

export const saveEvaluation = async (evaluation: ProductEvaluation): Promise<ProductEvaluation> => {
  const config = useRuntimeConfig()
  const tableId = (config.public as any).nocodbProductMatrixTable || 'm_product_evaluations'

  const savedRecord = normalizeEvaluation(evaluation)

  // Update in-memory
  const existingIdx = inMemoryEvaluations.findIndex(e => String(e.id) === String(savedRecord.id))
  if (existingIdx >= 0) {
    inMemoryEvaluations[existingIdx] = savedRecord
  } else {
    inMemoryEvaluations.unshift(savedRecord)
  }

  // Try sync to NocoDB
  try {
    const payload = {
      product_name: savedRecord.productName,
      sku: savedRecord.sku || '',
      category: savedRecord.category || '',
      evaluator: savedRecord.evaluator || '',
      evaluation_date: savedRecord.date,
      total_score: savedRecord.totalScore,
      classification: savedRecord.classification,
      status: savedRecord.status,
      all_mandatory_passed: savedRecord.allMandatoryPassed,
      criteria_data: JSON.stringify(savedRecord.criteria),
      filters_data: JSON.stringify(savedRecord.mandatoryFilters),
      general_notes: savedRecord.generalNotes || ''
    }

    if (evaluation.id && typeof evaluation.id === 'number') {
      await fetchNocoDB(tableId, '', {
        method: 'PATCH',
        body: { Id: evaluation.id, id: evaluation.id, ...payload }
      })
    } else {
      const res: any = await fetchNocoDB(tableId, '', {
        method: 'POST',
        body: payload
      })
      if (res && (res.Id || res.id)) {
        savedRecord.id = res.Id || res.id
      }
    }
  } catch (error) {
    console.warn('Error saving evaluation to NocoDB (persisted in memory):', error)
  }

  return savedRecord
}

export const deleteEvaluation = async (id: string | number): Promise<boolean> => {
  const config = useRuntimeConfig()
  const tableId = (config.public as any).nocodbProductMatrixTable || 'm_product_evaluations'

  inMemoryEvaluations = inMemoryEvaluations.filter(e => String(e.id) !== String(id))

  try {
    await fetchNocoDB(tableId, '', {
      method: 'DELETE',
      body: { Id: id, id: id }
    })
  } catch (error) {
    console.warn('Error deleting evaluation from NocoDB:', error)
  }

  return true
}
