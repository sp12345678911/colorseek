export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const LINE_LOGIN_URL = (import.meta.env.VITE_LINE_LOGIN_URL || '').trim()
export const LIFF_ID = (import.meta.env.VITE_LIFF_ID || '').trim()
export const LIFF_LOGIN_PATH = (import.meta.env.VITE_LIFF_LOGIN_PATH || '/api/v1/auth/line/liff').trim()
