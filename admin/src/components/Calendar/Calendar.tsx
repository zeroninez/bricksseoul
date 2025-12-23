'use client'

import { useState, useMemo } from 'react'
import classNames from 'classnames'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { motion } from 'motion/react'

interface CalendarProps {
  year: number
  month: number
  reservations: Array<{
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
  onDateClick?: (date: string) => void
  onMonthChange?: (year: number, month: number) => void
}

interface DayData {
  checkInCount: number
  checkOutCount: number
  stayingCount: number
  hasConfirmed: boolean
  totalRequested: number
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

export const Calendar = ({ year, month, reservations, onDateClick, onMonthChange }: CalendarProps) => {
  const [viewMode, setViewMode] = useState<'reservation' | 'vacancy'>('reservation')

  const commonDateClassName =
    'aspect-calendar overflow-hidden px-2 pt-1 pb-2 flex flex-col justify-start items-center w-full relative rounded-md '
  const commonDateNumberClassName =
    'w-full flex items-center justify-center text-center text-sm font-medium leading-none'

  // 📊 데이터 전처리: 날짜별로 예약 정보 미리 계산
  const calendarData = useMemo(() => {
    const dataMap: Record<string, DayData> = {}

    // 전체 예약을 한 번만 순회
    reservations.forEach((reservation) => {
      const checkInDate = new Date(reservation.check_in_date)
      const checkOutDate = new Date(reservation.check_out_date)

      // 예약 기간의 모든 날짜를 순회
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

    return dataMap
  }, [reservations])

  // 📈 월간 통계 계산
  const monthStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayData = calendarData[today]

    return {
      todayCheckIn: todayData?.checkInCount || 0,
      todayCheckOut: todayData?.checkOutCount || 0,
      todayRequested: todayData?.totalRequested || 0,
    }
  }, [calendarData])

  // 해당 월의 첫날과 마지막날
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  // 이전 달 정보
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate()

  // 이전/다음 달로 이동
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange?.(year - 1, 12)
    } else {
      onMonthChange?.(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange?.(year + 1, 1)
    } else {
      onMonthChange?.(year, month + 1)
    }
  }

  // 달력 그리드 생성
  const calendarDays = []

  // 이전 달의 날짜들 추가
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayData = calendarData[dateStr]

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

  // 현재 달의 날짜들 추가
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = new Date().toISOString().split('T')[0] === dateStr

    const dayData = calendarData[dateStr] || {
      checkInCount: 0,
      checkOutCount: 0,
      stayingCount: 0,
      hasConfirmed: false,
      totalRequested: 0,
      allReservations: [],
    }

    const commonDayDataClassName = 'w-full h-full  flex-1 overflow-hidden px-1 rounded flex items-center justify-center'
    const commonDayDataNumberClassName = 'text-xxs text-white text-center font-bold leading-0 -translate-y-[1px]'

    calendarDays.push(
      <div
        key={day}
        onClick={() => onDateClick?.(dateStr)}
        className={classNames(
          isToday && 'border border-primary',
          dayData.hasConfirmed && 'bg-[#ECE7E4]',
          'cursor-pointer active:bg-stone-100 transition-colors',
          commonDateClassName,
        )}
      >
        <div className={classNames('text-stone-900', commonDateNumberClassName)}>{day}</div>

        {dayData.hasConfirmed && (
          <div className='w-full h-full  flex flex-col justify-start items-center gap-0.5 mt-1.5'>
            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#6DA9FF]',
                // dayData.checkInCount === 0 && 'invisible',
              )}
              title={`${dayData.checkInCount} check-in(s)`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.checkInCount}</span>
            </div>

            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#868585]',
                // dayData.stayingCount === 0 && 'invisible',
              )}
              title={`${dayData.stayingCount} staying`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.stayingCount}</span>
            </div>

            <div
              className={classNames(
                commonDayDataClassName,
                'bg-[#FF7D7D]',
                // dayData.checkOutCount === 0 && 'invisible',
              )}
              title={`${dayData.checkOutCount} check-out(s)`}
            >
              <span className={commonDayDataNumberClassName}>{dayData.checkOutCount}</span>
            </div>
          </div>
        )}
      </div>,
    )
  }

  // 다음 달의 날짜들 추가
  const totalCells = 42
  const remainingCells = totalCells - calendarDays.length
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

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

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className='w-full h-fit '>
      <div className='flex items-center justify-between gap- mb-3'>
        {/* Today */}
        <div className='w-fit flex-shrink-0 h-fit flex flex-col gap-2 justify-end items-start'>
          <span className='text-[#3C2F2F] text-sm'>Today{"'"}s</span>

          <div className='w-fit h-10 bg-[#EFECEC] border border-[#CFC7C7] flex flex-row gap-3  px-3.5 py-2.5 rounded-md'>
            <div className='w-fit flex flex-shrink-0 flex-row justify-start items-center gap-2'>
              <div className={classNames('w-1.5 h-1.5 rounded-full', 'bg-[#6DA9FF]')} />
              <span className='text-[13px] text-[#3C2F2F] font-medium'>
                Check in{'  '}
                {/* {monthStats.todayCheckIn} */}
                22
              </span>
            </div>
            <div className='w-[1px] h-full bg-[#CFC7C7]' />
            <div className='w-fit flex flex-shrink-0 flex-row justify-start items-center gap-2'>
              <div className={classNames('w-1.5 h-1.5 rounded-full', 'bg-[#FF7D7D]')} />
              <span className='text-[13px] text-[#3C2F2F] font-medium'>
                Check out{'  '}
                {/* {monthStats.todayCheckOut} */}
                22
              </span>
            </div>
          </div>
        </div>

        {/* New */}
        <div className='w-fit flex-shrink-0 h-fit flex flex-col gap-2 justify-end items-start'>
          <span className='text-[#3C2F2F] text-sm'>New</span>
          <div
            className={classNames(
              'w-fit h-10 flex flex-row gap-2.5 pl-4 pr-3 py-2.5 rounded-md items-center justify-center',
              monthStats.todayRequested > 0 ? 'bg-[#5E4646]' : 'bg-[#DFDADA]',
            )}
          >
            <span
              className={classNames(
                'text-[13px] font-medium leading-none',
                monthStats.todayRequested > 0 ? 'text-white' : 'text-[#3C2F2F]',
              )}
            >
              Request
            </span>
            <div
              className={classNames(
                'w-6 h-6 p-2 aspect-square rounded-full flex justify-center items-center',
                monthStats.todayRequested > 0 ? 'bg-[#D99B48]' : 'bg-[#BFB5B5]',
              )}
            >
              <span className='text-sm font-bold leading-none text-white'>{monthStats.todayRequested}</span>
            </div>
          </div>
        </div>
      </div>

      {/* header */}
      <div className='flex items-center justify-between mb-2'>
        {/* month navigation */}
        <div className='w-fit h-full flex gap-1  items-center justify-center'>
          <button onClick={handlePrevMonth} className='w-fit h-fit p-1 opacity-50 transition-colors'>
            <FaCaretLeft className='text-lg text-[#5E4646]' />
          </button>
          <h2 className='text-[17px] font-medium text-[#3C2F2F] w-fit h-6 text-center flex items-center leading-[26px]'>
            {year}년 {month}월
          </h2>
          <button onClick={handleNextMonth} className='w-fit h-fit p-1 opacity-50 transition-colors'>
            <FaCaretRight className='text-lg text-[#5E4646]' />
          </button>
        </div>

        {/* mode toggle */}
        <motion.div
          className='rounded-full  w-fit p-1 h-full bg-[#ECE7E4] flex flex-row relative cursor-pointer'
          onClick={() => {
            setViewMode(viewMode === 'reservation' ? 'vacancy' : 'reservation')
          }}
        >
          <motion.div
            className='absolute w-12 h-6 bg-white rounded-full'
            animate={{
              x: viewMode === 'reservation' ? 0 : 48,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          <motion.div
            style={{
              color: viewMode === 'reservation' ? '#000' : '#898A8C',
            }}
            className='w-12 h-6 px-2 py-1 z-10 text-sm flex items-center justify-center rounded-full text-center'
          >
            예약
          </motion.div>
          <motion.div
            style={{
              color: viewMode === 'vacancy' ? '#000' : '#898A8C',
            }}
            className='w-12 h-6 px-2 py-1 z-10 text-sm flex items-center justify-center rounded-full text-center'
          >
            빈방
          </motion.div>
        </motion.div>
      </div>

      {/* 요일 헤더 */}
      <div className='grid grid-cols-7 gap-2 mb-2 '>
        {weekDays.map((day) => (
          <div key={day} className='text-center  text-sm font-medium text-stone-400 py-1'>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className='grid grid-cols-7 gap-2'>{calendarDays}</div>
    </div>
  )
}
