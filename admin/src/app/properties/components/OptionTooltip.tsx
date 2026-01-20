'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { DeletePropertyButton } from '@/components/DeletePropertyButton'
import { useRouter } from 'next/navigation'
import { PropertyListItem } from '@/types/property'
import { AnimatePresence, motion } from 'motion/react'

export function OptionTooltip({
  onEdit,
  property,
  onRefresh,
}: {
  onEdit: () => void
  property: PropertyListItem
  onRefresh?: () => void
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

  const [duplicating, setDuplicating] = useState(false)
  const [changingVisibility, setChangingVisibility] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const router = useRouter()

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지

    const ok = confirm(`"${property.name}" 숙소를 복제하시겠습니까?`)
    if (!ok) return

    try {
      setDuplicating(true)

      const res = await fetch('/api/properties/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: property.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '숙소 복제에 실패했어요.')
      }

      const result = await res.json()
      alert(`숙소가 복제되었습니다: ${result.data?.name || '복사본'}`)

      // 리스트 새로고침
      onRefresh?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '숙소 복제 중 오류가 발생했어요.')
    } finally {
      setDuplicating(false)
    }
  }

  const handleVisibilityToggle = async () => {
    try {
      setChangingVisibility(true)

      const res = await fetch('/api/properties/visible', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: property.id, is_visible: !property.is_visible }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '숙소 노출 상태 변경에 실패했어요.')
      }
      alert(`숙소가 ${property.is_visible ? '숨김' : '게시'} 상태로 변경되었어요.`)
      // 리스트 새로고침
      onRefresh?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '숙소 노출 상태 변경 중 오류가 발생했어요.')
    } finally {
      setChangingVisibility(false)
    }
  }

  const handleDelete = async () => {
    const ok = confirm('이 숙소를 정말 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')
    if (!ok) return

    try {
      setDeleting(true)

      const res = await fetch(`/api/properties/delete?id=${encodeURIComponent(property.id)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '삭제 요청에 실패했어요.')
      }

      alert('숙소가 삭제되었습니다.')

      // 리스트 새로고침
      onRefresh?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '삭제 중 오류가 발생했어요.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((v) => !v)
        }}
        className={classNames(
          'w-fit h-fit translate-x-1 flex justify-center items-center',
          'relative p-1 rounded-lg bg-white active:bg-stone-200 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center',
          isOpen ? 'bg-stone-200' : 'bg-stone-100',
        )}
        aria-haspopup='menu'
        aria-expanded={isOpen}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 16 16' fill='currentColor'>
          <path d='M7.125 3.60938c0 .23206.09219.45462.25628.61871.1641.1641.38666.25629.61872.25629.23206 0 .45462-.09219.61872-.25629.16409-.16409.25628-.38665.25628-.61871 0-.23207-.09219-.45463-.25628-.61872C8.45462 2.82656 8.23206 2.73438 8 2.73438c-.23206 0-.45462.09218-.61872.25628-.16409.16409-.25628.38665-.25628.61872zM7.125 7.98438c0 .23206.09219.45462.25628.61871.1641.1641.38666.25629.61872.25629.23206 0 .45462-.09219.61872-.25629.16409-.16409.25628-.38665.25628-.61871 0-.23207-.09219-.45463-.25628-.61872-.1641-.1641-.38666-.25629-.61872-.25629-.23206 0-.45462.09219-.61872.25629-.16409.16409-.25628.38665-.25628.61872zM7.125 12.3594c0 .232.09219.4546.25628.6187.1641.1641.38666.2563.61872.2563.23206 0 .45462-.0922.61872-.2563.16409-.1641.25628-.3867.25628-.6187 0-.2321-.09219-.4547-.25628-.6187-.1641-.1641-.38666-.2563-.61872-.2563-.23206 0-.45462.0922-.61872.2563-.16409.164-.25628.3866-.25628.6187z' />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role='menu'
            aria-orientation='vertical'
            className='absolute right-0 top-[45px] min-w-40 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden z-10'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className='w-full h-fit flex flex-row justify-between items-center px-4 py-3 active:bg-stone-100 transition-colors cursor-pointer'
            >
              <span className='text-sm text-black'>{duplicating ? '복사 중...' : '복사하기'}</span>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M19.0781 6H8.67188C7.19624 6 6 7.19624 6 8.67188V19.0781C6 20.5538 7.19624 21.75 8.67188 21.75H19.0781C20.5538 21.75 21.75 20.5538 21.75 19.0781V8.67188C21.75 7.19624 20.5538 6 19.0781 6Z'
                  stroke='currentColor'
                  strokeWidth='1.6'
                  strokeLinejoin='round'
                />
                <path
                  d='M17.9766 6L18 4.875C17.998 4.17942 17.7208 3.51289 17.229 3.02103C16.7371 2.52918 16.0706 2.25198 15.375 2.25H5.25C4.45507 2.25235 3.69338 2.56917 3.13128 3.13128C2.56917 3.69338 2.25235 4.45507 2.25 5.25V15.375C2.25198 16.0706 2.52918 16.7371 3.02103 17.229C3.51289 17.7208 4.17942 17.998 4.875 18H6M13.875 10.125V17.625M17.625 13.875H10.125'
                  stroke='currentColor'
                  strokeWidth='1.6'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            <div className='h-px bg-stone-200' />
            <button
              onClick={handleVisibilityToggle}
              className='w-full h-fit flex flex-row justify-between items-center px-4 py-3 active:bg-stone-100 transition-colors cursor-pointer'
            >
              <span className='text-sm text-black'>
                {changingVisibility ? '변경 중...' : property.is_visible ? '숨기기' : '게시하기'}
              </span>
              {!property.is_visible ? (
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M3 13C6.6 5 17.4 5 21 13'
                    stroke='currentColor'
                    strokeWidth='1.6'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M12 17C11.606 17 11.2159 16.9224 10.8519 16.7716C10.488 16.6209 10.1573 16.3999 9.87868 16.1213C9.6001 15.8427 9.37913 15.512 9.22836 15.1481C9.0776 14.7841 9 14.394 9 14C9 13.606 9.0776 13.2159 9.22836 12.8519C9.37913 12.488 9.6001 12.1573 9.87868 11.8787C10.1573 11.6001 10.488 11.3791 10.8519 11.2284C11.2159 11.0776 11.606 11 12 11C12.7956 11 13.5587 11.3161 14.1213 11.8787C14.6839 12.4413 15 13.2044 15 14C15 14.7956 14.6839 15.5587 14.1213 16.1213C13.5587 16.6839 12.7956 17 12 17Z'
                    stroke='currentColor'
                    strokeWidth='1.6'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : (
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M2.21973 2.21934C2.09271 2.34633 2.01549 2.51468 2.00209 2.69379C1.98869 2.8729 2.04002 3.05087 2.14673 3.19534L2.21973 3.27934L6.25373 7.31434C4.28767 8.69386 2.88378 10.7349 2.29873 13.0643C2.25371 13.2561 2.28597 13.458 2.38854 13.6262C2.4911 13.7944 2.65574 13.9155 2.84687 13.9633C3.038 14.0111 3.24026 13.9818 3.40995 13.8817C3.57965 13.7816 3.70313 13.6187 3.75373 13.4283C4.27354 11.3608 5.55133 9.56401 7.33373 8.39434L9.14373 10.2043C8.42073 10.9598 8.02232 11.9684 8.03386 13.0141C8.04539 14.0597 8.46594 15.0593 9.20544 15.7986C9.94493 16.538 10.9446 16.9584 11.9902 16.9697C13.0359 16.9811 14.0444 16.5825 14.7997 15.8593L20.7187 21.7793C20.8526 21.9135 21.0322 21.9921 21.2216 21.9992C21.411 22.0063 21.596 21.9415 21.7396 21.8177C21.8831 21.694 21.9744 21.5205 21.9953 21.3321C22.0161 21.1437 21.9648 20.9544 21.8517 20.8023L21.7787 20.7183L15.6657 14.6043L15.6667 14.6023L14.4667 13.4043L11.5967 10.5343H11.5987L8.71873 7.65734L8.71973 7.65534L7.58673 6.52534L3.27973 2.21934C3.13911 2.07889 2.94848 2 2.74973 2C2.55098 2 2.36036 2.07889 2.21973 2.21934ZM10.2037 11.2643L13.7387 14.8003C13.2672 15.2557 12.6357 15.5077 11.9802 15.502C11.3247 15.4963 10.6977 15.2334 10.2342 14.7699C9.77066 14.3064 9.50774 13.6793 9.50205 13.0238C9.49635 12.3684 9.74834 11.7358 10.2037 11.2643ZM11.9997 5.49934C10.9997 5.49934 10.0297 5.64734 9.11073 5.92434L10.3477 7.16034C12.4873 6.7367 14.7078 7.15142 16.5502 8.31877C18.3926 9.48611 19.716 11.3168 20.2467 13.4323C20.2985 13.6213 20.4222 13.7824 20.5913 13.8814C20.7604 13.9803 20.9615 14.0091 21.1516 13.9617C21.3417 13.9143 21.5056 13.7944 21.6084 13.6276C21.7113 13.4608 21.7447 13.2605 21.7017 13.0693C21.1599 10.9065 19.9109 8.98685 18.153 7.61528C16.3952 6.24371 14.2294 5.49895 11.9997 5.49934ZM12.1947 9.00934L15.9957 12.8093C15.9466 11.8172 15.5303 10.8789 14.8278 10.1766C14.1253 9.47427 13.1868 9.05825 12.1947 9.00934Z'
                    fill='currentColor'
                  />
                </svg>
              )}
            </button>
            <div className='h-1 bg-stone-200' />
            <button
              role='menuitem'
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                handleDelete()
              }}
              className='w-full h-fit flex flex-row justify-between items-center px-4 py-3 active:bg-stone-100 transition-colors cursor-pointer'
            >
              <span className='text-sm text-red-500'>삭제</span>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-red-500' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M20.5 6H3.5M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 20.999 15.047 21 12.387 21H11.613C8.953 21 7.622 21 6.757 20.19C5.892 19.381 5.803 18.054 5.627 15.4L5.167 8.5M9.5 11L10 16M14.5 11L14 16'
                  stroke='currentColor'
                  strokeWidth='1.6'
                  strokeLinecap='round'
                />
                <path
                  d='M6.5 6H6.61C7.01245 5.98972 7.40242 5.85822 7.72892 5.62271C8.05543 5.3872 8.30325 5.05864 8.44 4.68L8.474 4.577L8.571 4.286C8.654 4.037 8.696 3.913 8.751 3.807C8.85921 3.59939 9.01451 3.41999 9.20448 3.28316C9.39444 3.14633 9.6138 3.05586 9.845 3.019C9.962 3 10.093 3 10.355 3H13.645C13.907 3 14.038 3 14.155 3.019C14.3862 3.05586 14.6056 3.14633 14.7955 3.28316C14.9855 3.41999 15.1408 3.59939 15.249 3.807C15.304 3.913 15.346 4.037 15.429 4.286L15.526 4.577C15.6527 4.99827 15.9148 5.36601 16.2717 5.62326C16.6285 5.88051 17.0603 6.01293 17.5 6'
                  stroke='currentColor'
                  strokeWidth='1.6'
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
