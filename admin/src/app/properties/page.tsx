// admin/src/app/properties/page.tsx

import { PageHeader } from '@/components'
import { getAllPropertiesFull } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60 // 1분마다 새로고침

export default async function Properties() {
  const properties = await getAllPropertiesFull()

  if (!properties || properties.length === 0) {
    return (
      <section className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
        <p className='text-gray-600'>등록된 숙소가 없습니다.</p>
      </section>
    )
  }

  return (
    <>
      <PageHeader title='Properties 관리' />
      <section className='w-full'>
        <div className='px-4 py-6'>
          <h2 className='text-lg font-semibold mb-4'>등록된 숙소 목록</h2>
          <div className='flex flex-col gap-4'>
            {properties.map((property) => (
              <Link
                href={`/properties/${property.slug}`}
                key={property.id}
                className='active:bg-gray-50 p-4 border rounded-lg hover:bg-gray-50 transition-colors'
              >
                <h3 className='text-md font-medium'>{property.name}</h3>
                <p className='text-sm text-gray-500'>{property.address}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
