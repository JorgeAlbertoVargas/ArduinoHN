import { defineEventHandler, readBody, createError } from 'h3'
import { getUserFromEvent } from '../../utils/jwt'
import { sendTestEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const admin = await getUserFromEvent(event)
  if (!admin || (admin as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Requiere privilegios de administrador.' })
  }

  const body = await readBody(event).catch(() => ({}))
  const targetEmail = body?.email || 'jvargas@syteccorp.com'

  const result = await sendTestEmail(targetEmail)

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      targetEmail
    }
  }

  return {
    success: true,
    message: `¡Correo de prueba enviado con éxito a ${targetEmail}!`,
    messageId: result.message,
    targetEmail
  }
})
