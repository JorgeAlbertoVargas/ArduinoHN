import { defineEventHandler } from 'h3'
import { getUserFromEvent } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  // Populate event context with user if authenticated
  const user = await getUserFromEvent(event)
  if (user) {
    event.context.user = user
  }
})
