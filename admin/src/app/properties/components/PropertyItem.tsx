'use client'

import Link from 'next/link'
import { useState } from 'react'

import { PropertyListItem } from '@/types/property'
import { DeletePropertyButton } from '@/components/DeletePropertyButton'
import { OptionTooltip } from './OptionTooltip'

export const PropertyItem = (
  property: PropertyListItem & {
    key: string
    onClick?: (propertyId: string) => void
    onDeleted?: () => void
  },
) => {
  const [isShowOptions, setIsShowOptions] = useState(false)
  return (
    <div className='w-full h-fit flex flex-row relative'>
      {/* 정보 */}
      <div
        className='w-full h-fit flex flex-col bg-stone-100 px-4 py-2 rounded-lg gap-1.5 active:bg-stone-200 active:translate-y-0.5 transition-all cursor-pointer'
        onClick={() => {
          property.onClick?.(property.id)
        }}
      >
        <div className='text-lg leading-tight font-medium text-black'>{property.name}</div>

        {/* <div className='text-sm leading-snug text-stone-500 pr-12'>{property.address1}</div> */}
        <div className='text-sm leading-snug text-stone-500 pr-12'>{property.address2}</div>
      </div>
      <OptionTooltip
        onEdit={() => property.onClick?.(property.id)}
        propertyId={property.id}
        onDeleted={property.onDeleted}
      />

      {/* <div className='w-fit h-fit flex-shrink-0 px-4 py-2 border flex flex-col justify-start items-start'>빈객실</div> */}
    </div>
  )
}
