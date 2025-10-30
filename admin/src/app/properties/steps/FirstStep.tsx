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

type JusoItem = {
  korAddr: string
  roadAddr: string
}

const DEBOUNCE_DELAY = 300
const SCROLL_OFFSET = 80

export const FirstStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [depth, setDepth] = useState(0)
  const [iframePreview, setIframePreview] = useState(false)

  // Search states
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<JusoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJuso, setSelectedJuso] = useState<JusoItem | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Validation
  const step1ValidCheck = Boolean(form.address.address1?.length)
  const step2ValidCheck = Boolean(form.name?.length && form.address.address2?.length)

  // 🔧 엣지 케이스 1: 검색 취소 헬퍼
  const cancelPendingSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  // 🔧 엣지 케이스 2: 검색 상태 초기화
  const resetSearchState = useCallback(() => {
    setKeyword('')
    setResults([])
    setError(null)
    setLoading(false)
    setIsInputFocused(false)
    cancelPendingSearch()
  }, [cancelPendingSearch])

  // Live search effect
  useEffect(() => {
    if (!isOpen) {
      // 🔧 엣지 케이스 3: 모달이 닫히면 검색 취소
      cancelPendingSearch()
      return
    }

    if (!keyword.trim()) {
      setResults([])
      setError(null)
      setLoading(false)
      // 키워드가 비어있으면 선택된 주소도 초기화
      if (selectedJuso) {
        setSelectedJuso(null)
        setForm((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            address1: null,
          },
        }))
      }
      return
    }

    // 🔧 키워드가 변경되면 기존 선택 초기화 (사용자가 다시 입력 중)
    if (selectedJuso && keyword !== selectedJuso.korAddr) {
      setSelectedJuso(null)
      setForm((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          address1: null,
        },
      }))
    }

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

        if (!res.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await res.json()
        const items = data?.items ?? []

        setResults(items)

        // 🔧 엣지 케이스 4: 결과가 없을 때만 에러 메시지 표시
        if (items.length === 0 && keyword.trim()) {
          setError('검색 결과가 없어요')
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError('검색 중 오류가 발생했어요.')
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_DELAY)

    return () => {
      cancelPendingSearch()
    }
  }, [keyword, isOpen, cancelPendingSearch, selectedJuso, setForm])

  // 결과 항목 선택
  const selectItem = useCallback(
    (item: JusoItem) => {
      setResults([])
      setSelectedJuso(item) // 한글주소 포함 전체 정보 저장
      setKeyword(item.korAddr)
      setError(null)
      setLoading(false)
      setIsInputFocused(false) // 선택 시 포커스 해제

      setForm((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          address1: item.roadAddr, // 영문 주소만 저장
          address2: prev.address.address2 || null,
          guide: prev.address.guide || null,
          iframe_src: prev.address.iframe_src || null,
        },
      }))
    },
    [setForm],
  )

  // Enter 키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        selectItem(results[0])
      }
    },
    [results, selectItem],
  )

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
    setSelectedJuso(null)
    resetSearchState()
    setIframePreview(false)
    onClose()
  }, [onClose, resetSearchState])

  // 뒤로 가기
  const handleBack = useCallback(() => {
    if (depth < 1) {
      handleClose()
    } else {
      setDepth(depth - 1)
      // depth 0으로 돌아갈 때 검색 상태 초기화
      if (depth === 1) {
        setError(null)
        setKeyword('') // 빈칸으로 초기화
      }
    }
  }, [depth, handleClose])

  // 재검색
  const handleResearch = useCallback(() => {
    setDepth(0)
    setResults([])
    setKeyword('') // 빈칸에서 다시 검색
    setError(null)
  }, [])

  // 다음/완료 버튼
  const handleNext = useCallback(() => {
    if (depth < 1) {
      setDepth(1)
    } else {
      handleClose()
    }
  }, [depth, handleClose])

  // Form 업데이트 헬퍼
  const updateAddress = useCallback(
    (field: string, value: string) => {
      setForm((prev: any) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }))
    },
    [setForm],
  )

  const updateForm = useCallback(
    (field: string, value: string) => {
      setForm((prev: any) => ({ ...prev, [field]: value }))
    },
    [setForm],
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleBack }} title='숙소 등록'>
      {depth === 0 ? (
        <SearchStep
          keyword={keyword}
          setKeyword={setKeyword}
          results={results}
          loading={loading}
          error={error}
          selectedAddress={form.address.address1}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          onSelectItem={selectItem}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <DetailStep
          form={form}
          selectedJuso={selectedJuso}
          iframePreview={iframePreview}
          setIframePreview={setIframePreview}
          onResearch={handleResearch}
          onInputFocus={handleInputFocus}
          updateAddress={updateAddress}
          updateForm={updateForm}
        />
      )}

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleNext} disabled={depth < 1 ? !step1ValidCheck : !step2ValidCheck}>
          {depth < 1 ? '다음으로' : '완료'}
        </Button>
      </div>
    </BottomSheet>
  )
}

// 검색 스텝 컴포넌트
interface SearchStepProps {
  keyword: string
  setKeyword: (value: string) => void
  results: JusoItem[]
  loading: boolean
  error: string | null
  selectedAddress: string
  isInputFocused: boolean
  setIsInputFocused: (value: boolean) => void
  onSelectItem: (item: JusoItem) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const SearchStep = ({
  keyword,
  setKeyword,
  results,
  loading,
  error,
  selectedAddress,
  isInputFocused,
  setIsInputFocused,
  onSelectItem,
  onKeyDown,
}: SearchStepProps) => {
  // 검색 결과를 표시할지 결정
  const showResults = isInputFocused && results.length > 0

  return (
    <div className='w-full h-fit flex flex-col gap-6 px-5 pt-4 pb-5'>
      <div className='text-xl font-bold'>
        숙박 장소의
        <br />
        주소를 등록해주세요
      </div>
      <div className='text-sm font-medium text-stone-500'>검색된 영문 주소 중 하나를 선택해주세요</div>

      <div className='w-full h-fit flex flex-col gap-3'>
        <div className='w-full relative h-12 bg-stone-100 pl-3 pr-4 rounded-md focus-within:bg-stone-200 transition-all flex items-center'>
          <SearchIcon />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setIsInputFocused(true)}
            // onBlur={() => results.length === 1 && setIsInputFocused(false)}
            className='w-full bg-transparent outline-none'
            placeholder='한글 주소 입력 (도로명+건물번호 추천)'
          />

          {showResults && <SearchResults results={results} onSelect={onSelectItem} />}
        </div>

        {/* 선택된 영문 주소 표시 - 포커스 없을 때만 */}
        {selectedAddress && !isInputFocused && (
          <div className='w-full h-fit flex flex-col text-sm px-2 text-black/50 transition-all'>
            <span className='text-xs opacity-70'>현재 선택된 영문 주소 :</span>
            <span className='break-words'>{selectedAddress}</span>
          </div>
        )}

        {loading && <div className='text-sm pl-1 text-stone-500'>검색 중…</div>}
        {error && !loading && <div className='text-sm pl-1 text-red-500'>{error}</div>}

        {!loading && !results.length && keyword.trim() && !error && !selectedAddress && (
          <div className='text-sm pl-1 text-stone-500'>검색 결과가 없어요. 도로명+건물번호 형태로 입력해보세요.</div>
        )}
      </div>
    </div>
  )
}

// 검색 결과 리스트
const SearchResults = ({ results, onSelect }: { results: JusoItem[]; onSelect: (item: JusoItem) => void }) => (
  <div
    className='absolute top-12 left-0 w-full h-fit max-h-72 overflow-y-auto rounded-md bg-white shadow-lg show-scrollbar flex flex-col gap-4 p-4 z-50'
    onMouseDown={(e) => e.preventDefault()} // input의 blur를 방지하여 포커스 유지
  >
    {results.map((item, idx) => (
      <div
        key={`${item.roadAddr}-${idx}`}
        onClick={() => onSelect(item)}
        className='h-fit w-full cursor-pointer active:opacity-50 active:translate-y-0.5 transition-all flex flex-col'
      >
        <div className='font-medium'>{item.korAddr || '주소 정보 없음'}</div>
        <div className='text-sm text-stone-500'>{item.roadAddr || '주소 정보 없음'}</div>
      </div>
    ))}
  </div>
)

// 상세 입력 스텝
interface DetailStepProps {
  form: any
  selectedJuso: JusoItem | null
  iframePreview: boolean
  setIframePreview: (value: boolean) => void
  onResearch: () => void
  onInputFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  updateAddress: (field: string, value: string) => void
  updateForm: (field: string, value: string) => void
}

const DetailStep = ({
  form,
  selectedJuso,
  iframePreview,
  setIframePreview,
  onResearch,
  onInputFocus,
  updateAddress,
  updateForm,
}: DetailStepProps) => (
  <div className='w-full h-fit flex flex-col gap-6 p-5 pb-32'>
    <Field label='기본주소 (영문)' rightText='재검색' rightAction={onResearch}>
      <div className='w-full h-fit p-4 bg-stone-100 rounded-md flex flex-col gap-3 justify-start items-start'>
        <div className='w-fit h-fit flex flex-col gap-2 justify-start items-start'>
          <div className='w-full h-fit text-sm break-words'>{form.address.address1 || '—'}</div>
        </div>
      </div>
    </Field>

    <Field label='상세주소' required='영문작성'>
      <input
        type='text'
        placeholder='상세주소 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.address.address2 || ''}
        onChange={(e) => updateAddress('address2', e.target.value)}
        onFocus={onInputFocus}
      />
    </Field>

    <Field label='숙소명' required='영문작성'>
      <input
        type='text'
        placeholder='숙소명 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.name || ''}
        onChange={(e) => updateForm('name', e.target.value)}
        onFocus={onInputFocus}
      />
    </Field>

    <Field label='길 안내' required='영문작성'>
      <textarea
        placeholder='길 안내 입력'
        className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all outline-none resize-none'
        value={form.address.guide || ''}
        onChange={(e) => updateAddress('guide', e.target.value)}
        onFocus={onInputFocus}
      />
    </Field>

    <Field
      label='구글 지도 임베드 링크'
      rightText='미리보기'
      rightAction={() => form.address.iframe_src && setIframePreview(true)}
    >
      <input
        type='text'
        placeholder='구글 지도 임베드 링크 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.address.iframe_src || ''}
        onChange={(e) => updateAddress('iframe_src', e.target.value)}
        onFocus={onInputFocus}
      />
    </Field>

    {iframePreview && <IframePreview src={form.address.iframe_src} onClose={() => setIframePreview(false)} />}

    <Field label='숙소 설명' required='영문작성'>
      <textarea
        placeholder='숙소 설명 입력'
        className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all outline-none resize-none'
        value={form.description || ''}
        onChange={(e) => updateForm('description', e.target.value)}
        onFocus={onInputFocus}
      />
    </Field>
  </div>
)

// 아이프레임 미리보기 모달
const IframePreview = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-5'
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className='absolute top-5 right-5 text-white text-xl rounded-full active:scale-75 active:opacity-50 transition-all'
      aria-label='닫기'
    >
      <MdClose />
    </button>

    <span className='absolute top-5 text-white text-base font-medium'>구글 지도 미리보기</span>

    <div
      onClick={(e) => e.stopPropagation()}
      className='w-full h-auto aspect-square rounded-lg overflow-hidden bg-black relative'
    >
      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-0'>로딩 중...</span>
      <iframe
        src={src}
        width='100%'
        height='100%'
        style={{ border: 0 }}
        className='absolute top-0 left-0 w-full h-full z-10'
        allowFullScreen
        loading='eager'
        referrerPolicy='no-referrer-when-downgrade'
        title='구글 지도'
      />
    </div>
  </motion.div>
)

// 검색 아이콘
const SearchIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' className='text-black/50 mr-2 w-4 flex-shrink-0'>
    <path
      d='M10.6873 9.74467L13.5427 12.5993L12.5993 13.5427L9.74467 10.6873C8.68249 11.5388 7.36133 12.0019 6 12C2.688 12 0 9.312 0 6C0 2.688 2.688 0 6 0C9.312 0 12 2.688 12 6C12.0019 7.36133 11.5388 8.68249 10.6873 9.74467ZM9.35 9.25C10.1959 8.37981 10.6684 7.21358 10.6667 6C10.6667 3.422 8.578 1.33333 6 1.33333C3.422 1.33333 1.33333 3.422 1.33333 6C1.33333 8.578 3.422 10.6667 6 10.6667C7.21358 10.6684 8.37981 10.1959 9.25 9.35L9.35 9.25Z'
      fill='currentColor'
    />
  </svg>
)

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
