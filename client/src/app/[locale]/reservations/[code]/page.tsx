'use client'

import { useParams, useRouter } from 'next/navigation'
import { useReservationByCode } from '@/hooks/useReservation'
import { PageStart } from '@/components'
import { formatCurrency, formatDate } from '@/utils'
import { FiCalendar, FiUsers, FiMapPin, FiMail, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { useEffect } from 'react'

export default function ReservationDetailPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
  const { data: reservation, isLoading, error } = useReservationByCode(code)

  if (isLoading) {
    return (
      <>
        <PageStart />
        <div className='w-full min-h-[80vh] flex items-center justify-center'>
          <div className='text-stone-500'>Loading reservation...</div>
        </div>
      </>
    )
  }

  if (error || !reservation) {
    return (
      <>
        <PageStart />
        <div className='w-full min-h-[80vh] flex flex-col items-center justify-center p-5 gap-6'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center'>
            <FiXCircle className='w-12 h-12 text-red-600' />
          </div>
          <div className='text-center space-y-2'>
            <h1 className='text-2xl font-bold text-stone-900'>Reservation Not Found</h1>
            <p className='text-stone-600'>
              We couldn&apos;t find a reservation with code: <strong>{code}</strong>
            </p>
          </div>
          <button
            onClick={() => router.push('/reservations/check')}
            className='bg-black text-white rounded-xl px-6 py-3 font-medium active:scale-95 transition-all'
          >
            Try Again
          </button>
        </div>
      </>
    )
  }

  const getStatusBadge = () => {
    switch (reservation.status) {
      case 'confirmed':
        return (
          <div className='flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium'>
            <FiCheckCircle className='w-4 h-4' />
            <span>Confirmed</span>
          </div>
        )
      case 'cancelled':
        return (
          <div className='flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium'>
            <FiXCircle className='w-4 h-4' />
            <span>Cancelled</span>
          </div>
        )
      case 'requested':
        return (
          <div className='flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium'>
            <FiClock className='w-4 h-4' />
            <span>Pending</span>
          </div>
        )
    }
  }

  const dayCount = Math.ceil(
    (new Date(reservation.check_out_date).getTime() - new Date(reservation.check_in_date).getTime()) /
      (1000 * 3600 * 24),
  )

  return (
    <>
      <PageStart />
      <div className='w-full h-fit p-5 pb-20 flex flex-col gap-6'>
        {/* Header */}
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-stone-900'>Reservation Details</h1>
            {getStatusBadge()}
          </div>
          <div className='text-sm text-stone-500'>
            Code: <span className='font-mono font-bold text-stone-900'>{reservation.reservation_code}</span>
          </div>
        </div>

        {/* Property Info */}
        <div className='w-full bg-primary/10 p-4 rounded-lg flex gap-4'>
          <div className='w-24 h-24 bg-black/10 rounded-lg overflow-hidden flex-shrink-0'>
            {reservation.property.thumbnail ? (
              <img
                src={reservation.property.thumbnail}
                alt={reservation.property.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-stone-400'>No image</div>
            )}
          </div>
          <div className='flex-1 flex flex-col gap-1'>
            <h2 className='text-lg font-bold text-stone-900'>{reservation.property.name}</h2>
            <div className='flex items-start gap-1 text-sm text-stone-600'>
              <FiMapPin className='w-4 h-4 mt-0.5 flex-shrink-0' />
              <span>
                {reservation.property.address.address1}
                {reservation.property.address.address2 && `, ${reservation.property.address.address2}`}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className='w-full space-y-4'>
          <h3 className='text-lg font-bold text-stone-900'>Booking Information</h3>

          <div className='space-y-3'>
            {/* Dates */}
            <div className='flex items-start gap-3 p-3 bg-stone-50 rounded-lg'>
              <FiCalendar className='w-5 h-5 text-stone-600 mt-0.5' />
              <div className='flex-1'>
                <div className='text-sm text-stone-600'>Check-in / Check-out</div>
                <div className='font-medium text-stone-900'>
                  {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                </div>
                <div className='text-sm text-stone-500'>{dayCount} nights</div>
              </div>
            </div>

            {/* Guests */}
            <div className='flex items-start gap-3 p-3 bg-stone-50 rounded-lg'>
              <FiUsers className='w-5 h-5 text-stone-600 mt-0.5' />
              <div className='flex-1'>
                <div className='text-sm text-stone-600'>Guests</div>
                <div className='font-medium text-stone-900'>{reservation.guest_count} guest(s)</div>
              </div>
            </div>

            {/* Email */}
            <div className='flex items-start gap-3 p-3 bg-stone-50 rounded-lg'>
              <FiMail className='w-5 h-5 text-stone-600 mt-0.5' />
              <div className='flex-1'>
                <div className='text-sm text-stone-600'>Email</div>
                <div className='font-medium text-stone-900'>{reservation.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.special_requests && (
          <div className='w-full space-y-2'>
            <h3 className='text-lg font-bold text-stone-900'>Special Requests</h3>
            <div className='p-4 bg-stone-50 rounded-lg text-stone-700'>{reservation.special_requests}</div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className='w-full space-y-2'>
          <h3 className='text-lg font-bold text-stone-900'>Price Details</h3>
          {reservation.invoice ? (
            <div dangerouslySetInnerHTML={{ __html: reservation.invoice }} />
          ) : (
            // fallback: invoice가 없으면 기본 가격 정보 표시
            <div className='bg-primary/10 rounded-lg p-4 space-y-3'>
              <div className='flex justify-between'>
                <span className='text-stone-600'>
                  {formatCurrency(reservation.property.price_per_night, reservation.property.currency)} x {dayCount}{' '}
                  nights
                </span>
                <span className='font-medium text-stone-900'>
                  {formatCurrency(reservation.property.price_per_night * dayCount, reservation.property.currency)}
                </span>
              </div>
              <div className='w-full h-px bg-stone-400' />
              <div className='flex justify-between text-lg'>
                <span className='font-bold text-stone-900'>Total</span>
                <span className='font-bold text-stone-900'>
                  {formatCurrency(reservation.total_price, reservation.property.currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className='w-full text-xs text-stone-500 space-y-1'>
          <div>Booked: {new Date(reservation.created_at).toLocaleString()}</div>
          {reservation.confirmed_at && <div>Confirmed: {new Date(reservation.confirmed_at).toLocaleString()}</div>}
          {reservation.cancelled_at && <div>Cancelled: {new Date(reservation.cancelled_at).toLocaleString()}</div>}
        </div>

        {/* Actions */}
        <button
          onClick={() => router.push('/')}
          className='w-full bg-black text-white rounded-xl px-6 py-4 font-medium active:scale-95 transition-all'
        >
          Back to Home
        </button>
      </div>
    </>
  )
}
