import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  )
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await apiFetch('/users/me')

        if (!response.ok) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = async (email, password) => {
    const response = await fetch(
      'http://localhost:8080/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed.')
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)

    return data
  }

  const logout = async () => {
    try {
      if (token) {
        await apiFetch('/auth/logout', {
          method: 'POST',
        })
      }
    } catch {
      // Logout locally even if the server request fails.
    }

    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
