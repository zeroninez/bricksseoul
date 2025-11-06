'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

export function Tooltip({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
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
