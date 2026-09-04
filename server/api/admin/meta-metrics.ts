import { defineEventHandler, getMethod, readBody, createError, getQuery } from 'h3'
import { 
  getAllMetaScenarios, 
  saveMetaScenario, 
  deleteMetaScenario, 
  DEFAULT_SCENARIOS,
  calculateMetaMetrics 
} from '../../utils/metaMetricsStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user || (user as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const method = getMethod(event)
  const query = getQuery(event)

  if (method === 'GET') {
    if (query.action === 'defaults') {
      return {
        defaultScenarios: DEFAULT_SCENARIOS
      }
    }
    const scenarios = await getAllMetaScenarios()
    return {
      scenarios,
      benchmarks: {
        ctrUnico: { min: 1.0, healthy: '≥ 1.0%', alert: '< 1.0%', action: 'Rota creativo — cambia el gancho de los primeros 3 segundos' },
        ctrTodos: { min: 2.0, healthy: '≥ 2.0%', alert: '< 1.5%', action: 'El arte visual no es disruptivo; prueba formato Reel' },
        cpm: { healthy: 'Estable (variación < 20% semanal)', alert: 'Sube > 20% en 1 semana', action: 'Revisa saturación de audiencia o calidad del anuncio' },
        frecuenciaFria: { max: 2.0, healthy: '≤ 2.0', alert: '> 2.0', action: 'Amplía audiencia o rota creatividades (nicho técnico se satura rápido)' },
        frecuenciaRetargeting: { max: 3.0, healthy: '≤ 3.0', alert: '> 3.0 sin ventas nuevas', action: 'Refresca el público o cambia el ángulo del mensaje' },
        cpc: { healthy: 'Según subasta, estable', alert: 'Sube sin cambio en CTR', action: 'Subasta saturada; ajusta puja o abre segmentación (Broad/Advantage+)' },
        cvr: { min: 2.0, healthy: '≥ 2–3%', alert: '< 2%', action: 'Fricción en landing: envío en Honduras, stock, método de pago o WhatsApp de soporte' },
        cpa: { healthy: 'Por debajo del margen bruto', alert: 'Se acerca o supera el margen', action: 'Diagnostica con la cascada: ¿es problema de CPC o de CVR?' },
        tasaCierreMensajes: { min: 5.0, healthy: '≥ 5%', alert: '< 5%', action: 'El fallo está en el proceso comercial/ventas, no en Meta Ads' },
        roas: { min: 3.0, healthy: '≥ 3–4x (mínimo viable)', alert: '< 2x', action: 'Sube el AOV empaquetando en Kits/Bundles antes de tocar el CPA' }
      }
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)

    if (query.action === 'calculate') {
      const calc = calculateMetaMetrics(body)
      return { success: true, calculations: calc }
    }

    const saved = await saveMetaScenario(body)
    return { success: true, scenario: saved }
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    if (!body || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing Scenario ID' })
    }
    await deleteMetaScenario(String(body.id))
    return { success: true }
  }
})
