import { API_BASE_URL } from './config'

const ACCOUNTS_PATH = '/api/v1/accounts'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

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

export const listAccounts = () => request(`${ACCOUNTS_PATH}?offset=0&limit=200`)
export const updateAccount = (id, data) => request(`${ACCOUNTS_PATH}/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
})
export const listAccountPoints = id => request(`${ACCOUNTS_PATH}/${id}/points?offset=0&limit=50`)
export const adjustAccountPoints = (id, data) => request(`${ACCOUNTS_PATH}/${id}/points`, {
  method: 'POST',
  body: JSON.stringify(data),
})
