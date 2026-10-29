import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The merger must know our type-scale classes (text-hero, text-body, ...) are font sizes. Otherwise it treats them as
// text colors and drops a real color such as text-primary-foreground that sits next to them.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['hero', 'title', 'heading', 'lead', 'body', 'ui', 'caption'] }] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
