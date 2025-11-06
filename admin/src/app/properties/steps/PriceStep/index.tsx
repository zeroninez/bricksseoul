'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import 'swiper/css'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'
import { useCallback, useState } from 'react'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export const PriceStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  // 공통 핸들러
  const handleClose = useCallback(() => onClose(), [onClose])
  // 뒤로가기시 초기화 후 닫기
  const handleBack = useCallback(() => {
    initialize()
    handleClose()
  }, [handleClose])

  const initialize = () => {
    setForm((prev: any) => ({
      ...prev,
      price_per_night: 0,
    }))
  }

  const handleSubmit = useCallback(() => {
    handleClose()
  }, [handleClose, setForm])

  // Visual Viewport Height 적용
  useVisualViewportHeightVar('--viewport-height')

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleBack }} title='요금 정책'>
      <div className='w-full h-full overflow-auto snap-y flex flex-col gap-12 px-5 pb-5'>
        <div className='text-xl font-bold snap-start pt-4'>
          요금 정책을
          <br />
          지정해주세요
        </div>
        <div className='w-full h-fit flex flex-col gap-3'>
          <span className='font-medium px-1'>1박 금액</span>
          <div className='w-full h-fit relative'>
            <input
              type='number'
              id='price-per-night'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
              placeholder='금액 입력'
              value={form.price_per_night || ''}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  price_per_night: Number(e.target.value),
                }))
              }
            />
            <span className='absolute top-1/2 -translate-y-1/2 right-4 whitespace-nowrap'>
              {form.currency || 'KRW'}
            </span>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleSubmit} disabled={form.price_per_night <= 0}>
          저장하기
        </Button>
      </div>
    </BottomSheet>
  )
}
