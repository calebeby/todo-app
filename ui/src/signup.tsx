import { useState } from 'preact/hooks'
import { route } from './app'
import { makeRequest, setToken } from './request'

export const Signup = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: Event) => {
    e.preventDefault()
    setError(null)
    makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    }).then((res) => {
      if (res.ok) {
        setToken(res.data.token)
        route('/')
      } else setError(res.data)
    })
  }

  return (
    <form onSubmit={submit} class="auth-form">
      <h1>Signup</h1>
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
        First Name
        <input
          type="text"
          onChange={(e) => {
            const value = e.currentTarget.value
            setFirstName(value)
          }}
        />
      </label>
      <label>
        Last Name
        <input
          type="text"
          onChange={(e) => {
            const value = e.currentTarget.value
            setLastName(value)
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
      <button>Sign Up</button>
      {error && <div class="input-error">{error}</div>}
      <a href="/login">Log in</a>
    </form>
  )
}
