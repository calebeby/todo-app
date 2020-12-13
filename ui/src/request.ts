import { Task } from './task'
import { Label } from './label'

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

export const parseDueDate = <T extends Task & { due_date: string }>(
  task: T,
) => ({
  ...task,
  due_date: new Date(task.due_date),
})

export const getAllLabels = async () => {
  const res = await makeRequest('/labels')
  if (res.ok) return (res.data as Label[]).sort((a, b) => a.id - b.id)
  throw new Error(res.data)
}
