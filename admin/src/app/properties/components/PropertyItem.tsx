// admin/src/app/properties/components/PropertyItem.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MdContentCopy } from 'react-icons/md'

import { PropertyListItem } from '@/types/property'
import { ToggleSwitch } from '@/components'
import { OptionTooltip } from './OptionTooltip'

export const PropertyItem = (
  property: PropertyListItem & {
    key: string
    onClick?: (propertyId: string) => void
    onRefresh?: () => void
  },
) => {
  const [loading, setLoading] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  return (
    <>
      <div
        className='w-full h-fit flex flex-col bg-white p-4 border border-[#E9E9E9] rounded-xl gap-4 cursor-pointer'
        onClick={() => {
          property.onClick?.(property.id)
        }}
      >
        <div className='w-full h-auto aspect-[3/1] overflow-hidden rounded-md bg-stone-200'>
          {property.thumbnail ? (
            // 이미지 있음
            <img src={property.thumbnail} alt={property.name} className='w-full h-full object-cover' />
          ) : (
            // 이미지 없음
            <div className='w-full h-full text-xs bg-stone-300 flex items-center justify-center text-stone-500'>
              이미지 없음
            </div>
          )}
        </div>

        <div className='w-full h-fit flex flex-row justify-between items-start'>
          <div className='w-full h-fit flex flex-col gap-1 justify-start items-start'>
            <div className='text-sm leading-tight text-stone-500 mr-16'>{property.address2}</div>
            <div className='text-lg leading-tight font-medium text-black mr-16'>{property.name}</div>
            <div className='text-xs leading-snug text-stone-500 pr-12'>{property.address1}</div>
          </div>
          <OptionTooltip
            onEdit={() => property.onClick?.(property.id)}
            property={property}
            onRefresh={property.onRefresh}
          />
        </div>
        <div className='w-full h-fit flex flex-row justify-between items-center'>
          {property.is_visible ? (
            <div className='text-xs text-green-600 font-medium'>게시됨</div>
          ) : (
            <div className='text-xs text-stone-400 font-medium'>숨김 처리됨</div>
          )}
          {/* 수정된 시간 */}
          <div className='w-fit text-right text-xs text-stone-400 font-medium'>
            마지막 수정:{' '}
            {new Date(property.updated_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </>
  )
}
