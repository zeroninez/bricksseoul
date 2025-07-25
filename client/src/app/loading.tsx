'use client'

import { Logo } from '@/components'
import React from 'react'

export default function Loading() {
  return (
    <section className='w-full h-screen flex flex-col gap-4 items-center justify-center p-6'>
      <Logo className='w-12 h-12 animate-spin' />
      <p className='text-base text-gray-700'>Loading...</p>
    </section>
  )
}
