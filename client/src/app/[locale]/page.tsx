'use client'
import { useState } from 'react'
import { Input, Screen } from '@/components'
import { HEADER_HEIGHT } from '@/theme/constants'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { IoHomeSharp } from 'react-icons/io5'
import { TbNoteOff } from 'react-icons/tb'

export default function Home() {
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
  )
  const [moveOutDate, setMoveOutDate] = useState(
    new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
  )
  const [sortOption, setSortOption] = useState('')
  return (
    <Screen
      style={{
        paddingTop: `calc(${HEADER_HEIGHT} + 20px)`,
      }}
      className='flex flex-col bg-zinc-50 items-center justify-start text-center px-5 gap-8'
    >
      <div className='w-full h-fit flex flex-col items-center justify-center gap-2'>
        <div className='w-full h-fit text-left text-zinc-800 text-[40px] leading-[42px] font-bold'>
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
              <span className='text-lg font-bold'>{(0).toString()} Place Found</span>
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
            {/* none */}
            <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 bg-white border-zinc-100 border shadow-[0px_1px_4px_0px_rgba(0,0,0,0.15)] flex flex-col justify-center items-center'>
              <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                <div className='text-center text-zinc-400 text-base font-medium'>Give it try again</div>
                <div className='font-semibold text-zinc-600 text-[22px] text-center leading-tight'>
                  Sorry, we couldn’t find <br />a match with those filters.
                </div>
              </div>
              <TbNoteOff className='w-20 h-20 text-zinc-200' />
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
