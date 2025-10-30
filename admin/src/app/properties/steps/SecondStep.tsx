'use client'

import { Button } from '@/components'
import { BottomSheet } from '../components'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { MdClose } from 'react-icons/md'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

const SCROLL_OFFSET = 80

export const SecondStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [depth, setDepth] = useState(0)

  // Validation

  // Input focus 시 스크롤
  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      const element = e.target
      const container = element.closest('[data-rsbs-scroll]')

      if (container) {
        const elementRect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - SCROLL_OFFSET

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 300)
  }, [])

  // iOS viewport 조정
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  // 모달 닫기
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // 뒤로 가기
  const handleBack = useCallback(() => {
    if (depth < 1) {
      handleClose()
    } else {
      setDepth(depth - 1)
    }
  }, [depth, handleClose])

  // 다음/완료 버튼
  const handleNext = useCallback(() => {
    if (depth === 0) {
      //step이 0일 때
      setDepth(1)
    } else if (depth === 1) {
      //step이 1일 때
      setDepth(2)
    } else if (depth === 2) {
      //step이 2일 때
      handleClose()
    }
  }, [depth, handleClose])

  // Form 업데이트 헬퍼
  const updateForm = useCallback(
    (field: string, value: string) => {
      setForm((prev: any) => ({ ...prev, [field]: value }))
    },
    [setForm],
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      leftAction={{ onClick: handleBack }}
      title='공간 정보 / 어메니티 / 규율'
    >
      {depth === 0 ? (
        <>
          <div className='w-full h-fit flex flex-col gap-12 px-5 pt-4 pb-5'>
            <div className='text-xl font-bold'>
              숙박 공간의
              <br />
              정보를 입력해주세요
            </div>
            <div className='w-full h-fit flex flex-col gap-3'>
              {/* available_people */}
              <OptionItem
                label='허용 인원'
                value={form.space_info.available_people || 1}
                onIncrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      available_people: (prev.space_info.available_people || 1) + 1,
                    },
                  }))
                }
                onDecrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      available_people:
                        prev.space_info.available_people && prev.space_info.available_people > 1
                          ? prev.space_info.available_people - 1
                          : 1,
                    },
                  }))
                }
              />
              {/* living_rooms */}
              <OptionItem
                label='거실'
                value={form.space_info.living_rooms || 0}
                onIncrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      living_rooms: (prev.space_info.living_rooms || 0) + 1,
                    },
                  }))
                }
                onDecrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      living_rooms:
                        prev.space_info.living_rooms && prev.space_info.living_rooms > 0
                          ? prev.space_info.living_rooms - 1
                          : 0,
                    },
                  }))
                }
              />
              {/* bedrooms */}
              <OptionItem
                label='침실'
                value={form.space_info.bedrooms || 0}
                onIncrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      bedrooms: (prev.space_info.bedrooms || 0) + 1,
                    },
                  }))
                }
                onDecrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      bedrooms:
                        prev.space_info.bedrooms && prev.space_info.bedrooms > 0 ? prev.space_info.bedrooms - 1 : 0,
                    },
                  }))
                }
              />
              {/* bathrooms */}
              <OptionItem
                label='욕실'
                value={form.space_info.bathrooms || 0}
                onIncrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      bathrooms: (prev.space_info.bathrooms || 0) + 1,
                    },
                  }))
                }
                onDecrease={() =>
                  setForm((prev: any) => ({
                    ...prev,
                    space_info: {
                      ...prev.space_info,
                      bathrooms:
                        prev.space_info.bathrooms && prev.space_info.bathrooms > 0 ? prev.space_info.bathrooms - 1 : 0,
                    },
                  }))
                }
              />
            </div>
          </div>
        </>
      ) : depth === 1 ? (
        <div className='w-full h-fit flex flex-col gap-12 px-5 pt-4 pb-5'>
          <div className='text-xl font-bold'>
            시설 및 어메니티를
            <br />
            추가해주세요
          </div>
          {/* available_people */}
          <div className='w-full h-fit flex flex-col gap-3'>
            <span className='text-sm font-semibold text-black/50'>어메니티 옵션</span>
            <div className='w-full h-fit grid grid-cols-4 gap-3'>
              <div className='w-full h-auto aspect-square rounded-lg bg-stone-100 flex flex-col justify-center items-center gap-2 p-3'>
                <div className='w-5 h-5 bg-stone-200'></div>
                <span className='text-sm'>에어컨</span>
              </div>
            </div>
          </div>
        </div>
      ) : depth === 2 ? (
        <div className='w-full h-fit flex flex-col gap-12 px-5 pt-4 pb-5'>
          <div className='text-xl font-bold'>
            객실 내 규율을
            <br />
            선택해주세요
          </div>
          {/* available_people */}
          <div className='w-full h-fit flex flex-col gap-3'></div>
        </div>
      ) : null}

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleNext} disabled={false}>
          {depth < 2 ? '다음으로' : '완료'}
        </Button>
      </div>
    </BottomSheet>
  )
}

const OptionItem = ({
  label,
  value,
  onIncrease,
  onDecrease,
}: {
  label: string
  value: number
  onIncrease: () => void
  onDecrease: () => void
}) => {
  return (
    <div className='w-full h-fit flex flex-row justify-between items-center'>
      <span className='text-base font-semibold'>{label}</span>
      <div className='w-40 h-fit rounded-full flex flex-row justify-between items-center px-2 py-1 bg-stone-100'>
        <button
          onClick={onDecrease}
          className='w-fit p-2.5 h-fit flex justify-center items-center text-black/20 active:scale-75 transition-all'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 20 2' fill='currentColor'>
            <path d='M20 0V1.81818H10.9091H9.09091H0V0H9.09091L10.9091 8.86917e-05L20 0Z' />
          </svg>
        </button>
        <span className='text-base font-medium text-center'>{value}</span>
        <button
          onClick={onIncrease}
          className='w-fit p-2.5 h-fit flex justify-center items-center text-black active:scale-75 transition-all'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
            <path d='M20 9.09091V10.9091H10.9091V20H9.09091V10.9091H0V9.09091H9.09091V0H10.9091V9.09091H20Z' />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Field 컴포넌트
const Field = ({
  label,
  required,
  rightText,
  rightAction,
  children,
}: {
  label?: string
  required?: string
  rightText?: string
  rightAction?: () => void
  children: React.ReactNode
}) => {
  return (
    <div className='w-full h-fit flex flex-col gap-2'>
      <div className='w-full h-fit flex flex-row justify-between items-center'>
        <span className='text-sm font-medium'>
          {label && `${label}${required ? '*' : ''}`}
          {required && <span className='text-xs text-black/50 font-normal ml-2'>{required}</span>}
        </span>
        {rightText && rightAction && (
          <button
            onClick={rightAction}
            className='text-sm text-stone-400 active:opacity-70 cursor-pointer transition-all'
          >
            {rightText}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
