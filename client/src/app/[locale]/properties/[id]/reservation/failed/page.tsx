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
    <main className='w-full h-dvh absolute z-50 bg-background inset-0 flex flex-col items-center gap-10'>
      <motion.div
        {...animationProps}
        className='flex-4 w-full px-7 inline-flex flex-col justify-end items-center gap-4'
      >
        <div className='w-fit h-fit flex text-center justify-center text-zinc-800 text-3xl font-bold'>SORRY!</div>
        <div className='w-fit h-fit flex flex-col text-center justify-center gap-2'>
          <div className='text-stone-700 text-xl font-bold'>Reservation Failed</div>
          <div className='text-stone-700 text-base font-normal'>We couldn&apos;t complete your reservation</div>
        </div>
      </motion.div>
      <motion.div {...animationProps} className='flex-4 w-full px-12 flex flex-col justify-start items-center gap-3'>
        <div className='w-full bg-red-50 border border-red-300 rounded-xl flex flex-col justify-center items-center gap-3 p-4'>
          <p className='w-full text-red-800 text-center'>{decodeURIComponent(reason)}</p>
          {/* 날짜 겹침 정보 표시 */}
          {conflicts && conflicts.length > 0 && (
            <div className='w-full mt-2 items-center justify-center text-center pt-4 pb-2 border-t border-red-300 space-y-2'>
              <p className='font-medium text-red-800'>Conflicting reservations:</p>
              <div className='space-y-2'>
                {conflicts.map((conflict: any, index: number) => (
                  <div key={index} className='bg-white rounded-lg px-3 py-2 text-sm text-red-700'>
                    {formatDate(conflict.check_in)} - {formatDate(conflict.check_out)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => router.replace('/')}
          className='w-full h-fit bg-red-800 rounded-lg inline-flex justify-center items-center gap-2 p-3 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
        >
          <span className='text-white text-base font-medium'> Choose Different Dates</span>
        </button>
      </motion.div>
      <motion.div
        {...animationProps}
        className='flex-3 w-full px-8 flex flex-col justify-start items-center text-center gap-3 font-medium text-stone-600'
      >
        <span>Please select different dates or contact our support team if you need assistance.</span>
        <button
          onClick={() => {
            router.replace('/')
          }}
          className='text-stone-800 underline underline-offset-2 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
        >
          Go to Home
        </button>
      </motion.div>
    </main>
  )
}
