// Development uses Vite's same-origin proxy so JSON requests are not blocked by
// a CORS preflight. Set VITE_API_BASE_URL only when an absolute API URL is needed.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const REVENUE_PATH = '/api/v1/revenue-records'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  })
  if (!response.ok) {
    let message = `API 請求失敗 (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || message
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }
  return response.status === 204 ? null : response.json()
}

export const listRevenueRecords = () => request(`${REVENUE_PATH}?offset=0&limit=200`)
export const createRevenueRecord = record => request(REVENUE_PATH, { method: 'POST', body: JSON.stringify(record) })
export const updateRevenueRecord = (id, record) => request(`${REVENUE_PATH}/${id}`, { method: 'PATCH', body: JSON.stringify(record) })
export const deleteRevenueRecord = id => request(`${REVENUE_PATH}/${id}`, { method: 'DELETE' })
