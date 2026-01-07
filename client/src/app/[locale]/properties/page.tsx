// app/[locale]/properties/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Footer, Input, PageStart } from '@/components'
import { useAvailableProperties } from '@/hooks/useProperty'
import { PropertyCard } from './components'
import { getLocalDateString } from '@/utils'

export default function PropertiesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 🔹 기본값: 오늘 / 내일 (로컬 시간 기준)
  const today = new Date()
  const todayStr = getLocalDateString(today) // ✅ 변경

  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow) // ✅ 변경

  // 🔹 URL에서 moveIn/moveOut 가져오기 (없으면 기본값)
  const initialMoveIn = searchParams.get('in') ?? todayStr
  const initialMoveOut = searchParams.get('out') ?? tomorrowStr

  const [moveInDate, setMoveInDate] = useState(initialMoveIn)
  const [moveOutDate, setMoveOutDate] = useState(initialMoveOut)
  const [sortOption, setSortOption] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)

  // 🔹 예약 가능한 숙소만 가져오기
  const {
    data: properties,
    isLoading,
    error,
  } = useAvailableProperties(dateError ? '' : moveInDate, dateError ? '' : moveOutDate)

  const validateDates = (): boolean => {
    if (!moveInDate || !moveOutDate) {
      setDateError('Select both move-in and move-out dates.')
      return false
    }

    const inDate = new Date(moveInDate)
    const outDate = new Date(moveOutDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (inDate < today) {
      setDateError('Move-in date must be today or later.')
      return false
    }

    if (outDate <= inDate) {
      setDateError('Move-out date must be after move-in date.')
      return false
    }

    setDateError(null)
    return true
  }

  // 🔹 날짜 바뀔 때마다 검증
  useEffect(() => {
    validateDates()
  }, [moveInDate, moveOutDate])

  // 🔹 날짜 유효할 때 URL 쿼리에도 반영
  useEffect(() => {
    if (dateError) return

    const params = new URLSearchParams(window.location.search)
    params.set('in', moveInDate)
    params.set('out', moveOutDate)

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [moveInDate, moveOutDate, dateError, pathname, router])

  // 🔹 정렬 로직
  const sortedProperties = properties
    ? [...properties].sort((a, b) => {
        if (sortOption === 'lowest') {
          return a.price_per_night - b.price_per_night
        } else if (sortOption === 'highest') {
          return b.price_per_night - a.price_per_night
        }
        return 0
      })
    : []

  return (
    <>
      <PageStart />

      <div className='space-y-10 px-5'>
        <div className='w-full h-fit flex flex-col items-center justify-center gap-2 pt-6 pb-6'>
          <div className='w-full h-fit text-left text-black text-3xl leading-[1.15] font-bold'>
            Find your <br />
            Place to relax
          </div>
          <div className='w-full h-fit text-left text-stone-600 text-base'>Price exclude taxes, other fees</div>
        </div>

        {/* date & filter */}
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
              <span className='text-2xl font-bold'>Find option</span>
            </div>
          </div>

          <div className='w-full h-fit flex flex-col gap-2'>
            <div className='w-full h-fit flex flex-row items-center justify-between'>
              <Input type='date' label='Move-in' placeholder='select' value={moveInDate} setValue={setMoveInDate} />
              <Input type='date' label='Move-out' placeholder='select' value={moveOutDate} setValue={setMoveOutDate} />
            </div>
            {dateError && <p className='text-sm text-red-500 px-1'>{dateError}</p>}
          </div>
        </div>

        {/* results */}
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
          <div className='w-full h-fit flex flex-row items-center justify-between gap-4'>
            <div className='w-fit h-fit flex flex-row justify-center items-end gap-1'>
              <span className='text-2xl font-bold'>Places</span>
              {!dateError && properties && (
                <span className='text-base text-stone-500'>({properties.length} available)</span>
              )}
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

          <div className='w-full h-fit flex flex-col items-center justify-center gap-4 pb-32'>
            {isLoading && (
              <div className='text-stone-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
                Finding available properties...
              </div>
            )}

            {error && (
              <div className='text-red-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
                {(error as Error).message || 'Failed to load properties.'}
              </div>
            )}

            {sortedProperties && sortedProperties.length > 0 ? (
              !dateError ? (
                sortedProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    {...p}
                    moveInDate={moveInDate}
                    moveOutDate={moveOutDate}
                    onValidateDates={validateDates}
                  />
                ))
              ) : (
                <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 flex flex-col justify-center items-center'>
                  <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                    <div className='text-center text-stone-400 text-base font-medium'>Give it try again</div>
                    <div className='font-semibold text-stone-600 text-base text-center leading-tight'>
                      Please select valid dates
                    </div>
                  </div>
                </div>
              )
            ) : (
              !isLoading &&
              !error && (
                <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 flex flex-col justify-center items-center'>
                  <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                    <div className='text-center text-stone-400 text-base font-medium'>No properties available</div>
                    <div className='font-semibold text-stone-600 text-base text-center leading-tight'>
                      Sorry, all properties are booked <br />
                      for the selected dates.
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
