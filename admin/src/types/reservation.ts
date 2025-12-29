// admin/src/types/reservation.ts

export type ReservationStatus = 'requested' | 'confirmed' | 'cancelled'

// 숙소 정보
export interface ReservationProperty {
  id: string
  name: string
  thumbnail: string | null
  check_in_time: string | null
  check_out_time: string | null
  address: {
    address1: string | null
    address2: string | null
  }
}

// ✅ 통합 예약 타입 (모든 필드 포함)
export interface Reservation {
  id: string
  reservation_code: string
  email: string
  guest_count: number
  check_in_date: string
  check_out_date: string
  total_price: number
  status: ReservationStatus
  special_requests: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  options?: any
  invoice?: string | null
  property: ReservationProperty
}

// 달력용 (간소화 버전)
export interface CalendarReservation {
  id: string
  reservation_code: string
  check_in_date: string
  check_out_date: string
  status: ReservationStatus
  guest_count: number
  property_id: string
  properties: {
    id: string
    name: string
  }
}

// 달력 날짜별 데이터
export interface CalendarDayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  totalRequested: number
  availableCount: number
  allReservations: CalendarReservation[]
}

// API 응답 타입
export interface ReservationListResponse {
  data: Reservation[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReservationCalendarResponse {
  data: CalendarReservation[]
}

export interface ReservationDetailResponse {
  data: Reservation
}

// 예약 생성/수정 페이로드
export interface ReservationCreatePayload {
  property_id: string
  email: string
  guest_count: number
  check_in_date: string
  check_out_date: string
  total_price: number
  special_requests?: string | null
}

export interface ReservationUpdatePayload {
  id: string
  status?: ReservationStatus
  email?: string
  guest_count?: number
  check_in_date?: string
  check_out_date?: string
  total_price?: number
  special_requests?: string | null
}
