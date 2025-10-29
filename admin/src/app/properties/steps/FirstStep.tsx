'use client'

import { Button } from '@/components'
import { BottomSheet } from '../components'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { MdClose } from 'react-icons/md'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

type JusoItem = {
  korAddr: string // 한글 주소
  roadAddr: string // 도로명 주소
  zipNo: string // 우편번호
}

export const FirstStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [depth, setDepth] = useState(0)

  //iframe 미리보기
  const [iframePreview, setIframePreview] = useState(false)

  // --- live search states ---
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<JusoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 선택된 결과(두 번째 스텝에서 라벨 표시용)
  const [selectedJuso, setSelectedJuso] = useState<JusoItem | null>(null)

  // 디바운스 & 취소 토큰
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // 유효성
  const step1ValidCheck = form.address.address1 && form.address.address1.length > 0
  const step2ValidCheck = form.name && form.name.length > 0 && form.address.address2 && form.address.address2.length > 0

  const onInitialClose = () => {
    setForm({
      name: '',
      description: '',
      address: {
        address1: '',
        address2: '',
        guide: '',
        iframe_src: '',
      },
    })
    setSelectedJuso(null)
    setKeyword('')
    setResults([])
    setDepth(0)
    onClose()
  }

  // --- live search effect ---
  useEffect(() => {
    if (!isOpen) return
    // 키워드 없으면 초기화
    if (!keyword.trim()) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    // 디바운스
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      // 이전 요청 취소
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/to-english?keyword=${encodeURIComponent(keyword.trim())}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        const data = await res.json()
        const items = data?.items ?? []
        setResults(items)
        // Juso 에러 메시지 노출(개발 편의)
        // if (!items.length && data?.common?.errorMessage) {
        //   setError(data.common.errorMessage)
        // }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError('검색 중 오류가 발생했어요.')
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      // 언마운트/재실행 시 이전 fetch 취소
      abortRef.current?.abort()
    }
  }, [keyword, isOpen])

  // 결과 항목 선택 → 폼에 반영하고 다음 단계로
  const selectItem = (item: JusoItem) => {
    setResults([])
    setSelectedJuso(item)
    setKeyword(item.korAddr)
    setForm({
      ...form,
      address: { address1: item.roadAddr, address2: null, guide: null, iframe_src: null },
    })
  }

  // Enter로 검색 UX (굳이 없어도됨: 이미 live search지만 UX 향상)
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Enter 시 첫 번째 항목 자동 선택(있다면)
      if (results.length > 0) {
        selectItem(results[0])
      }
    }
  }

  // input에 focus될 때 해당 요소로 스크롤
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      const element = e.target
      const container = element.closest('[data-rsbs-scroll]') // Sheet.Content의 스크롤 컨테이너

      if (container) {
        const elementRect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const offset = 72 // 원하는 오프셋 값 (px)

        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - offset

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      } else {
        // 컨테이너를 못 찾으면 기본 방식 사용
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 300)
  }

  useEffect(() => {
    // iOS에서 키보드가 올라올 때 viewport 조정
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onInitialClose}
      leftAction={{
        onClick: () => {
          depth < 1 ? onInitialClose() : setDepth(depth - 1)
        },
      }}
      title='숙소 등록'
    >
      {depth === 0 ? (
        <div className='w-full h-fit flex flex-col gap-6 px-5 pt-4 pb-5'>
          <div className='text-2xl font-bold'>
            숙박 장소의
            <br />
            주소를 등록해주세요
          </div>
          <div className='text-sm font-medium text-stone-500'>검색된 영문 주소를 선택해주세요</div>

          {/* 실시간 영문 변환 검색창 */}
          <div className='w-full h-fit flex flex-col gap-3'>
            <div className='w-full relative h-12 bg-stone-100 pl-3 pr-4 rounded-md focus:bg-stone-200 transition-all flex items-center justify-center'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' className='text-black/50 mr-2 w-4'>
                <path
                  d='M10.6873 9.74467L13.5427 12.5993L12.5993 13.5427L9.74467 10.6873C8.68249 11.5388 7.36133 12.0019 6 12C2.688 12 0 9.312 0 6C0 2.688 2.688 0 6 0C9.312 0 12 2.688 12 6C12.0019 7.36133 11.5388 8.68249 10.6873 9.74467ZM9.35 9.25C10.1959 8.37981 10.6684 7.21358 10.6667 6C10.6667 3.422 8.578 1.33333 6 1.33333C3.422 1.33333 1.33333 3.422 1.33333 6C1.33333 8.578 3.422 10.6667 6 10.6667C7.21358 10.6684 8.37981 10.1959 9.25 9.35L9.35 9.25Z'
                  fill='currentColor'
                />
              </svg>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={onKeyDown}
                className='w-full'
                placeholder='한글 주소 입력 (도로명+건물번호 추천)'
              />
              {/* 결과 리스트 */}
              {results.length > 1 && (
                <div
                  className='absolute top-12 w-full h-fit max-h-72 overflow-y-auto rounded-md bg-white shadow-lg show-scrollbar flex flex-col gap-4 p-4'
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  {results.map((it, idx) => (
                    <div
                      key={`${it.roadAddr}-${idx}`}
                      onClick={() => selectItem(it)}
                      className='h-fit w-full cursor-pointer active:opacity-50 active:translate-y-0.5 transition-all flex flex-col'
                    >
                      <div className='font-medium'>{it.korAddr || '주소 정보 없음'}</div>
                      <div className='text-sm text-stone-500'>{it.roadAddr || '주소 정보 없음'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='w-full h-fit text-sm px-2 text-black/50 transition-all'>
              {form.address.address1 && <span>{form.address.address1}</span>}
            </div>
            {loading && <div className='text-sm pl-1 text-stone-500'>검색 중…</div>}
            {error && !loading && <div className='text-sm pl-1 text-red-500'>{error}</div>}

            {/* 결과 없을 때 힌트 */}
            {!loading && !results.length && keyword.trim() && !error && (
              <div className='text-sm pl-1 text-stone-500'>
                검색 결과가 없어요. 도로명+건물번호 형태로 입력해보세요.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='w-full h-fit flex flex-col gap-6 p-5 pb-32'>
          <Field
            label='기본주소 (영문)'
            rightText='재검색'
            rightAction={() => {
              setDepth(0)
              // 재검색 UX: 기존 키워드를 유지하거나 초기화하고 싶으면 아래 주석 해제
              // setKeyword('')
              // setResults([])
            }}
          >
            <div className='w-full h-fit p-4 bg-stone-100 rounded-md flex flex-col gap-3 justify-start items-start'>
              <span className='font-semibold text-md break-words'>
                {selectedJuso?.korAddr ? selectedJuso.korAddr : form.address.address1 || '—'}
              </span>
              <div className='w-fit h-fit flex flex-row gap-2 justify-start items-center'>
                <span className='w-fit h-fit text-nowrap text-xs bg-white rounded-full px-3 py-1 font-medium text-black/50'>
                  영문
                </span>
                <span className='text-sm'>{selectedJuso?.roadAddr ? selectedJuso.roadAddr : '—'}</span>
              </div>
              <div className='w-fit h-fit flex flex-row gap-2 justify-start items-center'>
                <span className='w-fit h-fit text-xs bg-white rounded-full px-3 py-1 font-medium text-black/50'>
                  우편번호
                </span>
                <span className='text-sm'>{selectedJuso?.zipNo || form.address.zipNo || '—'}</span>
              </div>
            </div>
          </Field>

          <Field label='상세주소' required='영문작성'>
            <input
              type='text'
              placeholder='상세주소 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.address2 || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, address2: e.target.value } })
              }}
              onFocus={handleInputFocus} // 추가
            />
          </Field>

          <Field label='숙소명' required='영문작성'>
            <input
              type='text'
              placeholder='숙소명 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.name || ''}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
              }}
              onFocus={handleInputFocus} // 추가
            />
          </Field>

          <Field label='길 안내' required='영문작성'>
            <textarea
              placeholder='길 안내 입력'
              className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.guide || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, guide: e.target.value } })
              }}
              onFocus={handleInputFocus} // 추가
            />
          </Field>

          <Field
            label='구글 지도 임베드 링크'
            rightText='미리보기'
            rightAction={() => {
              form.address.iframe_src && setIframePreview(true)
            }}
          >
            <input
              type='text'
              placeholder='구글 지도 임베드 링크 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.iframe_src || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, iframe_src: e.target.value } })
              }}
              onFocus={handleInputFocus} // 추가
            />
          </Field>
          {iframePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-5'
              onClick={() => setIframePreview(false)}
            >
              <button
                onClick={() => setIframePreview(false)}
                className='absolute top-5 right-5 text-white text-xl rounded-full active:scale-75 active:opacity-50 transition-all'
              >
                <MdClose />
              </button>

              <div
                onClick={(e) => e.stopPropagation()}
                className='w-full h-auto aspect-square rounded-lg overflow-hidden bg-primary'
              >
                <iframe
                  src={form.address.iframe_src || ''}
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                ></iframe>
              </div>
            </motion.div>
          )}

          <Field label='숙소 설명' required='영문작성'>
            <textarea
              placeholder='숙소 설명 입력'
              className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all'
              value={form.description || ''}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value })
              }}
              onFocus={handleInputFocus} // 추가
            />
          </Field>
        </div>
      )}
      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button
          onClick={() => {
            depth < 1 ? setDepth(1) : onClose()
          }}
          disabled={depth < 1 ? !step1ValidCheck : !step2ValidCheck}
        >
          {depth < 1 ? '다음으로' : '완료'}
        </Button>
      </div>
    </BottomSheet>
  )
}

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
          {label + (required?.length ? '*' : '')}
          {'  '}
          {required && <span className='text-xs text-black/50 font-normal'>{required}</span>}
        </span>
        {rightText && (
          <span
            onClick={() => {
              rightAction?.()
            }}
            className='text-sm text-stone-400 active:opacity-70 cursor-pointer transition-all'
          >
            {rightText}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
