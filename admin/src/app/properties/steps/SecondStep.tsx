'use client'

import { Button } from '@/components'
import { BottomSheet } from '../components'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { MdClose } from 'react-icons/md'
import { useAmenities } from '@/hooks/useAmenities'
import classNames from 'classnames'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

const SCROLL_OFFSET = 80

export const SecondStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [depth, setDepth] = useState(0)

  const { data: amenities, isLoading } = useAmenities()

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

  // ---------- Rules helpers ----------
  const RULE_MAX_LEN = 80

  const addRule = useCallback(
    (text: string) => {
      const value = text.trim()
      if (!value) return
      if (value.length > RULE_MAX_LEN) return
      setForm((prev: any) => {
        if (prev.rules.includes(value)) return prev // 중복 방지
        return { ...prev, rules: [...prev.rules, value] }
      })
    },
    [setForm],
  )

  const removeRule = useCallback(
    (index: number) => {
      setForm((prev: any) => ({
        ...prev,
        rules: prev.rules.filter((_: string, i: number) => i !== index),
      }))
    },
    [setForm],
  )

  const updateRule = useCallback(
    (index: number, next: string) => {
      const value = next.trimStart() // 입력중에는 앞 공백만 제거 (뒤 공백은 사용자가 타이핑 중일 수 있어 남김)
      if (value.length > RULE_MAX_LEN) return
      setForm((prev: any) => {
        const nextRules = [...prev.rules]
        nextRules[index] = value
        return { ...prev, rules: nextRules }
      })
    },
    [setForm],
  )

  const blurRule = useCallback(
    (index: number) => {
      // blur에서 최종 트림 + 빈값 제거
      setForm((prev: any) => {
        const trimmed = prev.rules[index].trim()
        if (!trimmed) {
          return { ...prev, rules: prev.rules.filter((_: string, i: number) => i !== index) }
        }
        const nextRules = [...prev.rules]
        nextRules[index] = trimmed
        return { ...prev, rules: nextRules }
      })
    },
    [setForm],
  )

  const moveRule = useCallback(
    (from: number, to: number) => {
      setForm((prev: any) => {
        const list = [...prev.rules]
        if (to < 0 || to >= list.length) return prev
        const [item] = list.splice(from, 1)
        list.splice(to, 0, item)
        return { ...prev, rules: list }
      })
    },
    [setForm],
  )

  const [ruleInput, setRuleInput] = useState('')
  const canAdd =
    ruleInput.trim().length > 0 && ruleInput.trim().length <= RULE_MAX_LEN && !form.rules.includes(ruleInput.trim())

  const handleRuleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canAdd) {
      addRule(ruleInput)
      setRuleInput('')
    }
  }

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
        <div className='w-full h-full overflow-auto snap-y flex flex-col gap-12 px-5 pb-5'>
          <div className='text-xl font-bold snap-start pt-4'>
            시설 및 어메니티를
            <br />
            추가해주세요
          </div>
          {/* available_people */}
          <div className='w-full h-fit flex flex-col gap-3 pb-32 snap-start'>
            <span className='text-sm font-semibold text-black/50'>어메니티 옵션</span>
            <div className='w-full h-fit grid grid-cols-4 gap-3'>
              {amenities &&
                amenities.map((item) => (
                  <div
                    key={item.code}
                    onClick={() => {
                      const isSelected = form.amenities.includes(item.code)
                      if (isSelected) {
                        // 이미 선택된 경우 제거
                        setForm((prev: any) => ({
                          ...prev,
                          amenities: prev.amenities.filter((code: string) => code !== item.code),
                        }))
                      } else {
                        // 선택되지 않은 경우 추가
                        setForm((prev: any) => ({
                          ...prev,
                          amenities: [...prev.amenities, item.code],
                        }))
                      }
                    }}
                    className={classNames(
                      'w-full h-auto aspect-square rounded-lg bg-stone-100 flex flex-col justify-between items-center gap-2 p-3 transition-all',
                      { 'border-[1.5px] border-black': form.amenities.includes(item.code) },
                    )}
                  >
                    <div className='w-full h-full flex flex-1 bg-stone-200'>
                      {/* 아이콘 들어갈 자리 */}
                      {/* {item.code} */}
                    </div>
                    <span className='w-full h-fit flex text-center truncate text-xs'>{item.label}</span>
                  </div>
                ))}
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
          <div className='w-full h-fit flex flex-col gap-6 pb-24'>
            {/* 수정하거나 삭제할 수 있는 아이템으로 rules 리스트를 만들고 제일 마지막에는 생성할 수 있는 input으로 하고 키다운하면 규율이 추가되도록 구현 */}
            <div className='w-full h-fit flex flex-col gap-2'>
              <span className='text-sm font-semibold text-black/50'>추가하기</span>
              <div className='w-full h-fit flex flex-col gap-2'>
                <input
                  type='text'
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleRuleKeyDown}
                  placeholder='예: 실내에서는 큰 소리로 통화하지 말아주세요'
                  className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
                  maxLength={RULE_MAX_LEN + 5} // 여유
                />
                <button
                  type='button'
                  onClick={() => {
                    if (canAdd) {
                      addRule(ruleInput)
                      setRuleInput('')
                    }
                  }}
                  disabled={!canAdd}
                  className={`px-4 h-12 rounded-md text-sm font-medium transition-all ${
                    canAdd ? 'bg-black text-white' : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  추가
                </button>
              </div>
              <div className='text-xs text-stone-500'>
                {ruleInput.trim().length}/{RULE_MAX_LEN}자
                {!canAdd &&
                ruleInput.trim().length > 0 &&
                ruleInput.trim().length <= RULE_MAX_LEN &&
                form.rules.includes(ruleInput.trim())
                  ? ' · 중복 규칙'
                  : ''}
              </div>
            </div>

            {/* 규칙 리스트 */}
            <div className='w-full h-fit flex flex-col gap-3'>
              <span className='text-sm font-semibold text-black/50'>등록된 규율 ({form.rules.length})</span>

              {form.rules.length === 0 ? (
                <div className='w-full h-fit text-sm text-stone-500 px-1'>아직 추가된 규율이 없어요.</div>
              ) : (
                <div className='w-full h-fit flex flex-col gap-2'>
                  {form.rules.map((rule: string, idx: number) => (
                    <div
                      key={`${rule}-${idx}`}
                      className='w-full h-fit flex flex-row justify-between items-center gap-0 bg-stone-100 rounded-md'
                    >
                      {/* 삭제 */}
                      <button
                        type='button'
                        onClick={() => removeRule(idx)}
                        className='w-fit p-3 h-fit text-sm text-red-500 active:scale-95'
                        aria-label='삭제'
                        title='삭제'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-5 h-5 text-red-500'
                          viewBox='0 0 24 24'
                          fill='none'
                        >
                          <rect
                            x='2.75'
                            y='2.75'
                            width='18.5'
                            height='18.5'
                            rx='9.25'
                            stroke='currentColor'
                            strokeWidth='1.5'
                          />
                          <path d='M6 12H18' stroke='currentColor' strokeWidth='1.5' />
                        </svg>
                      </button>

                      {/* 인라인 편집 입력 */}
                      <input
                        value={rule}
                        onChange={(e) => updateRule(idx, e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={() => blurRule(idx)}
                        className='flex-1 bg-transparent outline-none h-full text-sm'
                        maxLength={RULE_MAX_LEN + 5}
                      />
                      {/* 순서 이동 */}
                      <div className='flex flex-col gap-0.5 px-3 text-sm'>
                        <button
                          type='button'
                          onClick={() => moveRule(idx, idx - 1)}
                          className='leading-none text-black/40 active:scale-90 disabled:opacity-30'
                          disabled={idx === 0}
                          aria-label='위로'
                          title='위로'
                        >
                          ▲
                        </button>
                        <button
                          type='button'
                          onClick={() => moveRule(idx, idx + 1)}
                          className='leading-none text-black/40 active:scale-90 disabled:opacity-30'
                          disabled={idx === form.rules.length - 1}
                          aria-label='아래로'
                          title='아래로'
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
