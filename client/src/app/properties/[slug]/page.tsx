// src/app/properties/[slug]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { getPropertyBySlug } from '@/lib/supabase'
import { ImageSlider, Details, ReservationForm, Location } from './components'
import { Summary } from './components/Summary'

export default function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const [property, setProperty] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resolvedParams = use(params)
  const propertySlug = resolvedParams.slug

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        const data = await getPropertyBySlug(propertySlug)
        setProperty(data)
      } catch (err) {
        console.error('Property fetch error:', err)
        setError('숙소 정보를 불러오는 데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (propertySlug) {
      fetchProperty()
    }
  }, [propertySlug])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-500'>Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>Error</h2>
          <p className='text-red-500'>{error || 'Could not find property.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Image Slider */}
      <ImageSlider images={property.images} propertyName={property.name} />

      {/* Basic Info */}
      <Summary property={property} />

      {/* Detailed Information */}
      <Details detail={property.detail} />

      {/* Location */}
      <Location latitude={property.latitude} longitude={property.longitude} />

      {/* Reservation Form */}
      <ReservationForm reservations={property.reservations} property={property} />
    </div>
  )
}
