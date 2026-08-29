import { defineEventHandler } from 'h3'
import { getUserFromEvent } from '../utils/jwt'

export default defineEventHandler((event) => {
  // Populate event context with user if authenticated
  const user = getUserFromEvent(event)
  if (user) {
    event.context.user = user
  }
})
