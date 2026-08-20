import { kmCompact, kmExact } from '../lib/lightTravel.js'

/** Kleiner Statushinweis über dem Objektnamen. */
function Tag({ tone = 'beam', children }) {
  const tones = {
    beam: 'bg-beam/20 text-beam',
    front: 'bg-front/20 text-front',
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/** Info-Karte für ein angeklicktes Objekt (Planet oder Stern). */
export default function InfoPopup({ object, onClose }) {
  if (!object) return null

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 w-[min(20rem,calc(100%-1.5rem))] animate-fade-in rounded-xl border border-light-400/20 bg-space-950/90 p-4 shadow-hud backdrop-blur-md sm:bottom-4 sm:left-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label text-[10px] text-light-400/75">{object.kind}</span>
            {object.inside && <Tag>im Lichtkegel</Tag>}
            {object.frontier ? (
              <Tag>als Nächstes</Tag>
            ) : (
              object.boundary && <Tag tone="front">an der Grenze</Tag>
            )}
          </div>
          <h3 className="mt-1 truncate font-display text-xl font-semibold text-light-100">
            {object.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="-mr-1 -mt-1 shrink-0 rounded-md px-2 py-1 text-light-300/60 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      {object.meta && <p className="mt-1 text-xs text-light-300/70">{object.meta}</p>}

      <dl className="mt-3.5 space-y-2 text-sm">
        <Row label="Distanz" value={object.distanceLabel} />
        <Row label="in Kilometern" value={kmCompact(object.distanceKm)} title={kmExact(object.distanceKm)} />
        <div className="flex items-baseline justify-between gap-4 border-t border-white/[0.07] pt-2">
          <dt className="text-light-300/60">Lichtlaufzeit</dt>
          <dd className="text-right font-semibold tabular-nums text-beam">
            {object.lightTime}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] leading-relaxed text-light-300/50">
        Das Licht dieses Objekts, das dich jetzt erreicht, ist so lange unterwegs
        gewesen.
      </p>
    </div>
  )
}

function Row({ label, value, title }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-light-300/60">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-light-100" title={title}>
        {value}
      </dd>
    </div>
  )
}
