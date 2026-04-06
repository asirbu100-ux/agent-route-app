// Get current date and day in Moldova timezone (Europe/Chisinau)
const TIMEZONE = 'Europe/Chisinau'

export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE }) // YYYY-MM-DD format
}

export function getTodayDayOfWeek(): number {
  const day = new Date().toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'short' })
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
  const jsDay = map[day] ?? new Date().getDay()
  // Normalize: weekends fallback to nearest weekday
  if (jsDay === 0) return 1
  if (jsDay === 6) return 5
  return jsDay
}
