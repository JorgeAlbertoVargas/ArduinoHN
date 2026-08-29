import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function testProcessOrder() {
  const jwt = await import('jose')
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_arduino_hn_2026'
  const secret = new TextEncoder().encode(JWT_SECRET)
  
  const token = await new jwt.SignJWT({ id: 9, email: 'tester@gmail.com', role: 'cliente' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const payload = {
    id: Math.random().toString(36).substr(2, 9),
    total_price: 500, // 500 spent
    loyalty: {
      usedPoints: 50,    // using 50 points
      earnedPoints: 5,   // earning 5 points
      totalSpent: 450,
      pointsDiscountValue: 50
    }
  }

  // We can't easily fetch via nuxt local server if it's not running, so let's import the storage function directly
}

testProcessOrder()
