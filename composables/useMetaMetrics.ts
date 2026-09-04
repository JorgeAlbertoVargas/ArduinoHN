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

// Tabla de Configuración de Reglas KPI (Fácilmente adaptable a futuro para 3ra Forma Normal en BDD)
export const META_KPI_RULES = {
  ctrUnico: {
    minHealthy: 1.0,
    alertText: 'El creativo no habla el lenguaje del ingeniero o maker.',
    alertAction: 'Rota creativo — cambia el gancho de los primeros 3 segundos.',
    healthyText: 'Creativo resonando adecuadamente con la audiencia técnica.',
    healthyAction: 'Mantén el formato y prueba variaciones sutiles de copy.'
  },
  ctrTodos: {
    minHealthy: 2.0,
    minAlert: 1.5,
    alertText: 'Baja retención visual inicial.',
    alertAction: 'El arte visual no es disruptivo; prueba formato Reel.',
    healthyText: 'El anuncio atrae la atención y genera clics generales.',
    healthyAction: 'Monitorear la tasa de conversión posterior.'
  },
  frecuenciaFria: {
    maxHealthy: 2.0,
    alertText: 'Saturación publicitaria en nicho técnico.',
    alertAction: 'Amplía audiencia o rota creatividades (nicho técnico se satura rápido).',
    healthyText: 'Exposición equilibrada sin quemar la audiencia.',
    healthyAction: 'Continuar monitoreo semanal.'
  },
  frecuenciaRetargeting: {
    maxHealthy: 3.0,
    alertText: 'Saturación sin nuevas ventas.',
    alertAction: 'Refresca el público o cambia el ángulo del mensaje.',
    healthyText: 'Recordatorio constante y efectivo.',
    healthyAction: 'Mantener si las ventas continúan.'
  },
  cvr: {
    minHealthy: 2.0,
    alertText: 'Fricción en el proceso de compra o checkout.',
    alertAction: 'Fricción en landing: revisa envío, stock, método de pago.',
    healthyText: 'Embudo de conversión de tienda con buena fluidez.',
    healthyAction: 'Testea upsells de cables y accesorios en el carrito.'
  },
  cpa: {
    alertText: 'El costo publicitario por adquisición supera el margen de ganancia del producto.',
    alertAction: 'Diagnostica con la cascada: ¿es problema de CPC o de CVR?'
  },
  tasaCierre: {
    minHealthy: 5.0,
    alertText: 'Baja conversión de leads a ventas.',
    alertAction: 'El fallo está en el proceso comercial, no en Meta Ads.',
    healthyText: 'Proceso de ventas por chat altamente efectivo.',
    healthyAction: 'Escalar presupuesto en campañas de mensajes.'
  },
  roas: {
    minHealthy: 3.0,
    minAlert: 2.0,
    alertText: 'Rentabilidad inviable en dropshipping / comercio electrónico.',
    alertAction: 'Sube el AOV con kits/bundles antes de tocar el CPA.',
    alertActionMedium: 'Explora bundles con mayor margen para dar holgura a las pujas de Meta.',
    healthyText: 'Excelente retorno sobre inversión publicitaria.',
    healthyAction: 'Campaña lista para escalar presupuesto verticalmente.'
  },
  cpmTip: 'Si CPM sube > 20% en 1 semana: Revisa saturación de audiencia o calidad del anuncio.',
  cpcTip: 'Si CPC sube sin cambio en CTR: Subasta saturada; ajusta puja o abre segmentación (Broad).'
}

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
    if (ctr < META_KPI_RULES.ctrUnico.minHealthy) {
      alerts.push({
        metric: 'CTR Único (Enlace)',
        level: 'critical',
        currentValue: `${ctr.toFixed(2)}%`,
        benchmark: `≥ ${META_KPI_RULES.ctrUnico.minHealthy}%`,
        diagnosisText: META_KPI_RULES.ctrUnico.alertText,
        actionText: META_KPI_RULES.ctrUnico.alertAction
      })
    } else {
      alerts.push({
        metric: 'CTR Único (Enlace)',
        level: 'healthy',
        currentValue: `${ctr.toFixed(2)}%`,
        benchmark: `≥ ${META_KPI_RULES.ctrUnico.minHealthy}%`,
        diagnosisText: META_KPI_RULES.ctrUnico.healthyText,
        actionText: META_KPI_RULES.ctrUnico.healthyAction
      })
    }

    // CTR Todos Audit
    const ctrTodos = Number(activeScenario.value.ctrTodos) || 0
    if (ctrTodos > 0) {
      if (ctrTodos < META_KPI_RULES.ctrTodos.minAlert) {
        alerts.push({
          metric: 'CTR (Todos)',
          level: 'alert',
          currentValue: `${ctrTodos.toFixed(2)}%`,
          benchmark: `≥ ${META_KPI_RULES.ctrTodos.minHealthy}%`,
          diagnosisText: META_KPI_RULES.ctrTodos.alertText,
          actionText: META_KPI_RULES.ctrTodos.alertAction
        })
      } else if (ctrTodos >= META_KPI_RULES.ctrTodos.minHealthy) {
        alerts.push({
          metric: 'CTR (Todos)',
          level: 'healthy',
          currentValue: `${ctrTodos.toFixed(2)}%`,
          benchmark: `≥ ${META_KPI_RULES.ctrTodos.minHealthy}%`,
          diagnosisText: META_KPI_RULES.ctrTodos.healthyText,
          actionText: META_KPI_RULES.ctrTodos.healthyAction
        })
      }
    }

    // Frecuencia Audit
    const isRetargeting = campaignType === 'retargeting'
    const freqThreshold = isRetargeting ? META_KPI_RULES.frecuenciaRetargeting.maxHealthy : META_KPI_RULES.frecuenciaFria.maxHealthy
    const freqRule = isRetargeting ? META_KPI_RULES.frecuenciaRetargeting : META_KPI_RULES.frecuenciaFria

    if (freq > freqThreshold) {
      alerts.push({
        metric: `Frecuencia (${isRetargeting ? 'Retargeting' : 'Audiencia Fría'})`,
        level: 'alert',
        currentValue: `${freq.toFixed(1)}x`,
        benchmark: `≤ ${freqThreshold.toFixed(1)}`,
        diagnosisText: freqRule.alertText,
        actionText: freqRule.alertAction
      })
    } else {
      alerts.push({
        metric: 'Frecuencia',
        level: 'healthy',
        currentValue: `${freq.toFixed(1)}x`,
        benchmark: `≤ ${freqThreshold.toFixed(1)}`,
        diagnosisText: freqRule.healthyText,
        actionText: freqRule.healthyAction
      })
    }

    // CVR Landing / Checkout Audit
    if (cvr < META_KPI_RULES.cvr.minHealthy) {
      alerts.push({
        metric: 'CVR (Conversión)',
        level: 'alert',
        currentValue: `${cvr.toFixed(2)}%`,
        benchmark: `≥ ${META_KPI_RULES.cvr.minHealthy}%`,
        diagnosisText: META_KPI_RULES.cvr.alertText,
        actionText: META_KPI_RULES.cvr.alertAction
      })
    } else {
      alerts.push({
        metric: 'CVR',
        level: 'healthy',
        currentValue: `${cvr.toFixed(2)}%`,
        benchmark: `≥ ${META_KPI_RULES.cvr.minHealthy}%`,
        diagnosisText: META_KPI_RULES.cvr.healthyText,
        actionText: META_KPI_RULES.cvr.healthyAction
      })
    }

    // CPA vs Margin
    if (cpa > marginAmount && cpa > 0) {
      alerts.push({
        metric: 'CPA',
        level: 'critical',
        currentValue: `$${cpa.toFixed(2)} (Margen: $${marginAmount.toFixed(2)})`,
        benchmark: 'CPA < Margen Bruto',
        diagnosisText: META_KPI_RULES.cpa.alertText,
        actionText: META_KPI_RULES.cpa.alertAction
      })
    } else {
      alerts.push({
        metric: 'CPA',
        level: 'healthy',
        currentValue: `$${cpa.toFixed(2)}`,
        benchmark: `CPA < $${marginAmount.toFixed(2)}`,
        diagnosisText: 'Costo por adquisición rentable.',
        actionText: 'Mantén el costo bajo control.'
      })
    }
    
    // Tasa de Cierre (Mensajes)
    const isMessages = campaignType === 'lead_messages'
    const tasaCierre = Number(activeScenario.value.tasaCierreMensajes) || 0
    if (isMessages) {
      if (tasaCierre < META_KPI_RULES.tasaCierre.minHealthy) {
        alerts.push({
          metric: 'Tasa Cierre',
          level: 'alert',
          currentValue: `${tasaCierre.toFixed(2)}%`,
          benchmark: `≥ ${META_KPI_RULES.tasaCierre.minHealthy}%`,
          diagnosisText: META_KPI_RULES.tasaCierre.alertText,
          actionText: META_KPI_RULES.tasaCierre.alertAction
        })
      } else {
        alerts.push({
          metric: 'Tasa Cierre',
          level: 'healthy',
          currentValue: `${tasaCierre.toFixed(2)}%`,
          benchmark: `≥ ${META_KPI_RULES.tasaCierre.minHealthy}%`,
          diagnosisText: META_KPI_RULES.tasaCierre.healthyText,
          actionText: META_KPI_RULES.tasaCierre.healthyAction
        })
      }
    }

    // ROAS Audit
    if (roas < META_KPI_RULES.roas.minAlert) {
      alerts.push({
        metric: 'ROAS',
        level: 'critical',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: `≥ ${META_KPI_RULES.roas.minHealthy}x`,
        diagnosisText: META_KPI_RULES.roas.alertText,
        actionText: META_KPI_RULES.roas.alertAction
      })
    } else if (roas < META_KPI_RULES.roas.minHealthy) {
      alerts.push({
        metric: 'ROAS',
        level: 'alert',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: `≥ ${META_KPI_RULES.roas.minHealthy}x`,
        diagnosisText: 'Rentabilidad ajustada cerca del umbral de equilibrio.',
        actionText: META_KPI_RULES.roas.alertActionMedium
      })
    } else {
      alerts.push({
        metric: 'ROAS',
        level: 'healthy',
        currentValue: `${roas.toFixed(2)}x`,
        benchmark: `≥ ${META_KPI_RULES.roas.minHealthy}x`,
        diagnosisText: META_KPI_RULES.roas.healthyText,
        actionText: META_KPI_RULES.roas.healthyAction
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
