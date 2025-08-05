'use client'

// admin/src/app/properties/[id]/page.tsx
import { useState, useEffect, use } from 'react'
import { getAllPropertiesFull, updateProperty } from '@/lib/supabase'
import { Breadcrumbs } from '@/components'
import { TbEye, TbEdit, TbCheck, TbX } from 'react-icons/tb'

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [draftProperty, setDraftProperty] = useState<any | null>(null)

  // React.use()를 사용해서 params Promise를 unwrap
  const resolvedParams = use(params)
  const propertyId = parseInt(resolvedParams.id, 10)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getAllPropertiesFull()
        setProperty(data.find((p) => p.id === propertyId) || null)
        setDraftProperty(data.find((p) => p.id === propertyId) || null)
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

  const resetDraft = () => {
    setDraftProperty({ ...property })
    setIsEditing(false)
  }

  const saveDraft = async () => {
    try {
      await updateProperty({
        propertyId: property.id,
        property: {
          name: draftProperty.name,
          address: draftProperty.address,
          description: draftProperty.description,
          latitude: draftProperty.latitude,
          longitude: draftProperty.longitude,
          features: draftProperty.features,
          payment_link: draftProperty.payment_link,
        },
      })
      setProperty({ ...draftProperty })
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving property:', err)
      setError('숙소 정보를 저장하는 데 실패했습니다.')
    }
  }

  return (
    <>
      <Breadcrumbs />
      <div className='w-full flex flex-row px-4 py-6 items-center justify-between'>
        <button
          disabled={!isEditing}
          onClick={() => setIsEditing(false)}
          className='disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
        >
          Preview
        </button>
        <button
          disabled={isEditing}
          onClick={() => setIsEditing(true)}
          className='disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
        >
          Edit
        </button>
        <button
          onClick={resetDraft}
          className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
        >
          Reset
        </button>
        <button
          onClick={saveDraft}
          disabled={!isEditing}
          className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
        >
          Save
        </button>
      </div>
      <section className='max-w-4xl mx-auto px-4 py-6'>
        <h2 className='text-xl font-semibold mt-6'>Images</h2>
        <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {property.images.map((image: { id: number; url: string; name: string }) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.name || 'Property Image'}
              className='w-full h-auto rounded-lg shadow-md'
            />
          ))}
        </div>
        <h2 className='text-xl font-semibold mt-6'>Information</h2>
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <input
              required
              type='text'
              className='w-full text-2xl font-bold border-b border-gray-300 focus:border-black'
              value={draftProperty.name}
              onChange={(e) => setDraftProperty({ ...draftProperty, name: e.target.value })}
            />
          ) : (
            <h1 className='w-full text-2xl font-bold'>{draftProperty.name}</h1>
          )}
        </div>
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <input
              required
              type='text'
              className='w-full border-b border-gray-300 focus:border-black'
              value={draftProperty.address}
              onChange={(e) => setDraftProperty({ ...draftProperty, address: e.target.value })}
            />
          ) : (
            <p className='w-full text-gray-700'>{property.address}</p>
          )}
        </div>
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <textarea
              required
              className='w-full h-24 p-2 border border-gray-300 focus:border-black'
              value={draftProperty.description}
              onChange={(e) => setDraftProperty({ ...draftProperty, description: e.target.value })}
            />
          ) : (
            <p className='w-full text-gray-700'>{draftProperty.description}</p>
          )}
        </div>
        <div className='flex flex-row items-center gap-4 mt-4'>
          {property.features.map((feature: any, index: number) => (
            <span key={index} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
              {feature.icon} {feature.name}
            </span>
          ))}
        </div>
        <h2 className='text-xl font-semibold mt-6'>Details</h2>
        <div className='mt-4'>
          {property.detail ? (
            <>
              <h3 className='text-lg font-medium'>{property.detail.description_blocks}</h3>
              <p className='text-gray-600'>{property.detail.nearby_info}</p>
              <div className='mt-2'>
                {property.detail.amenities.map((amenity: any) => (
                  <span
                    key={amenity.name}
                    className='inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 mr-2 mb-2 text-sm'
                  >
                    {amenity.icon} {amenity.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className='text-gray-500'>No details available for this property.</p>
          )}
        </div>
        <h2 className='text-xl font-semibold mt-6'>Calendar</h2>
        <div className='mt-4'>
          {property.reservations ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {property.reservations.map((reservation: any) => (
                <div key={reservation.id} className='p-4 border rounded-lg shadow-sm'>
                  <h3 className='text-md font-medium'>{reservation.title}</h3>
                  <p className='text-sm text-gray-600'>
                    {new Date(reservation.start_date).toLocaleDateString()} -{' '}
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-500'>No calendar data available for this property.</p>
          )}
        </div>
        <h2 className='text-xl font-semibold mt-6'>Location</h2>
        <div className='mt-4'>
          <p className='text-gray-600'>Latitude: {property.latitude}</p>
          <p className='text-gray-600'>Longitude: {property.longitude}</p>
        </div>
        <h2 className='text-xl font-semibold mt-6'>Purchase</h2>
      </section>
    </>
  )
}
