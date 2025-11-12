//steps/CheckInoutStep/index.tsx

'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import 'swiper/css'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'
import { useCallback, useEffect, useState } from 'react'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  mode: 'create' | 'edit'
}

export const CheckInoutStep = ({ isOpen, onClose, form, setForm, mode = 'create' }: StepProps) => {
  const [checkIn, setCheckIn] = useState(form.check_in ?? '15:00')
  const [checkOut, setCheckOut] = useState(form.check_out ?? '11:00')

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
      check_in: null,
      check_out: null,
    }))
  }

  const handleSubmit = useCallback(() => {
    setForm((prev: any) => ({
      ...prev,
      check_in: checkIn,
      check_out: checkOut,
    }))
    handleClose()
  }, [checkIn, checkOut, handleClose, setForm])

  useEffect(() => {
    if (!isOpen) return
    setCheckIn(form.check_in ?? '15:00')
    setCheckOut(form.check_out ?? '11:00')
  }, [isOpen, form.check_in, form.check_out])

  // Visual Viewport Height 적용
  useVisualViewportHeightVar('--viewport-height')

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleBack }} title='체크인/체크아웃'>
      <div className='w-full h-full overflow-auto snap-y flex flex-col gap-12 px-5 pb-5'>
        <div className='text-xl font-bold snap-start pt-4'>
          체크인/체크아웃 시간을
          <br />
          지정해주세요
        </div>

        <div className='w-full h-fit flex flex-col gap-3'>
          <div className='w-full h-fit flex flex-row justify-between items-center'>
            <span className='w-fit h-fit font-medium'>체크인</span>
            <label
              htmlFor='check-in'
              className='w-32 h-12 px-6 py-1 bg-stone-100 rounded-full flex flex-row justify-center items-center cursor-pointer'
            >
              <input
                id='check-in'
                type='time'
                className='w-fit h-fit text-base leading-none outline-none'
                value={checkIn}
                placeholder='시간 선택'
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>
          </div>
          <div className='w-full h-fit flex flex-row justify-between items-center'>
            <span className='w-fit h-fit font-medium'>체크아웃</span>
            <label
              htmlFor='check-out'
              className='w-32 h-12 px-6 py-1 bg-stone-100 rounded-full flex flex-row justify-center items-center cursor-pointer'
            >
              <input
                id='check-out'
                type='time'
                className='w-fit h-fit text-base leading-none outline-none'
                value={checkOut}
                placeholder='시간 선택'
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleSubmit} disabled={false}>
          저장하기
        </Button>
      </div>
    </BottomSheet>
  )
}
