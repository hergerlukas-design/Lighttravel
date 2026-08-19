import { nf } from '../lib/lightTravel.js'

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
      <div className="starfield-bg pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(138,180,255,0.12), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-16 sm:pt-24">
        <div className="animate-fade-in text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-light-400/20 bg-space-800/50 px-3 py-1 text-xs font-medium text-light-300/80">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-beam" />
            Eine Reise mit Lichtgeschwindigkeit
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-bold leading-tight tracking-tight text-light-200 sm:text-6xl">
            Wie weit ist das Licht seit deinem Datum gereist?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-light-300/70 sm:text-lg">
            Wähle ein Datum. Wir berechnen, welche Strecke ein Lichtstrahl seit
            diesem Moment zurückgelegt hätte – und zeigen sie dir im Kosmos.
          </p>
        </div>

        {/* Eingabe + Ergebnis */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {/* Eingabe */}
          <div className="rounded-2xl border border-light-400/15 bg-space-900/60 p-6 backdrop-blur-md">
            <label
              htmlFor="date"
              className="text-xs font-medium uppercase tracking-widest text-light-300/60"
            >
              Startdatum
            </label>
            <input
              id="date"
              type="date"
              value={dateStr}
              max={today}
              min="0001-01-01"
              onChange={(e) => setDateStr(e.target.value)}
              className="mt-2 w-full rounded-xl border border-light-400/20 bg-space-950/70 px-4 py-3 font-display text-2xl text-light-200 outline-none transition focus:border-light-400/60 focus:ring-2 focus:ring-light-400/30"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setDateStr(p.get())}
                  className="rounded-full border border-light-400/15 bg-space-800/60 px-3 py-1.5 text-xs text-light-300/80 transition hover:border-light-400/40 hover:text-white"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ergebnis */}
          <div className="flex flex-col justify-center rounded-2xl border border-beam/20 bg-gradient-to-br from-space-800/70 to-space-900/70 p-6 backdrop-blur-md">
            {result.isFuture ? (
              <p className="text-center text-light-300/70">
                Bitte wähle ein Datum in der Vergangenheit.
              </p>
            ) : (
              <>
                <div className="text-xs font-medium uppercase tracking-widest text-light-300/60">
                  Zurückgelegte Lichtdistanz
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold tabular-nums text-beam sm:text-6xl">
                    {result.distance.display}
                  </span>
                  <span className="font-display text-lg text-light-300/80">
                    {result.distance.unit}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Vergangene Zeit" value={result.elapsedText} />
                  <Stat
                    label="Ansicht"
                    value={result.scene === 'solar' ? 'Sonnensystem' : 'Sternenkarte'}
                  />
                  <Stat
                    label="In Kilometern"
                    value={`${nf(0).format(Math.round(result.km))} km`}
                    wide
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, wide }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <div className="text-[11px] uppercase tracking-wider text-light-300/50">
        {label}
      </div>
      <div className="mt-0.5 font-medium text-light-200">{value}</div>
    </div>
  )
}
