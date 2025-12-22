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
