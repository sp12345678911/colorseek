import { API_BASE_URL } from './config'

export async function sendLineMessages(accountIds, { text = null, imageUrl = null }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/message/line/send`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account_ids: accountIds,
      text: text || null,
      image_url: imageUrl || null,
    }),
  })

  if (!response.ok) {
    let message = `LINE 訊息傳送失敗 (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || message
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return response.json()
}
