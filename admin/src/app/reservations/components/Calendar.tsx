'use client'

import classNames from 'classnames'

interface DayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  totalRequested: number
  availableCount: number // 추가
  allReservations: Array<{
    id: string
    reservation_code: string
    check_in_date: string
    check_out_date: string
    status: 'requested' | 'confirmed' | 'cancelled'
    guest_count: number
    properties: {
      id: string
      name: string
    }
  }>
}

interface CalendarProps {
  year: number
  month: number
  calendarData: Record<string, DayData>
  viewMode: 'reservation' | 'vacancy'
  onDateClick?: (date: string) => void
}

export const Calendar = ({ year, month, calendarData, viewMode, onDateClick }: CalendarProps) => {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const commonDateClassName =
    'aspect-calendar overflow-hidden px-2 pt-1 pb-2 flex flex-col justify-start items-center w-full relative rounded-md'
  const commonDateNumberClassName =
    'w-full flex items-center justify-center text-center text-sm font-medium leading-none'
  const commonDayDataClassName = 'w-full h-full flex-1 overflow-hidden px-1 rounded flex items-center justify-center'
  const commonDayDataNumberClassName = 'text-xxs text-white text-center font-bold leading-0 -translate-y-[1px]'

  // 해당 월의 첫날과 마지막날
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  // 이전 달 정보
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate()

  // 다음 달 정보
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  // 달력 그리드 생성
  const calendarDays = []

  // 이전 달의 날짜들
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    calendarDays.push(
      <div
        key={`prev-${day}`}
        onClick={() => onDateClick?.(dateStr)}
        className={classNames('opacity-40', commonDateClassName)}
      >
        <div className={classNames('text-stone-600', commonDateNumberClassName)}>{day}</div>
      </div>,
    )
  }

  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = new Date().toISOString().split('T')[0] === dateStr

    const dayData = calendarData[dateStr] || {
      checkInCount: 0,
      checkOutCount: 0,
      stayingCount: 0,
      hasConfirmed: false,
      totalRequested: 0,
      availableCount: 0,
      allReservations: [],
    }

    calendarDays.push(
      <div
        key={day}
        onClick={() => onDateClick?.(dateStr)}
        className={classNames(
          isToday && 'border border-[#3C2F2F]',
          dayData.hasConfirmed && viewMode === 'reservation' && 'bg-[#ECE7E4]',
          dayData.availableCount > 0 && viewMode === 'vacancy' && 'bg-[#E8F5E9]', // 빈방이 있으면 연한 초록색
          'cursor-pointer active:bg-stone-100 transition-colors',
          commonDateClassName,
        )}
      >
        <div className={classNames('text-stone-900', commonDateNumberClassName)}>{day}</div>

        {viewMode === 'reservation' && dayData.hasConfirmed && (
          <div className='w-full h-full flex flex-col justify-start items-center gap-0.5 mt-1.5'>
            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#6DA9FF]',
                dayData.checkInCount === 0 ? 'opacity-0' : 'opacity-100',
              )}
              title={`${dayData.checkInCount} check-in(s)`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.checkInCount}</span>
            </div>

            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#868585]',
                dayData.stayingCount === 0 ? 'opacity-0' : 'opacity-100',
              )}
              title={`${dayData.stayingCount} staying`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.stayingCount}</span>
            </div>

            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#FF7D7D]',
                dayData.checkOutCount === 0 ? 'opacity-0' : 'opacity-100',
              )}
              title={`${dayData.checkOutCount} check-out(s)`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.checkOutCount}</span>
            </div>
          </div>
        )}

        {viewMode === 'vacancy' && (
          <div className='w-full h-full flex flex-col justify-center items-center mt-1'>
            <div className='w-full h-fit flex items-center justify-center' title={`${dayData.availableCount}개 빈방`}>
              <span className='text-base font-bold text-[#4CAF50]'>{dayData.availableCount}</span>
            </div>
          </div>
        )}
      </div>,
    )
  }

  // 다음 달의 날짜들
  const totalCells = 42
  const remainingCells = totalCells - calendarDays.length

  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    calendarDays.push(
      <div
        key={`next-${day}`}
        onClick={() => onDateClick?.(dateStr)}
        className={classNames('opacity-40', commonDateClassName)}
      >
        <div className={classNames('text-stone-600', commonDateNumberClassName)}>{day}</div>
      </div>,
    )
  }

  return (
    <div className='w-full'>
      {/* 요일 헤더 */}
      <div className='grid grid-cols-7 gap-2 mb-2'>
        {weekDays.map((day) => (
          <div key={day} className='text-center text-sm font-medium text-stone-400 py-1'>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className='grid grid-cols-7 gap-2'>{calendarDays}</div>
    </div>
  )
}
