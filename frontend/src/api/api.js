const API_BASE_URL = 'http://localhost:8080'

const API_TOKEN = localStorage.getItem('token')

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    Authorization: `Bearer ${API_TOKEN}`,
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}