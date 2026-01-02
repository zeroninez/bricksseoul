// admin/src/app/reservations/components/MiniCalendar.tsx
'use client'

import classNames from 'classnames'
import { getTodayString } from '@/utils'
import { Reservation } from '@/types/reservation'

interface DayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  allReservations: Reservation[]
}

interface MiniCalendarProps {
  year: number
  month: number
  selectedDate: string // ✅ 선택된 날짜
  calendarData: Record<string, DayData>
  onDateClick?: (date: string) => void
  selectedReservation?: Reservation | null
}

export const MiniCalendar = ({
  year,
  month,
  selectedDate,
  calendarData,
  onDateClick,
  selectedReservation,
}: MiniCalendarProps) => {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const todayString = getTodayString()

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

  // ✅ 빈 칸 (이전 달 날짜 대신)
  for (let i = 0; i < startDayOfWeek; i++) {
    const day = daysInPrevMonth - i

    calendarDays.push(
      <div key={`empty-prev-${i}`} className=''>
        <div
          className={classNames(
            ' overflow-hidden px-2 pt-1 pb-2 flex flex-col justify-start items-center w-full relative rounded-md',
          )}
        >
          <div className='w-full flex items-center justify-center text-center text-sm font-medium leading-none text-stone-300'>
            {day}
          </div>
        </div>
      </div>,
    )
  }

  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = todayString === dateStr
    const isSelected = selectedDate === dateStr
    const dayData = calendarData[dateStr]
    const hasConfirmed = dayData?.hasConfirmed || false
    const currentSelected = selectedReservation
      ? dayData?.allReservations.some((res) => res.id === selectedReservation.id)
      : false

    calendarDays.push(
      <div
        key={day}
        onClick={() => hasConfirmed && onDateClick?.(dateStr)}
        className={classNames(
          'w-full h-fit overflow-hidden px-2 pt-1 pb-2 flex flex-col justify-start items-center relative rounded-md cursor-pointer active:bg-stone-100 transition-colors',
          isToday && 'border border-[#3C2F2F] text-black',
          isSelected
            ? 'bg-[#7E6B6B] text-white'
            : currentSelected
              ? 'bg-[#CFC7C7] text-black'
              : hasConfirmed
                ? 'bg-[#EBE7E4] text-black'
                : 'bg-transparent text-black',
        )}
      >
        <div className='w-full flex items-center justify-center text-center text-sm font-medium leading-none'>
          {day}
        </div>
      </div>,
    )
  }

  // 다음 달의 날짜들
  const totalCells = 42
  const remainingCells = totalCells - calendarDays.length

  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    calendarDays.push(
      <div key={`empty-next-${day}`} className=''>
        <div
          className={classNames(
            ' overflow-hidden px-2 pt-1 pb-2 flex flex-col justify-start items-center w-full relative rounded-md',
          )}
        >
          <div className='w-full flex items-center justify-center text-center text-sm font-medium leading-none text-stone-300'>
            {day}
          </div>
        </div>
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
      <div className='grid grid-cols-7 gap-2 h-fit'>{calendarDays}</div>
    </div>
  )
}
