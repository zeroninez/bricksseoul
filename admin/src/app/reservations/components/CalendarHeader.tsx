// components/CalendarHeader.tsx
'use client'

import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { motion } from 'motion/react'
import classNames from 'classnames'
import { useMemo, useRef, useState } from 'react'

interface CalendarHeaderProps {
  mini?: boolean
  year: number
  month: number
  viewMode?: 'reservation' | 'vacancy'
  onMonthChange: (year: number, month: number) => void
  onViewModeChange?: (mode: 'reservation' | 'vacancy') => void
}

export const CalendarHeader = ({
  mini = false,
  year,
  month,
  viewMode = 'reservation',
  onMonthChange,
  onViewModeChange,
}: CalendarHeaderProps) => {
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  return (
    <div className={classNames('flex items-center  mb-2', onViewModeChange ? 'justify-between' : 'justify-center')}>
      {/* Month Navigation */}
      <div className='w-fit h-full flex gap-1 items-center justify-center'>
        <button onClick={handlePrevMonth} className='w-fit h-fit p-1 opacity-50 transition-colors'>
          <FaCaretLeft className='text-lg text-[#5E4646]' />
        </button>
        <MonthTitleAsNativeInput
          year={year}
          month={month}
          onChange={({ year, month }) => {
            onMonthChange(year, month)
          }}
        />
        <button onClick={handleNextMonth} className='w-fit h-fit p-1 opacity-50 transition-colors'>
          <FaCaretRight className='text-lg text-[#5E4646]' />
        </button>
      </div>

      {/* Mode Toggle */}
      {onViewModeChange && (
        <motion.div
          className='rounded-full w-fit p-1 h-full bg-[#ECE7E4] flex flex-row relative cursor-pointer'
          onClick={() => {
            onViewModeChange(viewMode === 'reservation' ? 'vacancy' : 'reservation')
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
      )}
    </div>
  )
}

export function MonthTitleAsNativeInput({
  mini,
  year,
  month,
  onChange,
}: {
  mini?: boolean
  year: number
  month: number
  onChange: (next: { year: number; month: number }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const value = useMemo(() => {
    const mm = String(month).padStart(2, '0')
    return `${year}-${mm}` // YYYY-MM
  }, [year, month])

  const titleClass = classNames(
    mini ? 'text-sm' : 'text-[17px] font-medium text-[#3C2F2F] w-fit h-6 text-center flex items-center leading-[26px]',
  )

  const openPicker = () => {
    const el = inputRef.current
    if (!el) return // Chrome/Edge 등에서 지원. Safari는 없을 수 있음.
    ;(el as any).showPicker?.()
    el.focus()
  }

  return (
    <div
      className='relative inline-flex items-center'
      onClick={openPicker}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPicker()
      }}
    >
      <h2 className={classNames(titleClass, 'select-none')}>
        {year}년 {month}월
      </h2>

      <input
        ref={inputRef}
        type='month'
        value={value}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-').map(Number)
          if (!Number.isFinite(y) || !Number.isFinite(m)) return
          onChange({ year: y, month: m })
        }}
        aria-label='연/월 선택'
        className='absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer'
      />
    </div>
  )
}
