import bcrypt from 'bcryptjs'
import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import { findUserByEmail } from '../../utils/nocodb'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo y contraseña son requeridos'
    })
  }

  // Check if user exists
  const user = await findUserByEmail(email)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas'
    })
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas'
    })
  }

  // Generate JWT
  const token = generateToken({
    id: user.Id || user.id,
    email: user.email,
    role: user.role
  })

  // Set cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })

  return {
    user: {
      id: user.Id || user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  }
})
