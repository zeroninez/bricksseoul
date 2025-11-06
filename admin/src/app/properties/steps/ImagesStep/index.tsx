'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PropertyImage } from '@/types/property'
import { uploadPropertyImage, deletePropertyImage } from '@/utils/images'
import { ImageUploadSection } from './ImageUploadSection'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export type ImageItem = {
  url: string
  isNew: boolean // 새로 업로드한 것인지 여부
  isUploading?: boolean // 업로드 중인지 여부
}

type CatBlock = {
  category: string
  images: ImageItem[] // urls와 files를 통합
}

const INIT_CATEGORIES = ['Main', 'Living Room', 'Bathroom', 'Kitchen', 'Bedroom']

export const ImagesStep = ({ isOpen, onClose, form, setForm }: StepProps) => {
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
