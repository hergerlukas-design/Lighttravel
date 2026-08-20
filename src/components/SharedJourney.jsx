import { useEffect, useMemo, useState } from 'react'
import SharedJourneyScene from './SharedJourneyScene.jsx'
import InfoPopup from './InfoPopup.jsx'
import { Shell } from './Section.jsx'
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
  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

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

  const nameA = journey.nameA || 'Person A'
  const nameB = journey.nameB || 'Person B'

  return (
    <section className="relative overflow-hidden">
      <div
        className="starfield-bg pointer-events-none absolute -inset-x-24 -inset-y-10 animate-drift opacity-70"
        aria-hidden="true"
      />
      <div className="aurora-beam pointer-events-none absolute inset-0" aria-hidden="true" />

      <Shell className="relative pb-10 pt-14 sm:pt-20">
        <div className="animate-fade-in text-center">
          <span className="chip pointer-events-none border-light-400/20 bg-space-800/50 text-light-300/85">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-beam" />
            Zwei Lichtreisen, die sich treffen
          </span>
          <h1 className="mx-auto mt-6 max-w-[42rem] text-balance font-display text-[2.15rem] font-bold leading-[1.08] tracking-tight text-light-100 sm:text-[3.4rem]">
            Eure gemeinsame Lichtreise
          </h1>
          <p className="mx-auto mt-5 max-w-prose text-pretty text-base leading-relaxed text-light-300/75 sm:text-lg">
            Seit eurer Geburt reist euer Licht durchs All. Am Tag, an dem ihr euch
            kennengelernt habt, treffen sich beide Strahlen – und fliegen von da an
            gemeinsam weiter.
          </p>
        </div>

        <div className="panel mx-auto mt-12 grid max-w-4xl overflow-hidden md:grid-cols-2">
          {/* Eingabe */}
          <div className="border-b border-light-400/10 p-6 md:border-b-0 md:border-r sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <PersonInputs
                accent="text-light-400"
                dot="bg-light-400"
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
                dot="bg-beam"
                title="Person B"
                name={fields.nameB}
                onName={set('nameB')}
                date={fields.birthB}
                onDate={set('birthB')}
                today={today}
                placeholder="z. B. Jonas"
              />
            </div>

            <div className="mt-6 h-px w-full rule-fade" aria-hidden="true" />

            <label htmlFor="meeting" className="label mt-5 block">
              Kennenlern-Datum
            </label>
            <input
              id="meeting"
              type="date"
              value={fields.meeting}
              max={today}
              min="0001-01-01"
              onChange={set('meeting')}
              className="field mt-2 font-display text-xl"
            />

            <button onClick={share} className="btn-accent mt-5 w-full">
              {copied ? '✓ Link kopiert' : <><ShareIcon /> Gemeinsame Reise teilen</>}
            </button>
            <p className="mt-2 text-center text-[11px] text-light-300/50">
              Der Link öffnet die Szene direkt mit euren beiden Daten.
            </p>
          </div>

          {/* Ergebnis */}
          <div className="flex flex-col justify-between gap-7 bg-gradient-to-br from-beam/[0.05] to-transparent p-6 sm:p-7">
            {journey.valid ? (
              <>
                <div>
                  <div className="label">Gemeinsam zurückgelegt seit dem Kennenlernen</div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="figure text-[3.25rem] leading-none sm:text-6xl">
                      {journey.m.distance.display}
                    </span>
                    <span className="font-display text-lg text-light-300/85">
                      {journey.m.distance.unit}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm text-light-300/75">
                    Ihr kennt euch seit {journey.m.elapsedText}.
                  </p>
                </div>

                <Timeline
                  fields={fields}
                  journey={journey}
                  nameA={nameA}
                  nameB={nameB}
                />

                <dl className="grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4 text-sm">
                  <Stat
                    dot="bg-light-400"
                    label={`${nameA} · seit Geburt`}
                    value={`${journey.a.distance.display} ${journey.a.distance.unit}`}
                    accent="text-light-200"
                  />
                  <Stat
                    dot="bg-beam"
                    label={`${nameB} · seit Geburt`}
                    value={`${journey.b.distance.display} ${journey.b.distance.unit}`}
                    accent="text-beam"
                  />
                </dl>
              </>
            ) : (
              <div className="my-auto text-sm">
                <p className="font-medium text-light-100">Bitte prüft eure Eingaben:</p>
                <ul className="mt-2 space-y-1.5 text-light-300/75">
                  {journey.errors.map((e) => (
                    <li key={e} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-beam/70" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Shell>

      {/* Visualisierung */}
      <Shell className="pb-4">
        <div className="relative h-[min(70vh,42rem)] min-h-[26rem] w-full overflow-hidden rounded-3xl border border-light-400/10 bg-space-975 shadow-panel">
          {journey.valid ? (
            <>
              <SharedJourneyScene journey={journey} onSelect={setSelected} />
              <div className="pointer-events-none absolute inset-0">
                <JourneyLegend nameA={nameA} nameB={nameB} />
                <InfoPopup object={selected} onClose={() => setSelected(null)} />
                {!selected && (
                  <div className="absolute inset-x-3 bottom-3 flex justify-center sm:bottom-4">
                    <p className="rounded-full border border-light-400/10 bg-space-975/70 px-3 py-1.5 text-center text-[11px] text-light-300/60 backdrop-blur-sm">
                      <span className="sm:hidden">Ziehen · Zoomen · Antippen</span>
                      <span className="hidden sm:inline">
                        Ziehen zum Drehen · Scrollen zum Zoomen · Sterne anklicken
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-light-300/60">
              Sobald die Daten stimmen, seht ihr eure gemeinsame Lichtreise hier.
            </div>
          )}
        </div>
        <p className="mx-auto mt-4 max-w-prose text-center text-xs leading-relaxed text-light-300/50">
          Strahllängen sind zur besseren Lesbarkeit wurzel-skaliert – rein
          illustrativ. Wegmarken zeigen reale Sterne aus dem HYG-Katalog.
        </p>
      </Shell>
    </section>
  )
}

/**
 * Kompakter Zeitstrahl: die beiden Geburten, das Kennenlernen und heute.
 * Er füllt die Ergebnisfläche und macht die Reihenfolge sofort sichtbar.
 */
function Timeline({ fields, journey, nameA, nameB }) {
  const t = (s) => new Date(`${s}T00:00:00`).getTime()
  const start = Math.min(t(fields.birthA), t(fields.birthB))
  const end = journey.now.getTime()
  const span = Math.max(1, end - start)
  const at = (s) => ((t(s) - start) / span) * 100

  const meetPos = at(fields.meeting)
  // Beschriftung am Treffpunkt einhalten, damit sie nicht aus der Karte läuft.
  const labelPos = Math.min(82, Math.max(18, meetPos))

  const marks = [
    { pos: at(fields.birthA), color: 'bg-light-400', label: nameA },
    { pos: at(fields.birthB), color: 'bg-beam', label: nameB },
  ]

  return (
    <div aria-hidden="true">
      <div className="relative h-6">
        {/* Grundlinie: vor dem Kennenlernen getrennt, danach gemeinsam. */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-light-400/70 to-beam"
          style={{ left: `${meetPos}%`, right: 0 }}
        />
        {marks.map((m) => (
          <span
            key={m.label}
            title={m.label}
            className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-space-900 ${m.color}`}
            style={{ left: `${m.pos}%` }}
          />
        ))}
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-space-900"
          style={{ left: `${meetPos}%` }}
        />
      </div>
      <div className="relative mt-1.5 h-4 text-[10px] uppercase tracking-wide">
        <span className="absolute left-0 text-light-300/45">Geburt</span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap text-light-300/70"
          style={{ left: `${labelPos}%` }}
        >
          Kennenlernen
        </span>
        <span className="absolute right-0 text-light-300/45">heute</span>
      </div>
    </div>
  )
}

function PersonInputs({ accent, dot, title, name, onName, date, onDate, today, placeholder }) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-label ${accent}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {title}
      </div>
      <input
        type="text"
        value={name}
        onChange={onName}
        maxLength={40}
        placeholder={placeholder}
        aria-label={`Name ${title}`}
        className="field mt-2.5 px-3 py-2 text-sm"
      />
      <label className="label mt-3 block text-[10px]">Geburtsdatum</label>
      <input
        type="date"
        value={date}
        max={today}
        min="0001-01-01"
        onChange={onDate}
        aria-label={`Geburtsdatum ${title}`}
        className="field mt-1.5 px-3 py-2 font-display text-base"
      />
    </div>
  )
}

function Stat({ label, value, accent = 'text-light-100', dot }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-light-300/50">
        {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className={`mt-1 font-medium tabular-nums ${accent}`}>{value}</dd>
    </div>
  )
}

function JourneyLegend({ nameA, nameB }) {
  return (
    <div className="hud absolute right-3 top-3 hidden max-w-[12rem] sm:right-4 sm:top-4 sm:block">
      <ul className="space-y-1.5">
        <LegendItem cls="bg-light-400/70 ring-1 ring-light-400" label={nameA} />
        <LegendItem cls="bg-beam/70 ring-1 ring-beam" label={nameB} />
        <li className="flex items-center gap-2 text-[11px] text-light-300/75">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: 'linear-gradient(90deg,#8ab4ff,#ffd76a)' }}
          />
          gemeinsam
        </li>
      </ul>
    </div>
  )
}

function LegendItem({ cls, label }) {
  return (
    <li className="flex items-center gap-2 text-[11px] text-light-300/75">
      <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${cls}`} />
      <span className="truncate">{label}</span>
    </li>
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
