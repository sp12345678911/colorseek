import { API_BASE_URL } from './config'
import { LIFF_LOGIN_PATH } from './config'

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
export const loginWithLiff = async idToken => {
  const account = await request(LIFF_LOGIN_PATH, {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  })
  if (!account) throw new Error('LINE 登入驗證失敗，請重新登入')
  return account
}

export const beginLineLogin = async (returnHash = '#home') => {
  window.sessionStorage.setItem('line_login_return_hash', returnHash)
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/line/login/start`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`無法開始 LINE 登入 (${response.status})`)
  }
  const body = await response.json()
  if (!body.authorization_url) throw new Error('LINE 登入網址不存在')
  window.location.href = body.authorization_url
}
