import { SignJWT, jwtVerify } from 'jose'
import { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_arduino_hn_2026'
const secret = new TextEncoder().encode(JWT_SECRET)

export const generateToken = async (user: { id: number; email: string; role: string }) => {
  const jwt = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  return jwt
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export const getUserFromEvent = async (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null
  return await verifyToken(token)
}
