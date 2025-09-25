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
              <FaRegCalendarAlt className='text-lg text-orange-500' />
              <span className='text-lg font-bold'>Find option</span>
            </div>
            <button className='w-fit h-8 bg-orange-500 font-medium text-white py-2 px-4 rounded-full flex items-center justify-center'>
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
              <IoHomeSharp className='text-lg text-orange-500' />
              <span className='text-lg font-bold'>{(0).toString()} Place Found</span>
            </div>
            <Input
              type='select'
              placeholder='sort'
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
            <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 bg-white border-zinc-100 border shadow-[0px_1px_4px_0px_rgba(0,0,0,0.15)] rounded-4xl flex flex-col justify-center items-center'>
              <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                <div className='text-center text-zinc-400 text-base font-medium'>Give it try again</div>
                <div className='font-semibold text-zinc-600 text-[22px] text-center leading-tight'>
                  Sorry, we couldn’t find <br />a match with those filters.
                </div>
              </div>
              <TbNoteOff className='w-20 h-20 text-zinc-200' />
            </div>
            {/* example */}
            <div
              data-property-1='Card 1'
              data-show-price='true'
              className='w-80 px-3 pt-3 pb-6 bg-white rounded-[32px] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] inline-flex flex-col justify-center items-start gap-4'
            >
              <div className='self-stretch h-60 relative rounded-[20px]'>
                <div className='px-3 py-1 left-[248px] top-[206px] absolute bg-black/50 rounded-2xl inline-flex flex-col justify-center items-start gap-2.5 overflow-hidden'>
                  <div className='inline-flex justify-start items-center gap-2'>
                    <div className='flex justify-start items-center gap-2'>
                      <div className="justify-start text-white text-xs font-medium font-['SF_Pro_Display']">1 / 12</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='self-stretch px-1.5 flex flex-col justify-start items-start gap-1'>
                <div className="w-80 justify-start text-zinc-800 text-xl font-semibold font-['SF_Pro_Display'] tracking-tight">
                  Serenity Lakes 5, Apartment I
                </div>
                <div className='w-80 flex flex-col justify-start items-start gap-3'>
                  <div className='self-stretch flex flex-col justify-start items-start gap-1'>
                    <div className='self-stretch inline-flex justify-start items-center gap-1'>
                      <div className='w-4 h-4 relative'>
                        <div className='w-1.5 h-1.5 left-[5.39px] top-[1.48px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-orange-500' />
                        <div className='w-3 h-2 left-[2.13px] top-[6.70px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-orange-500' />
                      </div>
                      <div className="w-72 justify-start text-zinc-600 text-base font-normal font-['SF_Pro_Display'] tracking-tight">
                        Jumeirah Village Circle,Dubai
                      </div>
                    </div>
                    <div className='inline-flex justify-start items-center gap-1'>
                      <div className="justify-start text-zinc-600 text-xs font-normal font-['SF_Pro_Display'] tracking-tight">
                        1st Floor{' '}
                      </div>
                      <div className="justify-start text-zinc-600 text-base font-light font-['SF_Pro_Display']">•</div>
                      <div className="justify-start text-zinc-600 text-xs font-normal font-['SF_Pro_Display'] tracking-tight">
                        482ft²
                      </div>
                      <div className="justify-start text-zinc-600 text-base font-light font-['SF_Pro_Display']">•</div>
                      <div className="justify-start text-zinc-600 text-xs font-normal font-['SF_Pro_Display'] tracking-tight">
                        1 bed
                      </div>
                    </div>
                  </div>
                  <div className='inline-flex justify-start items-center gap-1.5'>
                    <div className="justify-start text-zinc-800 text-xl font-semibold font-['SF_Pro_Display'] tracking-tight">
                      $6,530
                    </div>
                    <div className="justify-start text-zinc-800 text-base font-medium font-['SF_Pro_Display'] tracking-tight">
                      / For 19 Sep - 24 Oct 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
