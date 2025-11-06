'use client'

import React from 'react'
import { JusoItem } from '.'

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

export const SearchStep = ({
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

// 검색 아이콘
const SearchIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' className='text-black/50 mr-2 w-4 flex-shrink-0'>
    <path
      d='M10.6873 9.74467L13.5427 12.5993L12.5993 13.5427L9.74467 10.6873C8.68249 11.5388 7.36133 12.0019 6 12C2.688 12 0 9.312 0 6C0 2.688 2.688 0 6 0C9.312 0 12 2.688 12 6C12.0019 7.36133 11.5388 8.68249 10.6873 9.74467ZM9.35 9.25C10.1959 8.37981 10.6684 7.21358 10.6667 6C10.6667 3.422 8.578 1.33333 6 1.33333C3.422 1.33333 1.33333 3.422 1.33333 6C1.33333 8.578 3.422 10.6667 6 10.6667C7.21358 10.6684 8.37981 10.1959 9.25 9.35L9.35 9.25Z'
      fill='currentColor'
    />
  </svg>
)
