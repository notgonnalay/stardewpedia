/**
 * Formats gold currency with 'g' suffix (e.g. 1500 -> "1,500g")
 */
export function formatGold(amount: number): string {
  return `${amount.toLocaleString('en-US')}g`
}

/**
 * Capitalizes string
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format growth days
 */
export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`
}
