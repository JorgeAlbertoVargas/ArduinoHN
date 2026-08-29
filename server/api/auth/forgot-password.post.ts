import crypto from 'crypto'
import { defineEventHandler, readBody, createError } from 'h3'
import { findUserByEmail, updateUser } from '../../utils/nocodb'
import { sendPasswordResetEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El correo electrónico es requerido'
    })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return { success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación.' }
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenExpiry = new Date(Date.now() + 3600000).toISOString() // 1 hour from now

  // Save token in DB
  try {
    await updateUser(user.Id || user.id, {
      reset_password_token: resetToken,
      reset_password_expires: tokenExpiry
    })
  } catch (error) {
    console.error('Error saving reset token:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al procesar la solicitud'
    })
  }

  // Send Email
  const emailSent = await sendPasswordResetEmail(email, resetToken)

  if (!emailSent) {
    // If email failed to send, we might want to clear the token or just return an error
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al enviar el correo electrónico'
    })
  }

  return {
    success: true,
    message: 'Si el correo existe, se ha enviado un enlace de recuperación.'
  }
})
