import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
try {
  const rows = await p['\x24queryRawUnsafe']('SHOW CREATE TABLE t_records')
  console.log(typeof rows, Array.isArray(rows))
  if (rows && rows[0]) {
    console.log(Object.keys(rows[0]))
    console.log(JSON.stringify(rows[0], null, 2).slice(0, 2000))
  }
} catch (e) { console.error(e.message) }
await p['\x24disconnect']()
