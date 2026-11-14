// Quick actions for a client: open navigation, call, WhatsApp.

export function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

// Google Maps directions through several stops (from current location).
// Maps URLs support at most 9 waypoints + destination.
export function mapsRouteUrl(addresses: string[]) {
  const stops = addresses.filter(Boolean).slice(0, 10)
  if (stops.length === 0) return null
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(0, -1)
  const params = new URLSearchParams({ api: '1', destination, travelmode: 'driving' })
  if (waypoints.length) params.set('waypoints', waypoints.join('|'))
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function normalizePhone(phone: string) {
  let digits = phone.replace(/[^\d+]/g, '')
  // Moldova local format: 0XXXXXXXX -> +373XXXXXXXX
  if (/^0\d{8}$/.test(digits)) digits = '+373' + digits.slice(1)
  return digits
}

export default function ClientContacts({ address, phone }: { address?: string | null; phone?: string | null }) {
  if (!address && !phone) return null
  const tel = phone ? normalizePhone(phone) : null

  const btn = 'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold active:scale-[0.97] transition-transform'

  return (
    <div className="flex gap-2 mt-3">
      {address && (
        <a href={mapsSearchUrl(address)} target="_blank" rel="noopener noreferrer" className={`${btn} bg-blue-50 text-blue-700`}>
          📍 Карта
        </a>
      )}
      {tel && (
        <a href={`tel:${tel}`} className={`${btn} bg-green-50 text-green-700`}>
          📞 Звонок
        </a>
      )}
      {tel && (
        <a href={`https://wa.me/${tel.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-emerald-50 text-emerald-700`}>
          💬 WhatsApp
        </a>
      )}
    </div>
  )
}
