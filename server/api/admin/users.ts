import { defineEventHandler, createError, getMethod, readBody, getQuery } from 'h3'
import { getAllUsers, updateUser, findUserById } from '../../utils/nocodb'
import { getUserFromEvent } from '../../utils/jwt'
import { logSecurityAction, getAuditLogs } from '../../utils/auditLogger'

export default defineEventHandler(async (event) => {
  // Authentication & Authorization check
  const jwtUser = await getUserFromEvent(event)
  if (!jwtUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  if ((jwtUser as any).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admins only' })
  }

  const method = getMethod(event)
  const query = getQuery(event)

  if (method === 'GET') {
    if (query.action === 'audit') {
      const logs = await getAuditLogs()
      return { logs }
    }

    try {
      const users = await getAllUsers()
      const logs = await getAuditLogs()
      return {
        users: users.map((user: any) => ({
          id: user.Id || user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at || user.CreatedAt
        })),
        auditLogs: logs
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error fetching users' })
    }
  }

  if (method === 'PUT' || method === 'POST') {
    const body = await readBody(event)
    const userId = body.userId || body.id
    const role = body.role
    const reason = body.reason || 'Actualización de permisos desde el panel de administración'
    
    if (!userId || !role) {
      throw createError({ statusCode: 400, statusMessage: 'User ID and Role are required' })
    }
    
    if (!['admin', 'empleado', 'cliente'].includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }

    try {
      let targetUser: any = null
      try {
        targetUser = await findUserById(Number(userId))
      } catch (e) {
        // continue
      }

      const prevRole = targetUser?.role || 'cliente'
      await updateUser(userId, { role })

      // Record in Security Audit Log
      await logSecurityAction({
        adminName: (jwtUser as any).full_name || 'Jorge Vargas',
        adminEmail: (jwtUser as any).email || 'admin@arduino.hn',
        targetUserId: userId,
        targetUserName: targetUser?.full_name || body.userName || 'Usuario',
        targetUserEmail: targetUser?.email || body.userEmail || '',
        action: 'CAMBIO_DE_ROL',
        previousRole: prevRole,
        newRole: role,
        details: reason
      })

      return { success: true, message: 'Rol de usuario actualizado y registrado en auditoría con éxito.' }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error updating user role' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
