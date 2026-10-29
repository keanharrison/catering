import { Button } from '../../components/ui/button'

const pill = 'h-12 w-full rounded-full px-8 text-lead font-normal'

/** The first thing a new request shows: two stacked buttons, AI chat or the manual form. */
export function PlanChoice({ onAssisted, onManual }: { onAssisted: () => void; onManual: () => void }) {
  return (
    <div className="flex min-h-[calc(100svh-6rem)] w-full flex-col items-center justify-center px-5 py-10 text-foreground">
      <h1 className="type-page-title mb-8 text-center">Plan your catering</h1>
      <div className="grid w-full max-w-xs gap-3">
        <Button className={pill} onClick={onAssisted}>Plan with AI</Button>
        <Button variant="outline" className={`${pill} shadow-[0_1px_2px_rgb(0_0_0/0.06)]`} onClick={onManual}>Enter details myself</Button>
      </div>
    </div>
  )
}
