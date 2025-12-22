'use client'

import { Input, TextArea, PageStart, FormLabel, Invoice, generateInvoiceHTML } from '@/components'
import { usePropertyGet } from '@/hooks/useProperty'
import { useRouter } from '@/i18n/routing'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { formatCurrency, formatDate } from '@/utils'
import { ReservationButton } from '../components'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReservationPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = usePropertyGet(id)

  const params = useSearchParams()
  const moveInDate = params.get('in')!
  const moveOutDate = params.get('out')!

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bookingForm, setBookingForm] = useState<{
    email: string
    guest_count: number
    check_in_date: string
    check_out_date: string
    total_price: number
    special_requests: string
    options: { key: string; name: string; price: number; num: number }[] | []
  }>({
    email: '',
    guest_count: 1,
    check_in_date: moveInDate,
    check_out_date: moveOutDate,
    total_price: 0,
    special_requests: '',
    options: [],
  })

  const dayCount = Math.ceil((new Date(moveOutDate).getTime() - new Date(moveInDate).getTime()) / (1000 * 3600 * 24))

  useEffect(() => {
    // Calculate total amount based on move-in and move-out dates
    if (!data) return

    setBookingForm((prev) => ({
      ...prev,
      check_in_date: moveInDate,
      check_out_date: moveOutDate,
      total_price: dayCount * data.price_per_night,
    }))
  }, [moveInDate, moveOutDate, data, dayCount])

  const invoiceHTML = generateInvoiceHTML({
    pricePerNight: data?.price_per_night || 0,
    currency: data?.currency || 'USD',
    nights: dayCount,
    totalPrice: bookingForm.total_price,
  })

  const handleConfirmBooking = async () => {
    // 이메일 검증
    if (!bookingForm.email) {
      alert('Please enter your email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingForm.email)) {
      alert('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: id,
          email: bookingForm.email,
          guest_count: bookingForm.guest_count,
          check_in_date: bookingForm.check_in_date,
          check_out_date: bookingForm.check_out_date,
          total_price: bookingForm.total_price,
          invoice: invoiceHTML, // useMemo로 생성된 invoice 사용
          special_requests: bookingForm.special_requests,
          options: bookingForm.options,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // 예약 성공 - 성공 페이지로 이동
        router.push(`/properties/${id}/reservation/success?code=${result.data.reservation_code}`)
      } else {
        // 예약 실패 - 실패 페이지로 이동
        const failureUrl = new URL(`/properties/${id}/reservation/failed`, window.location.origin)
        failureUrl.searchParams.set('reason', result.error || 'Unknown error')

        // conflicts 정보가 있으면 추가
        if (result.conflicts) {
          failureUrl.searchParams.set('conflicts', JSON.stringify(result.conflicts))
        }

        router.push(failureUrl.pathname + failureUrl.search)
      }
    } catch (error) {
      console.error('Booking error:', error)
      // 네트워크 에러 등 - 실패 페이지로 이동
      router.push(`/properties/${id}/reservation/failed?reason=${encodeURIComponent('Network error occurred')}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (data === undefined || isLoading) {
    return <div className='w-full h-full flex justify-center items-center'>Loading...</div>
  }

  if (error) {
    return <div className='w-full h-full flex justify-center items-center'>Error loading property data.</div>
  }

  return (
    <>
      <PageStart />
      <div className='w-full h-fit p-4 mb-20 flex flex-col justify-start items-center gap-8'>
        <div className='w-full h-fit mb-2 flex flex-row gap-3 bg-primary/10 p-2 rounded-lg justify-between items-start'>
          <div className='w-28 h-20 bg-black/10 rounded-lg overflow-hidden'>
            <img
              src={data.images && data.images.length > 0 ? data.images[0].url : ''}
              alt={data.name}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='w-full h-fit flex flex-col gap-0.5 justify-center items-start'>
            <div className='w-full text-base leading-tight font-bold mb-1 text-stone-800'>{data.name}</div>
            <div className='w-full text-sm leading-tight text-stone-700'>{data.address?.address1}</div>
            <div className='w-full text-sm leading-tight text-stone-600'>{data.address?.address2}</div>
          </div>
        </div>

        {/* Email Input */}
        <FormLabel title='Email' description='Email is required to verify your booking.'>
          <Input
            type='email'
            placeholder='Enter your email'
            value={bookingForm.email}
            setValue={(value) => setBookingForm({ ...bookingForm, email: value })}
          />
        </FormLabel>

        {/* Guest Count Input */}
        <FormLabel title='Number of Guests' description='How many guests will be staying?'>
          <Input
            type='number'
            placeholder='Enter number of guests'
            value={bookingForm.guest_count.toString()}
            setValue={(value) => setBookingForm({ ...bookingForm, guest_count: Math.max(1, parseInt(value) || 1) })}
          />
        </FormLabel>

        {/* Special Requests Textarea */}
        <FormLabel title='Special Requests' description='Any special requests? (Optional)'>
          <TextArea
            placeholder='Enter any special requests'
            value={bookingForm.special_requests}
            setValue={(value) => setBookingForm({ ...bookingForm, special_requests: value })}
            rows={4}
          />
        </FormLabel>

        {/* Total Cost */}
        <FormLabel title='Total Cost' description='No refunds after booking is confirmed.'>
          <Invoice
            pricePerNight={data.price_per_night}
            currency={data.currency}
            nights={dayCount}
            totalPrice={bookingForm.total_price}
          />
        </FormLabel>
        <ReservationButton
          data={data}
          moveInDate={moveInDate}
          moveOutDate={moveOutDate}
          action={{
            label: isSubmitting ? 'Submitting...' : 'Confirm',
            onClick: handleConfirmBooking,
          }}
        />
      </div>

      {/* 로딩 모달 */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-[100000] flex items-center justify-center'
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='bg-white rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4'
            >
              <div className='w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin' />
              <div className='text-center space-y-2'>
                <h3 className='text-xl font-bold text-stone-900'>Processing your booking</h3>
                <p className='text-sm text-stone-600'>Please wait while we confirm your reservation...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
