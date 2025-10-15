// app/[locale]/properties/[id]/DetailClient.tsx
'use client'
import { useEffect } from 'react'
import { usePropertyGet } from '@/hooks/useProperty'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

// import required modules
import { Pagination } from 'swiper/modules'
import { HEADER_HEIGHT } from '@/theme/constants'
import classNames from 'classnames'
import { motion, useScroll, useTransform } from 'motion/react'

export default function DetailClient({ id }: { id: string }) {
  const { data, isLoading, error } = usePropertyGet(id)

  const { scrollY } = useScroll()

  // 0~300px 사이에서만 줄이기
  const headerH = useTransform(scrollY, [0, 300], [320, 120], { clamp: true })
  // syntax : useTransform(value, inputRange, outputRange, options?)

  useEffect(() => {
    // 페이지 로드 시 스크롤을 최상단으로
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id]) // id가 변경될 때마다 실행

  return (
    <>
      <div
        style={{
          marginTop: `-${HEADER_HEIGHT}`,
        }}
        className='w-full h-fit pb-40 relative'
      >
        {isLoading && <div className='text-zinc-500'>Loading...</div>}
        {error && <div className='text-red-500'>Failed to load</div>}
        {!isLoading && !data && <div>Not found</div>}
        {data && (
          <>
            {/* header */}
            <motion.section
              style={{
                height: headerH,
              }}
              className='w-full flex fixed top-0 z-10'
            >
              <div className='w-full h-full relative bg-black'>
                <img
                  src={data?.images?.find((img) => img.is_primary)?.url || data?.images?.[0].url}
                  alt={data.name}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/90 to-transparent' />
              </div>
              <div className='absolute bottom-0 p-5 '>
                <h1 className='text-2xl font-bold text-white'>{data.name}</h1>
                <p className='text-sm text-white mt-1'>{data.address?.address1}</p>
              </div>
            </motion.section>
            <div className='checking h-[320px]' />
            {/* 이미지 슬라이더 */}
            <section className='w-full h-fit text-left flex flex-col gap-2 p-5 '>
              <div className='w-full h-fit flex overflow-x-scroll scrollbar-hide flex-row gap-2'>
                {data.images?.map((img, idx) => (
                  <button
                    key={idx}
                    className={classNames(
                      'w-fit h-fit px-2 py-1 text-sm rounded-lg border border-primary text-primary whitespace-nowrap',
                    )}
                  >
                    {img.category}
                  </button>
                )) || <div className='text-zinc-500'>No images</div>}
              </div>

              <Swiper
                pagination={{
                  type: 'fraction', // ← 반드시 추가
                  renderFraction: () => {
                    // Tailwind purge 피하려고 우리가 정의한 고정 클래스만 사용
                    return `
            <div class="absolute bottom-2 right-2 bg-stone-900/30 text-white text-xs px-2 py-1 flex flex-row justify-center items-center rounded-full z-10 select-none">
        <span class="swiper-pagination-current"></span>
        <span class="mx-1 opacity-70">/</span>
        <span class="swiper-pagination-total"></span>
        </div>
      `
                  },
                }}
                modules={[Pagination]}
                className='w-full aspect-landscape bg-black relative'
              >
                {data.images?.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className='relative w-full h-full bg-primary overflow-hidden'>
                      <img src={img.url} alt={data.name} className='w-full h-full object-cover' />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
            <section className='w-full text-left static top-0 flex flex-col gap-4 p-5'>
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
            </section>
          </>
        )}
      </div>
    </>
  )
}
