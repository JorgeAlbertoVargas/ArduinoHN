import { defineEventHandler, getMethod, readBody, createError } from 'h3'
import { getLoyaltyConfig, saveLoyaltyConfig } from '../../utils/loyaltyStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)
  
  if (!user || (user as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const method = getMethod(event)

  if (event.node.req.method === 'GET') {
    return await getLoyaltyConfig()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    await saveLoyaltyConfig(body)
    return { success: true }
  }
})
