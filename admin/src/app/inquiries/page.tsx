// admin/src/app/inquiries/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MdLock, MdLockOpen, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { PageHeader } from '@/components'
import { INQUIRY_CATEGORIES, InquiryType } from '@/types/inquiry'

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchInquiries()
  }, [filter, searchQuery, currentDate])

  const fetchInquiries = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      // 상태 필터
      if (filter !== 'all') {
        params.append('status', filter)
      }

      // 검색 파라미터
      if (searchQuery.trim()) {
        params.append('search_query', searchQuery.trim())
      }

      // 월별 파라미터
      params.append('year', currentDate.getFullYear().toString())
      params.append('month', (currentDate.getMonth() + 1).toString())

      const url = `/api/inquiries?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json()

      if (res.ok) {
        setInquiries(json.data)
      } else {
        console.error('Failed to fetch inquiries:', json.error)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth()
  }

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    replied: inquiries.filter((i) => i.status === 'replied').length,
  }

  return (
    <div className='w-full min-h-dvh mt-14 px-4 pb-32'>
      {/* 통계 카드 */}
      <div className='grid grid-cols-4 gap-2 mb-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-3 text-center'>
          <div className='text-xs text-gray-600 mb-1'>전체</div>
          <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
        </div>
        <div className='bg-orange-50 border border-orange-200 rounded-lg p-3 text-center'>
          <div className='text-xs text-orange-700 mb-1'>대기중</div>
          <div className='text-2xl font-bold text-orange-600'>{stats.pending}</div>
        </div>
        <div className='bg-green-50 border border-green-200 rounded-lg p-3 text-center'>
          <div className='text-xs text-green-700 mb-1'>답변완료</div>
          <div className='text-2xl font-bold text-green-600'>{stats.replied}</div>
        </div>
      </div>

      {/* 월별 네비게이션 */}
      <div className='flex items-center justify-center gap-2 mb-4'>
        <button
          onClick={goToPreviousMonth}
          className='p-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors'
        >
          <MdChevronLeft size={20} />
        </button>

        <button
          onClick={goToCurrentMonth}
          disabled={isCurrentMonth()}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isCurrentMonth()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          {format(currentDate, 'yyyy년 MM월')}
        </button>

        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth()}
          className={`p-1.5 rounded-md transition-colors ${
            isCurrentMonth() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <MdChevronRight size={20} />
        </button>
      </div>

      {/* 검색 입력 */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='이메일 또는 제목으로 검색...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
        />
      </div>

      {/* 필터 탭 */}
      <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
        {[
          { value: 'all', label: '전체' },
          { value: 'pending', label: '답변 대기' },
          { value: 'replied', label: '답변 완료' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-black text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 문의 목록 */}
      {loading ? (
        <div className='text-center py-12 text-gray-500'>로딩 중...</div>
      ) : inquiries.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          {searchQuery ? '검색 결과가 없습니다.' : '문의가 없습니다.'}
        </div>
      ) : (
        <div className='space-y-3'>
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/inquiries/${inquiry.id}`}
              className='block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between gap-3 mb-2'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    {inquiry.has_password ? (
                      <MdLock className='text-gray-400 flex-shrink-0' size={16} />
                    ) : (
                      <MdLockOpen className='text-gray-400 flex-shrink-0' size={16} />
                    )}
                    <h3 className='font-medium text-gray-900 truncate'>{inquiry.subject}</h3>
                    <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                      {INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_ko}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0`}>{inquiry.status}</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <span>{inquiry.email}</span>
                <span>•</span>
                <span>{format(new Date(inquiry.created_at), 'yyyy-MM-dd HH:mm')}</span>
                {inquiry.reservation_code && (
                  <>
                    <span>•</span>
                    <span className='text-blue-600'>예약: {inquiry.reservation_code}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
