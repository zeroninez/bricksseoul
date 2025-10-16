'use client'

import classNames from 'classnames'
import React, { useMemo, useRef, useState } from 'react'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { MdClose } from 'react-icons/md'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import { motion } from 'motion/react'

interface RoomGalleryProps {
  images: any[]
}

export const RoomGallery = ({ images }: RoomGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<any>(null)

  const [maximizedImg, setMaximizedImg] = useState<string | null>(null)

  // unique categories in the order of first appearance
  const categories = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    images?.forEach((img) => {
      if (img?.category && !seen.has(img.category)) {
        seen.add(img.category)
        ordered.push(img.category)
      }
    })
    return ordered
  }, [images])

  // map category -> first index
  const indexByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    images?.forEach((img, i) => {
      if (img?.category !== undefined && map[img.category] === undefined) {
        map[img.category] = i
      }
    })
    return map
  }, [images])

  const activeCategory = images?.[activeIndex]?.category

  const handleCategoryClick = (category: string) => {
    const idx = indexByCategory[category] ?? 0
    if (swiperRef.current) {
      swiperRef.current.slideTo(idx)
    }
  }

  const handleSlideImageClick = (imgUrl: string) => {
    setMaximizedImg(imgUrl)
  }

  useBodyScrollLock(!!maximizedImg)

  return (
    <>
      <section className='w-full h-fit flex flex-col gap-4 py-5 '>
        <div className='w-full h-fit snap-x px-5 scroll-px-5 flex overflow-x-scroll scrollbar-hide flex-row gap-2.5'>
          {categories.length ? (
            categories.map((cat) => (
              <React.Fragment key={cat}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className={classNames(
                    'w-fit h-fit px-3 py-1 snap-start text-base rounded-lg border whitespace-nowrap transition-colors',
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary'
                      : 'border-primary text-primary hover:bg-primary/10',
                  )}
                >
                  {cat}
                </button>
              </React.Fragment>
            ))
          ) : (
            <div className='text-zinc-500'>No images</div>
          )}
        </div>

        <Swiper
          onSwiper={(s) => {
            swiperRef.current = s
            // initialize activeIndex in case Swiper doesn't start at 0
            setActiveIndex(s.activeIndex ?? 0)
          }}
          slidesPerView={1.2} // 👈 한 번에 보이는 슬라이드 수
          slidesOffsetBefore={20} // 👈 시작 패딩
          slidesOffsetAfter={20} // 👈 끝 패딩
          spaceBetween={10}
          onSlideChange={(s) => setActiveIndex(s.activeIndex ?? 0)}
          className='w-full aspect-landscape relative'
        >
          {images?.map((img, idx) => (
            <SwiperSlide key={idx}>
              <motion.div
                whileTap={{ opacity: 0.8 }}
                onClick={() => handleSlideImageClick(img.url)}
                className='relative w-full h-full bg-primary rounded-lg overflow-hidden cursor-pointer'
              >
                <img src={img.url} alt={img.category} className='w-full h-full object-cover' />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      {maximizedImg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center'
          onClick={() => setMaximizedImg(null)}
        >
          <button
            onClick={() => setMaximizedImg(null)}
            className='absolute top-5 right-5 text-white text-xl rounded-full bg-black/30 hover:bg-black/50 transition'
          >
            <MdClose />
          </button>

          <img src={maximizedImg} alt='Maximized' className='max-h-full max-w-full object-contain' />
        </motion.div>
      )}
    </>
  )
}
