import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '../../utils/jwt'
import { findUserById } from '../../utils/nocodb'

export default defineEventHandler(async (event) => {
  const jwtUser = await getUserFromEvent(event)
  
  if (!jwtUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado'
    })
  }

  // Try to fetch latest user info from DB, fallback to JWT claims if DB is offline
  let user: any = null
  try {
    user = await findUserById((jwtUser as any).id)
  } catch (error) {
    console.warn('NocoDB unreachable in me.get.ts, falling back to JWT claims')
  }

  let resolvedName = user?.full_name || (jwtUser as any).full_name
  if (!resolvedName || resolvedName.toLowerCase() === 'administrador' || resolvedName.toLowerCase() === 'admin') {
    resolvedName = 'Jorge Vargas'
  }

  return {
    user: {
      id: user?.Id || user?.id || (jwtUser as any).id,
      email: user?.email || (jwtUser as any).email,
      full_name: resolvedName,
      role: user?.role || (jwtUser as any).role || 'admin',
      preferences: user?.preferences || null
    }
  }
})
