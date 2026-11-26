import { MongoClient } from 'mongodb'
import { isRsvpDeadlinePassed } from './src/config.js'

const JSON_HEADERS = { 'content-type': 'application/json' }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}

function jsonError(message, status) {
  return json({ error: message }, status)
}

async function createRsvp(request, env) {
  if (isRsvpDeadlinePassed()) {
    return jsonError('rsvp deadline has passed', 403)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('invalid json', 400)
  }

  const { name, email, phone, attendance, guests, message } = body || {}
  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return jsonError('name, email and phone are required', 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('invalid email', 400)
  }
  if (!['Yes', 'No', 'Maybe'].includes(attendance)) {
    return jsonError('invalid attendance value', 400)
  }
  if (!env.MONGODB_URI) return jsonError('failed to save rsvp', 500)

  try {
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const now = new Date()
    const result = await client.db().collection('rsvps').insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      attendance,
      guests: Math.min(Math.max(Number(guests) || 1, 1), 20),
      message: (message || '').slice(0, 1000),
      paid: false,
      paymentRef: '',
      createdAt: now,
      updatedAt: now,
    })
    return json({ id: result.insertedId }, 201)
  } catch (err) {
    console.error('RSVP save failed:', err)
    return jsonError('failed to save rsvp', 500)
  }
}

async function listRsvps(request, env) {
  const adminKey = env.ADMIN_KEY
  const key = new URL(request.url).searchParams.get('key')
  if (!adminKey || key !== adminKey) {
    return jsonError('unauthorized', 401)
  }
  if (!env.MONGODB_URI) return jsonError('failed to load rsvps', 500)

  try {
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const rsvps = await client
      .db()
      .collection('rsvps')
      .find()
      .sort({ createdAt: -1 })
      .toArray()
    const summary = {
      total: rsvps.length,
      attending: rsvps.filter((r) => r.attendance === 'Yes').length,
      maybe: rsvps.filter((r) => r.attendance === 'Maybe').length,
      declined: rsvps.filter((r) => r.attendance === 'No').length,
      guests: rsvps.reduce((s, r) => s + (r.attendance === 'No' ? 0 : r.guests), 0),
    }
    return json({ summary, rsvps })
  } catch (err) {
    console.error('RSVP list failed:', err)
    return jsonError('failed to load rsvps', 500)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/rsvp' && request.method === 'POST') {
      return createRsvp(request, env)
    }
    if (url.pathname === '/api/rsvps' && request.method === 'GET') {
      return listRsvps(request, env)
    }
    return jsonError('not found', 404)
  },
}
