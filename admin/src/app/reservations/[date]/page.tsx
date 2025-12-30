// admin/src/app/reservations/[date]/page.tsx
'use client'

import { Fragment, use, useMemo, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { MiniCalendar, CalendarHeader, ReservationItem, DetailSheet } from '../components'
import { useReservationsList } from '@/hooks/useReservation'
import { formatDate } from '@/utils'
import type { Reservation } from '@/types/reservation'

function isValidYYYYMMDD(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

interface DayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  allReservations: Reservation[]
}

export default function ReservationByDatePage({ params }: { params: Promise<{ date: string }> }) {
  const router = useRouter()

  const filterOptions = ['all', 'in', 'stay', 'out']
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>('all')

  // ✅ React.use()로 params unwrap
  const { date } = use(params)

  if (!isValidYYYYMMDD(date)) {
    notFound()
  }

  // 날짜에서 년/월 추출
  const [year, month] = date.split('-').map(Number)

  // ✅ 전체 예약 데이터 fetch (상세 정보 포함)
  const { data: reservations, isLoading, refetch: refetchReservations } = useReservationsList()

  // 선택된 날짜 상태
  const [selectedDate, setSelectedDate] = useState(date)

  // 선택된 예약 (상세보기용)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  // ✅ 해당 월의 예약만 필터링 (취소된 예약 제외)
  const monthReservations = useMemo(() => {
    if (!reservations) return []

    return reservations.filter((r) => {
      // ✅ 취소된 예약 제외
      if (r.status === 'cancelled') return false

      const checkInDate = new Date(r.check_in_date)
      const checkOutDate = new Date(r.check_out_date)
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)

      // 예약 기간이 해당 월과 겹치는지 확인
      return checkInDate <= monthEnd && checkOutDate >= monthStart
    })
  }, [reservations, year, month])

  // 📊 달력 데이터 전처리
  const calendarData = useMemo(() => {
    const dataMap: Record<string, DayData> = {}

    monthReservations.forEach((reservation) => {
      const checkInDate = new Date(reservation.check_in_date)
      const checkOutDate = new Date(reservation.check_out_date)

      const currentDate = new Date(checkInDate)
      while (currentDate <= checkOutDate) {
        const dateStr = currentDate.toISOString().split('T')[0]

        if (!dataMap[dateStr]) {
          dataMap[dateStr] = {
            checkInCount: 0,
            checkOutCount: 0,
            stayingCount: 0,
            hasConfirmed: false,
            allReservations: [],
          }
        }

        dataMap[dateStr].allReservations.push(reservation)

        if (reservation.status === 'confirmed') {
          dataMap[dateStr].hasConfirmed = true

          if (reservation.check_in_date === dateStr) {
            dataMap[dateStr].checkInCount++
          } else if (reservation.check_out_date === dateStr) {
            dataMap[dateStr].checkOutCount++
          } else {
            dataMap[dateStr].stayingCount++
          }
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return dataMap
  }, [monthReservations])

  // 선택된 날짜의 예약 목록 (필터 적용)
  const selectedDayReservations = useMemo(() => {
    const dayReservations = calendarData[selectedDate]?.allReservations || []

    // ✅ 필터 적용
    if (filter === 'all') {
      return dayReservations
    } else if (filter === 'in') {
      return dayReservations.filter((r) => r.check_in_date === selectedDate)
    } else if (filter === 'out') {
      return dayReservations.filter((r) => r.check_out_date === selectedDate)
    } else if (filter === 'stay') {
      return dayReservations.filter((r) => r.check_in_date !== selectedDate && r.check_out_date !== selectedDate)
    }

    return dayReservations
  }, [calendarData, selectedDate, filter])

  const handleDateClick = (newDate: string) => {
    setSelectedDate(newDate)
    setFilter('all') // ✅ 날짜 변경 시 필터 초기화
  }

  const handleBack = () => {
    router.push('/reservations')
  }

  const handleUpdate = () => {
    refetchReservations()
  }

  if (isLoading) {
    return (
      <div className='w-full min-h-dvh mt-14 flex items-center justify-center'>
        <div className='animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full' />
      </div>
    )
  }

  return (
    <>
      <div className='fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full min-h-dvh h-full overflow-y-scroll bg-white z-50'>
        <button
          className='absolute left-0 top-0 w-fit px-4 h-fit py-3 z-10 active:scale-90 active:opacity-70 transition-all text-black flex justify-center items-center'
          onClick={handleBack}
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M3.63654 11.2932C3.44907 11.4807 3.34375 11.735 3.34375 12.0002C3.34375 12.2653 3.44907 12.5197 3.63654 12.7072L9.29354 18.3642C9.48214 18.5463 9.73474 18.6471 9.99694 18.6449C10.2591 18.6426 10.5099 18.5374 10.6954 18.352C10.8808 18.1666 10.9859 17.9158 10.9882 17.6536C10.9905 17.3914 10.8897 17.1388 10.7075 16.9502L6.75754 13.0002H20.0005C20.2658 13.0002 20.5201 12.8948 20.7076 12.7073C20.8952 12.5198 21.0005 12.2654 21.0005 12.0002C21.0005 11.735 20.8952 11.4806 20.7076 11.2931C20.5201 11.1055 20.2658 11.0002 20.0005 11.0002H6.75754L10.7075 7.05018C10.8897 6.86158 10.9905 6.60898 10.9882 6.34678C10.9859 6.08458 10.8808 5.83377 10.6954 5.64836C10.5099 5.46295 10.2591 5.35778 9.99694 5.35551C9.73474 5.35323 9.48214 5.45402 9.29354 5.63618L3.63654 11.2932Z' />
          </svg>
        </button>

        {/* 미니 달력 */}
        <div className='px-4 flex flex-col gap-2 pb-4 pt-3 bg-background'>
          <CalendarHeader
            year={year}
            month={month}
            onMonthChange={(newYear, newMonth) => {
              const monthStr = String(newMonth).padStart(2, '0')
              router.push(`/reservations/${newYear}-${monthStr}-01`)
            }}
          />
          <MiniCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            calendarData={calendarData}
            onDateClick={handleDateClick}
          />
        </div>

        {/* 예약 목록 */}
        <div className='space-y-4 w-full bg-white px-4 pt-3 pb-32'>
          <div className='w-full h-fit flex flex-row justify-between items-center'>
            <span className='text-sm text-black'>{formatDate(selectedDate, 'ko')}</span>
          </div>

          {/* ✅ 필터 버튼 */}
          <div className='w-full h-fit flex flex-row gap-2 justify-start items-center'>
            {filterOptions.map((option) => {
              const count =
                option === 'all'
                  ? calendarData[selectedDate]?.allReservations.length || 0
                  : option === 'in'
                    ? calendarData[selectedDate]?.checkInCount || 0
                    : option === 'out'
                      ? calendarData[selectedDate]?.checkOutCount || 0
                      : calendarData[selectedDate]?.stayingCount || 0

              return (
                <button
                  key={option}
                  className={`px-3 py-2 rounded-full text-xs leading-tight ${
                    filter === option
                      ? 'bg-[#3C2F2F] text-white font-medium'
                      : 'bg-[#F5F4F4] text-black hover:bg-stone-300 transition-colors font-normal'
                  }`}
                  onClick={() => setFilter(option)}
                >
                  {option.toUpperCase()} {count}
                </button>
              )
            })}
          </div>

          {selectedDayReservations.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>이 날짜에 예약이 없습니다.</div>
          ) : (
            <div className='space-y-3'>
              {selectedDayReservations.map((reservation, index) => (
                <Fragment key={reservation.id}>
                  <ReservationItem
                    statusType='date'
                    standardDate={selectedDate}
                    reservation={reservation}
                    action={{
                      label: '더보기',
                      type: 'dropdown',
                      onDetailClick: () => {
                        setSelectedReservation(reservation)
                      },
                    }}
                  />
                  {index < selectedDayReservations.length - 1 && <div className='w-full h-px bg-[#EFECEC]' />}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      <DetailSheet
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onUpdate={() => {
          handleUpdate()
        }}
      />
    </>
  )
}
