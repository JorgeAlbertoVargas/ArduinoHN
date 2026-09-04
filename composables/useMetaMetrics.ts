import { ref, computed } from 'vue'

export interface MetaScenario {
  id: string;
  name: string;
  campaignType: 'cold_traffic' | 'retargeting' | 'advantage_plus' | 'lead_messages' | 'bundle_launch';
  targetAudience: string;
  productType: 'single_component' | 'kit_bundle' | 'combo_maker' | 'custom';
  date: string;
  notes?: string;

  // Master Tree Inputs
  precioMedio: number;
  cantidadMedia: number;
  aov: number;
  cpm: number;
  ctr: number;
  cpc: number;
  cvr: number;
  cpa: number;
  roas: number;

  // Additional Meta KPIs
  frecuencia?: number;
  ctrTodos?: number;
  margenBrutoPct?: number;
  inversionSimulada?: number;
  tasaCierreMensajes?: number;
  diasCampana?: number;
  healthStatus?: 'saludable' | 'alerta' | 'critico';
}

const PRESET_TEMPLATES: Partial<MetaScenario>[] = [
  {
    name: 'Kit IoT Starter ESP32 (Bundle Solución)',
    campaignType: 'cold_traffic',
    targetAudience: 'Estudiantes & Makers IoT',
    productType: 'kit_bundle',
    precioMedio: 60.0,
    cantidadMedia: 1.0,
    cpm: 3.00,
    ctr: 2.0,
    cvr: 3.0,
    frecuencia: 1.5,
    margenBrutoPct: 45,
    inversionSimulada: 200,
    notes: 'Kit solución con ESP32 + Sensores + Protoboard + Guía práctica.'
  },
  {
    name: 'Componente Suelto (ESP32-WROOM)',
    campaignType: 'cold_traffic',
    targetAudience: 'Audiencia Técnica Maker',
    productType: 'single_component',
    precioMedio: 25.0,
    cantidadMedia: 1.0,
    cpm: 3.00,
    ctr: 2.0,
    cvr: 3.0,
    frecuencia: 1.6,
    margenBrutoPct: 35,
    inversionSimulada: 100,
    notes: 'Venta unitaria de componente para comparar apalancamiento de AOV.'
  },
  {
    name: 'Kit Robótica Educativa & STEM',
    campaignType: 'advantage_plus',
    targetAudience: 'Colegios, Padres & Entusiastas',
    productType: 'kit_bundle',
    precioMedio: 85.0,
    cantidadMedia: 1.0,
    cpm: 3.50,
    ctr: 2.2,
    cvr: 2.8,
    frecuencia: 1.8,
    margenBrutoPct: 50,
    inversionSimulada: 300,
    notes: 'Chasis 2WD + Arduino Uno + Driver L298N + Sensores ultrasónicos.'
  },
  {
    name: 'Kit Domótica WiFi Relés + App',
    campaignType: 'cold_traffic',
    targetAudience: 'Técnicos & Electricistas Residenciales',
    productType: 'kit_bundle',
    precioMedio: 70.0,
    cantidadMedia: 1.0,
    cpm: 3.20,
    ctr: 1.8,
    cvr: 2.5,
    frecuencia: 1.9,
    margenBrutoPct: 42,
    inversionSimulada: 150,
    notes: 'Control de luces por app móvil y relés optoacoplados.'
  },
  {
    name: 'Kit Sensores Industriales & PLC Arduino',
    campaignType: 'advantage_plus',
    targetAudience: 'Ingenieros Industriales & Automatización',
    productType: 'kit_bundle',
    precioMedio: 120.0,
    cantidadMedia: 1.0,
    cpm: 4.00,
    ctr: 2.5,
    cvr: 3.2,
    frecuencia: 1.7,
    margenBrutoPct: 55,
    inversionSimulada: 250,
    notes: 'Módulos RS485, transmisores 4-20mA, carril DIN y fuentes conmutadas.'
  },
  {
    name: 'Campaña Retargeting 75% Video',
    campaignType: 'retargeting',
    targetAudience: 'Visitantes que vieron ≥75% video',
    productType: 'combo_maker',
    precioMedio: 45.0,
    cantidadMedia: 1.0,
    cpm: 4.50,
    ctr: 3.2,
    cvr: 4.5,
    frecuencia: 2.6,
    margenBrutoPct: 40,
    inversionSimulada: 150,
    notes: 'Remarketing para cerrar carritos y visitantes calificados.'
  }
];

export const useMetaMetrics = () => {
  const scenarios = ref<MetaScenario[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  // Active form / Tree model
  const activeScenario = ref<MetaScenario>({
    id: '',
    name: 'Simulación: Kit IoT Starter Bundle',
    campaignType: 'cold_traffic',
    targetAudience: 'Ingenieros & Makers (Audiencia Fría)',
    productType: 'kit_bundle',
    date: new Date().toISOString().split('T')[0],
    notes: 'Estrategia de escalado por AOV empaquetado para ganar margen en subasta.',
    precioMedio: 60.00,
    cantidadMedia: 1.0,
    aov: 60.00,
    cpm: 3.00,
    ctr: 2.0,
    cpc: 0.15,
    cvr: 3.0,
    cpa: 5.00,
    roas: 12.0,
    frecuencia: 1.5,
    ctrTodos: 3.1,
    margenBrutoPct: 45,
    inversionSimulada: 200,
    tasaCierreMensajes: 6.0,
    diasCampana: 5,
    healthStatus: 'saludable'
  })

  // Live Cascade Computations
  const computedAov = computed(() => {
    const p = Number(activeScenario.value.precioMedio) || 0
    const q = Number(activeScenario.value.cantidadMedia) || 1
    return Number((p * q).toFixed(2))
  })

  const computedCpc = computed(() => {
    const cpm = Number(activeScenario.value.cpm) || 0
    const ctr = Number(activeScenario.value.ctr) || 0.0001
    if (ctr <= 0) return 0
    // (CPM / 1000) / (CTR / 100)
    return Number(((cpm / 1000) / (ctr / 100)).toFixed(4))
  })

  const computedCpa = computed(() => {
    const cpc = computedCpc.value
    const cvr = Number(activeScenario.value.cvr) || 0.0001
    if (cvr <= 0) return 0
    // CPC / (CVR / 100)
    return Number((cpc / (cvr / 100)).toFixed(2))
  })

  const computedRoas = computed(() => {
    const aov = computedAov.value
    const cpa = computedCpa.value
    if (cpa <= 0) return 0
    // AOV / CPA
    return Number((aov / cpa).toFixed(2))
  })

  // Financial & Profitability Simulator
  const computedFinancials = computed(() => {
    const adSpend = Number(activeScenario.value.inversionSimulada) || 100
    const cpa = computedCpa.value
    const aov = computedAov.value
    const marginPct = (Number(activeScenario.value.margenBrutoPct) || 35) / 100
    const roas = computedRoas.value

    const estimatedPurchases = cpa > 0 ? Math.floor(adSpend / cpa) : 0
    const grossRevenue = Number((estimatedPurchases * aov).toFixed(2))
    const grossProfitFromProducts = Number((grossRevenue * marginPct).toFixed(2))
    const netProfitAfterAds = Number((grossProfitFromProducts - adSpend).toFixed(2))
    const profitPerUnit = Number(((aov * marginPct) - cpa).toFixed(2))
    const breakEvenRoas = marginPct > 0 ? Number((1 / marginPct).toFixed(2)) : 3.0

    return {
      adSpend,
      estimatedPurchases,
      grossRevenue,
      grossProfitFromProducts,
      netProfitAfterAds,
      profitPerUnit,
      breakEvenRoas,
      isProfitable: netProfitAfterAds > 0
    }
  })

  // Live Health & Diagnosis Evaluator
  const diagnosis = computed(() => {
    const alerts: Array<{
      metric: string;
      level: 'healthy' | 'alert' | 'critical';
      currentValue: string;
      benchmark: string;
      diagnosisText: string;
      actionText: string;
    }> = []

    const ctr = Number(activeScenario.value.ctr) || 0
    const cpm = Number(activeScenario.value.cpm) || 0
    const cvr = Number(activeScenario.value.cvr) || 0
    const cpa = computedCpa.value
    const roas = computedRoas.value
    const freq = Number(activeScenario.value.frecuencia) || 1.0
    const campaignType = activeScenario.value.campaignType
    const marginAmount = computedAov.value * ((Number(activeScenario.value.margenBrutoPct) || 35) / 100)

    // CTR Único Audit
    if (ctr < 1.0) {
      alerts.push({
        metric: 'CTR Único (Enlace)',
        level: 'critical',
        currentValue: `${ctr.toFixed(2)}%`,
        benchmark: '≥ 1.0% en público técnico',
        diagnosisText: 'El creativo no habla el lenguaje del ingeniero o maker.',
        actionText: 'Cambia el ángulo: muestra datasheets, pines, esquemas de conexión o caso de uso real en los primeros 3s.'
      })
    } else {
      alerts.push({
        metric: 'CTR Único (Enlace)',
        level: 'healthy',
        currentValue: `${ctr.toFixed(2)}%`,
        benchmark: '≥ 1.0%',
        diagnosisText: 'Creativo resonando adecuadamente con la audiencia técnica.',
        actionText: 'Mantén el formato y prueba variaciones sutiles de copy.'
      })
    }

    // Frecuencia Audit (Specific for technical niche: limit is 2.0 on cold traffic!)
    const freqThreshold = campaignType === 'retargeting' ? 3.0 : 2.0
    if (freq > freqThreshold) {
      alerts.push({
        metric: `Frecuencia (${campaignType === 'retargeting' ? 'Retargeting' : 'Audiencia Fría'})`,
        level: 'alert',
        currentValue: `${freq.toFixed(1)}x`,
        benchmark: `≤ ${freqThreshold.toFixed(1)} en nicho técnico`,
        diagnosisText: 'Saturación publicitaria: los ingenieros/makers sufren fatiga rápida (banner blindness).',
        actionText: 'Amplía audiencia a electrónica DIY/Broad o introduce nuevos ángulos de creatividades.'
      })
    } else {
      alerts.push({
        metric: 'Frecuencia',
        level: 'healthy',
        currentValue: `${freq.toFixed(1)}x`,
        benchmark: `≤ ${freqThreshold.toFixed(1)}`,
        diagnosisText: 'Exposición equilibrada sin quemar la audiencia.',
        actionText: 'Continuar monitoreo semanal.'
      })
    }

    // CVR Landing / Checkout Audit
    if (cvr < 2.0) {
      alerts.push({
        metric: 'CVR (Conversión Landing/Tienda)',
        level: 'alert',
        currentValue: `${cvr.toFixed(2)}%`,
        benchmark: '≥ 2.0% – 3.0%',
        diagnosisText: 'Fricción en el proceso de compra o checkout.',
        actionText: 'Optimiza la landing: aclara envíos en Honduras, métodos locales de pago y botón directo a WhatsApp de soporte técnico.'
      })
    } else {
      alerts.push({
        metric: 'CVR',
        level: 'healthy',
        currentValue: `${cvr.toFixed(2)}%`,
        benchmark: '≥ 2.0%',
        diagnosisText: 'Embudo de conversión de tienda con buena fluidez.',
        actionText: 'Testea upsells de cables y accesorios en el carrito.'
      })
    }

    // CPA vs Margin
    if (cpa > marginAmount && cpa > 0) {
      alerts.push({
        metric: 'CPA vs Margen Bruto',
        level: 'critical',
        currentValue: `$${cpa.toFixed(2)} (Margen: $${marginAmount.toFixed(2)})`,
        benchmark: 'CPA < Margen Bruto',
        diagnosisText: 'El costo publicitario por adquisición supera el margen de ganancia del producto.',
        actionText: 'Aplica la cascada: sube el AOV empaquetando en Kits o reduce el CPA mejorando el CVR.'
      })
    }

    // ROAS Audit
    if (roas < 2.0) {
      alerts.push({
        metric: 'ROAS',
        level: 'critical',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: '≥ 3.0x – 4.0x',
        diagnosisText: 'Rentabilidad inviable en dropshipping / comercio electrónico.',
        actionText: 'No bajes el CPA sacrificando volumen; empaqueta en bundle (Kit IoT $60 vs pieza de $25) para disparar el ROAS.'
      })
    } else if (roas < 3.0) {
      alerts.push({
        metric: 'ROAS',
        level: 'alert',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: '≥ 3.0x – 4.0x',
        diagnosisText: 'Rentabilidad ajustada cerca del umbral de equilibrio.',
        actionText: 'Explora bundles con mayor margen para dar holgura a las pujas de Meta.'
      })
    } else {
      alerts.push({
        metric: 'ROAS',
        level: 'healthy',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: '≥ 3.0x',
        diagnosisText: 'Excelente retorno sobre inversión publicitaria.',
        actionText: 'Campaña lista para escalar presupuesto verticalmente (15-20% cada 3 días).'
      })
    }

    const hasCritical = alerts.some(a => a.level === 'critical')
    const hasAlert = alerts.some(a => a.level === 'alert')
    const overallStatus = hasCritical ? 'critico' : (hasAlert ? 'alerta' : 'saludable')

    return {
      overallStatus,
      alerts,
      criticalCount: alerts.filter(a => a.level === 'critical').length,
      alertCount: alerts.filter(a => a.level === 'alert').length
    }
  })

  // Synchronize computed values into the activeScenario model
  const syncComputedValues = () => {
    activeScenario.value.aov = computedAov.value
    activeScenario.value.cpc = computedCpc.value
    activeScenario.value.cpa = computedCpa.value
    activeScenario.value.roas = computedRoas.value
    activeScenario.value.healthStatus = diagnosis.value.overallStatus
  }

  // Fetch scenarios from API
  const fetchScenarios = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response: any = await $fetch('/api/admin/meta-metrics')
      if (response && response.scenarios) {
        scenarios.value = response.scenarios
      }
    } catch (err: any) {
      console.warn('Using default scenarios due to API error:', err)
      errorMessage.value = 'No se pudo conectar a la base de datos remota. Trabajando con datos locales.'
    } finally {
      isLoading.value = false
    }
  }

  // Load a scenario into the live active tree
  const loadScenario = (scenario: MetaScenario) => {
    activeScenario.value = {
      ...scenario,
      precioMedio: Number(scenario.precioMedio) || 25,
      cantidadMedia: Number(scenario.cantidadMedia) || 1,
      cpm: Number(scenario.cpm) || 3,
      ctr: Number(scenario.ctr) || 2,
      cvr: Number(scenario.cvr) || 3,
      frecuencia: Number(scenario.frecuencia) || 1.5,
      margenBrutoPct: Number(scenario.margenBrutoPct) || 35,
      inversionSimulada: Number(scenario.inversionSimulada) || 100,
      tasaCierreMensajes: Number(scenario.tasaCierreMensajes) || 5,
      diasCampana: Number(scenario.diasCampana) || 3
    }
    syncComputedValues()
  }

  // Apply a template preset
  const applyPreset = (preset: Partial<MetaScenario>) => {
    activeScenario.value = {
      ...activeScenario.value,
      id: '',
      name: `Simulación: ${preset.name}`,
      campaignType: preset.campaignType || 'cold_traffic',
      targetAudience: preset.targetAudience || 'Ingenieros & Makers',
      productType: preset.productType || 'kit_bundle',
      precioMedio: preset.precioMedio ?? 60,
      cantidadMedia: preset.cantidadMedia ?? 1,
      cpm: preset.cpm ?? 3,
      ctr: preset.ctr ?? 2,
      cvr: preset.cvr ?? 3,
      frecuencia: preset.frecuencia ?? 1.5,
      margenBrutoPct: preset.margenBrutoPct ?? 45,
      inversionSimulada: preset.inversionSimulada ?? 200,
      notes: preset.notes || ''
    }
    syncComputedValues()
  }

  // Reset to new clean scenario
  const resetToNew = () => {
    activeScenario.value = {
      id: '',
      name: 'Nueva Auditoría de Campaña Meta',
      campaignType: 'cold_traffic',
      targetAudience: 'Audiencia Fría (Honduras Makers)',
      productType: 'kit_bundle',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      precioMedio: 50.0,
      cantidadMedia: 1.0,
      aov: 50.0,
      cpm: 3.0,
      ctr: 2.0,
      cpc: 0.15,
      cvr: 3.0,
      cpa: 5.0,
      roas: 10.0,
      frecuencia: 1.5,
      ctrTodos: 2.8,
      margenBrutoPct: 40,
      inversionSimulada: 150,
      tasaCierreMensajes: 5.0,
      diasCampana: 3,
      healthStatus: 'saludable'
    }
    syncComputedValues()
  }

  // Save current active scenario to API / Storage
  const saveCurrentScenario = async (saveAsNewCopy = false) => {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''
    syncComputedValues()

    const payload = {
      ...activeScenario.value,
      id: (saveAsNewCopy || !activeScenario.value.id) ? `sc-${Date.now()}` : activeScenario.value.id,
      name: saveAsNewCopy ? `${activeScenario.value.name} (Copia)` : activeScenario.value.name
    }

    try {
      const response: any = await $fetch('/api/admin/meta-metrics', {
        method: 'POST',
        body: payload
      })

      if (response && response.scenario) {
        activeScenario.value = { ...response.scenario }
        await fetchScenarios()
        successMessage.value = '¡Análisis guardado exitosamente en el historial!'
        setTimeout(() => { successMessage.value = '' }, 4000)
        return true
      }
    } catch (err: any) {
      console.warn('Error saving to API, updating locally:', err)
      const existingIdx = scenarios.value.findIndex(s => s.id === payload.id)
      if (existingIdx >= 0) {
        scenarios.value[existingIdx] = payload as MetaScenario
      } else {
        scenarios.value.unshift(payload as MetaScenario)
      }
      activeScenario.value = { ...(payload as MetaScenario) }
      successMessage.value = 'Guardado localmente en la sesión activa.'
      setTimeout(() => { successMessage.value = '' }, 4000)
      return true
    } finally {
      isSaving.value = false
    }
  }

  // Delete scenario
  const removeScenario = async (id: string) => {
    try {
      await $fetch('/api/admin/meta-metrics', {
        method: 'DELETE',
        body: { id }
      })
      scenarios.value = scenarios.value.filter(s => s.id !== id)
      if (activeScenario.value.id === id) {
        resetToNew()
      }
      successMessage.value = 'Escenario eliminado correctamente.'
      setTimeout(() => { successMessage.value = '' }, 3000)
    } catch (err: any) {
      scenarios.value = scenarios.value.filter(s => s.id !== id)
    }
  }

  return {
    scenarios,
    activeScenario,
    presetTemplates: PRESET_TEMPLATES,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    computedAov,
    computedCpc,
    computedCpa,
    computedRoas,
    computedFinancials,
    diagnosis,
    fetchScenarios,
    loadScenario,
    applyPreset,
    resetToNew,
    saveCurrentScenario,
    removeScenario,
    syncComputedValues
  }
}
