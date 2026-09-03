import { useRuntimeConfig } from '#imports'
import { fetchNocoDB, updateUser, findUserById } from './nocodb'

export interface CompanyInfo {
  rtn: string;
  razonSocial: string;
  nombreComercial: string;
  colonia: string;
  calle: string;
  zona: string;
  bloque: string;
  referencia: string;
  departamento: string;
  municipio: string;
  telefonoFijo: string;
  telefonoMovil: string;
  email: string;
}

export interface SarConfig {
  cai: string;
  fechaLimiteEmision: string; // YYYY-MM-DD
  puntoEmision: string;
  documentoFiscal: string;
  cantidadAutorizada: number | string;
  rangoInicial: string;
  rangoFinal: string;
  siguienteFactura: string;
}

export interface LoyaltyConfig {
  earnRate: number; // Lempiras to spend to earn 1 point
  redemptionValue: number; // Value in Lempiras of 1 point
  exchangeRate: number; // Lempiras per 1 USD
  isvPercent: number;
  cai: string;
  digikeyProfitMargin: number; // Margen de semiconductores (ej. 2.0 = 100% ganancia)
  enableTiers: boolean;
  tiers: {
    silverThreshold: number;
    silverDiscount: number;
    goldThreshold: number;
    goldDiscount: number;
  };
  company?: CompanyInfo;
  sar?: SarConfig;
}

// In-memory fallback config with default SAR and ArduinoHN details
let inMemoryConfig: LoyaltyConfig = {
  earnRate: 100,
  redemptionValue: 1,
  exchangeRate: 25,
  isvPercent: 15,
  cai: '52BA20-7B982A-0A62E0-63BE03-090966-04',
  digikeyProfitMargin: 2.0,
  enableTiers: false,
  tiers: {
    silverThreshold: 5000,
    silverDiscount: 5,
    goldThreshold: 20000,
    goldDiscount: 10
  },
  company: {
    rtn: '18041969022884',
    razonSocial: 'ArduinoHN S.R.L.',
    nombreComercial: 'ArduinoHN SRL',
    colonia: 'BUFALO',
    calle: 'PRINCIPAL',
    zona: '',
    bloque: '',
    referencia: 'PARQUE INDUSTRIAL ZIP BUFALO',
    departamento: 'CORTÉS',
    municipio: 'VILLANUEVA',
    telefonoFijo: '95205861',
    telefonoMovil: '95205861',
    email: 'info@arduino.hn'
  },
  sar: {
    cai: '52BA20-7B982A-0A62E0-63BE03-090966-04',
    fechaLimiteEmision: '2027-05-26',
    puntoEmision: '001 - Auto impresor: SFC en Red Fijo',
    documentoFiscal: '01 - Factura',
    cantidadAutorizada: 100,
    rangoInicial: '000-001-01-00002451',
    rangoFinal: '000-001-01-00002550',
    siguienteFactura: '000-001-01-00002451'
  }
}

// Fetch Loyalty Config from NocoDB
export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '?limit=1')
    if (response && response.list && response.list.length > 0) {
      const row = response.list[0]
      const dbConfig: LoyaltyConfig = {
        earnRate: Number(row.earn_rate || inMemoryConfig.earnRate),
        redemptionValue: Number(row.redemption_value || inMemoryConfig.redemptionValue),
        exchangeRate: Number(row.exchange_rate || inMemoryConfig.exchangeRate),
        isvPercent: Number(row.isv_percent || inMemoryConfig.isvPercent),
        cai: row.cai || inMemoryConfig.cai,
        digikeyProfitMargin: Number(row.digikey_profit_margin || inMemoryConfig.digikeyProfitMargin),
        enableTiers: Boolean(row.enable_tiers ?? inMemoryConfig.enableTiers),
        tiers: {
          silverThreshold: Number(row.silver_threshold || inMemoryConfig.tiers.silverThreshold),
          silverDiscount: Number(row.silver_discount || inMemoryConfig.tiers.silverDiscount),
          goldThreshold: Number(row.gold_threshold || inMemoryConfig.tiers.goldThreshold),
          goldDiscount: Number(row.gold_discount || inMemoryConfig.tiers.goldDiscount)
        },
        company: row.company_data ? (typeof row.company_data === 'string' ? JSON.parse(row.company_data) : row.company_data) : inMemoryConfig.company,
        sar: row.sar_data ? (typeof row.sar_data === 'string' ? JSON.parse(row.sar_data) : row.sar_data) : inMemoryConfig.sar
      }
      inMemoryConfig = { ...inMemoryConfig, ...dbConfig }
      return inMemoryConfig
    }
  } catch (error) {
    console.error('Error fetching loyalty config from NocoDB, using inMemoryConfig:', error)
  }
  
  return inMemoryConfig
}

// Save Loyalty Config to NocoDB
export const saveLoyaltyConfig = async (loyaltyConfig: LoyaltyConfig) => {
  const config = useRuntimeConfig()
  inMemoryConfig = { ...inMemoryConfig, ...loyaltyConfig }
  
  try {
    const response: any = await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '?limit=1')
    
    const payload: any = {
      earn_rate: loyaltyConfig.earnRate,
      redemption_value: loyaltyConfig.redemptionValue,
      exchange_rate: loyaltyConfig.exchangeRate,
      isv_percent: loyaltyConfig.isvPercent,
      cai: loyaltyConfig.cai || loyaltyConfig.sar?.cai,
      digikey_profit_margin: loyaltyConfig.digikeyProfitMargin,
      enable_tiers: loyaltyConfig.enableTiers,
      company_data: JSON.stringify(loyaltyConfig.company),
      sar_data: JSON.stringify(loyaltyConfig.sar)
    }

    if (response && response.list && response.list.length > 0) {
      const recordId = response.list[0].Id || response.list[0].id
      await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '', {
        method: 'PATCH',
        body: {
          Id: recordId,
          id: recordId,
          ...payload
        }
      })
    } else {
      await fetchNocoDB(config.public.nocodbLoyaltyConfigTable, '', {
        method: 'POST',
        body: payload
      })
    }
  } catch (error) {
    console.error('Error saving loyalty config to NocoDB (saved in memory):', error)
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
