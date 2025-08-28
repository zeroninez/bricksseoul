// admin/src/app/properties/page.tsx

import { Breadcrumbs, Empty } from '@/components'
import { getAllProperties } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60 // 1분마다 새로고침

export default async function Properties() {
  const properties = await getAllProperties()

  return (
    <>
      <section className='w-full h-fit pt-8 px-4 pb-4 flex flex-col gap-4'>
        <Breadcrumbs />
      </section>
      <section className='w-full'>
        {!properties || properties.length === 0 ? (
          <Empty />
        ) : (
          <div className='px-4 py-6'>
            <div className='flex flex-col gap-4'>
              {properties.map((property) => (
                <Link
                  href={`/properties/${property.slug}`}
                  key={property.slug}
                  className='active:opacity-50 flex px-6 py-4 flex-col aspect-landscape relative overflow-hidden hover:opacity-50 transition-all'
                >
                  {property.thumbnail && (
                    <img
                      src={property.thumbnail.src!}
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
