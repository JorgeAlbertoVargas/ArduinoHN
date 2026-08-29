import { useRuntimeConfig } from '#imports'
import { fetchNocoDB } from './nocodb'

// NocoDB server is 3 hours ahead of true UTC. 
// We subtract 3 hours to get true UTC so the frontend can format it correctly for the user's local timezone.
function fixNocoDBDate(dateString: string) {
  if (!dateString) return new Date().toISOString()
  try {
    const d = new Date(dateString)
    d.setHours(d.getHours() - 3)
    return d.toISOString()
  } catch(e) {
    return new Date().toISOString()
  }
}

export interface OrderItem {
  sku: string;
  title: string;
  quantity: number;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
}

export interface LoyaltyOrderData {
  usedPoints: number;
  earnedPoints: number;
  pointsDiscountValue: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  totalPrice: number;
  subtotal: number;
  loyalty?: LoyaltyOrderData;
  status: string;
}

export const getAllOrders = async (): Promise<Order[]> => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbOrdersTable, '?limit=100&sort=-created_at')
    if (response && response.list) {
      return response.list.map((row: any) => {
        let items = []
        try {
          items = JSON.parse(row['Items Summary'] || row.items_summary)
        } catch(e) {
          // Fallback if it's just a text string
          items = [{ title: row['Items Summary'] || row.items_summary, quantity: 1, price: row['Total Amount'] || row.total_amount, sku: 'N/A' }]
        }
        
        return {
          id: row['Order ID'] || row.order_id,
          userId: 'N/A', // We don't have user_id in OrdersTable by default, but we can rely on transactions
          date: fixNocoDBDate(row.CreatedAt || row.created_at),
          items: items,
          totalPrice: row['Total Amount'] || row.total_amount,
          subtotal: row['Total Amount'] || row.total_amount, // Approximation
          status: row.Status || row.status || 'Desconocido'
        }
      })
    }
  } catch (error) {
    console.error('Error fetching all orders from NocoDB:', error)
  }
  return []
}

export const getUserOrders = async (userId: string | number): Promise<Order[]> => {
  // To get user orders efficiently, we first get their loyalty transactions to find their order_ids
  const config = useRuntimeConfig()
  try {
    const txResponse: any = await fetchNocoDB(
      config.public.nocodbLoyaltyTransactionsTable, 
      `?where=(user_id,eq,${userId})`
    )
    
    if (txResponse && txResponse.list) {
      const orderIds = txResponse.list.map((tx: any) => tx.order_id)
      
      if (orderIds.length === 0) return []
      
      const orders = []
      for (const orderId of orderIds) {
        const orderRes: any = await fetchNocoDB(config.public.nocodbOrdersTable, `?where=(Order%20ID,eq,${orderId})`)
        if (orderRes && orderRes.list && orderRes.list.length > 0) {
          const row = orderRes.list[0]
          let items = []
          try {
            items = JSON.parse(row['Items Summary'] || row.items_summary)
          } catch(e) {}
          
          orders.push({
            id: row['Order ID'] || row.order_id,
            userId: String(userId),
            date: fixNocoDBDate(row.CreatedAt || row.created_at),
            items: items,
            totalPrice: row['Total Amount'] || row.total_amount,
            subtotal: row['Total Amount'] || row.total_amount,
            status: row.Status || row.status || 'Desconocido'
          })
        }
      }
      // Sort newest first
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  } catch(error) {
    console.error('Error fetching user orders from NocoDB:', error)
  }
  
  return []
}

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const config = useRuntimeConfig()
  try {
    // 1. Fetch Order Details
    const response: any = await fetchNocoDB(config.public.nocodbOrdersTable, `?where=(Order%20ID,eq,${id})`)
    if (response && response.list && response.list.length > 0) {
      const row = response.list[0]
      
      let items = []
      try { items = JSON.parse(row['Items Summary'] || row.items_summary) } catch(e) {}
      
      // 2. Fetch Loyalty Info for this order to get usedPoints/earnedPoints
      let loyalty: LoyaltyOrderData | undefined
      let userId = '0'
      const txRes: any = await fetchNocoDB(config.public.nocodbLoyaltyTransactionsTable, `?where=(order_id,eq,${id})`)
      if (txRes && txRes.list && txRes.list.length > 0) {
        const tx = txRes.list[0]
        userId = String(tx.user_id || tx.user_id)
        loyalty = {
          usedPoints: tx.used_points,
          earnedPoints: tx.earned_points,
          pointsDiscountValue: tx.used_points // assuming 1:1 for display fallback
        }
      }

      return {
        id: row['Order ID'] || row.order_id,
        userId: userId,
        date: fixNocoDBDate(row.CreatedAt || row.created_at),
        items: items,
        totalPrice: row['Total Amount'] || row.total_amount,
        subtotal: row['Total Amount'] || row.total_amount,
        loyalty,
        status: row.Status || row.status || 'Desconocido'
      }
    }
  } catch(error) {
    console.error(`Error fetching order ${id} from NocoDB:`, error)
  }
  return undefined
}

export const saveOrder = async (order: Order) => {
  const config = useRuntimeConfig()
  try {
    // We store the items array as a JSON string in items_summary for easy retrieval
    // since we can't alter the NocoDB schema right now
    await fetchNocoDB(config.public.nocodbOrdersTable, '', {
      method: 'POST',
      body: {
        order_id: String(order.id),
        total_amount: order.totalPrice,
        items_summary: JSON.stringify(order.items), 
        status: order.status
      }
    })
  } catch (error) {
    console.error('Error saving order to NocoDB:', error)
  }
}
