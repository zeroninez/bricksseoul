'use client'

import { Button, FormLabel, Input, PageStart, TextArea } from '@/components'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'
import { MdOutlineSearch } from 'react-icons/md'

export default function Reservations() {
  const router = useRouter()
  const [reservationCode, setReservationCode] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!reservationCode || reservationCode.length < 5) {
      alert('Please enter a valid reservation code (at least 5 characters)')
      return
    }

    // 예약 상세 페이지로 이동
    router.push(`/reservations/${reservationCode.toUpperCase()}`)
  }

  return (
    <>
      <PageStart />
      <div className='w-full h-full flex flex-col items-center justify-center gap-6 px-5 pb-20'>
        <div className='w-full h-fit flex flex-col items-start justify-center gap-2 py-5'>
          <span className='text-2xl font-medium'>Start Here.</span>
          <p className='text-base text-left'>Easily access your reservation details and keep everything on track.</p>
        </div>
        <form onSubmit={handleSearch} className='w-full h-fit flex flex-col items-start justify-start gap-4'>
          <FormLabel title='Reservation Code' description='Enter the 7-character code from your confirmation'>
            <Input type='text' placeholder='e.g., ABC1234' value={reservationCode} setValue={setReservationCode} />
          </FormLabel>

          <button
            type='submit'
            className='w-full h-fit bg-black text-white rounded-lg px-6 py-4 font-medium flex items-center justify-center gap-2 active:scale-95 transition-all'
          >
            {/* search icon */}
            <MdOutlineSearch size={20} />
            <span className='leading-none -translate-y-0.5'>Search Reservation</span>
          </button>
        </form>

        <div className='text-center text-sm text-stone-500 max-w-md'>
          <p>Your reservation code was sent to your email after booking.</p>
        </div>
      </div>
    </>
  )
}
