'use client'
import { Screen } from '@/components'

export default function Home() {
  return (
    <Screen className='flex bg-black flex-col items-center justify-center text-center px-6'>
      <h1 className='text-3xl font-bold font-bodoniModa tracking-tighter mb-4'>Welcome to Bricks Seoul</h1>
      <p className='text-lg text-gray-700'>Your journey to rejuvenate your mind, body & soul starts here.</p>
    </Screen>
  )
}
