'use client'

import { HEADER_HEIGHT } from '@/theme/constants'
import { useRouter } from '@/i18n/routing'
import { useEffect } from 'react'
import { PageStart } from '@/components'

export default function Home() {
  const router = useRouter()
  //properties 로 리다이렉트

  useEffect(() => {
    router.push('/properties')
  }, [router])

  return (
    <>
      <PageStart />
      <div className='w-full h-full flex flex-1 flex-col items-center justify-center gap-6'>
        <div className='w-fit h-fit text-base'>Waiting for finding the best place for you...</div>
        <div className='w-fit h-fit flex items-center justify-center'>
          <div className='w-12 h-12 border-2 border-t-primary border-r-primary border-b-stone-200 border-l-stone-200 rounded-full animate-spin' />
        </div>
      </div>
    </>
  )
}
