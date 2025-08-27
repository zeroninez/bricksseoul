// components/ReservationForm.tsx
'use client'

import { Section } from '@/components'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

import { useReservationForm } from '@/hooks/useReservationForm'
import { ReservationSuccessMessage } from './ReservationSuccessMessage'
import { ReservationHeader } from './ReservationHeader'
import { ReservationStatus } from './ReservationStatus'
import { BookingForm } from './BookingForm'

interface Property {
  id: number
  name: string
  payment_link: string
}

interface PropertyReservation {
  id: number
  start_date: string
  end_date: string
  status: string
  requester_email?: string
}

interface ReservationFormProps {
  property: Property
  reservations: PropertyReservation[]
}

export const ReservationForm = ({ property, reservations }: ReservationFormProps) => {
  const {
    formData,
    dateRange,
    isSubmitting,
    error,
    success,
    getDisabledDates,
    setDefaultDates,
    handleInputChange,
    handleDateRangeChange,
    handleSubmit,
  } = useReservationForm(property, reservations)

  if (success) {
    return <ReservationSuccessMessage property={property} />
  }

  return (
    <Section>
      <h3 className='text-xl font-semibold mb-4'>Reservation</h3>

      <div className='bg-gray-50 rounded-lg overflow-hidden border border-gray-200'>
        <ReservationHeader
          propertyName={property.name}
          startDate={formData.startDate}
          endDate={formData.endDate}
          onClear={setDefaultDates}
        />

        <div className='bg-white border-b border-gray-200'>
          <DateRange
            editableDateInputs={true}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            //@ts-ignore
            ranges={dateRange}
            minDate={new Date()}
            disabledDates={getDisabledDates()}
            rangeColors={['#000000']}
            className='w-full'
            showSelectionPreview={true}
            showDateDisplay={false}
          />
        </div>

        <ReservationStatus reservations={reservations} />

        <BookingForm
          formData={formData}
          isSubmitting={isSubmitting}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
    </Section>
  )
}
