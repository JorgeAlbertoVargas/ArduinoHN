import bcrypt from 'bcryptjs'
import { defineEventHandler, readBody, createError } from 'h3'
import { findUserByEmail, createUser } from '../../utils/nocodb'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, full_name } = body

  if (!email || !password || !full_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo, contraseña y nombre completo son requeridos'
    })
  }

  // Validate password (min 6 chars, uppercase, lowercase, number, special char)
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (password.length < 6 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener al menos 6 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales'
    })
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Ya existe un usuario con este correo electrónico'
    })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(password, salt)

  // Create user in NocoDB
  try {
    const newUserRecord = await createUser({
      email,
      password_hash,
      full_name,
      role: 'cliente', // Default role
      created_at: new Date().toISOString()
    })

    // NocoDB might return the created record or an array of created records.
    // If it's an array, we take the first element.
    const user = Array.isArray(newUserRecord) ? newUserRecord[0] : newUserRecord

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
        email: email,
        full_name: full_name,
        role: 'cliente'
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear el usuario'
    })
  }
})
