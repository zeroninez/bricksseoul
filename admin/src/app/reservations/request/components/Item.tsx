'use client'

import { motion } from 'motion/react'
import classNames from 'classnames'

export const Item = ({ reservation, onClick }: { reservation: any; onClick: () => void }) => {
  return (
    <motion.div key={reservation.id} className='w-full h-fit flex flex-row justify-between items-center'>
      <div className='w-fit h-fit flex flex-row justify-start items-center gap-4'>
        <span
          className={classNames(
            'text-sm font-bold pl-1.5',
            reservation.status === 'requested'
              ? 'text-[#D99B48]'
              : reservation.status === 'confirmed'
                ? 'text-[#6DA9FF]'
                : 'text-[#A1A1A1]',
          )}
        >
          {reservation.status === 'requested' ? 'NEW' : reservation.status === 'confirmed' ? '확정' : '취소됨'}
        </span>

        <div className='w-fit h-fit flex flex-col justify-center items-start'>
          <span className='font-medium'>
            {reservation.property.name} | {reservation.property.address.address2}
          </span>
          <span className='text-sm text-gray-500'>
            {reservation.email} | {reservation.guest_count}명
          </span>
        </div>
      </div>
      <button
        onClick={onClick}
        className='w-fit h-fit px-2.5 py-2 leading-none text-sm bg-[#EFECEC] text-black rounded-md active:scale-95 transition-all'
      >
        상세보기
      </button>
    </motion.div>
  )
}
