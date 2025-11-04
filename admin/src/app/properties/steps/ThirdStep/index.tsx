'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PropertyImage } from '@/types/property'
import { uploadPropertyImage } from '@/utils/upload'
import classNames from 'classnames'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

type CatBlock = {
  category: string
  urls: string[] // 기존(form.images)에서 온 것
  files: File[] // 새로 추가하는 것
}

const INIT_CATEGORIES = ['Main', 'Living Room', 'Bathroom', 'Kitchen', 'Bedroom']

export const ThirdStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
  const [categories, setCategories] = useState<CatBlock[]>(
    INIT_CATEGORIES.map((cat) => ({ category: cat, urls: [], files: [] })),
  )
  const [uploading, setUploading] = useState(false)

  // ✅ 열릴 때 form.images를 한 번만 반영 (이미 카테고리 상태가 채워져 있으면 유지)
  useEffect(() => {
    if (!isOpen) return

    setCategories((prev) => {
      const alreadyLoaded = prev.some((c) => c.urls.length > 0 || c.files.length > 0)
      if (alreadyLoaded) return prev

      const byCat = new Map<string, string[]>()
      const existing: PropertyImage[] = Array.isArray(form?.images) ? form.images : []

      for (const img of existing) {
        const cat = (img.category ?? 'Extra').trim() || 'Extra'
        if (!byCat.has(cat)) byCat.set(cat, [])
        if (img.url) byCat.get(cat)!.push(img.url)
      }

      const allCats = Array.from(new Set([...INIT_CATEGORIES, ...Array.from(byCat.keys())]))

      return allCats.map((cat) => ({
        category: cat,
        urls: byCat.get(cat) ?? [],
        files: [],
      }))
    })
  }, [isOpen])

  // 닫을 때 초기화
  const handleClose = useCallback(() => {
    setCategories(INIT_CATEGORIES.map((cat) => ({ category: cat, urls: [], files: [] })))
    onClose()
  }, [onClose])

  // 카테고리 추가/삭제
  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setCategories((prev) => {
      if (prev.some((c) => c.category === n)) return prev
      return [...prev, { category: n, urls: [], files: [] }]
    })
  }, [])

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c.category !== name))
  }, [])

  // 섹션에서 파일/기존URL 변경 시 상위 상태 업데이트
  const setCategoryFiles = useCallback((name: string, files: File[]) => {
    setCategories((prev) => prev.map((c) => (c.category === name ? { ...c, files } : c)))
  }, [])

  const removeExistingUrl = useCallback((name: string, url: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.category === name ? { ...c, urls: c.urls.filter((u) => u !== url) } : c)),
    )
  }, [])

  // 업로드: files만 업로드 → 기존 urls + 신규 업로드 URL 합쳐서 form.images 재구성
  const handleUploadAll = useCallback(async () => {
    if (uploading) return

    const totalNew = categories.reduce((acc, c) => acc + c.files.length, 0)
    if (totalNew === 0 && categories.every((c) => c.urls.length === 0)) {
      return alert('이미지 없음')
    }

    setUploading(true)
    try {
      // 1) 신규 업로드
      const newImages: PropertyImage[] = []
      for (const cat of categories) {
        for (let i = 0; i < cat.files.length; i++) {
          const file = cat.files[i]
          const { url } = await uploadPropertyImage(file) // 압축/업로드 util
          newImages.push({
            url,
            category: cat.category,
            sort_order: i,
            is_primary: false,
          })
        }
      }

      // 2) 기존 urls도 PropertyImage로 보존(사용자가 이 화면에서 삭제한 것은 urls에서 빠졌으므로 제외)
      const keepExisting: PropertyImage[] = []
      for (const cat of categories) {
        cat.urls.forEach((url, i) => {
          keepExisting.push({
            url,
            category: cat.category,
            sort_order: i,
            is_primary: false,
          })
        })
      }

      // 3) 대표 이미지 규칙(예: Main의 첫 이미지를 대표로)
      const merged = [...keepExisting, ...newImages]
      const firstMain = merged.findIndex((m) => (m.category ?? '') === 'Main')
      if (firstMain >= 0) {
        merged.forEach((m) => (m.is_primary = false))
        merged[firstMain].is_primary = true
      }

      // 4) form.images 갱신
      setForm((prev: any) => ({
        ...prev,
        images: merged,
      }))

      alert('이미지 업데이트가 완료되었습니다.')
      handleClose()
    } catch (e: any) {
      alert(e?.message ?? '업데이트 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }, [categories, setForm, handleClose, uploading])

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleClose }} title='객실 사진'>
      <div className='flex flex-col gap-3 py-3 pb-48 px-3'>
        {categories.map((cat) => (
          <ImageUploadSection
            key={cat.category}
            category={cat.category}
            urls={cat.urls}
            files={cat.files}
            onChangeFiles={(files) => setCategoryFiles(cat.category, files)}
            onRemoveUrl={(url) => removeExistingUrl(cat.category, url)}
            onHandleDelete={() => removeCategory(cat.category)}
          />
        ))}

        <AddCategoryRow onAdd={addCategory} />
      </div>

      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleUploadAll} disabled={uploading}>
          {uploading ? '업로드 중...' : '업로드하기'}
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
  urls,
  files,
  onChangeFiles,
  onRemoveUrl,
  onHandleDelete,
}: {
  category: string
  urls: string[]
  files: File[]
  onChangeFiles: (files: File[]) => void
  onRemoveUrl: (url: string) => void
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
              className='outline-none w-full'
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

      {/* 기존 URL 프리뷰 */}
      {urls.length > 0 && (
        <Swiper slidesPerView={1.5} spaceBetween={10} className='w-full h-fit relative'>
          {urls.map((u, i) => (
            <SwiperSlide key={`url-${i}`}>
              <div className='w-full h-auto aspect-landscape relative'>
                <img src={u} alt={`img-${i}`} className='w-full h-full object-cover rounded-lg' />
                <button
                  onClick={() => onRemoveUrl(u)}
                  className='absolute top-1 right-1 bg-white/70 text-xs px-1 rounded'
                >
                  ✕
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 신규 파일 프리뷰 / 추가 */}
      {files.length === 0 ? (
        <DropCard onFiles={(picked) => onChangeFiles([...files, ...picked])} />
      ) : (
        <Swiper slidesPerView={1.5} spaceBetween={10} className='w-full h-fit relative'>
          {files.map((file, i) => (
            <SwiperSlide key={`file-${i}`}>
              <div className='w-full h-auto aspect-landscape relative'>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${i}`}
                  className='w-full h-full object-cover rounded-lg'
                />
                <button
                  onClick={() => onChangeFiles(files.filter((_, idx) => idx !== i))}
                  className='absolute top-1 right-1 bg-white/70 text-xs px-1 rounded'
                >
                  ✕
                </button>
              </div>
            </SwiperSlide>
          ))}
          <SwiperSlide>
            <DropCard onFiles={(picked) => onChangeFiles([...files, ...picked])} />
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
            if (picked.length) onFiles(picked)
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
