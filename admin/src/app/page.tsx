// src/app/page.tsx
'use client'

import { PageHeader, PasswordChangeModal } from '@/components'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const navigationItems = [
    { name: '초대코드 관리', key: 'codes', description: '초대코드를 생성하고 관리합니다' },
    { name: '접속 로그 관리', key: 'logs', description: '관리자 접속 로그를 확인합니다' },
    { name: 'Properties 관리', key: 'properties', description: '숙소 정보를 작성하고 관리합니다' }, // 새로 추가
    { name: '비밀번호 변경', key: 'password', description: '관리자 비밀번호를 변경합니다' },
  ]
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  return (
    <>
      {/* 헤더 섹션 */}
      <PageHeader title='관리자 대시보드' />

      {/* 페이지 리스트 */}
      <section className=''>
        <div className='flex flex-col justify-start items-start'>
          {navigationItems.map((item) =>
            item.key === 'password' ? (
              <button
                key={item.key}
                onClick={() => setIsPasswordModalOpen(true)}
                className='px-6 py-4 flex flex-col text-sm items-start w-full text-left bg-white border-b border-gray-200 active:bg-gray-50 transition-colors'
              >
                <span className='font-medium'>{item.name}</span>
                <span className='text-xs text-gray-500 mt-1'>{item.description}</span>
              </button>
            ) : (
              <Link
                key={item.key}
                href={`/${item.key}`}
                className='px-6 py-4 flex flex-col text-sm items-start w-full text-left bg-white border-b border-gray-200 active:bg-gray-50 transition-colors'
              >
                <span className='font-medium'>{item.name}</span>
                <span className='text-xs text-gray-500 mt-1'>{item.description}</span>
              </Link>
            ),
          )}
        </div>
        {/* 비밀번호 변경 모달 */}
        <PasswordChangeModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      </section>
    </>
  )
}
