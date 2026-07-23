// Vite proxies /api to port 8000 during local development. For a deployed
// frontend, set VITE_API_BASE_URL to the public URL of the same API service.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const SCHEDULES_PATH = '/api/v1/schedules'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `排程 API 請求失敗 (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || message
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return response.status === 204 ? null : response.json()
}

export const createSchedule = schedule => request(SCHEDULES_PATH, {
  method: 'POST',
  body: JSON.stringify(schedule),
})

export const listSchedules = ({ status, offset = 0, limit = 200 } = {}) => {
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  if (status) query.set('status', status)
  return request(`${SCHEDULES_PATH}?${query}`)
}

export const updateScheduleStatus = (id, status) => request(`${SCHEDULES_PATH}/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
})
