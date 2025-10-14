'use client'

import { Link } from '@/i18n/routing'
import Image from 'next/image'
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
      className='w-full h-fit text-left flex flex-col gap-4 relative'
    >
      {/* 이미지 슬라이더 */}
      <Swiper
        pagination={{
          type: 'fraction', // ← 반드시 추가
          renderFraction: () => {
            // Tailwind purge 피하려고 우리가 정의한 고정 클래스만 사용
            return `
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 flex flex-row justify-center items-center rounded-full z-10 select-none">
        <span class="swiper-pagination-current"></span>
        <span class="mx-1 opacity-70">/</span>
        <span class="swiper-pagination-total"></span>
        </div>
      `
          },
        }}
        modules={[Pagination]}
        className='w-full aspect-[4/3] bg-black relative'
      >
        {property.images?.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div className='relative w-full h-full bg-black overflow-hidden'>
              <Image src={img.url} alt={property.name} fill className='object-cover' />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 정보 */}
      <div className='flex flex-col gap-1'>
        <div className='text-lg font-semibold text-zinc-800 truncate'>{property.name}</div>
        <div className='text-base font-semibold text-zinc-800 truncate'>{property.location}</div>
        <div className='text-sm text-zinc-500'>{property.price_per_night.toLocaleString()}원 / night</div>
      </div>
    </Link>
  )
}
