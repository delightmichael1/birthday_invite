import { useState } from 'react'
import { CalendarBlank, Clock, MapPin, CheckCircle, WarningCircle, ArrowDown, TShirt, CurrencyDollar, Info } from '@phosphor-icons/react'
import { event, isRsvpDeadlinePassed, payment } from './config'
import Admin from './Admin.jsx'

const RSVP_URL = '/api/rsvp'

const inputCls =
  'w-full rounded-lg border border-forest-900/20 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20'
const labelCls = 'mb-1.5 block text-[13px] font-medium tracking-wide text-forest-900'

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-amber-glow">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-red-700">{error}</p>}
    </div>
  )
}

function RsvpClosedNotice() {
  return (
    <div className="rise-in rounded-2xl border border-forest-800/15 bg-white p-10 text-center shadow-sm">
      <Clock size={48} weight="duotone" className="mx-auto text-forest-700" />
      <h3 className="mt-4 font-serif text-3xl font-semibold text-forest-950">RSVP closed</h3>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink/70">
        The RSVP deadline was {event.rsvpDeadlineLabel}. Thank you for your interest in celebrating with us.
      </p>
    </div>
  )
}

function RsvpForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', attendance: '', guests: '1', message: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | closed | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your name'
    if (!form.email.trim()) e.email = 'Please enter your email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.phone.trim()) e.phone = 'Please enter your phone number'
    if (!form.attendance) e.attendance = 'Please let us know if you can make it'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    try {
      const res = await fetch(RSVP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, guests: Number(form.guests) || 1 }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 403 && body.error === 'rsvp deadline has passed') {
          setStatus('closed')
          return
        }
        throw new Error()
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'closed') return <RsvpClosedNotice />

  if (status === 'success') {
    return (
      <div className="rise-in rounded-2xl border border-forest-800/15 bg-white p-10 text-center shadow-sm">
        <CheckCircle size={48} weight="duotone" className="mx-auto text-forest-700" />
        <h3 className="mt-4 font-serif text-3xl font-semibold text-forest-950">
          Thank you, {form.name.split(' ')[0]}!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink/70">
          Your RSVP has been received. We look forward to celebrating
          Pastor {event.pastorName.replace(/^Pastor\s+/i, '')} with you on {event.date}.
        </p>
        <p className="mt-5 text-[13px] text-ink/50">{event.rsvpDeadline}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-forest-800/15 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          <input className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input className={inputCls} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="Phone / WhatsApp" required error={errors.phone}>
          <input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </Field>
        <Field label="Number of guests" required>
          <select className={inputCls} value={form.guests} onChange={set('guests')}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
            <option value="6">6+ guests</option>
          </select>
        </Field>
      </div>
            <div className="mt-5"/>
      <Field label="Will you be attending?" required error={errors.attendance}>
        <div className="mt-1 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Attendance">
          {['Yes', 'No', 'Maybe'].map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={form.attendance === opt}
              onClick={() => setForm((f) => ({ ...f, attendance: opt }))}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                form.attendance === opt
                  ? 'border-forest-800 bg-forest-900 text-bone-50'
                  : 'border-forest-900/20 bg-white text-ink/70 hover:border-forest-700/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>
<div className="mt-5"/>
      <Field label="A word of blessing or message (optional)">
        <textarea
          className={`${inputCls} min-h-[96px] resize-y`}
          value={form.message}
          onChange={set('message')}
          placeholder="A prayer, birthday wish, or dietary note…"
        />
      </Field>

      {status === 'error' && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <WarningCircle size={18} weight="fill" />
          Something went wrong sending your RSVP. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 w-full rounded-lg bg-forest-900 px-6 py-3.5 text-[15px] font-semibold tracking-wide text-bone-50 transition hover:bg-forest-800 active:translate-y-px disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === 'submitting' ? 'Sending…' : 'Send RSVP'}
      </button>
      <p className="mt-4 text-[13px] text-ink/50">{event.rsvpDeadline}</p>
    </form>
  )
}

function Hero() {
  return (
    <header className="grain relative overflow-hidden bg-forest-950 text-bone-50">
      {/* faint decorative rings */}
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full border border-bone-50/10" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full border border-amber-glow/15" />

      <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-20 text-center sm:pt-24">
        <p className="rise-in rise-in-1 text-[12px] font-medium uppercase tracking-[0.35em] text-amber-soft">
          You're cordially invited
        </p>
        <h1 className="rise-in rise-in-2 mt-6 font-serif text-5xl font-semibold leading-[1.05] sm:text-7xl">
          A Blessed<br />Birthday
        </h1>
        <p className="rise-in rise-in-3 mx-auto mt-6 max-w-md font-serif text-2xl font-medium text-amber-soft sm:text-3xl">
          {event.pastorName}
        </p>
        <p className="rise-in rise-in-4 mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-bone-50/70">
          {event.tagline}
        </p>
        <a
          href="#rsvp"
          className="rise-in rise-in-4 mt-10 inline-flex items-center gap-2 rounded-full border border-amber-glow/60 px-7 py-3 text-sm font-medium tracking-wide text-amber-soft transition hover:bg-amber-glow/10"
        >
          RSVP Now <ArrowDown size={16} weight="bold" />
        </a>
      </div>
    </header>
  )
}

function Details() {
  const items = [
    { icon: CalendarBlank, label: 'Date', value: event.date },
    { icon: Clock, label: 'Time', value: event.time },
    { icon: MapPin, label: 'Venue', value: event.venue },
    { icon: TShirt, label: 'Dress Code', value: event.dresscode },
  ]
  return (
    <section className="border-b border-forest-900/10 bg-bone-100">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900 text-amber-soft">
              <Icon size={20} weight="duotone" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-forest-700">{label}</p>
              <p className="mt-1.5 font-serif text-xl font-semibold leading-snug text-forest-950">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function KindNote() {
  return (
    <section className="border-b border-forest-900/10 bg-bone-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-amber-glow/40 bg-amber-glow/10 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-glow/25 text-forest-900">
              <CurrencyDollar size={20} weight="duotone" />
            </span>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-forest-950">
                ${payment.feePerHead} {payment.currency} per head
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/70">
                This covers venue hire and food. {event.paymentDeadline}.
                {payment.enabled
                  ? ' Please complete your payment when you RSVP below.'
                  : ' Payment details will be shared with confirmed guests.'}
              </p>
              <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink/55">
                <Info size={15} weight="fill" className="mt-0.5 shrink-0 text-forest-700" />
                {event.paymentNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RsvpSection() {
  return (
    <section id="rsvp" className="mx-auto max-w-2xl scroll-mt-10 px-6 py-20">
      <div className="text-center">
        <h2 className="font-serif text-4xl font-semibold text-forest-950 sm:text-5xl">Kindly Respond</h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink/65">
          We would be honoured by your presence. Please let us know if you can join the celebration.
        </p>
      </div>
      <div className="mt-10">
        {isRsvpDeadlinePassed() ? <RsvpClosedNotice /> : <RsvpForm />}
      </div>
      {payment.enabled && (
        <p className="mt-6 text-center text-sm font-medium text-forest-800">
          Seats are ${payment.feePerHead} {payment.currency} per head — payable now to confirm your table.
        </p>
      )}
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-forest-950 py-10 text-center text-bone-50/50">
      <p className="font-serif text-lg font-medium text-bone-50/80">{event.pastorName}</p>
      <p className="mt-2 text-[13px]">With love, from the family of Pastor Stephen Mudhege</p>
    </footer>
  )
}

export default function App() {
  if (window.location.pathname === '/admin') return <Admin />
  return (
    <main className="min-h-[100dvh]">
      <Hero />
      <Details />
      <KindNote />
      <RsvpSection />
      <Footer />
    </main>
  )
}
