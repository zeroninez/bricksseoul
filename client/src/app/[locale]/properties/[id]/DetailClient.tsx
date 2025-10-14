// app/[locale]/properties/[id]/DetailClient.tsx
'use client'
import { useEffect } from 'react'
import { usePropertyGet } from '@/hooks/useProperty'

export default function DetailClient({ id }: { id: string }) {
  const { data, isLoading, error } = usePropertyGet(id)

  useEffect(() => {
    // 페이지 로드 시 스크롤을 최상단으로
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id]) // id가 변경될 때마다 실행

  return (
    <>
      {isLoading && <div className='text-zinc-500'>Loading...</div>}
      {error && <div className='text-red-500'>Failed to load</div>}
      {!isLoading && !data && <div>Not found</div>}

      {data && (
        <div className='w-full max-w-3xl text-left flex flex-col gap-4'>
          {/* 메인 이미지 (있다면) */}
          {data.images?.[0]?.url && (
            <img src={data.images[0].url} alt={data.name} className='w-full h-auto rounded-xl object-cover' />
          )}

          <h1 className='text-2xl font-bold text-zinc-800'>{data.name}</h1>
          <div className='text-zinc-600'>
            {data.price_per_night.toLocaleString()} {data.currency} / night
          </div>

          {/* 위치 */}
          {data.address && (
            <div className='text-sm text-zinc-500'>
              {data.address.address1} {data.address.address2 ?? ''}
            </div>
          )}

          {/* 설명 */}
          {data.description && <p className='text-zinc-700'>{data.description}</p>}

          {/* 공간 정보 */}
          {data.space_info && (
            <div className='text-sm text-zinc-600'>
              인원 {data.space_info.available_people ?? '-'} · 거실 {data.space_info.living_rooms ?? 0} · 침실{' '}
              {data.space_info.bedrooms ?? 0} · 욕실 {data.space_info.bathrooms ?? 0}
            </div>
          )}

          {/* 어메니티 */}
          {data.amenities?.length ? (
            <ul className='flex flex-wrap gap-2 text-sm text-zinc-600'>
              {data.amenities.map((a) => (
                <li key={a} className='px-2 py-1 bg-zinc-100 rounded'>
                  {a}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </>
  )
}
