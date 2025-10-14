//app/[locale]/properties/page.tsx

'use client'

import { useState } from 'react'
import { Input } from '@/components'
import { HEADER_HEIGHT } from '@/theme/constants'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { IoHomeSharp } from 'react-icons/io5'
import { TbNoteOff } from 'react-icons/tb'
import { usePropertyList } from '@/hooks/useProperty'
import { PropertyCard } from './components'

export default function Home() {
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0])
  const [moveOutDate, setMoveOutDate] = useState(new Date().toISOString().split('T')[0])
  const [sortOption, setSortOption] = useState('')

  // 👇 숙소 목록 호출
  const { data: properties, isLoading, error } = usePropertyList()

  return (
    <div className='space-y-10'>
      <div className='w-full h-fit flex flex-col items-center justify-center gap-2'>
        <div className='w-full h-fit text-left text-zinc-800 text-2xl leading-tight font-bold'>
          Find your <br />
          Place to relax
        </div>
        <div className='w-full h-fit text-left text-zinc-600 text-base'>Price exclude taxes, other fees</div>
      </div>

      {/* contents */}
      <div className='w-full h-fit flex flex-col items-center justify-center gap-10'>
        {/* date & filter */}
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
              <FaRegCalendarAlt className='text-lg text-primary' />
              <span className='text-lg font-bold'>Find option</span>
            </div>
            <button className='w-fit h-8 bg-primary font-medium text-white py-2 px-4 flex items-center justify-center'>
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
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
              <IoHomeSharp className='text-lg text-primary' />
              <span className='text-lg font-bold'>
                {isLoading ? 'Loading...' : `${properties?.length ?? 0} Place Found`}
              </span>
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
          <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
            {/* 로딩 */}
            {isLoading && <div className='text-zinc-500 text-center'>Loading properties...</div>}

            {/* 에러 */}
            {error && (
              <div className='text-red-500 text-center'>{(error as Error).message || 'Failed to load properties.'}</div>
            )}

            {/* 데이터 있음 */}
            {properties && properties.length > 0
              ? properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price_per_night={p.price_per_night}
                    images={p.images}
                  />
                ))
              : // 데이터 없음
                !isLoading &&
                !error && (
                  <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 bg-white border-zinc-100 border shadow-[0px_1px_4px_0px_rgba(0,0,0,0.15)] flex flex-col justify-center items-center'>
                    <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                      <div className='text-center text-zinc-400 text-base font-medium'>Give it try again</div>
                      <div className='font-semibold text-zinc-600 text-[22px] text-center leading-tight'>
                        Sorry, we couldn’t find <br />a match with those filters.
                      </div>
                    </div>
                    <TbNoteOff className='w-20 h-20 text-zinc-200' />
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
