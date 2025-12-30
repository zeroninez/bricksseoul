// admin/src/app/reservations/request/page.tsx
'use client'

import { TabPageLayout } from '@/components'
import { Fragment, useState, useMemo } from 'react'
import { useReservationsList } from '@/hooks/useReservation'
import { ReservationItem, DetailSheet } from '../components'
import type { Reservation } from '@/types/reservation'
import { useQueryState } from '@/hooks/useQueryState'

type SortOption = 'latest' | 'oldest' | 'check_in_asc' | 'check_in_desc'

export default function RequestList() {
  const tabs = ['신규예약', '지난예약']
  const [tab, setTab] = useQueryState('tab', tabs[0], {
    allowed: tabs,
  })
  const [selectedReservation, setSelectedReservation] = useState<any>(null)

  // ✅ 검색 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('latest')

  // 신규 예약 (requested)
  const {
    data: newReservations,
    isLoading: isLoadingNew,
    error: errorNew,
    refetch: refetchNew,
  } = useReservationsList('requested')

  // 지난 예약 (confirmed + cancelled)
  const {
    data: allReservations,
    isLoading: isLoadingPast,
    error: errorPast,
    refetch: refetchPast,
  } = useReservationsList()

  // ✅ 검색 및 정렬이 적용된 지난 예약
  const pastReservations = useMemo(() => {
    if (!allReservations) return []

    // 1. 상태 필터링 (confirmed, cancelled만)
    let filtered = allReservations.filter((r: Reservation) => r.status === 'confirmed' || r.status === 'cancelled')

    // 2. 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((r: Reservation) => {
        const propertyName = r.property.name?.toLowerCase() || ''
        const address1 = r.property.address.address1?.toLowerCase() || ''
        const address2 = r.property.address.address2?.toLowerCase() || ''
        const reservationCode = r.reservation_code?.toLowerCase() || ''
        const email = r.email?.toLowerCase() || ''

        return (
          propertyName.includes(query) ||
          address1.includes(query) ||
          address2.includes(query) ||
          reservationCode.includes(query) ||
          email.includes(query)
        )
      })
    }

    // 3. 정렬
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'check_in_asc':
          return new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()
        case 'check_in_desc':
          return new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [allReservations, searchQuery, sortBy])

  const isLoading = tab === '신규예약' ? isLoadingNew : isLoadingPast
  const error = tab === '신규예약' ? errorNew : errorPast

  const handleRefresh = () => {
    if (tab === '신규예약') {
      refetchNew()
    } else {
      refetchPast()
    }
  }

  const handleUpdate = () => {
    refetchNew()
    refetchPast()
  }

  // ✅ 탭 변경 시 검색어 초기화
  const handleTabChange = (tab: (typeof tabs)[number]) => {
    setTab(tab)
    if (tab === '신규예약') {
      setSearchQuery('')
    }
  }

  return (
    <TabPageLayout
      tabs={tabs}
      activeTab={tab}
      setActiveTab={handleTabChange}
      backButton={{
        href: '/reservations',
      }}
      refreshHandler={{
        isLoading: isLoading,
        error: error,
        onRefetch: handleRefresh,
      }}
    >
      {/* 로딩 상태 */}
      {isLoading && (
        <div className='flex items-center justify-center p-12'>
          <div className='animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full' />
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className='p-6'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
            <p className='text-red-700 text-sm'>예약 목록을 불러오는데 실패했습니다.</p>
            <button onClick={handleRefresh} className='mt-2 text-xs text-red-600 hover:text-red-800 underline'>
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 신규 예약 리스트 */}
      {!isLoading && !error && tab === '신규예약' && (
        <div className='space-y-4 px-4 py-4'>
          {newReservations && newReservations.length > 0 ? (
            newReservations.map((reservation, index) => (
              <Fragment key={reservation.id}>
                <ReservationItem
                  statusType='request'
                  key={reservation.id}
                  reservation={reservation}
                  action={{
                    label: '상세보기',
                    type: 'button',
                    onClick: () => {
                      setSelectedReservation(reservation)
                    },
                  }}
                />
                {index < newReservations.length - 1 && <div key={index} className='w-full h-px bg-[#EFECEC]' />}
              </Fragment>
            ))
          ) : (
            <p className='text-center text-gray-500'>신규 예약이 없습니다.</p>
          )}
        </div>
      )}

      {/* 지난 예약 리스트 */}
      {!isLoading && !error && tab === '지난예약' && (
        <div className='flex flex-col'>
          {/* ✅ 검색 및 정렬 UI */}
          <div className='sticky top-0 z-10 p-4 space-y-3'>
            {/* 검색창 */}
            <div className='relative'>
              <input
                type='text'
                placeholder='숙소명, 주소, 예약코드, 이메일로 검색...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full h-10 text-sm bg-stone-100 pl-10 pr-4 rounded-md placeholder:text-[#898A8C] focus:bg-stone-200 transition-all outline-none'
              />
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B4B4B4]'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* 정렬 드롭다운 */}
            <div className='flex items-center justify-between'>
              <span className='text-xs text-gray-500 px-0.5'>
                {pastReservations.length}개의 예약
                {searchQuery && ` (검색됨)`}
              </span>
              <div className='relative w-fit h-fit'>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className='w-fit h-8 text-xs bg-stone-100 pl-2 pr-6 rounded-md placeholder:text-[#898A8C] active:bg-stone-200 transition-all outline-none'
                >
                  <option value='latest'>최신순</option>
                  <option value='oldest'>오래된순</option>
                  <option value='check_in_desc'>체크인 늦은순</option>
                  <option value='check_in_asc'>체크인 빠른순</option>
                </select>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B4B4B4]'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 예약 리스트 */}
          <div className='flex flex-col gap-4 p-4'>
            {pastReservations.length > 0 ? (
              pastReservations.map((reservation, index) => (
                <Fragment key={reservation.id}>
                  <ReservationItem
                    statusType='request'
                    key={reservation.id}
                    reservation={reservation}
                    action={{
                      label: '상세보기',
                      type: 'button',
                      onClick: () => {
                        setSelectedReservation(reservation)
                      },
                    }}
                  />
                  {index < pastReservations.length - 1 && <div key={index} className='w-full h-px bg-[#EFECEC]' />}
                </Fragment>
              ))
            ) : (
              <div className='text-center py-12'>
                <p className='text-gray-500'>{searchQuery ? '검색 결과가 없습니다.' : '지난 예약이 없습니다.'}</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='mt-2 text-sm text-blue-600 hover:text-blue-800 underline'
                  >
                    검색 초기화
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <DetailSheet
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onUpdate={handleUpdate}
      />
    </TabPageLayout>
  )
}
