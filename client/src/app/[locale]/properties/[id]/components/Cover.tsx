'use client'

import { useEffect } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { PropertyGetResponse } from '@/types/property'

interface CoverProps {
  data: PropertyGetResponse
}

export const Cover = ({ data }: CoverProps) => {
  const { scrollY } = useScroll()

  // 0~120px 사이에서만 줄이기
  const titleSize = useTransform(scrollY, [0, 120], ['32px', '24px'], { clamp: true })
  const pSize = useTransform(scrollY, [0, 120], ['14px', '12px'], { clamp: true })

  return (
    <>
      <motion.section
        style={{
          height: '320px',
        }}
        className='w-full sticky -top-[120px] flex z-10 bg-black'
      >
        <div className='w-full h-full relative bg-black'>
          {data?.images && data?.images.length > 0 ? (
            <img
              src={data?.images?.find((img) => img.is_primary)?.url || data?.images?.[0].url}
              alt={data.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full bg-background flex items-center justify-center text-black'>
              No Image Available
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 to-transparent' />
        </div>
        <div className='absolute bottom-0 p-5 '>
          <motion.h1
            style={{
              fontSize: titleSize,
              lineHeight: '1.2',
            }}
            className='font-bold text-white'
          >
            {data.name}
          </motion.h1>
          <motion.p
            style={{
              fontSize: pSize,
            }}
            className=' text-white mt-1'
          >
            {data.address?.address1}
          </motion.p>
        </div>
      </motion.section>
    </>
  )
}
