'use client'

import { Link } from '@/i18n/routing'
import { useState } from 'react'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

// import required modules
import { Pagination } from 'swiper/modules'
import { PropertyListItem } from '@/types/property'

export const PropertyCard = (property: PropertyListItem & { key: string }) => {
  return (
    <Link
      href={`/properties/${property.id}`}
      scroll={true}
      className='w-full h-fit text-left flex flex-col gap-3.5 relative'
    >
      {/* 이미지 슬라이더 */}
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
        spaceBetween={10}
        className='w-full aspect-landscape relative'
      >
        {property.images?.map((img, idx) => (
          <SwiperSlide key={idx} className='relative w-full h-full rounded-lg bg-primary overflow-hidden'>
            <img src={img.url} alt={property.name} className='w-full h-full object-cover' />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 정보 */}
      <div className='flex flex-col gap-1.5 px-1'>
        <div className='text-xl leading-tight font-bold text-stone-800'>{property.name}</div>
        <div className='text-lg font-medium text-stone-800'>
          ₩{property.price_per_night.toLocaleString()}{' '}
          <span className='text-sm font-normal text-stone-500 tracking-tight'>for 1 night</span>
        </div>
        <div className='text-sm leading-snug text-stone-500 pr-12'>{property.location}</div>
      </div>
    </Link>
  )
}
