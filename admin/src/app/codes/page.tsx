'use client'

import { PageHeader } from '@/components'
import { AccessCodeManager } from '@/components/AccessCodeManager'

export default function Codes() {
  return (
    <>
      <PageHeader title='초대 코드 관리' />
      <AccessCodeManager />
    </>
  )
}
