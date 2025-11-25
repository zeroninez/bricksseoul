'use client'

import { Link } from '@/i18n/routing'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { PropertyListItem } from '@/types/property'

interface PropertyCardProps extends PropertyListItem {
  moveInDate: string
  moveOutDate: string
  onValidateDates: () => boolean
}

export const PropertyCard = (props: PropertyCardProps) => {
  const { moveInDate, moveOutDate, onValidateDates, ...property } = props

  return (
    <Link
      href={{
        pathname: `/properties/${property.id}`,
        query: {
          moveIn: moveInDate,
          moveOut: moveOutDate,
        },
      }}
      scroll={true}
      onClick={(e) => {
        const ok = onValidateDates()
        if (!ok) {
          e.preventDefault()
        }
      }}
      className='w-full h-fit text-left flex flex-col gap-3.5 relative'
    >
      {/* 이미지 슬라이더 */}
      {property.images && property.images.length > 0 ? (
        <Swiper
          pagination={{
            type: 'fraction',
            renderFraction: () => {
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
      ) : (
        <div className='w-full aspect-landscape relative flex justify-center items-center bg-black/10 rounded-lg'>
          <span>No Image Available</span>
        </div>
      )}

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
