// admin/src/app/properties/page.tsx

import { PageHeader } from '@/components'
import { getAllPropertiesFull } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60 // 1분마다 새로고침

export default async function Properties() {
  const properties = await getAllPropertiesFull()

  return (
    <>
      <PageHeader title='Properties' />
      <section className='w-full'>
        {!properties || properties.length === 0 ? (
          <section className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
            <p className='text-gray-600'>등록된 숙소가 없습니다.</p>
          </section>
        ) : (
          <div className='px-4 py-6'>
            <div className='flex flex-col gap-4'>
              {properties.map((property) => (
                <Link
                  href={`/properties/${property.slug}`}
                  key={property.slug}
                  className='active:opacity-50 flex px-6 py-4 flex-col aspect-landscape relative overflow-hidden hover:opacity-50 transition-all'
                >
                  {property.images.length > 0 && (
                    <img
                      src={property.images[0].src!}
                      alt={property.name}
                      className='w-full h-auto absolute top-0 left-0 '
                    />
                  )}
                  <h3 className='text-xl font-medium mix-blend-difference text-white z-10'>{property.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
