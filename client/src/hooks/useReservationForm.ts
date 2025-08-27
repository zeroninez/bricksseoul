// src/hooks/useReservationForm.ts
import { useState, useEffect } from 'react'
import { createReservationRequest } from '@/lib/supabase'

interface ReservationRequest {
  property_id: number
  startDate: string
  endDate: string
  requester_email: string
}

interface PropertyReservation {
  id: number
  start_date: string
  end_date: string
  status: string
  requester_email?: string
}

interface Property {
  id: number
  name: string
  payment_link: string
}

export const useReservationForm = (property: Property, reservations: PropertyReservation[]) => {
  const [formData, setFormData] = useState<ReservationRequest>({
    property_id: property.id,
    startDate: '',
    endDate: '',
    requester_email: '',
  })

  const [dateRange, setDateRange] = useState([
    {
      startDate: null as Date | null,
      endDate: null as Date | null,
      key: 'selection',
    },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDisabledDates = () => {
    const disabledDates: Date[] = []

    reservations.forEach((reservation) => {
      if (reservation.status === 'approved') {
        const [startYear, startMonth, startDay] = reservation.start_date.split('-').map(Number)
        const [endYear, endMonth, endDay] = reservation.end_date.split('-').map(Number)

        const start = new Date(startYear, startMonth - 1, startDay)
        const end = new Date(endYear, endMonth - 1, endDay)

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          disabledDates.push(new Date(d))
        }
      }
    })

    return disabledDates
  }

  const findNearestAvailableDate = () => {
    const disabledDates = getDisabledDates()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let checkDate = new Date(today)

    for (let i = 0; i < 365; i++) {
      const isDisabled = disabledDates.some((disabledDate) => {
        const normalizedDisabled = new Date(disabledDate)
        normalizedDisabled.setHours(0, 0, 0, 0)
        return normalizedDisabled.getTime() === checkDate.getTime()
      })

      if (!isDisabled) {
        const nextDate = new Date(checkDate)
        nextDate.setDate(nextDate.getDate() + 1)

        const isNextDayDisabled = disabledDates.some((disabledDate) => {
          const normalizedDisabled = new Date(disabledDate)
          normalizedDisabled.setHours(0, 0, 0, 0)
          return normalizedDisabled.getTime() === nextDate.getTime()
        })

        if (!isNextDayDisabled) {
          return { startDate: new Date(checkDate), endDate: nextDate }
        }
      }

      checkDate.setDate(checkDate.getDate() + 1)
    }

    return null
  }

  const setDefaultDates = () => {
    const availableDates = findNearestAvailableDate()

    if (availableDates) {
      const startDateStr = formatDateToString(availableDates.startDate)
      const endDateStr = formatDateToString(availableDates.endDate)

      setFormData((prev) => ({
        ...prev,
        startDate: startDateStr,
        endDate: endDateStr,
      }))

      setDateRange([
        {
          startDate: availableDates.startDate,
          endDate: availableDates.endDate,
          key: 'selection',
        },
      ])
    }
  }

  const resetDates = () => {
    setDateRange([
      {
        startDate: null,
        endDate: null,
        key: 'selection',
      },
    ])
    setFormData((prev) => ({
      ...prev,
      startDate: '',
      endDate: '',
    }))
  }

  const handleInputChange = (field: keyof ReservationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'startDate' || field === 'endDate') {
      const dateValue = value
        ? (() => {
            const [year, month, day] = value.split('-').map(Number)
            return new Date(year, month - 1, day)
          })()
        : null

      setDateRange((prev) => [
        {
          ...prev[0],
          [field]: dateValue,
        },
      ])
    }

    if (error) setError(null)
  }

  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.requester_email) {
      setError('Please fill in all fields.')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Check-out date must be later than check-in date.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createReservationRequest(property.id, formData.startDate, formData.endDate, formData.requester_email)

      setSuccess(true)

      if (property.payment_link) {
        window.open(property.payment_link, '_blank')
      }
    } catch (err) {
      console.error('Reservation request failed:', err)
      setError('Failed to submit reservation request. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize default dates
  useEffect(() => {
    setDefaultDates()
  }, [reservations])

  // Sync dateRange with formData
  useEffect(() => {
    const selection = dateRange[0]

    setFormData((prev) => ({
      ...prev,
      startDate: selection.startDate ? formatDateToString(selection.startDate) : '',
      endDate: selection.endDate ? formatDateToString(selection.endDate) : '',
    }))
  }, [dateRange])

  return {
    formData,
    dateRange,
    isSubmitting,
    error,
    success,
    getDisabledDates,
    setDefaultDates,
    resetDates,
    handleInputChange,
    handleDateRangeChange,
    handleSubmit,
  }
}
