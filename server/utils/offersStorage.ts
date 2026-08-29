import fs from 'fs'
import path from 'path'

const filePath = path.resolve(process.cwd(), 'server', 'data', 'offers.json')

export interface OfferData {
  [productId: string]: {
    discount: number
  }
}

const ensureFile = () => {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8')
  }
}

export const getOffers = (): OfferData => {
  try {
    ensureFile()
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading offers:', error)
    return {}
  }
}

export const saveOffers = (data: OfferData) => {
  try {
    ensureFile()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error saving offers:', error)
    return false
  }
}
