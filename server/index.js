import pg from 'pg'
import polka from 'polka'
import { sql } from 'sqliterally'
import * as dotenv from 'dotenv'
import { json } from 'body-parser'
import send from '@polka/send-type'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Load environment variables from .env file
dotenv.config()

const { DB_USER, DB_PASSWORD, ACCESS_TOKEN_SECRET } = process.env

if (!DB_USER) throw new Error('Database user is required')
if (!DB_PASSWORD) throw new Error('Database password is required')
if (!ACCESS_TOKEN_SECRET) throw new Error('Access token secret is required')

const app = polka()

app.use(json())
app.use(cors({ origin: '*' }))

const jwtPrefix = 'Bearer '
const jwtExpiresIn = 30 * 60 // seconds
const saltRounds = 12

/**
 * @param {{userId: number}} userInfo
 * @returns {Promise<string>}
 */
const generateToken = (userInfo) =>
  new Promise((resolve, reject) => {
    return jwt.sign(
      userInfo,
      ACCESS_TOKEN_SECRET,
      { expiresIn: `${jwtExpiresIn}s` },
      (error, token) => {
        if (error) reject(error)
        else resolve(token)
      },
    )
  })

// Based on https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
app.use((req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return next()
  if (!authHeader.startsWith(jwtPrefix))
    return send(
      res,
      401,
      'authorization token must match format Bearer <token>',
    )
  const token = authHeader.slice(jwtPrefix.length)

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return send(res, 403, 'invalid authorization token')
    req.userId = user.userId
    next()
  })
})

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
    if (req.userId === undefined) return send(res, 401)
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
      INSERT INTO task(title, description, due_date, is_done, user_id)
      VALUES (${title}, ${description}, ${due_date}, ${is_done}, ${req.userId})
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
    if (req.userId === undefined) return send(res, 401)
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
          AND user_id = ${req.userId}
        RETURNING title, description, due_date, is_done, id
    `)
    if (queryResult.rows.length === 0) send(res, 404, 'task does not exist')
    else send(res, 200, queryResult.rows[0])
  })

  //retrieve task based on ID
  app.get('/tasks/:id', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      SELECT title, description, due_date, is_done, id
      FROM "task"
      WHERE task.id = ${req.params.id} AND task.user_id = ${req.userId}
    `)
    if (queryResult.rows.length === 0) send(res, 404, 'task does not exist')
    else send(res, 200, queryResult.rows[0])
  })

  app.get('/tasks', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    if (req.query.start && req.query.end) {
      //Retrieve all tasks in a week based on the start and end date
      const queryResult = await client.query(sql`
        SELECT title, description, due_date, is_done, id
        FROM "task"
        WHERE task.due_date >= ${req.query.start}
          AND task.due_date <= ${req.query.end}
          AND task.user_id = ${req.userId}
      `)
      send(res, 200, queryResult.rows)
    } else {
      //retrieve all not done tasks
      const queryResult = await client.query(sql`
        SELECT title, description, due_date, is_done, id
        FROM "task"
        WHERE task.is_done = false
          AND task.user_id = ${req.userId}
      `)
      send(res, 200, queryResult.rows)
    }
  })

  //label///////////////////////////////////
  //create new label
  app.post('/labels', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to create a task')
    const { name, color, is_column } = req.body
    if (typeof name !== 'string')
      return send(res, 400, 'label name is required and must be a string')
    if (typeof color !== 'string')
      return send(res, 400, 'label color is required and must be a string')
    if (typeof is_column !== 'boolean')
      return send(res, 400, 'label is_column is required and must be a string')

    const queryResult = await client.query(sql`
      INSERT INTO label(name, color, is_column, user_id)
      VALUES (${name}, ${color}, ${is_column}, ${req.userId})
      RETURNING id
    `)
    const newId = queryResult.rows[0]?.id

    if (newId !== undefined) {
      send(res, 201, { id: newId })
    } else {
      send(res, 500)
    }
  })
  //update labels
  app.put('/labels/:id', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    if (typeof req.params.id !== 'string')
      return send(res, 400, 'label id required to update a label')
    const id = Number(req.params.id)
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to update a label')
    const { name, color, is_column } = req.body

    const queryResult = await client.query(sql`
      UPDATE label
        SET
          name = COALESCE(${name}, name),
          color = COALESCE(${color}, color),
          is_column = COALESCE(${is_column}, is_column)
        WHERE
          id = ${id} AND user_id = ${req.userId}
        RETURNING *
    `)
    if (queryResult.rows.length === 0) send(res, 404, 'label does not exist')
    else send(res, 200, queryResult.rows[0])
  })

  //get all labels
  app.get('/labels', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      SELECT *
      FROM "label"
      WHERE label.user_id = ${req.userId}
    `)

    send(res, 200, queryResult.rows)
  })

  //get all tasks associated with a specific label id
  app.get('/labels/:id', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      SELECT *
      FROM "task_label","task"
      WHERE ${req.params.id} = task_label.label_id
        AND task.id = task_label.task_id
        AND label.user_id = ${req.userId}
    `)
    if (queryResult.rows.length === 0) send(res, 404, 'label does not exist')
    else send(res, 200, queryResult.rows)
  })

  // Delete a specific label
  app.delete('/labels/:id', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      DELETE
      FROM label
      WHERE ${req.params.id} = label.id
        AND label.user_id = ${req.userId}
    `)
    if (queryResult.rowCount.length === 0)
      send(res, 404, 'label does not exist')
  })
  //get all labels associated with a specific task id
  app.get('/tasks/:id/labels', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      SELECT *
      FROM "task_label","label"
      WHERE ${req.params.id} = task_label.task_id
        AND label.id = task_label.label_id
        AND label.user_id = ${req.userId}
    `)
    send(res, 200, queryResult.rows)
  })

  // Updates the labels associated with a task to whatever you pass in
  // Pass an array of integers (label ids) to associate with the task
  app.put('/tasks/:id/labels', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    if (
      !Array.isArray(req.body) ||
      !req.body.every((item) => typeof item === 'number')
    )
      return send(res, 400, 'request body must be an array of numbers')

    const taskId = Number(req.params.id)
    const labelIds = req.body

    // Query: Remove any labels associated with that task that are not in the array of labels
    // Makes sure that the user who makes the request owns the task and the label
    // This query uses select(unnest(array)) instead of ANY(array)
    // because ANY(array) wouldn't remove items when the array was empty
    const deletePromise = client.query(sql`
      DELETE FROM task_label
      USING task, label
      WHERE task_label.task_id = ${taskId}
        AND task_label.task_id = task.id
        AND task_label.label_id = label.id
        AND task.user_id = ${req.userId}
        AND label.user_id = ${req.userId}
        AND label.id NOT IN (select(unnest(${labelIds}::int[])))
    `)

    // Query: Add labels associated with the task; any that are not already associated
    // Makes sure that the user who makes the request owns the task and the label
    const insertPromise = client.query(sql`
      INSERT INTO task_label(task_id, label_id)
      SELECT ${taskId}::int, label.id
      FROM label, task
      WHERE label.id = ANY(${labelIds}::int[])
        AND task.id = ${taskId}
        AND task.user_id = ${req.userId}
        AND label.user_id = ${req.userId}
      ON CONFLICT DO NOTHING
    `)

    await Promise.all([deletePromise, insertPromise])

    send(res, 200, {})
  })

  //get all labels that are columns
  app.get('/column_labels', async (req, res) => {
    if (req.userId === undefined) return send(res, 401)
    const queryResult = await client.query(sql`
      SELECT *
      FROM "label"
      WHERE label.is_column = true AND user_id = ${req.userId};
    `)

    send(res, 200, queryResult.rows)
  })
  app.post('/users', async (req, res) => {
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to create a user')
    const { username, password, first_name, last_name } = req.body

    if (typeof username !== 'string')
      return send(res, 400, 'username is required and must be a string')
    if (!isPasswordValid(password)) return send(res, 400, passwordInstructions)
    if (typeof first_name !== 'string')
      return send(res, 400, 'first_name is required and must be a string')
    if (typeof last_name !== 'string')
      return send(res, 400, 'last_name is required and must be a string')

    const password_hash = await bcrypt.hash(password, saltRounds)

    const id = await client
      .query(
        sql`
          INSERT INTO "user"(first_name, last_name, username, password_hash)
          VALUES (${first_name}, ${last_name}, ${username}, ${password_hash})
          RETURNING id
        `,
      )
      .then((queryResult) => queryResult.rows[0]?.id)
      .catch((error) => {
        console.log(error)
        send(
          res,
          500,
          error.code === '23505'
            ? 'username already exists'
            : 'error creating user',
        )
        return undefined
      })

    if (id === undefined) return

    const token = await generateToken({ userId: id })
    send(res, 201, { id, token })
  })

  app.put('/users/:id', async (req, res) => {
    if (typeof req.params.id !== 'string')
      return send(res, 400, 'user id required')
    const id = Number(req.params.id)
    if (req.userId !== id)
      return send(res, 401, `you do not have permission to update user ${id}`)
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to update a task')
    const { first_name, last_name, username, password } = req.body

    if (password !== undefined && !isPasswordValid(password))
      return send(res, 400, passwordInstructions)
    const password_hash =
      password === undefined
        ? undefined
        : await bcrypt.hash(password, saltRounds)

    const queryResult = await client.query(sql`
      UPDATE "user"
        SET
          first_name = COALESCE(${first_name}, first_name),
          last_name = COALESCE(${last_name}, last_name),
          username = COALESCE(${username}, username),
          password_hash = COALESCE(${password_hash}, password_hash)
        WHERE
          id = ${id}
        RETURNING first_name, last_name, username, id
    `)

    if (queryResult.rows.length === 0) return send(res, 404, 'no such user')
    send(res, 200, queryResult.rows[0])
  })

  app.get('/users/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (req.userId !== id)
      return send(res, 401, `you do not have permission to view user ${id}`)
    const queryResult = await client.query(sql`
      SELECT first_name, last_name, username
      FROM "user"
      WHERE "user".id = ${req.params.id}
    `)
    send(res, 200, queryResult.rows[0])
  })

  app.post('/authenticate', async (req, res) => {
    if (typeof req.body !== 'object')
      return send(res, 400, 'request body is required to authenticate')
    const { username, password } = req.body

    if (typeof username !== 'string')
      return send(res, 400, 'username is required and must be a string')
    if (typeof password !== 'string')
      return send(res, 400, 'password is required and must be a string')

    const queryResult = await client.query(sql`
      SELECT password_hash, id
      FROM "user"
      WHERE username = ${username}
    `)

    if (queryResult.rows.length === 0) return send(res, 401, 'no such user')

    const { password_hash, id } = queryResult.rows[0]
    const isCorrect = await bcrypt.compare(password, password_hash)
    if (!isCorrect) return send(res, 401, 'incorrect password')

    const token = await generateToken({ userId: id })
    send(res, 200, { id, token })
  })

  app.listen(5000)
}

main()

/** @param {unknown} password */
const isPasswordValid = (password) => {
  return typeof password === 'string' && password.length >= 7
}
const passwordInstructions =
  'password must be a string that is at least 7 characters long'
