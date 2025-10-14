'use client'

import { HEADER_HEIGHT } from '@/theme/constants'
import { useRouter } from '@/i18n/routing'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  //properties 로 리다이렉트

  useEffect(() => {
    router.push('/properties')
  }, [router])

  return (
    <>
      <h1 className='text-3xl font-bold'>Welcome to Our Property Listing</h1>
    </>
  )
}
