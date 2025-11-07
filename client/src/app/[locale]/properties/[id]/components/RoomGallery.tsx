'use client'

import classNames from 'classnames'
import React, { useMemo, useRef, useState } from 'react'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { MdClose } from 'react-icons/md'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { motion } from 'motion/react'

interface RoomGalleryProps {
  images: Array<{
    url: string
    category?: string | null
    sort_order?: number | null
    is_primary?: boolean | null
  }>
}

/** (선택) 어드민에서 의도한 공식 카테고리 순서가 있다면 여기에 정의 */
const CANONICAL_CATEGORY_ORDER = ['Main', 'Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Extra']

export const RoomGallery = ({ images = [] }: RoomGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<any>(null)
  const [maximizedImg, setMaximizedImg] = useState<string | null>(null)

  /** 1) 카테고리별로 그룹핑 */
  const grouped = useMemo(() => {
    const map = new Map<string, { url: string; category: string; sort_order: number }[]>()
    for (const img of images) {
      const category = (img.category ?? 'Extra').trim() || 'Extra'
      const sort = Number.isFinite(img.sort_order as number) ? (img.sort_order as number) : 0
      if (!map.has(category)) map.set(category, [])
      map.get(category)!.push({
        url: img.url,
        category,
        sort_order: sort,
      })
    }
    // 각 카테고리 내 정렬
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.sort_order - b.sort_order)
      map.set(k, arr)
    }
    return map
  }, [images])

  /** 2) 카테고리 순서 결정 */
  const sortedCategories = useMemo(() => {
    const present = Array.from(grouped.keys())

    // i) 공식 순서가 있으면 그것을 우선 사용
    const inCanonicalOrder = CANONICAL_CATEGORY_ORDER.filter((c) => present.includes(c))

    // ii) 공식 목록에 없지만 실제로 존재하는 나머지들
    const others = present.filter((c) => !CANONICAL_CATEGORY_ORDER.includes(c))

    // others는 각 카테고리의 최소 sort_order 기준으로 안정 정렬
    others.sort((a, b) => {
      const minA = grouped.get(a)?.[0]?.sort_order ?? Number.MAX_SAFE_INTEGER
      const minB = grouped.get(b)?.[0]?.sort_order ?? Number.MAX_SAFE_INTEGER
      return minA - minB
    })

    return [...inCanonicalOrder, ...others]
  }, [grouped])

  /** 3) 플랫한 정렬 이미지 배열 생성 (카테고리 순서 → 카테고리 내부 sort_order 순서) */
  const sortedImages = useMemo(() => {
    const arr: { url: string; category: string; sort_order: number }[] = []
    for (const cat of sortedCategories) {
      const items = grouped.get(cat)
      if (items?.length) arr.push(...items)
    }
    return arr
  }, [grouped, sortedCategories])

  /** 4) 탭 클릭 시 슬라이드 위치 계산을 위한: 카테고리의 첫 슬라이드 인덱스 */
  const indexByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    let cursor = 0
    for (const cat of sortedCategories) {
      const len = grouped.get(cat)?.length ?? 0
      if (len > 0) {
        map[cat] = cursor // 해당 카테고리의 첫 이미지 인덱스
        cursor += len
      }
    }
    return map
  }, [grouped, sortedCategories])

  const activeCategory = sortedImages?.[activeIndex]?.category

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
        {/* 카테고리 탭 */}
        <div className='w-full h-fit snap-x px-5 scroll-px-5 flex overflow-x-scroll scrollbar-hide flex-row gap-2.5'>
          {sortedCategories.length ? (
            sortedCategories.map((cat) => (
              <button
                key={cat}
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
            ))
          ) : (
            <div className='text-zinc-500'>No images</div>
          )}
        </div>

        {/* 이미지 슬라이더: 정렬된 이미지 사용 */}
        <Swiper
          onSwiper={(s) => {
            swiperRef.current = s
            setActiveIndex(s.activeIndex ?? 0)
          }}
          slidesPerView={1.2}
          slidesOffsetBefore={20}
          slidesOffsetAfter={20}
          spaceBetween={10}
          onSlideChange={(s) => setActiveIndex(s.activeIndex ?? 0)}
          className='w-full aspect-landscape relative'
        >
          {sortedImages.map((img, idx) => (
            <SwiperSlide key={`${img.category}-${idx}`}>
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
