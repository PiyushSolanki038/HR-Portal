import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(chatId, text) {
  const res = await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
  return res.json()
}

export async function sendBulkMessage(chatIds, text) {
  const results = await Promise.allSettled(
    chatIds.map(id => sendMessage(id, text))
  )
  return results
}
