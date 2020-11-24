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

  //retrieve task based on ID
  app.get('/tasks/:id', async (req, res) => {
    const response = JSON.stringify(
      (
        await client.query(sql`
  SELECT *
  FROM "task"
  WHERE task.id = ${req.params.id}
  `)
      ).rows[0],
    )
    res.end(response)
  })

  app.get('/tasks', async (req, res) => {
    if (req.query.start && req.query.end) {
      //Retrieve all tasks in a week based on the start and end date
      const response = JSON.stringify(
        (
          await client.query(sql`
  SELECT *
  FROM "task"
  WHERE task.due_date >= ${req.query.start} AND
  task.due_date <= ${req.query.end}
  `)
        ).rows,
      )
      res.end(response)
    } else {
      //retrieve all not done tasks
      const response = JSON.stringify(
        (
          await client.query(sql`
    SELECT *
    FROM "task"
    WHERE task.is_done = false
    `)
        ).rows,
      )
      res.end(response)
    }
  })

  app.listen(5000)
}

main()
