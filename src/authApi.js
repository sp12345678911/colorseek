const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const AUTH_PATH = '/api/v1/auth'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) return null
  if (!response.ok) {
    let message = `會員 API 請求失敗 (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || message
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return response.status === 204 ? null : response.json()
}

export const getCurrentAccount = () => request(`${AUTH_PATH}/me`)
export const listMyPointTransactions = () => request(`${AUTH_PATH}/me/points?offset=0&limit=20`)
export const logoutAccount = () => request(`${AUTH_PATH}/logout`, { method: 'POST' })
