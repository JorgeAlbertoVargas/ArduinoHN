import { defineEventHandler, getMethod, readBody, createError, getQuery } from 'h3'
import { 
  getAllEvaluations, 
  saveEvaluation, 
  deleteEvaluation, 
  DEFAULT_CRITERIA, 
  DEFAULT_MANDATORY_FILTERS,
  getMasterConfig,
  saveMasterConfig
} from '../../utils/productMatrixStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user || (user as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const method = getMethod(event)
  const query = getQuery(event)

  if (method === 'GET') {
    if (query.action === 'config' || query.action === 'defaults') {
      const config = await getMasterConfig()
      return {
        criteria: config.criteria,
        mandatoryFilters: config.mandatoryFilters,
        defaultCriteria: DEFAULT_CRITERIA,
        defaultMandatoryFilters: DEFAULT_MANDATORY_FILTERS
      }
    }
    const evaluations = await getAllEvaluations()
    const config = await getMasterConfig()
    return {
      evaluations: evaluations.filter(e => e.productName !== '__MASTER_CONFIG__'),
      defaultCriteria: config.criteria,
      defaultMandatoryFilters: config.mandatoryFilters
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    // Check if saving master configuration
    if (query.action === 'config' || body.__isMasterConfig) {
      const savedConfig = await saveMasterConfig(body)
      return { success: true, config: savedConfig }
    }

    const result = await saveEvaluation(body)
    return { success: true, evaluation: result }
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    if (!body || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
    }
    await deleteEvaluation(body.id)
    return { success: true }
  }
})
