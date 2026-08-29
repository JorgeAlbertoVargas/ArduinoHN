import { defineEventHandler, readBody, createError } from 'h3'
import { getUserLoyalty, saveUserLoyalty } from '../../utils/loyaltyStorage'
import { saveOrder, Order } from '../../utils/orderStorage'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Debes iniciar sesión para procesar la orden con lealtad' })
  }

  const userId = String((user as any).id)
  const body = await readBody(event)
  
  const orderId = body.id || Math.random().toString(36).substr(2, 9)
  
  const loyaltyReq = body.loyalty
  
  let usedPoints = 0
  let earnedPoints = 0
  let totalSpent = Number(body.total_price) || 0
  let pointsDiscountValue = 0

  if (loyaltyReq) {
    usedPoints = loyaltyReq.usedPoints || 0
    earnedPoints = loyaltyReq.earnedPoints || 0
    totalSpent = loyaltyReq.totalSpent || 0
    pointsDiscountValue = loyaltyReq.pointsDiscountValue || 0

    // Obtener puntos actuales
    const userLoyalty = await getUserLoyalty(userId)
    
    if (usedPoints > 0 && userLoyalty.points < usedPoints) {
      throw createError({ statusCode: 400, statusMessage: 'No tienes suficientes puntos' })
    }

    // Restar puntos usados
    userLoyalty.points -= usedPoints
    
    // Sumar puntos ganados
    userLoyalty.points += earnedPoints
    
    // Sumar al historial
    userLoyalty.historicalSpent += totalSpent

    // Registrar transacción
    if (!userLoyalty.transactions) {
      userLoyalty.transactions = []
    }
    
    userLoyalty.transactions.unshift({
      date: new Date().toISOString(),
      orderId: orderId,
      usedPoints: usedPoints,
      earnedPoints: earnedPoints
    })

    // Guardar
    await saveUserLoyalty(userId, userLoyalty)
  }

  // Guardar Orden Completa
  const newOrder: Order = {
    id: orderId,
    userId: userId,
    date: new Date().toISOString(),
    items: body.line_items || [],
    totalPrice: Number(body.total_price),
    subtotal: Number(body.subtotal_price) || Number(body.total_price),
    loyalty: {
      usedPoints,
      earnedPoints,
      pointsDiscountValue
    },
    status: 'Completada'
  }
  
  await saveOrder(newOrder)

  return {
    success: true,
    message: `Orden ${orderId} pagada. Usaste ${usedPoints} pts y ganaste ${earnedPoints} pts.`
  }
})
