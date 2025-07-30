// src/app/page.tsx
'use client'

import { PageHeader } from '@/components'
import Link from 'next/link'

export default function Home() {
  const navigationItems = [
    { name: '초대코드 관리', key: 'codes' },
    { name: '접속 로그 관리', key: 'logs' },
  ]

  return (
    <>
      {/* 헤더 섹션 */}
      <PageHeader title='관리자 대시보드' />

      {/* 페이지 리스트 */}
      <section className=''>
        <div className='flex flex-col justify-start items-start'>
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              href={`/${item.key}`}
              className='px-6 py-4 flex text-sm items-center w-full text-left bg-white border-b border-gray-200 active:bg-gray-50 transition-colors'
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
