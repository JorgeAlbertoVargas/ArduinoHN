import jwt from 'jsonwebtoken'
import { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_arduino_hn_2026'

export const generateToken = (user: { id: number; email: string; role: string }) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const getUserFromEvent = (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null
  return verifyToken(token)
}
