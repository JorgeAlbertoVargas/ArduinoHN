import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nocodbUrl = process.env.NOCODB_URL
const nocodbToken = process.env.NOCODB_TOKEN
const table = process.env.NOCODB_LOYALTY_TRANSACTIONS_TABLE

async function test() {
  const url = `${nocodbUrl}api/v2/tables/${table}/records?limit=1`
  try {
    const res = await fetch(url, { headers: { 'xc-token': nocodbToken } })
    const data = JSON.parse(await res.text())
    console.log(JSON.stringify(data.list[0], null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
