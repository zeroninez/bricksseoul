'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PropertyImage } from '@/types/property'
import { uploadPropertyImage, deletePropertyImage } from '@/utils/images'
import classNames from 'classnames'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

type ImageItem = {
  url: string
  isNew: boolean // 새로 업로드한 것인지 여부
  isUploading?: boolean // 업로드 중인지 여부
}

type CatBlock = {
  category: string
  images: ImageItem[] // urls와 files를 통합
}

const INIT_CATEGORIES = ['Main', 'Living Room', 'Bathroom', 'Kitchen', 'Bedroom']

export const ThirdStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [categories, setCategories] = useState<CatBlock[]>(
    INIT_CATEGORIES.map((cat) => ({ category: cat, images: [] })),
  )
  const [saving, setSaving] = useState(false)

  // 새로 업로드한 URL들을 추적 (저장하지 않고 나갈 때 삭제용)
  const newUploadedUrlsRef = useRef<Set<string>>(new Set())

  // 열릴 때 form.images를 한 번만 반영
  useEffect(() => {
    if (!isOpen) return

    setCategories((prev) => {
      const alreadyLoaded = prev.some((c) => c.images.length > 0)
      if (alreadyLoaded) return prev

      const byCat = new Map<string, ImageItem[]>()
      const existing: PropertyImage[] = Array.isArray(form?.images) ? form.images : []

      for (const img of existing) {
        const cat = (img.category ?? 'Extra').trim() || 'Extra'
        if (!byCat.has(cat)) byCat.set(cat, [])
        if (img.url) {
          byCat.get(cat)!.push({
            url: img.url,
            isNew: false,
          })
        }
      }

      const allCats = Array.from(new Set([...INIT_CATEGORIES, ...Array.from(byCat.keys())]))

      return allCats.map((cat) => ({
        category: cat,
        images: byCat.get(cat) ?? [],
      }))
    })

    // 새 업로드 추적 초기화
    newUploadedUrlsRef.current.clear()
  }, [isOpen, form?.images])

  // 닫을 때 처리
  const handleClose = useCallback(
    async (isSaving: boolean = false) => {
      // 저장하지 않고 나가는 경우, 새로 업로드한 이미지들 삭제
      if (!isSaving && newUploadedUrlsRef.current.size > 0) {
        const urlsToDelete = Array.from(newUploadedUrlsRef.current)

        // 비동기로 삭제 (UI 블로킹 방지)
        Promise.all(
          urlsToDelete.map((url) =>
            deletePropertyImage(url).catch((err) => console.error('Failed to delete image:', url, err)),
          ),
        ).then(() => {
          console.log('Cleaned up unsaved images')
        })
      }

      setCategories(INIT_CATEGORIES.map((cat) => ({ category: cat, images: [] })))
      newUploadedUrlsRef.current.clear()
      onClose()
    },
    [onClose],
  )

  // 카테고리 추가/삭제
  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setCategories((prev) => {
      if (prev.some((c) => c.category === n)) return prev
      return [...prev, { category: n, images: [] }]
    })
  }, [])

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c.category !== name))
  }, [])

  // 이미지 즉시 업로드
  const handleImmediateUpload = useCallback(async (categoryName: string, files: File[]) => {
    if (files.length === 0) return

    // 임시 업로딩 상태 추가
    const tempImages: ImageItem[] = files.map(() => ({
      url: '',
      isNew: true,
      isUploading: true,
    }))

    setCategories((prev) =>
      prev.map((c) => (c.category === categoryName ? { ...c, images: [...c.images, ...tempImages] } : c)),
    )

    // 각 파일 업로드
    const uploadPromises = files.map(async (file, index) => {
      try {
        const { url } = await uploadPropertyImage(file)

        // 새 업로드 URL 추적
        newUploadedUrlsRef.current.add(url)

        // 임시 이미지를 실제 URL로 교체
        setCategories((prev) =>
          prev.map((c) => {
            if (c.category !== categoryName) return c

            const newImages = [...c.images]
            const uploadingIndex = newImages.findIndex((img) => img.isUploading)

            if (uploadingIndex !== -1) {
              newImages[uploadingIndex] = {
                url,
                isNew: true,
                isUploading: false,
              }
            }

            return { ...c, images: newImages }
          }),
        )

        return url
      } catch (error) {
        console.error('Upload failed:', error)

        // 실패한 임시 이미지 제거
        setCategories((prev) =>
          prev.map((c) => {
            if (c.category !== categoryName) return c
            return {
              ...c,
              images: c.images.filter((img) => !img.isUploading),
            }
          }),
        )

        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
    } catch (error) {
      alert('일부 이미지 업로드에 실패했습니다.')
    }
  }, [])

  // 이미지 삭제 (서버에서도 삭제)
  const handleDeleteImage = useCallback(async (categoryName: string, url: string, isNew: boolean) => {
    if (!url) return

    // UI에서 먼저 제거 (낙관적 업데이트)
    setCategories((prev) =>
      prev.map((c) => (c.category === categoryName ? { ...c, images: c.images.filter((img) => img.url !== url) } : c)),
    )

    // 새로 업로드한 이미지인 경우 추적에서 제거
    if (isNew) {
      newUploadedUrlsRef.current.delete(url)
    }

    // 서버에서 삭제
    try {
      await deletePropertyImage(url)
    } catch (error) {
      console.error('Failed to delete image from server:', error)
      // 삭제 실패 시 다시 복구할 수도 있지만, 여기서는 무시
    }
  }, [])

  // 저장하기
  const handleSave = useCallback(async () => {
    if (saving) return

    setSaving(true)
    try {
      // 모든 이미지를 PropertyImage 형식으로 변환
      const allImages: PropertyImage[] = []

      for (const cat of categories) {
        cat.images.forEach((img, i) => {
          if (img.url && !img.isUploading) {
            allImages.push({
              url: img.url,
              category: cat.category,
              sort_order: i,
              is_primary: false,
            })
          }
        })
      }

      // Main 카테고리의 첫 이미지를 대표 이미지로 설정
      const firstMain = allImages.findIndex((m) => (m.category ?? '') === 'Main')
      if (firstMain >= 0) {
        allImages.forEach((m) => (m.is_primary = false))
        allImages[firstMain].is_primary = true
      }

      // form 업데이트 (이미지가 없어도 빈 배열로 저장)
      setForm((prev: any) => ({
        ...prev,
        images: allImages,
      }))

      // 저장 성공 시 새 업로드 추적 초기화 (삭제하지 않음)
      newUploadedUrlsRef.current.clear()

      const message = allImages.length === 0 ? '모든 이미지가 삭제되었습니다.' : '이미지가 저장되었습니다.'

      alert(message)
      handleClose(true) // 저장 후 닫기
    } catch (e: any) {
      alert(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }, [categories, setForm, handleClose, saving])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => handleClose(false)}
      leftAction={{ onClick: () => handleClose(false) }}
      title='객실 사진'
    >
      <div className='flex flex-col gap-3 py-3 pb-48 px-3'>
        {categories.map((cat) => (
          <ImageUploadSection
            key={cat.category}
            category={cat.category}
            images={cat.images}
            onUploadFiles={(files) => handleImmediateUpload(cat.category, files)}
            onDeleteImage={(url, isNew) => handleDeleteImage(cat.category, url, isNew)}
            onHandleDelete={() => removeCategory(cat.category)}
          />
        ))}

        <AddCategoryRow onAdd={addCategory} />
      </div>

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </BottomSheet>
  )
}

function AddCategoryRow({ onAdd }: { onAdd: (name: string) => void }) {
  return (
    <div className='w-full flex gap-2 items-center'>
      <button
        className='w-full px-3 h-12 bg-white text-blue-500 active:opacity-80 transition-all'
        onClick={() => {
          onAdd('Extra')
        }}
      >
        + 카테고리 추가
      </button>
    </div>
  )
}

function ImageUploadSection({
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

function DropCard({ onFiles }: { onFiles: (files: File[]) => void }) {
  return (
    <div className='w-full h-auto aspect-landscape flex justify-center items-center bg-stone-200 rounded-lg cursor-pointer'>
      <label className='w-full h-full flex flex-col justify-center items-center cursor-pointer active:scale-95 active:opacity-80 transition-all'>
        <input
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => {
            const picked = Array.from(e.target.files || [])
            if (picked.length) {
              onFiles(picked)
              e.target.value = '' // 같은 파일 재선택 가능하도록
            }
          }}
        />
        <span className='text-2xl text-stone-400 select-none'>＋</span>
        <span className='text-xs font-medium text-stone-400 select-none'>이미지 업로드</span>
      </label>
    </div>
  )
}

function Tooltip({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onOutside = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        className={classNames(
          'w-10 h-10 flex justify-center items-center rounded-lg active:opacity-80 transition-all',
          isOpen ? 'bg-stone-200' : 'bg-transparent',
        )}
        aria-haspopup='menu'
        aria-expanded={isOpen}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 16 16' fill='currentColor'>
          <path d='M7.125 3.60938c0 .23206.09219.45462.25628.61871.1641.1641.38666.25629.61872.25629.23206 0 .45462-.09219.61872-.25629.16409-.16409.25628-.38665.25628-.61871 0-.23207-.09219-.45463-.25628-.61872C8.45462 2.82656 8.23206 2.73438 8 2.73438c-.23206 0-.45462.09218-.61872.25628-.16409.16409-.25628.38665-.25628.61872zM7.125 7.98438c0 .23206.09219.45462.25628.61871.1641.1641.38666.25629.61872.25629.23206 0 .45462-.09219.61872-.25629.16409-.16409.25628-.38665.25628-.61871 0-.23207-.09219-.45463-.25628-.61872-.1641-.1641-.38666-.25629-.61872-.25629-.23206 0-.45462.09219-.61872.25629-.16409.16409-.25628.38665-.25628.61872zM7.125 12.3594c0 .232.09219.4546.25628.6187.1641.1641.38666.2563.61872.2563.23206 0 .45462-.0922.61872-.2563.16409-.1641.25628-.3867.25628-.6187 0-.2321-.09219-.4547-.25628-.6187-.1641-.1641-.38666-.2563-.61872-.2563-.23206 0-.45462.0922-.61872.2563-.16409.164-.25628.3866-.25628.6187z' />
        </svg>
      </button>

      {isOpen && (
        <div
          role='menu'
          aria-orientation='vertical'
          className='absolute right-0 top-[45px] min-w-36 bg-white rounded-md border border-stone-200 shadow-xl overflow-hidden z-10'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            role='menuitem'
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              onEdit()
            }}
            className='w-full text-left text-sm text-blue-500 px-4 py-3 active:bg-stone-100 transition-colors'
          >
            카테고리 수정
          </button>
          <div className='h-px bg-stone-200' />
          <button
            role='menuitem'
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              onDelete()
            }}
            className='w-full text-left text-sm text-red-500 px-4 py-3 active:bg-stone-100 transition-colors'
          >
            카테고리 삭제
          </button>
        </div>
      )}
    </div>
  )
}
