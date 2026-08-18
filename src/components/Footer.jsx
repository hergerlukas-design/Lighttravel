export default function Footer() {
  return (
    <footer className="border-t border-light-400/10 bg-space-950/80">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="font-display text-lg font-semibold text-light-200">
              Lichtreise
            </div>
            <p className="mt-2 max-w-md text-sm text-light-300/60">
              Ein kleines Experiment darüber, wie unfassbar groß der Kosmos ist –
              gemessen an der Geschwindigkeit des Lichts.
            </p>
          </div>
          <div className="text-sm">
            <div className="text-xs font-medium uppercase tracking-widest text-light-300/50">
              Datenquellen
            </div>
            <ul className="mt-2 space-y-1.5 text-light-300/70">
              <li>
                Sternpositionen:{' '}
                <a
                  href="https://github.com/astronexus/HYG-Database"
                  target="_blank"
                  rel="noreferrer"
                  className="text-light-300 underline decoration-light-400/40 underline-offset-2 hover:text-white"
                >
                  HYG-Datenbank
                </a>{' '}
                (astronexus), nächste ≈&nbsp;3.600 Sterne
              </li>
              <li>
                Planetenpositionen:{' '}
                <a
                  href="https://github.com/cosinekitty/astronomy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-light-300 underline decoration-light-400/40 underline-offset-2 hover:text-white"
                >
                  astronomy-engine
                </a>
              </li>
              <li>
                Lichtgeschwindigkeit: 299.792,458&nbsp;km/s (exakt, SI)
              </li>
              <li>Voyager-1-Distanz: NASA/JPL (genähert)</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-light-400/10 pt-6 text-xs text-light-300/40 sm:flex-row sm:items-center">
          <span>Gebaut mit React, Vite, Tailwind &amp; React Three Fiber.</span>
          <span>Alle Distanzen sind Näherungen zu Anschauungszwecken.</span>
        </div>
      </div>
    </footer>
  )
}
