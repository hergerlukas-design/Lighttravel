import { nf } from '../lib/lightTravel.js'
import { AU_KM } from '../lib/constants.js'

/** Info-Karte für ein angeklicktes Objekt (Planet oder Stern). */
export default function InfoPopup({ object, onClose }) {
  if (!object) return null
  const km = object.distanceKm
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 w-[min(20rem,calc(100%-2rem))] animate-fade-in rounded-xl border border-light-400/20 bg-space-900/85 p-4 backdrop-blur-md shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-light-400/70">
            {object.kind}
            {object.inside && (
              <span className="ml-2 rounded-full bg-beam/20 px-2 py-0.5 text-[10px] font-semibold text-beam">
                im Lichtkegel
              </span>
            )}
          </div>
          <h3 className="mt-0.5 font-display text-xl font-semibold text-light-200">
            {object.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="rounded-md px-2 py-1 text-light-300/70 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      {object.meta && (
        <p className="mt-1 text-xs text-light-300/70">{object.meta}</p>
      )}

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-light-300/60">Distanz</dt>
          <dd className="text-right font-medium text-light-200">{object.distanceLabel}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-light-300/60">in Kilometern</dt>
          <dd className="text-right font-medium text-light-200">
            {nf(0).format(Math.round(km))} km
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-light-300/60">Lichtlaufzeit</dt>
          <dd className="text-right font-medium text-beam">{object.lightTime}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-light-300/50">
        Das Licht dieses Objekts, das dich jetzt erreicht, ist so lange unterwegs
        gewesen.
      </p>
    </div>
  )
}
