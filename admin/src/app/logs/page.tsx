'use client'

import { PageHeader } from '@/components'
import { AccessLogsViewer } from '@/components/AccessLogsViewer'

export default function Logs() {
  return (
    <>
      <PageHeader title='접속 로그 관리' />
      <AccessLogsViewer />
    </>
  )
}
