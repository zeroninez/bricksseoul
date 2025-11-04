// src/app/page.tsx
'use client'

import { PageHeader, PasswordChangeModal } from '@/components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()

  // /properties로 이동
  useState(() => {
    router.replace('/properties')
  })

  return <></>
}
