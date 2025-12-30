'use client'

import { useState, useMemo } from 'react'
import { useReservationsCalendar } from '@/hooks/useReservation'
import { usePropertyList } from '@/hooks/useProperty'
import { CalendarHeader, Calendar } from './components'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'
import { getTodayString } from '@/utils'

interface DayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  totalRequested: number
  availableCount: number
  allReservations: Array<{
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
}

export default function HomePage() {
  const router = useRouter()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [viewMode, setViewMode] = useState<'reservation' | 'vacancy'>('reservation')

  const { data: reservations, isLoading, error } = useReservationsCalendar(currentYear, currentMonth)
  const { data: properties } = usePropertyList()

  // 📊 데이터 전처리: 날짜별로 예약 정보 및 빈방 계산
  const calendarData = useMemo(() => {
    if (!reservations || !properties) return {}

    const dataMap: Record<string, DayData> = {}
    const totalProperties = properties.filter((p) => p.is_visible).length

    reservations.forEach((reservation) => {
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
            totalRequested: 0,
            availableCount: 0,
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
        } else if (reservation.status === 'requested') {
          dataMap[dateStr].totalRequested++
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    // 각 날짜별로 예약된 숙소 ID를 추적하여 빈방 계산
    Object.keys(dataMap).forEach((dateStr) => {
      const reservedPropertyIds = new Set<string>()

      dataMap[dateStr].allReservations.forEach((reservation) => {
        if (reservation.status === 'confirmed' || reservation.status === 'requested') {
          reservedPropertyIds.add(reservation.property_id)
        }
      })

      dataMap[dateStr].availableCount = totalProperties - reservedPropertyIds.size
    })

    // 예약이 없는 날짜도 빈방 정보 추가
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      if (!dataMap[dateStr]) {
        dataMap[dateStr] = {
          checkInCount: 0,
          checkOutCount: 0,
          stayingCount: 0,
          hasConfirmed: false,
          totalRequested: 0,
          availableCount: totalProperties,
          allReservations: [],
        }
      }
    }

    return dataMap
  }, [reservations, properties, currentYear, currentMonth])

  // 📈 월간 통계 계산
  const monthStats = useMemo(() => {
    const today = getTodayString() // ✅ 로컬 시간 사용
    const todayData = calendarData[today]

    // ✅ 변경: 전체 예약 요청 개수 계산 (중복 제거)
    const totalRequested = reservations?.filter((r) => r.status === 'requested').length || 0

    return {
      todayCheckIn: todayData?.checkInCount || 0,
      todayCheckOut: todayData?.checkOutCount || 0,
      totalRequested: totalRequested, // ✅ 변경: 오늘이 아닌 전체 예약 요청
      todayAvailable: todayData?.availableCount || 0,
    }
  }, [calendarData, reservations]) // ✅ reservations 의존성 추가

  const handleDayClick = (dateStr: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return
    router.push(`/reservations/${dateStr}`)
  }

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year)
    setCurrentMonth(month)
  }

  return (
    <div className='w-full min-h-dvh mt-14 px-4 pb-32'>
      {error ? (
        <div className='p-8 rounded-lg shadow-sm border border-red-200 text-center'>
          <div className='text-red-500'>Failed to load calendar</div>
        </div>
      ) : (
        <div className='relative'>
          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center z-10 rounded-lg'>
              <div className='animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full' />
            </div>
          )}

          <div className='w-full h-fit'>
            {/* Today & New Section */}
            <div className='flex items-center justify-between gap-2 mb-3'>
              {/* Today */}
              <div className='w-fit flex-shrink-0 h-fit flex flex-col gap-2 justify-end items-start'>
                <span className='text-[#3C2F2F] text-sm'>Today{"'s"}</span>
                <div className='w-fit h-10 bg-[#EFECEC] border border-[#CFC7C7] flex flex-row gap-3 px-3.5 py-2.5 rounded-md'>
                  <div className='w-fit flex flex-shrink-0 flex-row justify-start items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-[#6DA9FF]' />
                    <span className='text-[13px] text-[#3C2F2F] font-medium'>Check in {monthStats.todayCheckIn}</span>
                  </div>
                  <div className='w-[1px] h-full bg-[#CFC7C7]' />
                  <div className='w-fit flex flex-shrink-0 flex-row justify-start items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-[#FF7D7D]' />
                    <span className='text-[13px] text-[#3C2F2F] font-medium'>Check out {monthStats.todayCheckOut}</span>
                  </div>
                </div>
              </div>

              {/* New - 전체 예약 요청 표시 */}
              <div className='w-fit flex-shrink-0 h-fit flex flex-col gap-2 justify-end items-start'>
                <span className='text-[#3C2F2F] text-sm'>New</span>
                <button
                  className={classNames(
                    'w-fit h-10 flex flex-row gap-2.5 pl-4 pr-3 py-2.5 rounded-md items-center justify-center cursor-pointer active:scale-95 transition-all',
                    monthStats.totalRequested > 0 ? 'bg-[#5E4646]' : 'bg-[#DFDADA]',
                  )}
                  onClick={() => {
                    router.push('/reservations/request')
                  }}
                >
                  <span
                    className={classNames(
                      'text-[13px] font-medium leading-none',
                      monthStats.totalRequested > 0 ? 'text-white' : 'text-[#3C2F2F]',
                    )}
                  >
                    Request
                  </span>
                  <div
                    className={classNames(
                      'w-6 h-6 p-2 aspect-square rounded-full flex justify-center items-center',
                      monthStats.totalRequested > 0 ? 'bg-[#D99B48]' : 'bg-[#BFB5B5]',
                    )}
                  >
                    <span className='text-sm font-bold leading-none text-white'>{monthStats.totalRequested}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Calendar Header with Navigation and Toggle */}
            <CalendarHeader
              year={currentYear}
              month={currentMonth}
              viewMode={viewMode}
              onMonthChange={handleMonthChange}
              onViewModeChange={setViewMode}
            />

            {/* Calendar Grid */}
            <Calendar
              year={currentYear}
              month={currentMonth}
              calendarData={calendarData}
              viewMode={viewMode}
              onDateClick={handleDayClick}
            />
          </div>
        </div>
      )}
    </div>
  )
}
