//app/[locale]/properties/page.tsx

'use client'

import { useState } from 'react'
import { Input, PageStart } from '@/components'
import { HEADER_HEIGHT } from '@/theme/constants'
import { usePropertyList } from '@/hooks/useProperty'
import { PropertyCard } from './components'

export default function PropertiesPage() {
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0])
  const [moveOutDate, setMoveOutDate] = useState(new Date().toISOString().split('T')[0])
  const [sortOption, setSortOption] = useState('')

  // 👇 숙소 목록 호출
  const { data: properties, isLoading, error } = usePropertyList()

  return (
    <>
      <PageStart />

      <div className='space-y-10'>
        <div className='w-full h-fit flex flex-col items-center justify-center gap-2 px-5 pt-6 pb-6'>
          <div className='w-full h-fit text-left text-black text-3xl leading-[1.15] font-bold'>
            Find your <br />
            Place to relax
          </div>
          <div className='w-full h-fit text-left text-stone-600 text-base'>Price exclude taxes, other fees</div>
        </div>

        {/* date & filter */}
        <div className='w-full h-fit px-5 flex flex-col items-center justify-center gap-4'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
              <span className='text-2xl font-bold'>Find option</span>
            </div>
            <button className='w-fit h-8 bg-primary active:bg-disabled font-medium rounded-xl text-white py-2 px-4 flex items-center justify-center transition-all'>
              Filter
            </button>
          </div>

          {/* date picker */}
          <div className='w-full h-fit flex flex-row items-center justify-center gap-4'>
            <Input type='date' label='Move-in' placeholder='select' value={moveInDate} setValue={setMoveInDate} />
            <Input type='date' label='Move-out' placeholder='select' value={moveOutDate} setValue={setMoveOutDate} />
          </div>
        </div>

        {/* results */}
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4 px-5'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
              <span className='text-2xl font-bold'>Places</span>
            </div>
            <Input
              type='select'
              placeholder='sort'
              mini
              value={sortOption}
              setValue={setSortOption}
              options={[
                { label: 'Recommended', value: 'recommended' },
                { label: 'Lowest Price', value: 'lowest' },
                { label: 'Highest Price', value: 'highest' },
              ]}
            />
          </div>

          {/* cards */}
          <div className='w-full h-fit flex flex-col items-center justify-center gap-4 pb-32'>
            {/* 로딩 */}
            {isLoading && (
              <div className='text-stone-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
                Loading properties...
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div className='text-red-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
                {(error as Error).message || 'Failed to load properties.'}
              </div>
            )}

            {/* 데이터 있음 */}
            {properties && properties.length > 0
              ? properties.map((p) => <PropertyCard key={p.id} {...p} />)
              : // 데이터 없음
                !isLoading &&
                !error && (
                  <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 flex flex-col justify-center items-center'>
                    <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                      <div className='text-center text-stone-400 text-base font-medium'>Give it try again</div>
                      <div className='font-semibold text-stone-600 text-[22px] text-center leading-tight'>
                        Sorry, we couldn’t find <br />a match with those filters.
                      </div>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
    </>
  )
}
