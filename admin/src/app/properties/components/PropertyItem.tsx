// admin/src/app/properties/components/PropertyItem.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MdContentCopy } from 'react-icons/md'

import { PropertyListItem } from '@/types/property'
import { ToggleSwitch } from '@/components'
import { OptionTooltip } from './OptionTooltip'
import classNames from 'classnames'

export const PropertyItem = (
  property: PropertyListItem & {
    key: string
    onClick?: (propertyId: string) => void
    onRefresh?: () => void
  },
) => {
  const [loading, setLoading] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  const toggleVisibility = async () => {
    try {
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
      property.onRefresh?.() // 변경 후 리스트 새로고침
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '숙소 노출 상태 변경 중 오류가 발생했어요.')
    }
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지

    if (!property) return

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
      property.onRefresh?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '숙소 복제 중 오류가 발생했어요.')
    } finally {
      setDuplicating(false)
    }
  }

  const handleDelete = async () => {
    if (!property) return

    const ok = confirm('이 숙소를 정말 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')
    if (!ok) return

    try {
      setLoading(true)

      const res = await fetch(`/api/properties/delete?id=${encodeURIComponent(property.id)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '삭제 요청에 실패했어요.')
      }

      alert('숙소가 삭제되었습니다.')

      // 리스트 새로고침
      property.onRefresh?.()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '삭제 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-fit flex flex-row relative mb-3'>
      {/* 정보 */}
      <div
        className='w-full h-fit flex flex-col bg-white p-3 rounded-lg gap-1.5 cursor-pointer'
        onClick={() => {
          property.onClick?.(property.id)
        }}
      >
        {/* 노출 여부 토글 버튼 */}
        {/* <div className='absolute top-3 right-3 w-fit h-fit flex flex-col gap-2 justify-center items-end'>
          <div className='flex flex-row gap-1 justify-center items-center'>
            <span className='text-sm text-stone-600 leading-none'>{property.is_visible ? '게시' : '숨김'}</span>
            <ToggleSwitch checked={property.is_visible} onChange={toggleVisibility} />
          </div>

          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className={classNames(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all',
              'bg-white text-stone-700',
              ' active:bg-stone-100',
              duplicating && 'opacity-50 cursor-not-allowed',
            )}
          >
            <MdContentCopy size={14} />
            <span>{duplicating ? '복제 중...' : '복제'}</span>
          </button>
        </div> */}

        {/* <div className='text-sm leading-snug text-stone-500 pr-12'>{property.address1}</div> */}
        <div className='w-full h-fit flex flex-row justify-between items-start'>
          <div className='w-full h-fit flex flex-col gap-1 justify-start items-start'>
            <div className='text-sm leading-tight text-stone-500 mr-16'>{property.address2}</div>
            <div className='text-lg leading-tight font-medium text-black mr-16'>{property.name}</div>
          </div>
          <OptionTooltip
            onEdit={() => property.onClick?.(property.id)}
            propertyId={property.id}
            onDeleted={property.onRefresh}
          >
            <div className='w-full h-fit px-4 py-3 flex flex-row gap-1 justify-between items-center'>
              <span className='text-sm text-stone-700'>{property.is_visible ? '숙소 게시중' : '숙소 숨김'}</span>
              <ToggleSwitch checked={property.is_visible} onChange={toggleVisibility} />
            </div>

            {/* 복제 버튼 */}
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className={classNames(
                'w-full h-fit flex items-center gap-1 px-2 transition-all',
                'bg-white text-stone-700 text-left text-sm px-4 py-3',
                ' active:bg-stone-100',
                duplicating && 'opacity-50 cursor-not-allowed',
              )}
            >
              <span>{duplicating ? '복제 중...' : '숙소 복제'}</span>
            </button>
          </OptionTooltip>
        </div>
        <div className='w-full h-auto aspect-[3/1] overflow-hidden rounded-md bg-stone-200 mt-1.5'>
          {property.thumbnail ? (
            // 이미지 있음
            <img src={property.thumbnail} alt={property.name} className='w-full h-full object-cover' />
          ) : (
            // 이미지 없음
            <div className='w-full h-full text-sm bg-stone-300 flex items-center justify-center text-stone-500'>
              이미지 없음
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
