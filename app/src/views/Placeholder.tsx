type PlaceholderProps = {
  eyebrow: string
  title: string
  note: string
}

export function Placeholder({ eyebrow, title, note }: PlaceholderProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-wide">{eyebrow}</p>
      <h1 className="mt-6 text-6xl">{title}</h1>
      <p className="mt-8 max-w-xl text-muted">{note}</p>
    </section>
  )
}
