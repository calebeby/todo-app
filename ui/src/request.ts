import { Task } from './task'

let cachedToken: string | null = null

const getToken = () =>
  cachedToken || (cachedToken = localStorage.getItem('jwt'))

export const setToken = (token: string) =>
  localStorage.setItem('jwt', (cachedToken = token))

export const getUserIdFromToken = () => {
  const token = getToken()
  if (!token) return null
  // https://jwt.io/
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.userId
}

export const makeRequest = (url: string, options: RequestInit = {}) => {
  const token = getToken()
  return fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  }).then(async (res) => {
    return { ok: res.ok, data: await (res.ok ? res.json() : res.text()) }
  })
}

export const updateTask = (
  partialTask: Partial<Task>,
  taskId: number | string,
) => {
  return makeRequest(`/tasks/${taskId}`, {
    body: JSON.stringify(partialTask),
    method: 'PUT',
  })
}
