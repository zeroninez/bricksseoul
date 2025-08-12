// src/components/ImageSlider.tsx
'use client'

import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { motion } from 'motion/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

interface PropertyImage {
  id: number
  src: string
  name: string
  sort_order?: number
}

interface PropertyImageSliderProps {
  images: PropertyImage[]
  propertyName: string
}

export const ImageSlider = ({ images, propertyName }: PropertyImageSliderProps) => {
  const imageLength = images.length
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className='w-full h-[60vh] bg-gray-200 text-black flex items-center justify-center'>
        <p className=''>Image is loading...</p>
      </div>
    )
  }

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex)
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!swiperRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const targetSlide = Math.floor(percentage * images.length)

    swiperRef.current.slideTo(targetSlide)
  }

  const progress = ((currentSlide + 1) / images.length) * 100

  return (
    <section className='w-full h-[70vh] relative group'>
      <Swiper
        className='w-full h-full'
        spaceBetween={0}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        allowTouchMove={true}
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id} className='relative'>
            <img
              src={image.src}
              alt={image.name || `${propertyName} - Image ${index + 1}`}
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/5' />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Progress Bar */}
      <div className='absolute bottom-0 left-0 w-full h-fit z-10 p-4 mix-blend-difference'>
        <motion.div
          className='relative w-fit h-fit flex flex-row gap-2 items-center justify-center cursor-pointer'
          onClick={handleProgressBarClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {Array.from({ length: imageLength }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 mix-blend-difference border border-white ${index === currentSlide ? 'bg-white' : 'bg-transparent'}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentSlide ? 1 : 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
