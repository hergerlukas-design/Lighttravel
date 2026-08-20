import { Shell } from './Section.jsx'

const SOURCES = [
  {
    label: 'Sternpositionen',
    href: 'https://github.com/astronexus/HYG-Database',
    link: 'HYG-Datenbank',
    after: ' (astronexus), nächste ≈ 3.600 Sterne',
  },
  {
    label: 'Planetenpositionen',
    href: 'https://github.com/cosinekitty/astronomy',
    link: 'astronomy-engine',
  },
  {
    label: 'Deep-Sky-Objekte',
    before: 'Messier-Katalog (110), Positionen/Typen aus ',
    href: 'https://github.com/mattiaverga/OpenNGC',
    link: 'OpenNGC',
    after: ', Distanzen aus Literaturwerten',
  },
  {
    label: 'Sternenhimmel-Hintergrund',
    href: 'https://svs.gsfc.nasa.gov/4851',
    link: 'NASA/Goddard SVS – Deep Star Map 2020',
    after: ' (Gaia DR2, gemeinfrei)',
  },
]

const FACTS = [
  ['Lichtgeschwindigkeit', '299.792,458 km/s (exakt, SI)'],
  ['Voyager-1-Distanz', 'NASA/JPL, lineares Modell'],
  ['Nahe Sternhaufen', 'kuratierte Auswahl (Hyaden, Coma Ber. u. a.)'],
]

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-light-400/10 bg-space-975">
      <Shell className="py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-beam/30 blur-[3px]" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-beam" />
              </span>
              <span className="font-display text-base font-semibold text-light-100">
                Lichtreise
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-light-300/65">
              Ein kleines Experiment darüber, wie unfassbar groß der Kosmos ist –
              gemessen an der Geschwindigkeit des Lichts.
            </p>
            <dl className="mt-6 space-y-2.5">
              {FACTS.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <dt className="label text-[10px] text-light-300/45">{k}</dt>
                  <dd className="mt-0.5 text-light-300/75">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="label text-light-300/50">Datenquellen</div>
            <ul className="mt-4 space-y-3 text-sm">
              {SOURCES.map((s) => (
                <li key={s.label} className="leading-relaxed">
                  <span className="text-light-300/50">{s.label}: </span>
                  <span className="text-light-300/80">
                    {s.before}
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link-subtle"
                    >
                      {s.link}
                    </a>
                    {s.after}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-light-400/10 pt-6 text-xs text-light-300/45 sm:flex-row sm:items-center">
          <span>Gebaut mit React, Vite, Tailwind &amp; React Three Fiber.</span>
          <span>Alle Distanzen sind Näherungen zu Anschauungszwecken.</span>
        </div>
      </Shell>
    </footer>
  )
}
