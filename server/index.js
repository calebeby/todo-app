import pg from 'pg'
import polka from 'polka'
import { sql } from 'sqliterally'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const app = polka()
app.get('/', (req, res) => {
  res.end('Hello World!')
})

app.listen(3000)

const { DB_USER, DB_PASSWORD } = process.env

if (!DB_USER) throw new Error('Database user is required')
if (!DB_PASSWORD) throw new Error('Database user is required')

const main = async () => {
  const client = new pg.Client({
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'todo-app',
  })
  await client.connect()
  const res = await client.query(sql`
SELECT *
FROM "table"
`)
  console.log(res.rows)
}

main()

