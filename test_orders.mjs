import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nocodbUrl = process.env.NOCODB_URL
const nocodbToken = process.env.NOCODB_TOKEN

async function fetchNocoDB(tableId, pathStr = '', options = {}) {
  const url = `${nocodbUrl}api/v2/tables/${tableId}/records${pathStr}`
  const headers = { 'xc-token': nocodbToken, 'Content-Type': 'application/json', ...(options.headers || {}) }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) throw new Error(`NocoDB Error: ${res.status} ${await res.text()}`)
  return JSON.parse(await res.text())
}

async function testGetUserOrders() {
  const userId = '9';
  console.log(`Fetching orders for user ${userId}...`)
  
  try {
    // 1. Fetch transactions
    const txResponse = await fetchNocoDB(
      process.env.NOCODB_LOYALTY_TRANSACTIONS_TABLE, 
      `?where=(user_id,eq,${userId})`
    )
    console.log('Transactions found:', txResponse.list.length)
    if (txResponse.list.length > 0) {
      console.log('First TX:', txResponse.list[0])
    }
    
    const orderIds = txResponse.list.map(tx => tx.order_id)
    console.log('Order IDs mapped:', orderIds)
    
    if (orderIds.length === 0) {
      console.log('No order IDs found')
      return;
    }
    
    // 2. Fetch orders
    const orders = []
    for (const orderId of orderIds) {
      console.log(`Fetching order ${orderId}...`)
      const orderRes = await fetchNocoDB(process.env.NOCODB_ORDERS_TABLE, `?where=(order_id,eq,${orderId})`)
      if (orderRes && orderRes.list && orderRes.list.length > 0) {
        orders.push(orderRes.list[0])
      } else {
        console.log(`Order ${orderId} NOT FOUND in Orders table!`)
      }
    }
    
    console.log('Final orders length:', orders.length)
  } catch(error) {
    console.error('Error:', error)
  }
}

testGetUserOrders()
