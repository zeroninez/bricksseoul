// admin/src/app/reservations/request/page.tsx
'use client'

import { TabPageLayout } from '@/components'
import { useState } from 'react'
import { useReservationsList } from '@/hooks/useReservation'
import { Item, DetailSheet } from './components'

export default function RequestList() {
  const tabs = ['신규예약', '지난예약']
  const [activeTab, setActiveTab] = useState(tabs[0])

  const [selectedReservation, setSelectedReservation] = useState<any>(null)

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

  // 지난 예약 필터링 (confirmed, cancelled만)
  const pastReservations = allReservations?.filter((r) => r.status === 'confirmed' || r.status === 'cancelled')

  const isLoading = activeTab === '신규예약' ? isLoadingNew : isLoadingPast
  const error = activeTab === '신규예약' ? errorNew : errorPast

  const handleRefresh = () => {
    if (activeTab === '신규예약') {
      refetchNew()
    } else {
      refetchPast()
    }
  }

  return (
    <TabPageLayout
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
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
      {!isLoading && !error && activeTab === '신규예약' && (
        <div className='space-y-4 px-4 py-4'>
          {newReservations && newReservations.length > 0 ? (
            newReservations.map((reservation, index) => (
              <>
                <Item
                  key={reservation.id}
                  reservation={reservation}
                  onClick={() => {
                    setSelectedReservation(reservation)
                  }}
                />
                {index < newReservations.length - 1 && <div key={index} className='w-full h-px bg-gray-200' />}
              </>
            ))
          ) : (
            <p className='text-center text-gray-500'>신규 예약이 없습니다.</p>
          )}
        </div>
      )}
      {/* 지난 예약 리스트 */}
      {!isLoading && !error && activeTab === '지난예약' && (
        <div className='flex flex-col gap-4 p-4'>
          {pastReservations && pastReservations.length > 0 ? (
            pastReservations.map((reservation, index) => (
              <>
                <Item
                  key={reservation.id}
                  reservation={reservation}
                  onClick={() => {
                    setSelectedReservation(reservation)
                  }}
                />
                {index < pastReservations.length - 1 && <div key={index} className='w-full h-px bg-gray-200' />}
              </>
            ))
          ) : (
            <p className='text-center text-gray-500'>지난 예약이 없습니다.</p>
          )}
        </div>
      )}
      <DetailSheet reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
    </TabPageLayout>
  )
}
