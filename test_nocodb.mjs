import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nocodbUrl = process.env.NOCODB_URL
const nocodbToken = process.env.NOCODB_TOKEN
const nocodbUsersTable = process.env.NOCODB_USERS_TABLE

async function test() {
  const url = `${nocodbUrl}api/v1/db/meta/tables/${nocodbUsersTable}`
  try {
    const res = await fetch(url, { headers: { 'xc-token': nocodbToken } })
    const table = JSON.parse(await res.text())
    if (table && table.columns) {
       table.columns.forEach((c) => console.log(`${c.column_name} - ${c.uidt}`))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
