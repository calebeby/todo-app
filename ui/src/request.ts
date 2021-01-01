import { Task } from './task'

let cachedToken: string | null = null

export const getToken = () => {
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

const apiUrl = process.env.API_URL || 'https://todoooo-server.herokuapp.com'

export const makeRequest = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const res = await fetch(apiUrl + url, {
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
