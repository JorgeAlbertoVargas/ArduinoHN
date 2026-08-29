import { fetch } from 'undici'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nocodbUrl = process.env.NOCODB_URL
const nocodbToken = process.env.NOCODB_TOKEN

async function test() {
  const url = `${nocodbUrl}api/v1/db/meta/projects/pf1psc92t0y32as/tables`

  try {
    const res = await fetch(url, { headers: { 'xc-token': nocodbToken } })
    const text = await res.text()
    const tables = JSON.parse(text).list || JSON.parse(text)
    if (Array.isArray(tables)) {
       tables.forEach((t) => console.log(`${t.id} - ${t.title}`))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
