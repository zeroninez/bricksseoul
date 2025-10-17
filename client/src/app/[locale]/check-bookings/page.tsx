'use client'

import { Button, Input, PageStart, TextArea } from '@/components'

export default function CheckBookings() {
  return (
    <>
      <PageStart />
      <div className='w-full h-full flex flex-col items-center justify-center gap-6 px-5 pb-20'>
        <div className='w-full h-fit flex flex-col items-start justify-center gap-2 py-5'>
          <span className='text-2xl font-bold'>Start Here.</span>
          <p className='text-base text-left'>Easily access your booking details and keep everything on track.</p>
        </div>
        <form onSubmit={() => {}} className='w-full h-fit flex flex-col items-start justify-start gap-4'>
          <Input
            label='Booking Number'
            type='text'
            id='bookingNumber'
            value={''}
            setValue={(v) => {}}
            disabled={false}
            placeholder='Enter your Booking Number.'
            error={''}
            required
          />

          <Button type='submit' onClick={() => {}} disabled={false}>
            {'Find Reservation'}
          </Button>
        </form>
      </div>
    </>
  )
}
