import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '../../utils/jwt'
import { findUserById } from '../../utils/nocodb'

export default defineEventHandler(async (event) => {
  const jwtUser = getUserFromEvent(event)
  
  if (!jwtUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado'
    })
  }

  // Fetch the latest user info from DB
  const user = await findUserById((jwtUser as any).id)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Usuario no encontrado'
    })
  }

  return {
    user: {
      id: user.Id || user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      preferences: user.preferences
    }
  }
})
