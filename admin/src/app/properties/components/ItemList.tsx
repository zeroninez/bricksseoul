import { PropertyListItem } from '@/types/property'
import { PropertyItem } from './PropertyItem'

interface ItemListProps {
  properties: PropertyListItem[]
  isLoading: boolean
  error: Error | null
}

export const ItemList = (props: ItemListProps) => {
  const { properties, isLoading, error } = props

  return (
    <>
      {/* 데이터 있음 */}
      {properties && properties.length > 0
        ? properties.map((p, index) => (
            <>
              <PropertyItem key={p.id} {...p} />
              {index === properties.length - 1 ? null : (
                <div key={p.id + 'divider'} className='w-full h-px bg-stone-200 my-2' />
              )}
            </>
          ))
        : // 데이터 없음
          !isLoading &&
          !error && (
            <div className='w-full h-80 px-3 pt-3 pb-6 gap-7 flex flex-col justify-center items-center'>
              <div className='w-full h-fit flex flex-col justify-center items-center gap-2'>
                <div className='text-center text-stone-400 text-base font-medium'>다시 시도해 주세요</div>
                <div className='font-semibold text-stone-600 text-[22px] text-center leading-tight'>
                  등록된 숙소가 없습니다
                </div>
              </div>
            </div>
          )}
      {/* 로딩 */}
      {isLoading && (
        <div className='text-stone-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
          불러오는 중...
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className='text-red-500 text-center w-full h-auto aspect-square flex items-center justify-center'>
          {(error as Error).message || 'Failed to load properties.'}
        </div>
      )}
    </>
  )
}
