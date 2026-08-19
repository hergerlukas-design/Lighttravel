/** Schlanke Kopfzeile mit Wortmarke und Umschalter zwischen den beiden Reisen. */
export default function ModeNav({ mode, setMode }) {
  const tabs = [
    { id: 'einzel', label: 'Einzelreise' },
    { id: 'gemeinsam', label: 'Gemeinsame Reise' },
  ]
  return (
    <header className="sticky top-0 z-30 border-b border-light-400/10 bg-space-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={() => setMode('einzel')}
          className="flex items-center gap-2 font-display text-sm font-semibold text-light-200"
        >
          <span className="h-2 w-2 rounded-full bg-beam" />
          Lichtreise
        </button>
        <nav className="flex items-center gap-1 rounded-full border border-light-400/15 bg-space-900/60 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              aria-pressed={mode === t.id}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                mode === t.id
                  ? 'bg-light-400/15 text-white'
                  : 'text-light-300/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
