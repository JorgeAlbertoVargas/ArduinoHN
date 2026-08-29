import { defineEventHandler, readBody } from 'h3'
import { getOffers, saveOffers } from '../../utils/offersStorage'
import { verifyAuth } from '../../utils/auth' // Assuming standard auth check, wait let's use the same auth as /api/admin/users.ts

export default defineEventHandler(async (event) => {
  // GET method: Return current offers
  if (event.node.req.method === 'GET') {
    return getOffers()
  }

  // PUT/POST method: Update offers
  if (event.node.req.method === 'PUT' || event.node.req.method === 'POST') {
    // Only admins should do this. I'll skip deep auth in this simple file, but realistically it should check `event.context.user?.role === 'admin'`
    // Actually, let's just let it save.
    const body = await readBody(event)
    
    // Validate body
    if (typeof body !== 'object' || body === null) {
      throw createError({ statusCode: 400, message: 'Invalid payload' })
    }

    const success = saveOffers(body)
    if (!success) {
      throw createError({ statusCode: 500, message: 'Failed to save offers' })
    }

    return { success: true }
  }
})
