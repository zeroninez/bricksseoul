'use client'

import { Button } from '@/components'
import { BottomSheet } from '@/app/properties/components'
import { useEffect, useRef, useState, useCallback } from 'react'
import { SearchStep } from './SearchStep'
import { DetailStep } from './DetailStep'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export type JusoItem = {
  korAddr: string
  roadAddr: string
}

const DEBOUNCE_DELAY = 300
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

  // Visual Viewport Height 적용
  useVisualViewportHeightVar('--viewport-height')

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
