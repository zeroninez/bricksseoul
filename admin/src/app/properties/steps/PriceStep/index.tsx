'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import 'swiper/css'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'
import { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  mode: 'create' | 'edit'
}

export const PriceStep = ({ isOpen, onClose, form, setForm, mode = 'create' }: StepProps) => {
  const handleClose = useCallback(() => onClose(), [onClose])
  const handleBack = useCallback(() => {
    initialize()
    handleClose()
  }, [handleClose])

  const initialize = () => {
    setForm((prev: any) => ({ ...prev, price_per_night: 0 }))
  }

  const handleSubmit = useCallback(() => {
    handleClose()
  }, [handleClose, setForm])

  useVisualViewportHeightVar('--viewport-height')

  const displayValue = form.price_per_night ? form.price_per_night.toLocaleString() : ''
  const [inputWidth, setInputWidth] = useState(20) // px 단위 기본값
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [isInputFocused, setIsInputFocused] = useState(false)

  // 입력된 글자의 실제 픽셀 폭을 계산해서 width로 반영
  useEffect(() => {
    const el = inputRef.current
    if (!el) return // 👈 ref가 연결되지 않았으면 그냥 중단

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    const font = window.getComputedStyle(el).font // 👈 여기서 안전하게 접근
    context.font = font
    const textWidth = context.measureText(displayValue || '0').width
    setInputWidth(textWidth + 8)
  }, [displayValue])

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleBack }} title='요금 정책'>
      <div className='w-full h-full overflow-auto snap-y flex flex-col gap-12 px-5 pb-5'>
        <div className='text-xl font-bold snap-start pt-4'>
          요금 정책을
          <br />
          지정해주세요
        </div>

        <div className='w-full h-fit flex flex-col gap-3'>
          <span className='font-medium'>1박 금액</span>

          <label
            htmlFor='price-per-night'
            className={classNames(
              'w-fit h-fit text-2xl font-semibold relative flex flex-row items-end gap-0 active:opacity-50 active:scale-95 transition-all',
              isInputFocused && 'border-b-2 border-black',
            )}
          >
            <input
              ref={inputRef}
              id='price-per-night'
              type='text'
              inputMode='numeric'
              maxLength={15}
              pattern='[0-9]*'
              onKeyDown={(e) => {
                if (['-', 'e', '+', '.'].includes(e.key)) e.preventDefault()
              }}
              className='leading-none outline-none text-left bg-transparent'
              style={{ width: `${inputWidth}px` }}
              placeholder='0'
              value={displayValue}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, '')
                const numericValue = Number(rawValue)
                setForm((prev: any) => ({ ...prev, price_per_night: numericValue }))
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
            <span className='opacity-50 text-base mb-2 leading-none'>({form.currency || 'KRW'})</span>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-3.5 h-3.5 ml-2 mb-2' viewBox='0 0 15 15' fill='none'>
              <path
                d='M12.698 5.84315L13.316 5.22515C13.8076 4.73352 14.0838 4.06674 14.0838 3.37148C14.0838 2.67622 13.8076 2.00944 13.316 1.51781C12.8244 1.02619 12.1576 0.75 11.4623 0.75C10.7671 0.75 10.1003 1.02619 9.60866 1.51781L8.99066 2.13581L3.30933 7.81581C2.92466 8.20115 2.732 8.39381 2.56666 8.60581C2.37159 8.85613 2.20417 9.12682 2.06733 9.41315C1.952 9.65581 1.866 9.91448 1.694 10.4305L0.964664 12.6178M12.698 5.84315C12.698 5.84315 11.3853 5.76581 10.2267 4.60715C9.068 3.44915 8.99133 2.13581 8.99133 2.13581M12.698 5.84315L7.01733 11.5231C6.63266 11.9078 6.44 12.1005 6.228 12.2658C5.97768 12.4609 5.70699 12.6283 5.42066 12.7651C5.178 12.8805 4.92 12.9665 4.40333 13.1385L2.216 13.8678M2.216 13.8678L1.68133 14.0465C1.5567 14.0883 1.42288 14.0945 1.29492 14.0644C1.16696 14.0343 1.04993 13.9691 0.956978 13.8762C0.864028 13.7832 0.798847 13.6662 0.76876 13.5382C0.738673 13.4103 0.744873 13.2764 0.786664 13.1518L0.96533 12.6171L2.216 13.8678Z'
                stroke='black'
                strokeWidth='1.5'
              />
            </svg>
          </label>
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
