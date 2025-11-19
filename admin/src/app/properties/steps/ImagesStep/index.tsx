'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PropertyImage } from '@/types/property'
import { uploadPropertyImage, deletePropertyImage } from '@/utils/images'
import { ImageUploadSection } from './ImageUploadSection'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  mode: 'create' | 'edit'
}

export type ImageItem = {
  url: string
  isNew: boolean
  isUploading?: boolean
  tempId?: string // ← #2: 업로딩 자리표시자 식별용
}

type CatBlock = {
  category: string
  images: ImageItem[]
}

const INIT_CATEGORIES = ['Main', 'Living Room', 'Bathroom', 'Kitchen', 'Bedroom']

export const ImagesStep = ({ isOpen, onClose, form, setForm, mode }: StepProps) => {
  const [categories, setCategories] = useState<CatBlock[]>([])
  const [saving, setSaving] = useState(false)

  // 새로 업로드된 URL 추적(저장 안 하고 닫을 때 정리)
  const newUploadedUrlsRef = useRef<Set<string>>(new Set())

  // #1 폼 기반으로 카테고리 구성: 폼의 카테고리가 하나라도 있으면 그것만 사용.
  const initialCats = useMemo(() => {
    const existing: PropertyImage[] = Array.isArray(form?.images) ? form.images : []
    const catsInForm = Array.from(
      new Set(existing.map((i) => (i.category ?? '').trim()).filter((c) => c && c.length > 0)),
    )
    if (catsInForm.length > 0) return catsInForm
    return INIT_CATEGORIES
  }, [form?.images])

  // 열릴 때 1회 초기화
  useEffect(() => {
    if (!isOpen) return

    const byCat = new Map<string, ImageItem[]>()
    const existing: PropertyImage[] = Array.isArray(form?.images) ? form.images : []

    for (const img of existing) {
      const cat = (img.category ?? 'Extra').trim() || 'Extra'
      if (!byCat.has(cat)) byCat.set(cat, [])
      if (img.url) byCat.get(cat)!.push({ url: img.url, isNew: false })
    }

    setCategories(initialCats.map((cat) => ({ category: cat, images: byCat.get(cat) ?? [] })))
    newUploadedUrlsRef.current.clear()
  }, [isOpen, form?.images, initialCats])

  const handleClose = useCallback(
    async (isSaving = false) => {
      if (!isSaving && newUploadedUrlsRef.current.size > 0) {
        const urls = Array.from(newUploadedUrlsRef.current)
        Promise.all(urls.map((u) => deletePropertyImage(u).catch(() => {}))).then(() => {})
      }
      setCategories([])
      newUploadedUrlsRef.current.clear()
      onClose()
    },
    [onClose],
  )

  // 카테고리 추가/삭제 (추가 시 중복 방지)
  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setCategories((prev) => (prev.some((c) => c.category === n) ? prev : [...prev, { category: n, images: [] }]))
  }, [])

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c.category !== name))
  }, [])

  // #2 즉시 업로드(자리표시자 tempId로 정확한 위치 치환)
  const handleImmediateUpload = useCallback(async (categoryName: string, files: File[]) => {
    if (!files.length) return

    // 1) 자리표시자 추가
    const placeholders = files.map(
      () =>
        ({
          url: '',
          isNew: true,
          isUploading: true,
          tempId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        }) as ImageItem,
    )

    setCategories((prev) =>
      prev.map((c) => (c.category === categoryName ? { ...c, images: [...c.images, ...placeholders] } : c)),
    )

    // 2) 업로드 & 치환
    await Promise.all(
      files.map(async (file, idx) => {
        const myId = placeholders[idx].tempId!
        try {
          const { url } = await uploadPropertyImage(file)
          newUploadedUrlsRef.current.add(url)

          setCategories((prev) =>
            prev.map((c) => {
              if (c.category !== categoryName) return c
              const i = c.images.findIndex((img) => img.tempId === myId)
              if (i === -1) return c
              const next = [...c.images]
              next[i] = { url, isNew: true, isUploading: false }
              return { ...c, images: next }
            }),
          )
        } catch {
          // 실패 시 해당 자리표시자 제거
          setCategories((prev) =>
            prev.map((c) => {
              if (c.category !== categoryName) return c
              return { ...c, images: c.images.filter((img) => img.tempId !== myId) }
            }),
          )
        }
      }),
    )
  }, [])

  // 이미지 삭제 (서버 동기)
  const handleDeleteImage = useCallback(async (categoryName: string, url: string, isNew: boolean) => {
    if (!url) return
    // optimistic
    setCategories((prev) =>
      prev.map((c) => (c.category === categoryName ? { ...c, images: c.images.filter((i) => i.url !== url) } : c)),
    )
    if (isNew) newUploadedUrlsRef.current.delete(url)
    try {
      await deletePropertyImage(url)
    } catch {}
  }, [])

  // 저장
  const handleSave = useCallback(async () => {
    if (saving) return
    setSaving(true)
    try {
      const all: PropertyImage[] = []
      for (const cat of categories) {
        cat.images.forEach((img, i) => {
          if (!img.url || img.isUploading) return
          all.push({ url: img.url, category: cat.category, sort_order: i, is_primary: false })
        })
      }
      // 대표 이미지(Main 첫 장)
      const firstMain = all.findIndex((m) => (m.category ?? '') === 'Main')
      if (firstMain >= 0) {
        all.forEach((m) => (m.is_primary = false))
        all[firstMain].is_primary = true
      }

      setForm((prev: any) => ({ ...prev, images: all }))
      newUploadedUrlsRef.current.clear()
      alert(all.length ? '이미지가 저장되었습니다.' : '모든 이미지가 삭제되었습니다.')
      handleClose(true)
    } catch (e: any) {
      alert(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }, [categories, saving, setForm, handleClose])

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

      <div className='absolute bottom-0 w-full h-fit px-5 pb-5 z-10'>
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
        onClick={() => onAdd('Extra')}
      >
        + 카테고리 추가
      </button>
    </div>
  )
}
