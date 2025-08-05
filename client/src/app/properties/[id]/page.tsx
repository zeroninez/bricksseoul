'use client'

//src/app/properties/[id]/page.tsx
import { useState, useEffect, use } from 'react'
import { getAllPropertiesFull, createReservationRequest } from '@/lib/supabase'
import { Breadcrumbs } from '@/components'

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reservationRequest, setReservationRequest] = useState({
    property_id: 0,
    startDate: '',
    endDate: '',
    requester_email: '',
  })

  const handleReservationRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservationRequest.startDate || !reservationRequest.endDate || !reservationRequest.requester_email) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    try {
      await createReservationRequest(
        property.id,
        reservationRequest.startDate,
        reservationRequest.endDate,
        reservationRequest.requester_email,
      )
      alert('예약 요청이 성공적으로 제출되었습니다.')
      // 결제 링크로 이동
      window.open(`${property?.payment_link ?? ''}`, '_blank')
    } catch (err) {
      console.error('예약 요청 실패:', err)
      setError('예약 요청에 실패했습니다. 나중에 다시 시도해주세요.')
    }
  }

  // React.use()를 사용해서 params Promise를 unwrap
  const resolvedParams = use(params)
  const propertyId = parseInt(resolvedParams.id, 10)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getAllPropertiesFull()
        setProperty(data.find((p) => p.id === propertyId) || null)
        setReservationRequest((prev) => ({
          ...prev,
          property_id: propertyId,
        }))
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
        <h1 className='text-2xl font-bold mb-4'>{property.name}</h1>
        <p className='text-gray-700 mb-2'>{property.address}</p>
        <p>{property.description}</p>
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
        <div className='mt-4'>
          <span className='text-lg font-bold'>Request Form</span>
          <form onSubmit={handleReservationRequest} className='mt-4 space-y-4'>
            <div className='block text-sm font-medium text-gray-700 mb-2'>{property.name}</div>
            <div>
              <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 mb-2'>
                Start Date
              </label>
              <input
                type='date'
                id='startDate'
                value={reservationRequest.startDate}
                onChange={(e) => setReservationRequest({ ...reservationRequest, startDate: e.target.value })}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-black focus:border-black'
                required
              />
            </div>
            <div>
              <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 mb-2'>
                End Date
              </label>
              <input
                type='date'
                id='endDate'
                value={reservationRequest.endDate}
                onChange={(e) =>
                  setReservationRequest({
                    ...reservationRequest,
                    endDate: e.target.value,
                  })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring focus:ring-black focus:border-black'
                required
              />
            </div>
            <div>
              <label htmlFor='requester_email' className='block text-sm font-medium text-gray-700 mb-2'>
                Your Email
              </label>
              <input
                type='email'
                id='requester_email'
                value={reservationRequest.requester_email}
                onChange={(e) =>
                  setReservationRequest({
                    ...reservationRequest,
                    requester_email: e.target.value,
                  })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-black focus:border-black'
                required
              />
            </div>
            {error && <p className='text-red-500'>{error}</p>}
            <button
              type='submit'
              className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
            >
              Purchase Now
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
