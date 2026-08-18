import {
  AU_KM,
  LIGHT_YEAR_KM,
} from '../lib/constants.js'
import { voyager1DistanceKm, lightTimeFromKm, nf } from '../lib/lightTravel.js'

/** Baut die Vergleichsobjekte relativ zum aktuellen Ergebnis. */
function references(now) {
  const voyKm = voyager1DistanceKm(now)
  return [
    {
      name: 'Sonne → Erde',
      note: 'Eine Astronomische Einheit',
      km: AU_KM,
    },
    {
      name: 'Sonne → Neptun',
      note: 'Rand des Planetensystems',
      km: 30.07 * AU_KM,
    },
    {
      name: 'Voyager 1',
      note: 'am weitesten entferntes Raumschiff',
      km: voyKm,
    },
    {
      name: 'Proxima Centauri',
      note: 'nächster Stern',
      km: 4.2465 * LIGHT_YEAR_KM,
    },
    {
      name: 'Sirius',
      note: 'hellster Stern am Nachthimmel',
      km: 8.6 * LIGHT_YEAR_KM,
    },
    {
      name: 'Zentrum der Milchstraße',
      note: 'Sagittarius A*',
      km: 26000 * LIGHT_YEAR_KM,
    },
  ]
}

function ratioText(x) {
  if (x >= 1) {
    if (x >= 100) return `${nf(0).format(x)}×`
    return `${nf(1).format(x)}×`
  }
  return `${nf(x < 0.01 ? 4 : 2).format(x)}×`
}

export default function ContextSection({ result }) {
  const refs = references(result.to)
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-light-200 sm:text-4xl">
          Ein Gefühl für die Distanz
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-light-300/70">
          Die zurückgelegte Lichtdistanz im Vergleich zu bekannten Wegmarken im
          Kosmos. Grün bedeutet: dein Lichtstrahl hat diese Marke bereits
          überholt.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {refs.map((ref) => {
          const ratio = result.km / ref.km
          const reached = ratio >= 1
          return (
            <div
              key={ref.name}
              className={`rounded-2xl border p-5 backdrop-blur-md transition ${
                reached
                  ? 'border-emerald-400/30 bg-emerald-500/5'
                  : 'border-light-400/15 bg-space-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-light-200">
                    {ref.name}
                  </h3>
                  <p className="text-xs text-light-300/60">{ref.note}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    reached
                      ? 'bg-emerald-400/20 text-emerald-300'
                      : 'bg-light-400/10 text-light-300/70'
                  }`}
                >
                  {reached ? 'überholt' : 'noch nicht'}
                </span>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-light-300/55">Entfernung</dt>
                  <dd className="text-light-200">
                    {nf(0).format(Math.round(ref.km))} km
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-light-300/55">Lichtlaufzeit</dt>
                  <dd className="text-light-200">{lightTimeFromKm(ref.km)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-light-300/55">Dein Licht</dt>
                  <dd
                    className={`font-semibold ${
                      reached ? 'text-emerald-300' : 'text-beam'
                    }`}
                  >
                    {ratioText(ratio)} so weit
                  </dd>
                </div>
              </dl>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-xs text-light-300/40">
        Voyager-1-Distanz aus linearem Modell (≈ 166&nbsp;AE Anfang 2025,
        3,57&nbsp;AE/Jahr); übrige Werte gerundete Literaturwerte.
      </p>
    </section>
  )
}
