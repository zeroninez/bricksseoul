'use client'

import Link from 'next/link'
import { useState } from 'react'

import { PropertyListItem } from '@/types/property'

export const PropertyItem = (property: PropertyListItem & { key: string }) => {
  return (
    <div className='w-full h-fit flex flex-row gap-2 relative'>
      {/* 정보 */}
      <div className='w-full h-fit flex flex-col gap-1.5 px-1'>
        <div className='text-lg leading-tight font-medium text-black'>{property.name}</div>

        {/* <div className='text-sm leading-snug text-stone-500 pr-12'>{property.address1}</div> */}
        <div className='text-sm leading-snug text-stone-500 pr-12'>{property.address2}</div>
      </div>
      <div className='w-fit h-fit flex-shrink-0 px-4 py-2 border flex flex-col justify-start items-start'>빈객실</div>
    </div>
  )
}
