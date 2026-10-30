import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { MenuItem } from '../data'

/**
 * A menu item's photo, always the same 4:3 frame. Until the file exists (or when the item has no
 * image path) it shows a "?" tile of the same size, so the layout never shifts when photos arrive.
 */
export function MenuImage({ item, className }: { item: Pick<MenuItem, 'name' | 'image'>; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  if (!item.image || failedSrc === item.image) {
    return (
      <div role="img" aria-label={`Photo of ${item.name} not added yet`} className={cn('grid aspect-[4/3] w-full select-none place-items-center bg-muted text-5xl font-semibold text-muted-foreground/50', className)}>
        <span aria-hidden="true">?</span>
      </div>
    )
  }
  return <img src={item.image} alt={item.name} loading="lazy" onError={() => setFailedSrc(item.image)} className={cn('aspect-[4/3] w-full object-cover', className)} />
}
