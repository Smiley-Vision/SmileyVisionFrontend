export function normalizePhoneDigits(phoneNumber: unknown): string {
  return String(phoneNumber ?? '').replace(/\D/g, '')
}

export function formatPhone(phoneNumber: unknown): string {
  const digits = normalizePhoneDigits(phoneNumber)

  if (digits.length !== 10) {
    return (phoneNumber as string) || 'No registrado'
  }

  return `(+52) ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}
