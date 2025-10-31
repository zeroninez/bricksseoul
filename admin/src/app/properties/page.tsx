// admin/src/app/properties/page.tsx

'use client'

import { useState } from 'react'
import { usePropertyList } from '@/hooks/useProperty'
import { AddButton, AddSheet, PropertyItem } from './components'
import { CreateSheet } from './CreateSheet'
import { EditSheet } from './EditSheet'

export default function Properties() {
  const { data: properties, isLoading, error } = usePropertyList()
  const [isClickedAdd, setIsClickedAdd] = useState(false)
  const [modalState, setModalState] = useState<{ state: 'none' | 'create' | 'edit'; propertyId?: string }>({
    state: 'none',
  })

  return (
    <>
      <AddButton onClick={() => setIsClickedAdd(true)} />
      {/* cards */}
      <div className='w-full h-fit flex flex-col items-center justify-center gap-4 p-4'>
        {/* 숙소 생성 */}
        {/* 데이터 있음 */}
        {properties && properties.length > 0
          ? properties.map((p, index) => (
              <PropertyItem
                key={p.id}
                {...p}
                onClick={(propertyId) => {
                  setModalState({ state: 'edit', propertyId })
                }}
              />
            ))
          : // 데이터 없음
            !isLoading &&
            !error && (
              <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 flex flex-col justify-center items-center'>
                <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                  <div className='text-center text-stone-400 text-base font-medium'>다시 시도해 주세요</div>
                  <div className='font-semibold text-stone-600 text-[22px] text-center leading-tight'>
                    등록된 숙소가 없습니다
                  </div>
                </div>
              </div>
            )}
        {/* 로딩 */}
        {isLoading && (
          <div className='text-stone-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
            불러오는 중...
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className='text-red-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
            {(error as Error).message || 'Failed to load properties.'}
          </div>
        )}
      </div>
      <AddSheet
        isClickedAdd={isClickedAdd}
        setIsClickedAdd={setIsClickedAdd}
        onClickHousing={() => {
          setModalState({
            state: 'create',
          })
          setIsClickedAdd(false)
        }}
        onClickRental={() => {}}
      />
      <CreateSheet
        isOpen={modalState.state === 'create'}
        onClose={() => {
          setModalState({ state: 'none' })
          setIsClickedAdd(true)
        }}
      />
      <EditSheet
        isOpen={modalState.state === 'edit'}
        propertyId={modalState.propertyId!}
        onClose={() => {
          setModalState({ state: 'none' })
        }}
      />
    </>
  )
}
