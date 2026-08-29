import { useRuntimeConfig } from '#imports'
import { fetchNocoDB, updateUser, findUserById } from './nocodb'

export interface LoyaltyConfig {
  earnRate: number; // Lempiras to spend to earn 1 point
  redemptionValue: number; // Value in Lempiras of 1 point
  exchangeRate: number; // Lempiras per 1 USD
  enableTiers: boolean;
  tiers: {
    silverThreshold: number;
    silverDiscount: number;
    goldThreshold: number;
    goldDiscount: number;
  };
}

export interface LoyaltyTransaction {
  id?: string | number;
  date: string;
  orderId: string;
  earnedPoints: number;
  usedPoints: number;
  user_id?: string | number;
}

export interface UserLoyaltyData {
  points: number;
  historicalSpent: number;
  transactions?: LoyaltyTransaction[];
}

// Fetch Loyalty Config from NocoDB
export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '?limit=1')
    if (response && response.list && response.list.length > 0) {
      const row = response.list[0]
      return {
        earnRate: row.earn_rate || 100,
        redemptionValue: row.redemption_value || 1,
        exchangeRate: row.exchange_rate || 25,
        enableTiers: row.enable_tiers || false,
        tiers: {
          silverThreshold: 5000,
          silverDiscount: 5,
          goldThreshold: 20000,
          goldDiscount: 10
        }
      }
    }
  } catch (error) {
    console.error('Error fetching loyalty config from NocoDB:', error)
  }
  
  // Default fallback
  return {
    earnRate: 100,
    redemptionValue: 1,
    exchangeRate: 25,
    enableTiers: false,
    tiers: {
      silverThreshold: 5000,
      silverDiscount: 5,
      goldThreshold: 20000,
      goldDiscount: 10
    }
  }
}

// Save Loyalty Config to NocoDB
export const saveLoyaltyConfig = async (loyaltyConfig: LoyaltyConfig) => {
  const config = useRuntimeConfig()
  try {
    // Check if record exists
    const response: any = await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '?limit=1')
    
    if (response && response.list && response.list.length > 0) {
      // Update
      const recordId = response.list[0].Id || response.list[0].id
      await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '', {
        method: 'PATCH',
        body: {
          Id: recordId,
          id: recordId,
          earn_rate: loyaltyConfig.earnRate,
          redemption_value: loyaltyConfig.redemptionValue,
          exchange_rate: loyaltyConfig.exchangeRate,
          enable_tiers: loyaltyConfig.enableTiers
        }
      })
    } else {
      // Create
      await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '', {
        method: 'POST',
        body: {
          earn_rate: loyaltyConfig.earnRate,
          redemption_value: loyaltyConfig.redemptionValue,
          exchange_rate: loyaltyConfig.exchangeRate,
          enable_tiers: loyaltyConfig.enableTiers
        }
      })
    }
  } catch (error) {
    console.error('Error saving loyalty config to NocoDB:', error)
  }
}

// Fetch User Loyalty (points and transactions)
export const getUserLoyalty = async (userId: string | number): Promise<UserLoyaltyData> => {
  const config = useRuntimeConfig()
  const uid = Number(userId)
  
  let points = 0
  let historicalSpent = 0
  let transactions: LoyaltyTransaction[] = []
  
  try {
    // Fetch User Record
    const userRow = await findUserById(uid)
    if (userRow) {
      points = Number(userRow.points) || 0
      historicalSpent = Number(userRow.historical_spent) || 0
    }

    // Fetch Transactions
    const txResponse: any = await fetchNocoDB(
      config.public.nocodbLoyaltyTransactionsTable, 
      `?where=(user_id,eq,${uid})&sort=-date`
    )
    if (txResponse && txResponse.list) {
      transactions = txResponse.list.map((tx: any) => ({
        id: tx.Id,
        date: tx.date,
        orderId: tx.order_id,
        earnedPoints: tx.earned_points || 0,
        usedPoints: tx.used_points || 0
      }))
    }
  } catch (error) {
    console.error(`Error fetching loyalty data for user ${userId}:`, error)
  }

  return { points, historicalSpent, transactions }
}

// Save User Loyalty (update user points, and save transaction if needed)
export const saveUserLoyalty = async (userId: string | number, data: UserLoyaltyData) => {
  const config = useRuntimeConfig()
  const uid = Number(userId)
  
  try {
    // 1. Update User Table with new points/historical_spent
    await updateUser(uid, {
      points: Math.round(data.points),
      historical_spent: Math.round(data.historicalSpent)
    })

    // 2. Identify and push new transactions (transactions without an Id)
    if (data.transactions && data.transactions.length > 0) {
      const newTransactions = data.transactions.filter(tx => !tx.id)
      
      for (const tx of newTransactions) {
        await fetchNocoDB(config.public.nocodbLoyaltyTransactionsTable, '', {
          method: 'POST',
          body: {
            user_id: String(uid),
            order_id: tx.orderId,
            earned_points: tx.earnedPoints,
            used_points: tx.usedPoints,
            date: tx.date
          }
        })
      }
    }
  } catch (error) {
    console.error(`Error saving loyalty data for user ${userId}:`, error)
  }
}
