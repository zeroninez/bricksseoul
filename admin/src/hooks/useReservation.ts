// admin/src/hooks/useReservation.ts

import { useQuery } from '@tanstack/react-query'

// 달력용 월별 예약 조회
export const useReservationsCalendar = (year: number, month: number, propertyId?: string) => {
  return useQuery({
    queryKey: ['reservations', 'calendar', year, month, propertyId],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      })

      if (propertyId) {
        params.append('property_id', propertyId)
      }

      const response = await fetch(`/api/reservations/calendar?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
      }

      const result = await response.json()
      return result.data as Array<{
        id: string
        reservation_code: string
        check_in_date: string
        check_out_date: string
        status: 'requested' | 'confirmed' | 'cancelled'
        guest_count: number
        property_id: string
        properties: {
          id: string
          name: string
        }
      }>
    },
    enabled: !!year && !!month,
  })
}

// 예약 리스트 조회용 훅 - 주소 정보 포함
export const useReservationsList = (status?: 'requested' | 'confirmed' | 'cancelled') => {
  return useQuery({
    queryKey: ['reservations', 'list', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) {
        params.append('status', status)
      }
      params.append('limit', '100')

      const response = await fetch(`/api/reservations?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch reservations')
      }

      const result = await response.json()
      return result.data as Array<{
        id: string
        reservation_code: string
        email: string
        guest_count: number
        check_in_date: string
        check_out_date: string
        total_price: number
        status: 'requested' | 'confirmed' | 'cancelled'
        special_requests: string | null
        confirmed_at: string | null
        cancelled_at: string | null
        created_at: string
        property: {
          id: string
          name: string
          thumbnail: string | null
          address: {
            address1: string | null
            address2: string | null
          }
        }
      }>
    },
  })
}
