export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const configuredLineLoginUrl = (import.meta.env.VITE_LINE_LOGIN_URL || '').trim()
export const LINE_LOGIN_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/v1/auth/line/login`
  : configuredLineLoginUrl || '/api/v1/auth/line/login'
export const LIFF_ID = (import.meta.env.VITE_LIFF_ID || '2010814211-P0FrOsZT').trim()
export const LIFF_URL = `https://liff.line.me/${LIFF_ID}`
export const LIFF_LOGIN_PATH = (import.meta.env.VITE_LIFF_LOGIN_PATH || '/api/v1/auth/line/liff').trim()
