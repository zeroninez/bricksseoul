// admin/src/app/properties/page.tsx

'use client'

import { PageHeader } from '@/components'
import { usePropertyList } from '@/hooks/useProperty'
import { PropertyCard } from './components'

export default function Properties() {
  const { data: properties, isLoading, error } = usePropertyList()

  return (
    <>
      <section className='w-full'></section>
      {/* cards */}
      <div className='w-full h-fit flex flex-col items-center justify-center gap-4 p-4'>
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
    </>
  )
}
