import { defineEventHandler, createError } from 'h3'
import { getOrderById } from '../../utils/orderStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = String((user as any).id)
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order ID' })
  }

  const order = await getOrderById(id)

  if (!order || String(order.userId) !== userId) {
    throw createError({ statusCode: 404, statusMessage: 'Orden no encontrada' })
  }

  return order
})
