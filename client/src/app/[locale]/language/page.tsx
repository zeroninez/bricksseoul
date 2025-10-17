'use client'

import { Button, Input, LocaleDropdown, PageStart, TextArea } from '@/components'

export default function Language() {
  return (
    <>
      <PageStart />
      <div className='w-full h-full flex flex-col items-center justify-center gap-6 px-5 pb-20'>
        <div className='w-full h-fit flex flex-col items-start justify-center gap-2 py-5'>
          <span className='text-2xl font-bold'>Language</span>
          <p className='text-base text-left'>Select your preferred language for a personalized experience.</p>
        </div>
        <LocaleDropdown />
      </div>
    </>
  )
}
