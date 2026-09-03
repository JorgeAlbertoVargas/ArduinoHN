import { defineEventHandler, readBody, createError } from 'h3'
import { getUserFromEvent } from '../../../utils/jwt'
import { createRoleChangeRequest } from '../../../utils/otpStore'
import { sendRoleChangeOtpEmail } from '../../../utils/email'
import { findUserById } from '../../../utils/nocodb'

export default defineEventHandler(async (event) => {
  const admin = await getUserFromEvent(event)
  if (!admin || (admin as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Requiere privilegios de administrador.' })
  }

  const body = await readBody(event)
  const { targetUserId, newRole, targetUserName, targetUserEmail } = body

  if (!targetUserId || !newRole) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros requeridos (targetUserId, newRole).' })
  }

  // Get target user to verify
  let userDetails: any = { full_name: targetUserName, email: targetUserEmail, role: 'cliente' }
  try {
    const fetched = await findUserById(Number(targetUserId))
    if (fetched) {
      userDetails = fetched
    }
  } catch (e) {
    // continue
  }

  // Security Email destination: owner / admin email
  const ownerEmail = process.env.ADMIN_SECURITY_EMAIL || 'jvargas@syteccorp.com'

  const request = createRoleChangeRequest({
    adminEmail: (admin as any).email || ownerEmail,
    adminName: (admin as any).full_name || 'Jorge Vargas',
    targetUserId,
    targetUserName: userDetails.full_name || targetUserName || 'Usuario',
    targetUserEmail: userDetails.email || targetUserEmail || '',
    newRole,
    previousRole: userDetails.role || 'cliente'
  })

  // Send OTP email
  const emailResult = await sendRoleChangeOtpEmail(ownerEmail, request.otpCode, {
    targetName: request.targetUserName,
    targetEmail: request.targetUserEmail,
    newRole: request.newRole,
    adminName: request.adminName
  })

  const isDev = process.env.NODE_ENV !== 'production' || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'tu_contrasena_de_correo'

  return {
    success: true,
    requestId: request.requestId,
    targetUserId: request.targetUserId,
    targetUserName: request.targetUserName,
    newRole: request.newRole,
    sentToEmail: ownerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Obfuscated
    fullSentToEmail: ownerEmail,
    emailSent: emailResult.success,
    emailError: emailResult.error,
    devOtp: isDev ? request.otpCode : undefined
  }
})
