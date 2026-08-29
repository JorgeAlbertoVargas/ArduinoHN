import bcrypt from 'bcryptjs'
import { defineEventHandler, readBody, createError } from 'h3'
import { findUserByResetToken, updateUser } from '../../utils/nocodb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, newPassword } = body

  if (!token || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El token y la nueva contraseña son requeridos'
    })
  }

  // Validate new password (min 6 chars, alphanumeric)
  const isAlphanumeric = /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(newPassword)
  if (newPassword.length < 6 || !isAlphanumeric) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener al menos 6 caracteres y contener letras y números'
    })
  }

  // Find user by token
  const user = await findUserByResetToken(token)
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token inválido o expirado'
    })
  }

  // Check if token expired
  if (new Date(user.reset_password_expires) < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El token ha expirado'
    })
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(newPassword, salt)

  // Update user
  try {
    await updateUser(user.Id || user.id, {
      password_hash,
      reset_password_token: null,
      reset_password_expires: null
    })
  } catch (error) {
    console.error('Error updating password:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar la contraseña'
    })
  }

  return {
    success: true,
    message: 'Contraseña actualizada exitosamente'
  }
})
