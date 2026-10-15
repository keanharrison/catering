// Optional corner squares for a Panel (`corners` prop). Not used on customer-facing screens since the
// Pearl Island branding pass; kept so the component API stays stable.
export function CornerSquares() {
  const square = 'absolute size-2 bg-line'
  return (
    <>
      <span aria-hidden className={`${square} left-2 top-2`} />
      <span aria-hidden className={`${square} right-2 top-2`} />
      <span aria-hidden className={`${square} bottom-2 left-2`} />
      <span aria-hidden className={`${square} bottom-2 right-2`} />
    </>
  )
}
