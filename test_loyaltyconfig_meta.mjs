import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nocodbUrl = process.env.NOCODB_URL
const nocodbToken = process.env.NOCODB_TOKEN
const table = process.env.NOCODB_LOYALTY_CONFIG_TABLE

async function test() {
  const url = `${nocodbUrl}api/v1/db/meta/tables/${table}`
  try {
    const res = await fetch(url, { headers: { 'xc-token': nocodbToken } })
    const data = JSON.parse(await res.text())
    if (data && data.columns) {
       data.columns.forEach(c => {
         console.log(`ColumnName: ${c.column_name}, Title: ${c.title}, Type: ${c.uidt}`)
       })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
