import { useMemo, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

type FieldProps = ComponentProps<'div'> & {
  orientation?: 'vertical' | 'horizontal' | 'responsive'
}

type FieldLegendProps = ComponentProps<'legend'> & { variant?: 'legend' | 'label' }

export function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cx('flex flex-col', className)}
      {...props}
    />
  )
}

export function FieldLegend({ className, variant = 'legend', ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cx(
        variant === 'legend' ? 'mb-3 text-base font-medium' : 'text-sm font-medium leading-none',
        className,
      )}
      {...props}
    />
  )
}

export function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cx(
        'shadcn-field group/field-group @container/field-group flex w-full flex-col gap-5',
        className,
      )}
      {...props}
    />
  )
}

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cx(
        'group/field flex w-full gap-2 data-[invalid=true]:text-red-600',
        orientation === 'vertical' && 'flex-col *:w-full [&>.sr-only]:w-auto',
        orientation === 'horizontal' &&
          'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto',
        orientation === 'responsive' &&
          'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto',
        className,
      )}
      {...props}
    />
  )
}

export function FieldContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cx('group/field-content flex flex-1 flex-col leading-snug', className)}
      {...props}
    />
  )
}

export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cx(
        'items-center text-sm font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cx(
        'text-left text-sm leading-normal font-normal text-neutral-500 group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5 last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-neutral-950',
        className,
      )}
      {...props}
    />
  )
}

export function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="field-title" className={cx('flex w-fit items-center text-sm font-medium', className)} {...props} />
  )
}

export function FieldError({ className, children, errors, ...props }: ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) return children
    if (!errors?.length) return null

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]
    if (uniqueErrors.length === 1) return uniqueErrors[0]?.message

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cx('text-sm font-normal text-red-600', className)}
      {...props}
    >
      {content}
    </div>
  )
}

export function FieldSeparator({ children, className, ...props }: ComponentProps<'div'> & { children?: ReactNode }) {
  return (
    <div data-slot="field-separator" data-content={Boolean(children)} className={cx('relative', className)} {...props}>
      <div aria-hidden className="absolute inset-x-0 top-1/2 border-t border-neutral-200" />
      {children && (
        <span data-slot="field-separator-content" className="relative mx-auto block w-fit bg-white px-2 text-sm text-neutral-500">
          {children}
        </span>
      )}
    </div>
  )
}
