export function formatPrice(price: number | string | null | undefined): string {
  const numericPrice = Number(price ?? 0)
  if (!Number.isFinite(numericPrice)) return '0.00'

  return numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
