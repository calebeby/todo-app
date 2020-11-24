import pg from 'pg'
import polka from 'polka'
import { sql } from 'sqliterally'
import * as dotenv from 'dotenv'
import { json } from 'body-parser'
import send from '@polka/send-type'

// Load environment variables from .env file
dotenv.config()

const app = polka()

app.use(json())

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
    res.end('hello world')
  })

  app.post('/tasks', async (req, res) => {
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to create a task')
    const { title, description, due_date, is_done } = req.body
    if (typeof title !== 'string')
      return send(res, 400, 'task title is required and must be a string')
    if (typeof description !== 'string')
      return send(res, 400, 'task description is required and must be a string')
    if (typeof due_date !== 'string')
      return send(res, 400, 'task due_date is required and must be a string')
    if (typeof is_done !== 'string')
      return send(res, 400, 'task is_done is required and must be a string')

    const queryResult = await client.query(sql`
      INSERT INTO task(title, description, due_date)
      VALUES (${title}, ${description}, ${due_date})
      RETURNING id
    `)
    const newId = queryResult.rows[0]?.id

    if (newId !== undefined) {
      send(res, 201, { id: newId })
    } else {
      send(res, 500)
    }
  })

  app.listen(3000)
}

main()
