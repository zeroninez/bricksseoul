'use client'

import { useState } from 'react'
import { useReservationsCalendar } from '@/hooks/useReservation'
import { Calendar } from '@/components/Calendar'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)

  const { data: reservations, isLoading, error } = useReservationsCalendar(currentYear, currentMonth)

  const handleDateClick = (date: string) => {
    router.push(`/reservations?date=${date}`)
  }

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year)
    setCurrentMonth(month)
  }

  return (
    <div className='w-full min-h-dvh p-5'>
      {/* 로딩/에러는 달력 내부에서만 표시 */}
      {error ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center'>
          <div className='text-red-500'>Failed to load calendar</div>
        </div>
      ) : (
        <div className='relative'>
          {isLoading && (
            <div className='absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg'>
              <div className='animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full' />
            </div>
          )}
          <Calendar
            year={currentYear}
            month={currentMonth}
            reservations={reservations || []}
            onDateClick={handleDateClick}
            onMonthChange={handleMonthChange}
          />
        </div>
      )}
    </div>
  )
}
