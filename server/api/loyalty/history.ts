import { defineEventHandler, createError } from 'h3'
import { getUserLoyalty } from '../../utils/loyaltyStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = (user as any).id
  const userLoyalty = await getUserLoyalty(userId)
  
  return {
    transactions: userLoyalty.transactions || []
  }
})
