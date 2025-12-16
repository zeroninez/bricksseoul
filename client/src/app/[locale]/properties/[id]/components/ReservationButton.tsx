'use client'

import { motion } from 'motion/react'
import classNames from 'classnames'
import { useRouter } from '@/i18n/routing'
import { formatCurrency, formatDate } from '@/utils'
import { PropertyGetResponse } from '@/types/property'

interface ReservationButtonProps {
  data: PropertyGetResponse
  moveInDate: string
  moveOutDate: string
  action: {
    label: string
    onClick: () => void
  }
}

export const ReservationButton = ({ data, moveInDate, moveOutDate, action }: ReservationButtonProps) => {
  const router = useRouter()

  const inDate = new Date(moveInDate!)
  const outDate = new Date(moveOutDate!)
  const timeDiff = outDate.getTime() - inDate.getTime()
  const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24))

  const total = data.price_per_night * dayCount

  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={classNames(
          'fixed max-w-md mx-auto bottom-0 inset-x-0 z-[99999] bg-background flex flex-row items-center justify-between',
          'pl-4 pr-2 py-2 shadow-[0_-4px_6px_rgba(0,0,0,0.1)]',
          'w-full h-20',
        )}
      >
        <div className='w-fit h-fit flex flex-col justify-start gap-2 items-start'>
          <h2 className='text-lg leading-none font-bold'>{formatCurrency(total, data.currency)}</h2>
          {/* Selected period */}
          <div className='w-fit h-fit leading-none text-sm flex flex-row flex-wrap gap-2 justify-start items-center'>
            <p className=''>
              {formatDate(moveInDate)} - {formatDate(moveOutDate)}
            </p>
            <p className='underline'>
              {Math.ceil((new Date(moveOutDate).getTime() - new Date(moveInDate).getTime()) / (1000 * 3600 * 24))}
              {' nights'}
            </p>
          </div>
        </div>

        <button
          className='w-30 bg-black h-14 px-4 py-4 text-white text-[18px] rounded-xl font-medium active:opacity-50 active:scale-95 transition-all disabled:text-white/50 disabled:bg-disabled disabled:cursor-not-allowed flex justify-center items-center'
          onClick={action.onClick}
        >
          {action.label}
        </button>
      </motion.div>
    </>
  )
}
