// Fin-style registration squares marking the corners of a section or panel.
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
