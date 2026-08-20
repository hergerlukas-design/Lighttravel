/**
 * Gemeinsame Bausteine für den Seitenaufbau. Alle Abschnitte teilen sich
 * dieselbe Containerbreite (`max-w-shell`), damit eine durchgehende
 * vertikale Kante entsteht – Kopfzeile, Hero, Szene, Kontext und Footer.
 */

export function Shell({ className = '', children }) {
  return (
    <div className={`mx-auto w-full max-w-shell px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  )
}

/** Beschrifteter Abschnittskopf: Nummer, Titel, optionaler Fließtext. */
export function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow && (
        <div
          className={`label flex items-center gap-3 text-light-400/80 ${
            centered ? 'justify-center' : ''
          }`}
        >
          <span className="h-px w-8 rule-fade" aria-hidden="true" />
          {eyebrow}
          <span className="h-px w-8 rule-fade" aria-hidden="true" />
        </div>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-light-100 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 max-w-prose text-pretty text-[15px] leading-relaxed text-light-300/75 ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

/** Dünne, zu den Rändern ausblendende Trennlinie zwischen Abschnitten. */
export function Divider() {
  return (
    <Shell>
      <div className="h-px w-full rule-fade" aria-hidden="true" />
    </Shell>
  )
}
