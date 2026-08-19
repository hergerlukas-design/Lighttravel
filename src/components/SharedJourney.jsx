import { useEffect, useMemo, useState } from 'react'
import SharedJourneyScene from './SharedJourneyScene.jsx'
import InfoPopup from './InfoPopup.jsx'
import { computeSharedJourney, encodeJourneyParams } from '../lib/journey.js'

// Sanfte Vorbelegung, damit der Abschnitt beim ersten Öffnen etwas zeigt.
const EXAMPLE = {
  nameA: '',
  nameB: '',
  birthA: '1990-05-12',
  birthB: '1992-09-03',
  meeting: '2015-06-20',
}

export default function SharedJourney({ initial }) {
  const [fields, setFields] = useState(() => ({
    nameA: initial?.nameA || EXAMPLE.nameA,
    nameB: initial?.nameB || EXAMPLE.nameB,
    birthA: initial?.birthA || EXAMPLE.birthA,
    birthB: initial?.birthB || EXAMPLE.birthB,
    meeting: initial?.meeting || EXAMPLE.meeting,
  }))
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const set = (key) => (e) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  const journey = useMemo(() => computeSharedJourney(fields), [fields])

  // URL live spiegeln, damit ein Reload die gewählte Reise beibehält.
  useEffect(() => {
    const qs = encodeJourneyParams(fields)
    const url = `${window.location.pathname}?${qs}`
    window.history.replaceState(null, '', url)
  }, [fields])

  // Auswahl verwerfen, wenn sich die Reise grundlegend ändert.
  useEffect(() => {
    setSelected(null)
  }, [fields.birthA, fields.birthB, fields.meeting])

  const share = async () => {
    const qs = encodeJourneyParams(fields)
    const url = `${window.location.origin}${window.location.pathname}?${qs}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Unsere gemeinsame Lichtreise', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Nutzer hat abgebrochen o. Ä. – still ignorieren.
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="starfield-bg pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(255,215,106,0.10), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 pb-8 pt-14 sm:pt-20">
        <div className="animate-fade-in text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-light-400/20 bg-space-800/50 px-3 py-1 text-xs font-medium text-light-300/80">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-beam" />
            Zwei Lichtreisen, die sich treffen
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-bold leading-tight tracking-tight text-light-200 sm:text-6xl">
            Eure gemeinsame Lichtreise
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-light-300/70 sm:text-lg">
            Seit eurer Geburt reist euer Licht durchs All. Am Tag, an dem ihr euch
            kennengelernt habt, treffen sich beide Strahlen – und fliegen von da an
            gemeinsam weiter.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {/* Eingabe */}
          <div className="rounded-2xl border border-light-400/15 bg-space-900/60 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <PersonInputs
                accent="text-light-400"
                title="Person A"
                name={fields.nameA}
                onName={set('nameA')}
                date={fields.birthA}
                onDate={set('birthA')}
                today={today}
                placeholder="z. B. Mara"
              />
              <PersonInputs
                accent="text-beam"
                title="Person B"
                name={fields.nameB}
                onName={set('nameB')}
                date={fields.birthB}
                onDate={set('birthB')}
                today={today}
                placeholder="z. B. Jonas"
              />
            </div>

            <label
              htmlFor="meeting"
              className="mt-5 block text-xs font-medium uppercase tracking-widest text-light-300/60"
            >
              Kennenlern-Datum
            </label>
            <input
              id="meeting"
              type="date"
              value={fields.meeting}
              max={today}
              min="0001-01-01"
              onChange={set('meeting')}
              className="mt-2 w-full rounded-xl border border-light-400/20 bg-space-950/70 px-4 py-3 font-display text-xl text-light-200 outline-none transition focus:border-light-400/60 focus:ring-2 focus:ring-light-400/30"
            />

            <button
              onClick={share}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-beam/40 bg-beam/10 px-4 py-3 text-sm font-semibold text-beam transition hover:bg-beam/20"
            >
              {copied ? (
                <>✓ Link kopiert</>
              ) : (
                <>
                  <ShareIcon /> Gemeinsame Reise teilen
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-light-300/45">
              Der Link öffnet die Szene direkt mit euren beiden Daten.
            </p>
          </div>

          {/* Ergebnis */}
          <div className="flex flex-col justify-center rounded-2xl border border-beam/20 bg-gradient-to-br from-space-800/70 to-space-900/70 p-6 backdrop-blur-md">
            {journey.valid ? (
              <>
                <div className="text-xs font-medium uppercase tracking-widest text-light-300/60">
                  Gemeinsam zurückgelegt seit dem Kennenlernen
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold tabular-nums text-beam sm:text-6xl">
                    {journey.m.distance.display}
                  </span>
                  <span className="font-display text-lg text-light-300/80">
                    {journey.m.distance.unit}
                  </span>
                </div>
                <p className="mt-2 text-sm text-light-300/70">
                  Ihr kennt euch seit {journey.m.elapsedText}.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat
                    label={`${journey.nameA || 'Person A'} · Licht seit Geburt`}
                    value={`${journey.a.distance.display} ${journey.a.distance.unit}`}
                    accent="text-light-300"
                  />
                  <Stat
                    label={`${journey.nameB || 'Person B'} · Licht seit Geburt`}
                    value={`${journey.b.distance.display} ${journey.b.distance.unit}`}
                    accent="text-beam"
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-light-300/70">
                <p className="font-medium text-light-200">Bitte prüft eure Eingaben:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-light-300/70">
                  {journey.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visualisierung */}
      <div className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
        <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden rounded-3xl border border-light-400/15 bg-space-950 shadow-2xl">
          {journey.valid ? (
            <>
              <SharedJourneyScene journey={journey} onSelect={setSelected} />
              <div className="pointer-events-none absolute inset-0">
                <JourneyLegend nameA={journey.nameA || 'Person A'} nameB={journey.nameB || 'Person B'} />
                <InfoPopup object={selected} onClose={() => setSelected(null)} />
                {!selected && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] text-light-300/40">
                    Ziehen zum Drehen · Scrollen zum Zoomen · Sterne anklicken für Details
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-light-300/60">
              Sobald die Daten stimmen, seht ihr eure gemeinsame Lichtreise hier.
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-light-300/40">
          Strahllängen sind zur besseren Lesbarkeit wurzel-skaliert – rein
          illustrativ. Wegmarken zeigen reale Sterne aus dem HYG-Katalog.
        </p>
      </div>
    </section>
  )
}

function PersonInputs({ accent, title, name, onName, date, onDate, today, placeholder }) {
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>
        {title}
      </div>
      <input
        type="text"
        value={name}
        onChange={onName}
        maxLength={40}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-light-400/20 bg-space-950/70 px-3 py-2 text-sm text-light-200 outline-none transition placeholder:text-light-300/30 focus:border-light-400/60 focus:ring-2 focus:ring-light-400/20"
      />
      <label className="mt-2 block text-[11px] uppercase tracking-wider text-light-300/50">
        Geburtsdatum
      </label>
      <input
        type="date"
        value={date}
        max={today}
        min="0001-01-01"
        onChange={onDate}
        className="mt-1 w-full rounded-lg border border-light-400/20 bg-space-950/70 px-3 py-2 font-display text-base text-light-200 outline-none transition focus:border-light-400/60 focus:ring-2 focus:ring-light-400/20"
      />
    </div>
  )
}

function Stat({ label, value, accent = 'text-light-200' }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-light-300/50">{label}</div>
      <div className={`mt-0.5 font-medium ${accent}`}>{value}</div>
    </div>
  )
}

function JourneyLegend({ nameA, nameB }) {
  return (
    <div className="absolute right-4 top-4 hidden rounded-lg border border-light-400/15 bg-space-900/70 px-3 py-2 backdrop-blur-md sm:block">
      <div className="flex items-center gap-2 text-[11px] text-light-300/70">
        <span className="inline-block h-3 w-3 rounded-full bg-light-400/70 ring-1 ring-light-400" />
        {nameA}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-light-300/70">
        <span className="inline-block h-3 w-3 rounded-full bg-beam/70 ring-1 ring-beam" />
        {nameB}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-light-300/70">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: 'linear-gradient(90deg,#8ab4ff,#ffd76a)' }}
        />
        gemeinsam
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.7 13.3 15.3 17M15.3 7 8.7 10.7M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
