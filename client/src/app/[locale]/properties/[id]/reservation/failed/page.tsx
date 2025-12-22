'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { formatDate } from '@/utils'
import { motion } from 'motion/react'

export default function ReservationFailedPage() {
  const router = useRouter()
  const params = useSearchParams()
  const reason = params.get('reason') || 'An unexpected error occurred.'
  const conflictsParam = params.get('conflicts')

  // conflicts가 있으면 파싱
  let conflicts = null
  try {
    if (conflictsParam) {
      conflicts = JSON.parse(decodeURIComponent(conflictsParam))
    }
  } catch (e) {
    console.error('Failed to parse conflicts:', e)
  }

  const animationProps = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <main className='w-full h-dvh absolute z-50 bg-stone-100 inset-0 flex flex-col items-center gap-10'>
      <motion.div
        {...animationProps}
        className='flex-4 w-full px-7 inline-flex flex-col justify-end items-center gap-2'
      >
        <svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52' fill='none'>
          <path
            d='M28.1673 28.1667H23.834V15.1667H28.1673M28.1673 36.8334H23.834V32.5H28.1673M26.0006 4.33337C23.1553 4.33337 20.3379 4.8938 17.7092 5.98265C15.0805 7.0715 12.6919 8.66746 10.68 10.6794C6.61672 14.7427 4.33398 20.2537 4.33398 26C4.33398 31.7464 6.61672 37.2574 10.68 41.3207C12.6919 43.3326 15.0805 44.9286 17.7092 46.0174C20.3379 47.1063 23.1553 47.6667 26.0006 47.6667C31.747 47.6667 37.258 45.384 41.3213 41.3207C45.3846 37.2574 47.6673 31.7464 47.6673 26C47.6673 23.1547 47.1069 20.3373 46.018 17.7086C44.9292 15.0798 43.3332 12.6913 41.3213 10.6794C39.3094 8.66746 36.9208 7.0715 34.2921 5.98265C31.6634 4.8938 28.846 4.33337 26.0006 4.33337Z'
            fill='#FF7D7D'
          />
        </svg>
        <div className='w-fit h-fit flex flex-col text-center justify-center gap-2'>
          <div className='text-xl font-bold text-[#FF7D7D]'>Reservation Failed</div>
          <div className='text-stone-700 text-base font-normal'>{decodeURIComponent(reason)}</div>
        </div>
      </motion.div>
      <motion.div {...animationProps} className='flex-4 w-full px-12 flex flex-col justify-start items-center gap-4'>
        <div className='w-full border border-stone-300 rounded-lg flex flex-col justify-center items-center gap-3.5 p-3'>
          <div className='w-fit flex flex-col justify-center text-center items-center gap-1.5'>
            <span className='text-stone-700 text-sm font-normal'>Conflicting date</span>
            <div className='space-y-2'>
              {conflicts.map((conflict: any, index: number) => (
                <div key={index} className='text-lg font-bold text-stone-700'>
                  {formatDate(conflict.check_in)} - {formatDate(conflict.check_out)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => router.replace('/')}
          className='w-full h-11 bg-[#D99B48] rounded-lg inline-flex justify-center items-center gap-2 p-3 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
        >
          <span className='text-white text-base font-medium leading-none'>Change Date</span>
        </button>
        <button
          onClick={() => {
            router.replace('/')
          }}
          className='w-full h-fit bg-transparent rounded-lg inline-flex justify-center items-center gap-2 px-3 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
        >
          <span className='text-stone-500 text-base font-normal leading-none'>Go home</span>
        </button>
      </motion.div>
      <motion.div
        {...animationProps}
        className='flex-3 w-full px-12 flex flex-col justify-start items-center text-center gap-3 font-normal text-stone-600'
      >
        <span>Contact our support team if you need additional assistance.</span>
      </motion.div>
    </main>
  )
}
