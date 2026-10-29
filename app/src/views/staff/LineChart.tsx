import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { niceMax, smoothPath } from './analytics'

export type ChartSeries = { id: string; label: string; color: string; values: number[] }

const HEIGHT = 240
const MARGIN = { top: 10, right: 8, bottom: 28, left: 34 }

/**
 * Two or more smooth lines with a faint fill, three horizontal gridlines, and a tooltip that follows the pointer
 * or the arrow keys. Drawn as plain SVG so it adds no dependency; a hidden table repeats the numbers for screen readers.
 */
export function LineChart({ labels, series, caption, formatLabel, formatTick = String }: {
  labels: string[]
  series: ChartSeries[]
  caption: string
  formatLabel: (label: string) => string
  formatTick?: (value: number) => string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState<number | null>(null)
  const id = useId()

  useEffect(() => {
    const element = box.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const top = niceMax(Math.max(0, ...series.flatMap((line) => line.values)))
  const plotW = width - MARGIN.left - MARGIN.right
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const x = (index: number) => MARGIN.left + (labels.length < 2 ? plotW / 2 : (index / (labels.length - 1)) * plotW)
  const y = (value: number) => MARGIN.top + plotH - (value / top) * plotH
  const ticks = [0, top / 2, top]
  const base = MARGIN.top + plotH

  function indexAt(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left - MARGIN.left) / plotW
    return Math.min(labels.length - 1, Math.max(0, Math.round(ratio * (labels.length - 1))))
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = labels.length - 1
    const move: Record<string, number | null> = {
      ArrowLeft: Math.max(0, (active ?? last) - 1),
      ArrowRight: Math.min(last, (active ?? -1) + 1),
      Home: 0,
      End: last,
      Escape: null,
    }
    if (!(event.key in move)) return
    event.preventDefault()
    setActive(move[event.key])
  }

  const tipLeft = active === null ? 0 : x(active)
  const flip = tipLeft > width * 0.62

  return (
    <div
      ref={box}
      className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      tabIndex={0}
      role="group"
      aria-label={`${caption}. Use the left and right arrow keys to read each day.`}
      onKeyDown={onKeyDown}
      onFocus={() => setActive((current) => current ?? labels.length - 1)}
      onBlur={() => setActive(null)}
    >
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        aria-hidden="true"
        className="block touch-pan-y select-none"
        onPointerMove={(event) => setActive(indexAt(event))}
        onPointerDown={(event) => setActive(indexAt(event))}
        onPointerLeave={(event) => { if (event.pointerType === 'mouse') setActive(null) }}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth={1} />
            <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-caption tabular-nums">{formatTick(tick)}</text>
          </g>
        ))}

        {series.map((line) => {
          const pts = line.values.map((value, index) => [x(index), y(value)] as [number, number])
          const path = smoothPath(pts)
          return (
            <g key={line.id}>
              <path d={`${path} L${x(labels.length - 1)},${base} L${x(0)},${base} Z`} fill={line.color} fillOpacity={0.07} />
              <path d={path} fill="none" stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}

        <text x={MARGIN.left} y={HEIGHT - 6} className="fill-muted-foreground text-caption">{formatLabel(labels[0])}</text>
        {width > 480 && labels.length > 2 && <text x={x(Math.floor((labels.length - 1) / 2))} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-caption">{formatLabel(labels[Math.floor((labels.length - 1) / 2)])}</text>}
        <text x={width - MARGIN.right} y={HEIGHT - 6} textAnchor="end" className="fill-muted-foreground text-caption">{formatLabel(labels[labels.length - 1])}</text>

        {active !== null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={base} stroke="var(--border)" strokeWidth={1} />
            {series.map((line) => <circle key={line.id} cx={x(active)} cy={y(line.values[active])} r={4} fill={line.color} stroke="var(--background)" strokeWidth={2} />)}
          </g>
        )}
      </svg>

      {active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg border border-border bg-popover px-3 py-2 text-ui text-popover-foreground shadow-md"
          style={{ left: tipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})` }}
        >
          <p className="mb-1 text-caption text-muted-foreground">{formatLabel(labels[active])}</p>
          {series.map((line) => (
            <p key={line.id} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: line.color }} />
              <span className="font-medium">{line.label}:</span>
              <span className="tabular-nums">{line.values[active]}</span>
            </p>
          ))}
        </div>
      )}

      <table className="sr-only" aria-describedby={id}>
        <caption id={id}>{caption}</caption>
        <thead><tr><th scope="col">Day</th>{series.map((line) => <th key={line.id} scope="col">{line.label}</th>)}</tr></thead>
        <tbody>{labels.map((label, index) => <tr key={label}><th scope="row">{formatLabel(label)}</th>{series.map((line) => <td key={line.id}>{line.values[index]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
