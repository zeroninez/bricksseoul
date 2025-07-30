// src/app/page.tsx
'use client'

import { useState } from 'react'
import { AccessCodeManager } from '@/components/AccessCodeManager'
import { AccessLogsViewer } from '@/components/AccessLogsViewer'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'codes' | 'logs'>('codes')

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 섹션 */}
      <section className='w-full bg-white border-b border-gray-200 p-6'>
        <div className='w-full flex flex-col items-start justify-center'>
          <h1 className='text-lg'>Bricks Seoul Admin</h1>
          <p className='text-gray-700'>입장코드와 접근 로그를 효율적으로 관리하세요.</p>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className='w-full bg-white border-b border-gray-100 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto'>
            <button
              onClick={() => setActiveTab('codes')}
              className={`px-6 py-2 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'codes' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              입장코드 관리
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-2 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'logs' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              접근 로그
            </button>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className='w-full p-6'>
        <div className='max-w-4xl mx-auto'>{activeTab === 'codes' ? <AccessCodeManager /> : <AccessLogsViewer />}</div>
      </section>
    </div>
  )
}
