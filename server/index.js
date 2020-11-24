import pg from 'pg'
import polka from 'polka'
import { sql } from 'sqliterally'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const app = polka()

const { DB_USER, DB_PASSWORD } = process.env

if (!DB_USER) throw new Error('Database user is required')
if (!DB_PASSWORD) throw new Error('Database password is required')

const main = async () => {
  const client = new pg.Client({
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'todo-app',
  })
  await client.connect()

  app.get('/', async (req, res) => {
    const response = JSON.stringify(
      (
        await client.query(sql`
  SELECT *
  FROM "table"
  `)
      ).rows,
    )
    res.end(response)
  })

  app.listen(5000)
}

main()
