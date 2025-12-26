'use client'

import { Sheet } from 'react-modal-sheet'
import React from 'react'

interface DetailSheetProps {
  reservation: any
  onClose: () => void
}

export const DetailSheet = ({ reservation, onClose }: { reservation: any; onClose: () => void }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('복사되었습니다.')
  }

  return (
    <Sheet className='max-w-md mx-auto' isOpen={!!reservation} onClose={onClose}>
      <Sheet.Container
        style={{
          left: '16px',
          width: 'calc(100% - 32px)',
        }}
      >
        <Sheet.Header>
          <div className='w-full h-fit p-3 inline-flex items-center justify-end'>
            <button onClick={onClose} className='w-fit h-fit text-gray-500 active:text-gray-700 transition-all'>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M7 7L17 17M7 17L17 7'
                  stroke='black'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
        </Sheet.Header>
        <Sheet.Content className=''>
          {reservation ? (
            <div className='px-5 space-y-6'>
              <LabelItem label='예약 공간'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm'>{reservation.property.name}</div>
                <div className='w-full h-px bg-stone-200' />
                <div className='bg-[#F5F4F4] text-stone-500 px-5 pt-3 pb-0.5 text-xs'>
                  {reservation.property.address.address1}
                </div>
                <div className='bg-[#F5F4F4] text-stone-500 px-5 pt-0.5 pb-3 text-xs'>
                  {reservation.property.address.address2}
                </div>
              </LabelItem>
              <LabelItem label='예약자 정보'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  {reservation.email}
                  <button
                    onClick={() => copyToClipboard(reservation.email)}
                    className='absolute top-1/2 -translate-y-1/2 right-5 z-10 text-xs opacity-50 active:opacity-80 transition-all'
                  >
                    복사
                  </button>
                </div>
                <div className='w-full h-px bg-stone-200' />
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  인원 수
                  <span className='absolute top-1/2 -translate-y-1/2 right-5 z-10 text-sm'>
                    {reservation.guest_count}명
                  </span>
                </div>
              </LabelItem>
            </div>
          ) : (
            <div className='px-5 py-10 text-black flex flex-col justify-center items-center gap-4'>
              <p>예약 정보를 불러오는 중...</p>
            </div>
          )}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  )
}

const LabelItem = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm text-black px-0.5'>{label}</span>
      <div className='overflow-hidden rounded-md w-fll h-fit'>{children}</div>
    </div>
  )
}
