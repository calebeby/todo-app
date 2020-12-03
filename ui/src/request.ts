import { fireTaskChange } from './state'
import { Task } from './task'

let cachedToken: string | null = null

const getToken = () => {
  const token = cachedToken || (cachedToken = localStorage.getItem('jwt'))
  if (token === null) return null
  const { exp } = parseToken(token)
  if (new Date().getTime() / 1000 > exp) {
    setToken(null)
    return null
  }
  return token
}

export const setToken = (token: string | null) => {
  cachedToken = token
  if (token === null) localStorage.removeItem('jwt')
  else localStorage.setItem('jwt', token)
}

interface JWT {
  exp: number
  iat: number
  userId: number
}

export const parseToken = (token: string) => {
  // https://jwt.io/
  return JSON.parse(atob(token.split('.')[1])) as JWT
}

export const makeRequest = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const res = await fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })
  return { ok: res.ok, data: await (res.ok ? res.json() : res.text()) }
}

export const parseDueDate = (task: Task & { due_date: string }) => ({
  ...task,
  due_date: new Date(task.due_date),
})

export const updateTask = async (
  partialTask: Partial<Task>,
  taskId: number | string,
) => {
  const res = await makeRequest(`/tasks/${taskId}`, {
    body: JSON.stringify(partialTask),
    method: 'PUT',
  })
  if (res.ok) fireTaskChange(parseDueDate(res.data))
}

export const createTask = async (task: Task) => {
  const res = await makeRequest('/tasks', {
    body: JSON.stringify(task),
    method: 'POST',
  })
  if (res.ok) fireTaskChange({ ...task, id: res.data.id })
  return res.data.id as number
}
