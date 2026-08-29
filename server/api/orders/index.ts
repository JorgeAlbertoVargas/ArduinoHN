import { defineEventHandler, createError } from 'h3'
import { getUserOrders } from '../../utils/orderStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = String((user as any).id)
  return await getUserOrders(userId)
})
