import pg from 'pg'
import polka from 'polka'
import { sql } from 'sqliterally'
import * as dotenv from 'dotenv'
import { json } from 'body-parser'
import send from '@polka/send-type'
import cors from 'cors'

// Load environment variables from .env file
dotenv.config()

const app = polka()

app.use(json())
app.use(cors({ origin: '*' }))

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
    if (typeof is_done !== 'boolean')
      return send(res, 400, 'task is_done is required and must be a boolean')

    const queryResult = await client.query(sql`
      INSERT INTO task(title, description, due_date, is_done)
      VALUES (${title}, ${description}, ${due_date}, ${is_done})
      RETURNING id
    `)
    const newId = queryResult.rows[0]?.id

    if (newId !== undefined) {
      send(res, 201, { id: newId })
    } else {
      send(res, 500)
    }
  })

  app.put('/tasks/:id', async (req, res) => {
    if (typeof req.params.id !== 'string')
      return send(res, 400, 'task id required to update a task')
    const id = Number(req.params.id)
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to update a task')
    const { title, description, due_date, is_done } = req.body

    const queryResult = await client.query(sql`
      UPDATE task
        SET
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          due_date = COALESCE(${due_date}, due_date),
          is_done = COALESCE(${is_done}, is_done)
        WHERE
          id = ${id}
        RETURNING *
    `)
    send(res, 200, queryResult.rows[0])
  })

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
