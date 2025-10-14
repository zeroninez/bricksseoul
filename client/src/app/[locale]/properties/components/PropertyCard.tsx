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

interface PropertyCardProps {
  id: string
  name: string
  price_per_night: number
  images?: { url: string }[]
}

export const PropertyCard = ({ id, name, price_per_night, images }: PropertyCardProps) => {
  return (
    <Link
      href={`/properties/${id}`}
      scroll
      className='w-full bg-white border border-zinc-100 shadow-sm overflow-hidden text-left flex flex-col'
    >
      {/* 이미지 슬라이더 */}
      <Swiper
        pagination={{
          type: 'fraction',
        }}
        navigation={true}
        modules={[Pagination]}
        className='w-full aspect-[4/3] bg-black'
      >
        {images?.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div className='relative w-full h-full bg-black overflow-hidden'>
              <Image src={img.url} alt={name} fill className='object-cover' />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 정보 */}
      <div className='p-4 flex flex-col gap-1'>
        <div className='text-lg font-semibold text-zinc-800 truncate'>{name}</div>
        <div className='text-sm text-zinc-500'>{price_per_night.toLocaleString()}원 / night</div>
      </div>
    </Link>
  )
}
