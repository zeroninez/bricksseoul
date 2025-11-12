'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { DeletePropertyButton } from '@/components/DeletePropertyButton'
import { useRouter } from 'next/navigation'

export function OptionTooltip({
  onEdit,
  propertyId,
  onDeleted,
}: {
  onEdit: () => void
  propertyId: string
  onDeleted?: () => void
}) {
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

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!propertyId) return

    const ok = confirm('이 숙소를 정말 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')
    if (!ok) return

    try {
      setLoading(true)

      const res = await fetch(`/api/properties/delete?id=${encodeURIComponent(propertyId)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '삭제 요청에 실패했어요.')
      }

      alert('숙소가 삭제되었습니다.')

      // 리스트 새로고침
      onDeleted?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '삭제 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        className={classNames(
          'w-auto h-full flex justify-center items-center',
          'relative p-2 rounded-lg active:bg-stone-200 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center',
          isOpen ? 'bg-stone-200' : 'bg-stone-100',
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
            숙소 수정
          </button>
          <div className='h-px bg-stone-200' />
          <button
            role='menuitem'
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              handleDelete()
            }}
            className='w-full text-left text-sm text-red-500 px-4 py-3 active:bg-stone-100 transition-colors'
          >
            숙소 삭제
          </button>
        </div>
      )}
    </div>
  )
}
