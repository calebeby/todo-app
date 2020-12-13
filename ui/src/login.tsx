import { useEffect, useState } from 'preact/hooks'
import { route } from './app'
import { getToken, makeRequest, setToken } from './request'

/**
 * Rederects to the login page if the user is not signed in
 * or if their login token is expired
 */
export const useRequireLogin = () => {
  useEffect(() => {
    const token = getToken()
    if (token === null) route('/login')
  }, [])
}

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
      <a href="/signup">Sign up</a>
    </form>
  )
}
