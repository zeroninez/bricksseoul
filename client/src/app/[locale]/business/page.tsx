'use client'

import { Button, Input, PageStart, TextArea } from '@/components'

export default function Business() {
  return (
    <>
      <PageStart />
      <div className='w-full h-full flex flex-col items-center justify-center gap-6 px-5 pb-20'>
        <div className='w-full h-fit flex flex-col items-start justify-center gap-2 py-5'>
          <span className='text-2xl font-bold'>Let’s get started</span>
          <p className='text-base text-left'>Solutions tailored to your company’s needs.</p>
        </div>
        <form onSubmit={() => {}} className='w-full h-fit flex flex-col items-start justify-start gap-4'>
          <Input
            label='Full Name'
            type='text'
            id='fullName'
            value={''}
            setValue={(v) => {}}
            disabled={false}
            placeholder='Enter your Full Name.'
            error={''}
            required
          />
          <Input
            label='Company Name'
            type='text'
            id='companyName'
            value={''}
            setValue={(v) => {}}
            disabled={false}
            placeholder='Enter your Company Name.'
            error={''}
            required
          />
          <Input
            label='Email'
            type='text'
            id='email'
            value={''}
            setValue={(v) => {}}
            disabled={false}
            placeholder='Enter your Email'
            error={''}
            required
          />
          <TextArea
            label='Message'
            id='message'
            value={''}
            setValue={(v) => {}}
            disabled={false}
            placeholder='Enter your message'
            error={''}
            required
          />
          <Button type='submit' onClick={() => {}} disabled={false}>
            {'Contact'}
          </Button>
        </form>
      </div>
    </>
  )
}
