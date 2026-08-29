import { defineEventHandler, createError, getMethod, readBody } from 'h3'
import { getAllUsers, updateUser } from '../../utils/nocodb'
import { getUserFromEvent } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  // Authentication & Authorization check
  const jwtUser = getUserFromEvent(event)
  if (!jwtUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  if ((jwtUser as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admins only' })
  }

  const method = getMethod(event)

  if (method === 'GET') {
    try {
      const users = await getAllUsers()
      // Filter out sensitive data
      return users.map((user: any) => ({
        id: user.Id || user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at || user.CreatedAt
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error fetching users' })
    }
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { userId, role } = body
    
    if (!userId || !role) {
      throw createError({ statusCode: 400, statusMessage: 'User ID and Role are required' })
    }
    
    if (!['admin', 'empleado', 'cliente'].includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }

    try {
      await updateUser(userId, { role })
      return { success: true, message: 'User role updated successfully' }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error updating user role' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
