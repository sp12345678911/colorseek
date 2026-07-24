import { API_BASE_URL } from './config'

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
    let message = `商城 API 請求失敗 (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || message
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }
  return response.status === 204 ? null : response.json()
}

export const listProducts = (includeInactive = false) => request(
  `/api/v1/products${includeInactive ? '?include_inactive=true' : ''}`,
)
export const createProduct = data => request('/api/v1/products', {
  method: 'POST',
  body: JSON.stringify(data),
})
export const updateProduct = (id, data) => request(`/api/v1/products/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
})
export const createOrder = data => request('/api/v1/orders', {
  method: 'POST',
  body: JSON.stringify(data),
})
export const listMyOrders = () => request('/api/v1/orders/me')
export const listOrders = () => request('/api/v1/orders')
export const updateOrderStatus = (id, status) => request(`/api/v1/orders/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
})
