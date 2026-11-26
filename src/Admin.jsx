import { useEffect, useState } from 'react'
import { Users, UserCheck, UserMinus, Question, UsersThree, Lock } from '@phosphor-icons/react'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-forest-900/15 bg-white p-5 text-center">
      <Icon size={24} weight="duotone" className="mx-auto text-forest-700" />
      <p className="mt-2 font-serif text-3xl font-semibold text-forest-950">{value}</p>
      <p className="mt-1 text-[12px] font-medium uppercase tracking-widest text-ink/50">{label}</p>
    </div>
  )
}

export default function Admin() {
  const key = new URLSearchParams(window.location.search).get('key') || ''
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!key) {
      setError('Missing admin key. Open this page as /admin?key=YOUR_ADMIN_KEY')
      setLoading(false)
      return
    }
    fetch(`/api/rsvps?key=${encodeURIComponent(key)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Invalid admin key' : 'Failed to load')
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [key])

  return (
    <main className="min-h-[100dvh] bg-bone-100 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-4xl font-semibold text-forest-950">RSVP Dashboard</h1>

        {loading && <p className="mt-8 text-ink/60">Loading…</p>}
        {error && (
          <p className="mt-8 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <Lock size={18} weight="fill" /> {error}
          </p>
        )}

        {data && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Stat icon={Users} label="Responses" value={data.summary.total} />
              <Stat icon={UserCheck} label="Attending" value={data.summary.attending} />
              <Stat icon={Question} label="Maybe" value={data.summary.maybe} />
              <Stat icon={UserMinus} label="Declined" value={data.summary.declined} />
              <Stat icon={UsersThree} label="Total guests" value={data.summary.guests} />
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-forest-900/15 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-[11px] uppercase tracking-widest text-ink/50">
                    <th className="px-5 py-3.5 font-semibold">Name</th>
                    <th className="px-5 py-3.5 font-semibold">Contact</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Guests</th>
                    <th className="px-5 py-3.5 font-semibold">Message</th>
                    <th className="px-5 py-3.5 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rsvps.map((r) => (
                    <tr key={r._id} className="border-b border-forest-900/5 last:border-0">
                      <td className="px-5 py-3.5 font-medium text-forest-950">{r.name}</td>
                      <td className="px-5 py-3.5 text-ink/70">
                        <div>{r.email}</div>
                        <div className="text-ink/50">{r.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                            r.attendance === 'Yes'
                              ? 'bg-forest-900 text-bone-50'
                              : r.attendance === 'Maybe'
                                ? 'bg-amber-glow/20 text-forest-900'
                                : 'bg-ink/10 text-ink/60'
                          }`}
                        >
                          {r.attendance}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-ink/70">{r.guests}</td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-ink/60" title={r.message}>
                        {r.message || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink/50">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data.rsvps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-ink/50">
                        No RSVPs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
