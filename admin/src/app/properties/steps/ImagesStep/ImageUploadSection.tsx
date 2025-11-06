'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ImageItem } from '../'
import { DropCard } from './DropCard'
import { Tooltip } from './Tooltip'

import classNames from 'classnames'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

export function ImageUploadSection({
  category,
  images,
  onUploadFiles,
  onDeleteImage,
  onHandleDelete,
}: {
  category: string
  images: ImageItem[]
  onUploadFiles: (files: File[]) => void
  onDeleteImage: (url: string, isNew: boolean) => void
  onHandleDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [categoryName, setCategoryName] = useState(category)

  useEffect(() => setCategoryName(category), [category])

  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      const element = e.target
      const container = element.closest('[data-rsbs-scroll]')
      const scrollOffset = 100
      if (container) {
        const elementRect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const top = container.scrollTop + elementRect.top - containerRect.top - scrollOffset
        container.scrollTo({ top, behavior: 'smooth' })
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)
  }, [])

  return (
    <div className='w-full h-fit flex flex-col gap-3 p-2 bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.05)]'>
      {/* 상단 바 */}
      <div className='w-full h-fit flex flex-row gap-2'>
        <div
          className={classNames(
            'w-full h-10 rounded-lg outline-none relative flex items-center',
            isEditing ? 'px-4 bg-stone-100' : 'bg-transparent px-1',
          )}
        >
          {isEditing ? (
            <input
              type='text'
              value={categoryName}
              readOnly={!isEditing}
              placeholder='Category (예: Living Room, Bathroom 등)'
              onChange={(e) => setCategoryName(e.target.value)}
              className='outline-none w-full bg-transparent'
              autoFocus
              onFocus={handleInputFocus}
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className='select-none'>{categoryName}</span>
          )}
        </div>
        <Tooltip onEdit={() => setIsEditing(true)} onDelete={onHandleDelete} />
      </div>

      {/* 이미지 프리뷰 */}
      {images.length === 0 ? (
        <DropCard onFiles={onUploadFiles} />
      ) : (
        <Swiper slidesPerView={1.5} spaceBetween={10} className='w-full h-fit relative'>
          {images.map((item, i) => (
            <SwiperSlide key={`img-${i}`}>
              <div className='w-full h-auto aspect-landscape relative'>
                {item.isUploading ? (
                  <div className='w-full h-full flex items-center justify-center bg-stone-200 rounded-lg'>
                    <div className='flex flex-col items-center gap-2'>
                      <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
                      <span className='text-xs text-stone-500'>업로드 중...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <img src={item.url} alt={`img-${i}`} className='w-full h-full object-cover rounded-lg' />
                    <button
                      onClick={() => onDeleteImage(item.url, item.isNew)}
                      className='absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white/90 hover:bg-white text-stone-600 text-sm rounded-full shadow-sm active:scale-95 transition-all'
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
          <SwiperSlide>
            <DropCard onFiles={onUploadFiles} />
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  )
}
