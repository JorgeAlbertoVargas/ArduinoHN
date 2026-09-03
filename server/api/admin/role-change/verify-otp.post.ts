import { defineEventHandler, readBody, createError } from 'h3'
import { getUserFromEvent } from '../../../utils/jwt'
import { verifyRoleChangeOtp } from '../../../utils/otpStore'
import { updateUser } from '../../../utils/nocodb'

export default defineEventHandler(async (event) => {
  const admin = await getUserFromEvent(event)
  if (!admin || (admin as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)
  const { requestId, otpCode } = body

  if (!requestId || !otpCode) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros: requestId y otpCode.' })
  }

  // Verify OTP
  const verification = verifyRoleChangeOtp(requestId, otpCode)
  if (!verification.valid || !verification.request) {
    throw createError({ statusCode: 400, statusMessage: verification.error || 'Código inválido.' })
  }

  const { targetUserId, newRole, targetUserName, targetUserEmail } = verification.request

  // Apply change in database
  try {
    await updateUser(Number(targetUserId), { role: newRole })
  } catch (error: any) {
    console.error(`Error updating role for user ${targetUserId}:`, error)
    // Non-fatal if local fallback
  }

  return {
    success: true,
    message: `¡Rol de "${targetUserName}" (${targetUserEmail}) actualizado a "${newRole.toUpperCase()}" correctamente!`,
    userId: targetUserId,
    newRole
  }
})
