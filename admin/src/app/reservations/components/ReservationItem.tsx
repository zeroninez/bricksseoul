'use client'

import { AnimatePresence, motion } from 'motion/react'
import classNames from 'classnames'
import type { Reservation } from '@/types/reservation'
import { Fragment, useState } from 'react'
import { formatDate, formatTime } from '@/utils'

interface ReservationItemProps {
  statusType: 'date' | 'request'
  standardDate?: string
  reservation: Reservation
  action: {
    label: string
    type: 'button' | 'dropdown'
    onClick?: () => void
    onDetailClick?: () => void
  }
  syncSelectedReservation?: () => void
}
export const ReservationItem = ({
  statusType,
  standardDate,
  reservation,
  action,
  syncSelectedReservation,
}: ReservationItemProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // IN, OUT, STAY status
  const dateStatus = (() => {
    const evalDate = standardDate ? new Date(standardDate) : new Date()
    const checkInDate = new Date(reservation.check_in_date)
    const checkOutDate = new Date(reservation.check_out_date)

    if (evalDate <= checkInDate) return 'IN'
    if (evalDate > checkInDate && evalDate < checkOutDate) return 'STAY'
    if (evalDate >= checkOutDate) return 'OUT'
  })()

  console.log(`${reservation.id}-${standardDate}-item`)

  return (
    <>
      <motion.div
        key={`${reservation.id}-${standardDate}-item`}
        className='w-full h-fit grid grid-cols-[48px_1fr] grid-rows-1 gap-3 justify-between items-center'
      >
        {statusType === 'request' ? (
          <div
            className={classNames(
              'w-full text-xs font-bold text-center',
              reservation.status === 'requested'
                ? 'text-[#D99B48]'
                : reservation.status === 'confirmed'
                  ? 'text-[#6DA9FF]'
                  : 'text-[#A1A1A1]',
            )}
          >
            {reservation.status === 'requested' ? 'NEW' : reservation.status === 'confirmed' ? '확정' : '취소됨'}
          </div>
        ) : (
          <div
            className={classNames(
              'w-full text-xs font-bold text-center',
              dateStatus === 'IN' ? 'text-[#6DA9FF]' : dateStatus === 'STAY' ? 'text-[#A1A1A1]' : 'text-[#FF7D7D]',
            )}
          >
            {dateStatus}
          </div>
        )}

        <div className='w-full h-fit flex flex-col justify-start items-start'>
          <div className='w-full h-fit flex flex-row justify-between items-center'>
            <div className='w-full h-fit flex flex-col gap-1 justify-center items-start'>
              <div className='text-sm text-black flex flex-row justify-start items-center gap-1'>
                <span className='leading-tight'>{reservation.property.name}</span>{' '}
                <div className='w-px h-3 bg-gray-300 inline-block' />{' '}
                <span className='leading-tight'>{reservation.property.address.address2}</span>
              </div>
              <div className='text-sm text-gray-500 flex flex-row justify-start items-center gap-1'>
                <span className='leading-tight'>{reservation.email}</span>{' '}
                <div className='w-px h-3 bg-gray-300 inline-block' />{' '}
                <span className='leading-tight'>{reservation.guest_count}명</span>
              </div>
            </div>

            {action && (
              <button
                onClick={() => {
                  action.type === 'button'
                    ? action.onClick?.()
                    : (setIsDropdownOpen(!isDropdownOpen), syncSelectedReservation?.())
                }}
                className={classNames(
                  'w-fit h-fit flex-shrink-0 px-2 py-2 leading-none text-sm text-[#3C2F2F] active:scale-90 active:opacity-70 transition-all',
                  action.type === 'dropdown' ? 'cursor-pointer opacity-40' : 'bg-[#EFECEC] rounded-md ',
                )}
              >
                {action.type === 'dropdown' ? (isDropdownOpen ? `접기` : `${action.label}`) : action.label}
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {action.type === 'dropdown' && isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='w-full grid grid-cols-[48px_1fr] gap-3 mt-3.5 grid-rows-1'
          >
            <div />
            <div
              className={classNames(
                'w-full h-fit p-4 bg-[#F5F4F4] rounded-lg text-sm px-2 pt-3.5 pb-2',
                'flex flex-col justify-center items-center gap-2',
              )}
            >
              <div className='w-full h-fit flex flex-row gap-2 text-[#5E4646] justify-center items-center'>
                {[
                  {
                    label: '입실',
                    date: reservation.check_in_date,
                    time: reservation.property.check_in_time,
                  },
                  {
                    label: '퇴실',
                    date: reservation.check_out_date,
                    time: reservation.property.check_out_time,
                  },
                ].map((_, idx) => (
                  <Fragment key={idx}>
                    <div key={idx} className='w-full h-fit flex flex-col pb-1 justify-center items-center gap-2'>
                      <span className='text-sm font-medium leading-none'>{_.label}</span>
                      <span className='text-sm font-normal leading-none'>
                        {formatDate(_.date, 'short')}
                        {'  '}
                        {formatTime(_.time)}
                      </span>
                    </div>
                    {idx === 0 && <div key={`divider-${idx}`} className='w-px h-8 bg-[#DFDADA] inline-block' />}
                  </Fragment>
                ))}
              </div>
              <button
                onClick={() => action.onDetailClick && action.onDetailClick()}
                className='w-full h-fit px-2.5 py-3 bg-[#EFECEC] text-[#3C2F2F] flex justify-center items-center active:scale-95 rounded-md transition-all'
              >
                상세정보 보기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
