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
  
  //Retrieve all tasks in a week based on the start and end date
  app.get('/task', async (req, res) => {
    const response = JSON.stringify(
      (
        await client.query(sql`
  SELECT *
  FROM "task"
  WHERE task.duedate >= ${req.query.start} AND
  task.duedate <= ${req.query.end}
  `)
      ).rows,
    )
    res.end(response)
  })

  //retrieve task based on ID
  app.get('/task/:id', async (req, res) => {
    const response = JSON.stringify(
      (
        await client.query(sql`
  SELECT *
  FROM "task"
  WHERE task.id = ${req.params.id}
  `)
      ).rows,
    )
    res.end(response)
  })

  //retrieve all not done tasks
  app.get('/task', async (req, res) => {
    const response = JSON.stringify(
      (
        await client.query(sql`
  SELECT *
  FROM "task"
  WHERE task.isdone = false
  `)
      ).rows,
    )
    res.end(response)
  })

  app.listen(3000)
}

main()
