'use client'

import { BottomSheet } from '../components'
import { useEffect, useMemo, useRef, useState } from 'react'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export const FirstStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [depth, setDepth] = useState(0)

  // --- live search states ---
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 선택된 결과(두 번째 스텝에서 라벨 표시용)
  const [selected, setSelected] = useState<any | null>(null)

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
        zipNo: '', // 선택사항(없으면 제거해도 됨)
      },
    })
    setSelected(null)
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
        if (!items.length && data?.common?.errorMessage) {
          setError(data.common.errorMessage)
        }
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
  const selectItem = (item: any) => {
    // 영문 도로명 주소를 address1에 저장
    const addrEng = item.roadAddrEng ?? ''
    const zip = item.zipNo ?? ''

    setForm((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        address1: addrEng, // 저장: 영문 주소
        zipNo: zip, // 선택사항
      },
    }))
    setSelected(item)
    setDepth(1)
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
      nextAction={{
        text: depth < 1 ? '다음으로' : '완료',
        onClick: () => {
          depth < 1 ? setDepth(1) : onClose()
        },
        disabled: depth < 1 ? !step1ValidCheck : !step2ValidCheck,
      }}
    >
      {depth === 0 ? (
        <div className='w-full h-fit flex flex-col gap-6 p-5'>
          <div className='text-2xl font-bold'>
            숙박 장소의
            <br />
            주소를 등록해주세요
          </div>

          {/* 사용자가 직접 입력하는 기본 주소(원문) */}
          <input
            type='text'
            placeholder='숙소 주소(원문 메모용, 선택)'
            className='w-full h-12 bg-stone-100 px-4 rounded-md'
            value={form.address.address1 || ''}
            onChange={(e) => {
              setForm({ ...form, address: { ...form.address, address1: e.target.value } })
            }}
          />

          {/* 실시간 영문 변환 검색창 */}
          <div className='w-full h-fit flex flex-col gap-2'>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder='한글 도로명·지번·장소 키워드 → 영문 주소 검색'
              className='w-full h-12 bg-white border px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-300'
            />
            {loading && <div className='text-sm text-stone-500'>검색 중…</div>}
            {error && !loading && <div className='text-sm text-red-500'>{error}</div>}

            {/* 결과 리스트 */}
            {results.length > 0 && (
              <div className='w-full h-48 overflow-y-auto border rounded-md bg-white shadow-md'>
                {results.map((it, idx) => (
                  <div
                    key={`${it.roadAddr}-${idx}`}
                    onClick={() => selectItem(it)}
                    className='h-fit p-3 checking cursor-pointer hover:bg-stone-100 active:opacity-80 transition-colors flex flex-col'
                  >
                    <div className='font-medium'>{it.korAddr || '주소 정보 없음'}</div>
                    <div className='text-sm text-stone-500'>{it.roadAddr || '주소 정보 없음'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 결과 없을 때 힌트 */}
            {!loading && !results.length && keyword.trim() && !error && (
              <div className='text-sm text-stone-500'>검색 결과가 없어요. 도로명+건물번호 형태로 입력해보세요.</div>
            )}
          </div>
        </div>
      ) : (
        <div className='w-full h-fit flex flex-col gap-6 p-5'>
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
                {form.address.address1 /* 선택된 영문 주소가 들어있음 */}
              </span>
              <div className='w-fit h-fit flex flex-row gap-2 justify-start items-center'>
                <span className='w-fit h-fit text-xs bg-white rounded-full px-3 py-1 font-medium text-black/50'>
                  도로명
                </span>
                <span className='text-sm'>{selected?.roadAddr ? selected.roadAddr : '—'}</span>
              </div>
              <div className='w-fit h-fit flex flex-row gap-2 justify-start items-center'>
                <span className='w-fit h-fit text-xs bg-white rounded-full px-3 py-1 font-medium text-black/50'>
                  우편번호
                </span>
                <span className='text-sm'>{selected?.zipNo || form.address.zipNo || '—'}</span>
              </div>
            </div>
          </Field>

          <Field label='상세주소'>
            <input
              type='text'
              placeholder='상세주소 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.address2 || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, address2: e.target.value } })
              }}
            />
          </Field>

          <Field label='숙소명'>
            <input
              type='text'
              placeholder='숙소명 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.name || ''}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
              }}
            />
          </Field>

          <Field label='길 안내'>
            <textarea
              placeholder='길 안내 입력'
              className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.guide || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, guide: e.target.value } })
              }}
            />
          </Field>

          <Field label='구글 지도 임베드 링크'>
            <input
              type='text'
              placeholder='구글 지도 임베드 링크 입력'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all'
              value={form.address.iframe_src || ''}
              onChange={(e) => {
                setForm({ ...form, address: { ...form.address, iframe_src: e.target.value } })
              }}
            />
          </Field>

          <Field label='숙소 설명'>
            <textarea
              placeholder='숙소 설명 입력'
              className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all'
              value={form.description || ''}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value })
              }}
            />
          </Field>
        </div>
      )}
    </BottomSheet>
  )
}

const Field = ({
  label,
  rightText,
  rightAction,
  children,
}: {
  label?: string
  rightText?: string
  rightAction?: () => void
  children: React.ReactNode
}) => {
  return (
    <div className='w-full h-fit flex flex-col gap-2'>
      <div className='w-full h-fit flex flex-row justify-between items-center'>
        <span className='text-sm font-medium'>{label}</span>
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
