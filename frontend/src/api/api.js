const API_BASE_URL = 'http://localhost:8080'

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}