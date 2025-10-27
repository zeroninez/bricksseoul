// admin/src/app/properties/page.tsx

'use client'

import { PageHeader } from '@/components'
import { usePropertyList } from '@/hooks/useProperty'
import { AddButton, ItemList, AddCheckPopup, Drawer } from './components'
import { useState } from 'react'
import { Sheet } from 'react-modal-sheet'
import classNames from 'classnames'

export default function Properties() {
  const { data: properties, isLoading, error } = usePropertyList()
  const [isClickedAdd, setIsClickedAdd] = useState(false)
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode?: 'create' | 'edit' }>({
    isOpen: false,
  })

  return (
    <>
      <AddButton onClick={() => setIsClickedAdd(true)} />
      {/* cards */}
      <div className='w-full h-fit flex flex-col items-center justify-center gap-4 p-4'>
        {/* 숙소 생성 */}
        <ItemList properties={properties || []} isLoading={isLoading} error={error} />
      </div>
      <AddCheckPopup
        isClickedAdd={isClickedAdd}
        setIsClickedAdd={setIsClickedAdd}
        onClickHousing={() => {
          setModalState({ isOpen: true, mode: 'create' })
          setIsClickedAdd(false)
        }}
        onClickRental={() => {}}
      />
      <Drawer
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState({ isOpen: false })
          setIsClickedAdd(true)
        }}
      />
    </>
  )
}
