import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { Rsvp } from './models/Rsvp.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI

const app = express()
app.use(cors())
app.use(express.json({ limit: '100kb' }))

// ── API ─────────────────────────────────────────────────────

app.post('/api/rsvp', async (req, res) => {
  const { name, email, phone, attendance, guests, message } = req.body || {}

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'name, email and phone are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid email' })
  }
  if (!['Yes', 'No', 'Maybe'].includes(attendance)) {
    return res.status(400).json({ error: 'invalid attendance value' })
  }

  try {
    const rsvp = await Rsvp.create({
      name, email, phone, attendance,
      guests: Math.min(Math.max(Number(guests) || 1, 1), 20),
      message: (message || '').slice(0, 1000),
    })
    return res.status(201).json({ id: rsvp._id })
  } catch (err) {
    console.error('RSVP save failed:', err)
    return res.status(500).json({ error: 'failed to save rsvp' })
  }
})

// Admin: list RSVPs. Protect with ?key= matching ADMIN_KEY env var.
app.get('/api/rsvps', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey || req.query.key !== adminKey) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  const rsvps = await Rsvp.find().sort({ createdAt: -1 }).lean()
  const summary = {
    total: rsvps.length,
    attending: rsvps.filter((r) => r.attendance === 'Yes').length,
    maybe: rsvps.filter((r) => r.attendance === 'Maybe').length,
    declined: rsvps.filter((r) => r.attendance === 'No').length,
    guests: rsvps.reduce((s, r) => s + (r.attendance === 'No' ? 0 : r.guests), 0),
  }
  return res.json({ summary, rsvps })
})

// ── Static frontend (production build) ──────────────────────

const distDir = path.join(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' })
  res.sendFile(path.join(distDir, 'index.html'))
})

// ── Boot ────────────────────────────────────────────────────

async function start() {
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')
  } else {
    console.warn('MONGODB_URI not set — /api/rsvp will fail until configured')
  }
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
