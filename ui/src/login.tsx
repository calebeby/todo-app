import { useState } from 'preact/hooks'
import { route } from './app'
import { makeRequest, setToken } from './request'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: Event) => {
    e.preventDefault()
    setError(null)
    makeRequest('/authenticate', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then((res) => {
      if (res.ok) {
        setToken(res.data.token)
        route('/')
      } else setError(res.data)
    })
  }

  return (
    <form onSubmit={submit} class="auth-form">
      <h1>Login</h1>
      <label>
        Username
        <input
          autofocus
          type="text"
          onChange={(e) => {
            const value = e.currentTarget.value
            setUsername(value)
          }}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          onChange={(e) => {
            const value = e.currentTarget.value
            setPassword(value)
          }}
        />
      </label>
      <button>Log in</button>
      {error && <div class="input-error">{error}</div>}
    </form>
  )
}
