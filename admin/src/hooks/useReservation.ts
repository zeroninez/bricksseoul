// admin/src/hooks/useReservation.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CalendarReservation, Reservation, ReservationStatus, ReservationUpdatePayload } from '@/types/reservation'

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
      return result.data as CalendarReservation[]
    },
    enabled: !!year && !!month,
  })
}

// ✅ 통합: 예약 리스트 조회 (모든 필드 포함)
export const useReservationsList = (status?: ReservationStatus) => {
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
      return result.data as Reservation[]
    },
  })
}

// ✅ 통합: 단일 예약 조회 (모든 필드 포함)
export const useReservationDetail = (id: string) => {
  return useQuery({
    queryKey: ['reservations', 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/reservations/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch reservation detail')
      }

      const result = await response.json()
      return result.data as Reservation
    },
    enabled: !!id,
  })
}

// ✅ 예약 수정 훅 추가
export const useReservationUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ReservationUpdatePayload) => {
      const { id, ...updateData } = payload

      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update reservation')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // 관련된 모든 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'detail', variables.id] })
    },
  })
}

// ✅ 예약 삭제 훅 추가 (선택사항)
export const useReservationDelete = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete reservation')
      }

      return response.json()
    },
    onSuccess: () => {
      // 예약 목록 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
