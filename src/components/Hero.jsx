import { kmCompact, kmExact } from '../lib/lightTravel.js'
import { Shell } from './Section.jsx'

const PRESETS = [
  { label: 'Vor 1 Monat', get: () => shift({ days: 30 }) },
  { label: 'Vor 1 Jahr', get: () => shift({ years: 1 }) },
  { label: 'Mondlandung 1969', get: () => '1969-07-20' },
  { label: 'Vor 100 Jahren', get: () => shift({ years: 100 }) },
  { label: 'Vor 500 Jahren', get: () => shift({ years: 500 }) },
  { label: 'Christi Geburt', get: () => '0001-01-01' },
]

function shift({ days = 0, years = 0 }) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function Hero({ dateStr, setDateStr, result }) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="relative overflow-hidden">
      {/* Hintergrund: driftendes Sternenfeld unter weichem Farblicht. */}
      <div
        className="starfield-bg pointer-events-none absolute -inset-x-24 -inset-y-10 animate-drift opacity-70"
        aria-hidden="true"
      />
      <div className="aurora-blue pointer-events-none absolute inset-0" aria-hidden="true" />

      <Shell className="relative pb-14 pt-14 sm:pt-20">
        <div className="animate-fade-in text-center">
          <span className="chip pointer-events-none border-light-400/20 bg-space-800/50 text-light-300/85">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-beam" />
            Eine Reise mit Lichtgeschwindigkeit
          </span>
          <h1 className="mx-auto mt-6 max-w-[54rem] text-balance font-display text-[2.15rem] font-bold leading-[1.08] tracking-tight text-light-100 sm:text-[3.4rem]">
            Wie weit ist das Licht seit deinem Datum gereist?
          </h1>
          <p className="mx-auto mt-5 max-w-prose text-pretty text-base leading-relaxed text-light-300/75 sm:text-lg">
            Wähle ein Datum. Wir berechnen, welche Strecke ein Lichtstrahl seit
            diesem Moment zurückgelegt hätte – und zeigen sie dir im Kosmos.
          </p>
        </div>

        {/* Eingabe und Ergebnis bilden ein Instrument, keine zwei Kacheln. */}
        <div className="panel mx-auto mt-12 grid max-w-4xl overflow-hidden md:grid-cols-2">
          {/* Eingabe */}
          <div className="border-b border-light-400/10 p-6 md:border-b-0 md:border-r sm:p-7">
            <label htmlFor="date" className="label">
              Startdatum
            </label>
            <input
              id="date"
              type="date"
              value={dateStr}
              max={today}
              min="0001-01-01"
              onChange={(e) => setDateStr(e.target.value)}
              className="field mt-2.5 font-display text-2xl"
            />
            <div className="mt-5">
              <div className="label mb-2.5 text-light-300/45">Schnellwahl</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => setDateStr(p.get())} className="chip">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ergebnis */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-beam/[0.04] to-transparent p-6 sm:p-7">
            {result.isFuture ? (
              <p className="text-center text-sm text-light-300/70">
                Bitte wähle ein Datum in der Vergangenheit.
              </p>
            ) : (
              <>
                <div className="label">Zurückgelegte Lichtdistanz</div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="figure text-[3.25rem] leading-none sm:text-6xl">
                    {result.distance.display}
                  </span>
                  <span className="font-display text-lg text-light-300/85">
                    {result.distance.unit}
                  </span>
                </div>

                <div className="mt-6 h-px w-full rule-fade" aria-hidden="true" />

                <dl className="mt-5 space-y-3.5">
                  <Stat label="Vergangene Zeit" value={result.elapsedText} />
                  <Stat
                    label="In Kilometern"
                    value={kmCompact(result.km)}
                    title={kmExact(result.km)}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <dt className="label">Ansicht</dt>
                    <dd className="inline-flex items-center gap-1.5 rounded-full border border-light-400/20 bg-light-400/10 px-2.5 py-1 text-xs font-medium text-light-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-light-400" />
                      {result.scene === 'solar' ? 'Sonnensystem' : 'Sternenkarte'}
                    </dd>
                  </div>
                </dl>
              </>
            )}
          </div>
        </div>
      </Shell>
    </section>
  )
}

function Stat({ label, value, title }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="label">{label}</dt>
      <dd
        className="text-right font-medium tabular-nums text-light-100"
        title={title}
      >
        {value}
      </dd>
    </div>
  )
}
