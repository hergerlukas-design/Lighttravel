import { AU_KM, LIGHT_YEAR_KM } from '../lib/constants.js'
import {
  voyager1DistanceKm,
  lightTimeFromKm,
  kmCompact,
  kmExact,
  formatRatio,
} from '../lib/lightTravel.js'

/** Baut die Vergleichsobjekte relativ zum aktuellen Ergebnis. */
function references(now) {
  return [
    { name: 'Sonne → Erde', note: 'Eine Astronomische Einheit', km: AU_KM },
    { name: 'Sonne → Neptun', note: 'Rand des Planetensystems', km: 30.07 * AU_KM },
    {
      name: 'Voyager 1',
      note: 'am weitesten entferntes Raumschiff',
      km: voyager1DistanceKm(now),
    },
    { name: 'Proxima Centauri', note: 'nächster Stern', km: 4.2465 * LIGHT_YEAR_KM },
    { name: 'Sirius', note: 'hellster Stern am Nachthimmel', km: 8.6 * LIGHT_YEAR_KM },
    {
      name: 'Zentrum der Milchstraße',
      note: 'Sagittarius A*',
      km: 26000 * LIGHT_YEAR_KM,
    },
  ]
}

/**
 * Füllstand der Fortschrittsleiste. Zwischen der Erdbahn und dem Zentrum der
 * Milchstraße liegen über zehn Zehnerpotenzen – linear wären fast alle Balken
 * unsichtbar. Deshalb bildet die Leiste sechs Zehnerpotenzen logarithmisch ab.
 */
function barFill(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0
  if (ratio >= 1) return 1
  return Math.max(0.012, Math.min(1, (Math.log10(ratio) + 6) / 6))
}

export default function ContextSection({ result }) {
  const refs = references(result.to)

  return (
    <>
      <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {refs.map((ref) => {
          const ratio = result.km / ref.km
          const reached = ratio >= 1
          return (
            <article
              key={ref.name}
              className={`flex h-full flex-col rounded-2xl border p-5 shadow-panel backdrop-blur-md transition ${
                reached
                  ? 'border-emerald-400/30 bg-emerald-500/[0.06] hover:border-emerald-400/50'
                  : 'border-light-400/10 bg-space-900/50 hover:border-light-400/30'
              }`}
            >
              {/* Kopf: feste Mindesthöhe, damit alle Karten gleich takten. */}
              <header className="flex min-h-[3.5rem] items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold leading-tight text-light-100">
                    {ref.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-light-300/60">{ref.note}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    reached
                      ? 'bg-emerald-400/20 text-emerald-300'
                      : 'bg-light-400/10 text-light-300/70'
                  }`}
                >
                  {reached ? 'überholt' : 'noch nicht'}
                </span>
              </header>

              {/* Fortschritt des eigenen Lichts bis zu dieser Wegmarke. */}
              <div
                className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]"
                role="img"
                aria-label={`Dein Licht ist ${formatRatio(ratio)} so weit wie ${ref.name}`}
              >
                <div
                  className={`relative h-full rounded-full ${
                    reached
                      ? 'bg-gradient-to-r from-emerald-400/70 to-emerald-300'
                      : 'bg-gradient-to-r from-beam/50 to-beam'
                  }`}
                  style={{ width: `${barFill(ratio) * 100}%` }}
                >
                  {reached && (
                    <span className="absolute inset-y-0 w-1/3 animate-sheen bg-white/25 blur-[2px]" />
                  )}
                </div>
              </div>

              <dl className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                <Row label="Entfernung" value={kmCompact(ref.km)} title={kmExact(ref.km)} />
                <Row label="Lichtlaufzeit" value={lightTimeFromKm(ref.km)} />
                <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-white/[0.06] pt-2">
                  <dt className="text-light-300/60">Dein Licht</dt>
                  <dd
                    className={`font-semibold tabular-nums ${
                      reached ? 'text-emerald-300' : 'text-beam'
                    }`}
                  >
                    {formatRatio(ratio)} so weit
                  </dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>

      <p className="mx-auto mt-8 max-w-prose text-center text-xs leading-relaxed text-light-300/50">
        Die Balken zeigen sechs Zehnerpotenzen logarithmisch – linear wären die
        kurzen Strecken nicht sichtbar. Voyager-1-Distanz aus linearem Modell
        (≈ 166&nbsp;AE Anfang 2025, 3,57&nbsp;AE/Jahr); übrige Werte gerundete
        Literaturwerte. Für die exakte Kilometerzahl auf einen Wert zeigen.
      </p>
    </>
  )
}

function Row({ label, value, title }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-light-300/60">{label}</dt>
      <dd className="text-right tabular-nums text-light-100" title={title}>
        {value}
      </dd>
    </div>
  )
}
