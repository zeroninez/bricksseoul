'use client'

//src/app/properties/[id]/page.tsx
import { useState, useEffect, use } from 'react'
import { Property, loadProperty } from '@/lib/supabase'
import { Breadcrumbs } from '@/components'

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // React.use()를 사용해서 params Promise를 unwrap
  const resolvedParams = use(params)
  const propertyId = parseInt(resolvedParams.id, 10)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await loadProperty(propertyId)
        setProperty(data)
      } catch (err) {
        setError('숙소 정보를 불러오는 데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  if (loading) {
    return <p className='text-gray-500'>로딩 중...</p>
  }

  if (error) {
    console.error('Error fetching property:', error)
    return <p className='text-red-500'>Property not found</p>
  }

  if (!property) {
    return <p className='text-red-500'>Property not found</p>
  }

  return (
    <>
      <Breadcrumbs />
      <section className='max-w-4xl mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold mb-4'>{property.title}</h1>
        <p className='text-gray-700 mb-2'>{property.location}</p>
        <div className='mb-4'>
          {property.featured_image_url && (
            <img src={property.featured_image_url} alt={property.title} className='w-full h-auto rounded-lg' />
          )}
        </div>
        <div className='prose'>
          <p>{property.description}</p>
          <div dangerouslySetInnerHTML={{ __html: property.content || '' }} />
        </div>
      </section>
    </>
  )
}
