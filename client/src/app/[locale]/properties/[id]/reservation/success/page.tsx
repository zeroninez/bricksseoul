'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { motion } from 'motion/react'
import { Logo } from '@/components'

export default function ReservationSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const reservationCode = params.get('code')

  const animationProps = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <main className='w-full h-dvh absolute z-50 bg-stone-100 inset-0 flex flex-col items-center gap-10'>
      <motion.div
        {...animationProps}
        className='flex-4 w-full px-7 inline-flex flex-col justify-end items-center gap-6'
      >
        <Logo height={40} />
        <div className='w-fit h-fit flex flex-col text-center justify-center gap-2'>
          <div className='text-stone-700 text-xl font-bold'>Reservation Submitted</div>
          <div className='text-stone-700 text-base font-normal'>
            We will notify you via the email address you entered once the administrator confirms your booking.
          </div>
        </div>
      </motion.div>
      <motion.div {...animationProps} className='flex-4 w-full px-12 flex flex-col justify-start items-center gap-3'>
        <div className='w-full bg-stone-200 rounded-lg inline-flex justify-center items-center gap-4 p-4'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 flex-shrink-0' viewBox='0 0 20 20' fill='#D99B48'>
            <path d='M11 11H9V5H11M11 15H9V13H11M10 0C8.68678 0 7.38642 0.258658 6.17317 0.761205C4.95991 1.26375 3.85752 2.00035 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C3.85752 17.9997 4.95991 18.7362 6.17317 19.2388C7.38642 19.7413 8.68678 20 10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7362 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0Z' />
          </svg>
          <div className='w-full flex '>
            <span className='text-stone-700 text-base font-normal'>
              Please copy your <b>personal confirm code</b> to view your booking details
            </span>
          </div>
        </div>
        <div className='w-full border border-stone-300 rounded-lg flex flex-col justify-center items-center gap-3.5 p-3'>
          <div className='w-fit flex flex-col justify-center text-center items-center gap-1.5'>
            <span className='text-stone-700 text-sm font-normal'>Personal confirm code</span>
            <span className='text-2xl font-bold text-stone-700 tracking-wider'>{reservationCode}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(reservationCode || '')
              alert('Reservation code copied!')
            }}
            className='w-full h-11 bg-[#D99B48] rounded-lg inline-flex justify-center items-center gap-2 p-3 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='w-5 mt-1' viewBox='0 0 18 18' fill='none'>
              <path
                d='M10.1875 6.5625C10.4636 6.5625 10.6875 6.78636 10.6875 7.0625V9.6875H13.3125C13.5886 9.6875 13.8125 9.91136 13.8125 10.1875C13.8125 10.4636 13.5886 10.6875 13.3125 10.6875H10.6875V13.3125C10.6875 13.5886 10.4636 13.8125 10.1875 13.8125C9.91136 13.8125 9.6875 13.5886 9.6875 13.3125V10.6875H7.0625C6.78636 10.6875 6.5625 10.4636 6.5625 10.1875C6.5625 9.91136 6.78636 9.6875 7.0625 9.6875H9.6875V7.0625C9.6875 6.78636 9.91136 6.5625 10.1875 6.5625Z'
                fill='white'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M11.7041 0.0136719C12.3184 0.0761884 12.8955 0.34866 13.3359 0.789062C13.8392 1.29236 14.123 1.97475 14.125 2.68652V2.69824L14.1162 3.125H14.5234C16.0293 3.125 17.25 4.34572 17.25 5.85156V14.5234C17.25 16.0293 16.0293 17.25 14.5234 17.25H5.85156C4.34572 17.25 3.125 16.0293 3.125 14.5234V14.125H2.68652C1.97475 14.123 1.29236 13.8392 0.789062 13.3359C0.285764 12.8326 0.00202495 12.1502 0 11.4385V2.99805L0.015625 2.70215C0.085553 2.01659 0.38934 1.37238 0.880859 0.880859C1.44257 0.319148 2.20368 0.00247322 2.99805 0H11.4385L11.7041 0.0136719ZM5.85156 4.125C4.89801 4.125 4.125 4.89801 4.125 5.85156V14.5234C4.125 15.477 4.89801 16.25 5.85156 16.25H14.5234C15.477 16.25 16.25 15.477 16.25 14.5234V5.85156C16.25 4.89801 15.477 4.125 14.5234 4.125H5.85156ZM2.80371 1.01074C2.3461 1.05741 1.91598 1.2598 1.58789 1.58789C1.21288 1.9629 1.00157 2.47161 1 3.00195V11.4365L1.00879 11.6025C1.04805 11.9889 1.21912 12.3519 1.49609 12.6289C1.81245 12.9453 2.2411 13.1236 2.68848 13.125H3.125V5.85156C3.125 4.34572 4.34572 3.125 5.85156 3.125H13.1162L13.125 2.68848C13.1236 2.2411 12.9453 1.81245 12.6289 1.49609C12.3519 1.21912 11.9889 1.04805 11.6025 1.00879L11.4365 1H3.00195L2.80371 1.01074Z'
                fill='white'
              />
            </svg>
            <span className='text-white text-base font-medium leading-none'>Copy Code</span>
          </button>
        </div>
      </motion.div>
      <motion.div
        {...animationProps}
        className='flex-2 w-full px-8 flex flex-col justify-start items-center gap-3 text-base font-normal text-black'
      >
        <span>Thank you for your visiting.</span>
        <button
          onClick={() => {
            router.push('/')
          }}
          className='text-stone-800 underline underline-offset-2 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer'
        >
          Go to home
        </button>
      </motion.div>
    </main>
  )
}
