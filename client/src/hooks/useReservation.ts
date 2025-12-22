import { useQuery } from '@tanstack/react-query'

export interface ReservationDetail {
  id: string
  reservation_code: string
  email: string
  guest_count: number
  check_in_date: string
  check_out_date: string
  total_price: number
  status: 'requested' | 'confirmed' | 'cancelled'
  special_requests: string | null
  options: any[]
  invoice: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  property: {
    id: string
    name: string
    price_per_night: number
    currency: string
    thumbnail: string | null
    images: { url: string }[]
    address: {
      address1?: string
      address2?: string
    }
  }
}

export const useReservationByCode = (code: string) => {
  return useQuery({
    queryKey: ['reservation', code],
    queryFn: async () => {
      const response = await fetch(`/api/reservations/${code}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Reservation not found')
        }
        throw new Error('Failed to fetch reservation')
      }

      const result = await response.json()
      return result.data as ReservationDetail
    },
    enabled: !!code && code.length >= 5,
  })
}
