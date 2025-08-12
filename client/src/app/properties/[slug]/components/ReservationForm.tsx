// src/components/ReservationForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { createReservationRequest } from '@/lib/supabase'
import { Section } from '@/components'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css' // main css file
import 'react-date-range/dist/theme/default.css' // theme css file

interface ReservationRequest {
  property_id: number
  startDate: string
  endDate: string
  requester_email: string
}

interface Property {
  id: number
  name: string
  payment_link: string
}

interface PropertyReservationFormProps {
  property: Property
}

interface PropertyReservation {
  id: number
  start_date: string
  end_date: string
  status: string
  requester_email?: string
}

interface PropertyCalendarProps {
  reservations: PropertyReservation[]
}

export const ReservationForm = ({ property, reservations }: PropertyReservationFormProps & PropertyCalendarProps) => {
  const [formData, setFormData] = useState<ReservationRequest>({
    property_id: property.id,
    startDate: '',
    endDate: '',
    requester_email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // DateRange 상태 - 초기값을 null로 설정
  const [dateRange, setDateRange] = useState([
    {
      startDate: null as Date | null,
      endDate: null as Date | null,
      key: 'selection',
    },
  ])

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 (시간대 보정)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // DateRange에서 날짜가 변경될 때 formData 업데이트
  useEffect(() => {
    const selection = dateRange[0]

    if (selection.startDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: formatDateToString(selection.startDate!),
      }))
    } else {
      // startDate가 null이면 formData도 비우기
      setFormData((prev) => ({
        ...prev,
        startDate: '',
      }))
    }

    if (selection.endDate) {
      setFormData((prev) => ({
        ...prev,
        endDate: formatDateToString(selection.endDate!),
      }))
    } else {
      // endDate가 null이면 formData도 비우기
      setFormData((prev) => ({
        ...prev,
        endDate: '',
      }))
    }
  }, [dateRange])

  // 예약된 날짜들을 비활성화하기 위한 함수 (시간대 보정)
  const getDisabledDates = () => {
    const disabledDates: Date[] = []

    reservations.forEach((reservation) => {
      if (reservation.status === 'approved') {
        // 문자열을 로컬 시간대의 Date로 변환
        const [startYear, startMonth, startDay] = reservation.start_date.split('-').map(Number)
        const [endYear, endMonth, endDay] = reservation.end_date.split('-').map(Number)

        const start = new Date(startYear, startMonth - 1, startDay)
        const end = new Date(endYear, endMonth - 1, endDay)

        // 예약 기간의 모든 날짜를 비활성화
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          disabledDates.push(new Date(d))
        }
      }
    })

    return disabledDates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.requester_email) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('종료일은 시작일보다 늦어야 합니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createReservationRequest(property.id, formData.startDate, formData.endDate, formData.requester_email)

      setSuccess(true)

      // 결제 링크가 있으면 새 탭에서 열기
      if (property.payment_link) {
        window.open(property.payment_link, '_blank')
      }
    } catch (err) {
      console.error('예약 요청 실패:', err)
      setError('예약 요청에 실패했습니다. 나중에 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ReservationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 폼에서 직접 날짜를 변경했을 때 DateRange도 업데이트 (시간대 보정)
    if (field === 'startDate') {
      if (value) {
        // 로컬 시간대로 날짜 생성 (UTC 변환 방지)
        const [year, month, day] = value.split('-').map(Number)
        const newStartDate = new Date(year, month - 1, day)
        setDateRange((prev) => [
          {
            ...prev[0],
            startDate: newStartDate,
          },
        ])
      } else {
        // 값이 비어있으면 null로 설정
        setDateRange((prev) => [
          {
            ...prev[0],
            startDate: null,
          },
        ])
      }
    }

    if (field === 'endDate') {
      if (value) {
        // 로컬 시간대로 날짜 생성 (UTC 변환 방지)
        const [year, month, day] = value.split('-').map(Number)
        const newEndDate = new Date(year, month - 1, day)
        setDateRange((prev) => [
          {
            ...prev[0],
            endDate: newEndDate,
          },
        ])
      } else {
        // 값이 비어있으면 null로 설정
        setDateRange((prev) => [
          {
            ...prev[0],
            endDate: null,
          },
        ])
      }
    }

    if (error) setError(null) // 입력 시 에러 메시지 제거
  }

  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection])
  }

  // 날짜 리셋 함수
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

  if (success) {
    return (
      <Section>
        <h3 className='text-xl font-semibold mb-2'>Reservation</h3>
        <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
          <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-green-800 mb-2'>예약 요청이 완료되었습니다!</h3>
          <p className='text-green-600'>
            {property.payment_link ? '결제 페이지가 새 탭에서 열렸습니다.' : '곧 연락드리겠습니다.'}
          </p>
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <h3 className='text-xl font-semibold mb-4'>Reservation</h3>

      {/* Date Range Picker */}
      <div className='mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='flex justify-between items-center p-4 border-b border-gray-100'>
          <span className='text-sm font-medium text-gray-700'>날짜 선택</span>
          {(formData.startDate || formData.endDate) && (
            <button
              onClick={resetDates}
              className='text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors'
            >
              초기화
            </button>
          )}
        </div>
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

      {/* 선택된 날짜 표시 */}
      {(formData.startDate || formData.endDate) && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='font-medium text-blue-900 mb-2'>선택된 날짜</h4>
          <div className='text-sm text-blue-700'>
            {formData.startDate ? (
              <span>체크인: {new Date(formData.startDate).toLocaleDateString('ko-KR')}</span>
            ) : (
              <span className='text-gray-500'>체크인: 날짜를 선택해주세요</span>
            )}
            {(formData.startDate || formData.endDate) && <span className='mx-2'>→</span>}
            {formData.endDate ? (
              <span>체크아웃: {new Date(formData.endDate).toLocaleDateString('ko-KR')}</span>
            ) : (
              <span className='text-gray-500'>체크아웃: 날짜를 선택해주세요</span>
            )}
          </div>
          {formData.startDate && formData.endDate && (
            <div className='text-xs text-blue-600 mt-1'>
              총{' '}
              {Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24),
              )}
              박
            </div>
          )}
        </div>
      )}

      {/* 안내 메시지 */}
      {!formData.startDate && !formData.endDate && (
        <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
          <p className='text-sm text-gray-600'>📅 위 달력에서 체크인과 체크아웃 날짜를 선택해주세요.</p>
        </div>
      )}

      {/* 예약 현황 */}
      <div className='mb-6'>
        <h4 className='font-medium mb-3'>예약 현황</h4>
        <div className='space-y-3'>
          {reservations && reservations.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {reservations.map((reservation) => (
                <div key={reservation.id} className='p-3 border border-gray-200 rounded-lg bg-gray-50'>
                  <div className='flex items-center justify-between mb-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {reservation.status === 'approved' ? '확정' : '대기중'}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {new Date(reservation.start_date).toLocaleDateString('ko-KR')} -{' '}
                    {new Date(reservation.end_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6 text-gray-500 bg-gray-50 rounded-lg'>
              <p>현재 예약이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 예약 폼 */}
      <div className='bg-gray-50 p-6 rounded-lg'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='text-lg font-medium text-gray-800 mb-4'>{property.name}</div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 mb-2'>
                체크인 날짜
              </label>
              <input
                type='date'
                id='startDate'
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
                required
                disabled={isSubmitting}
                placeholder='날짜를 선택하세요'
              />
            </div>

            <div>
              <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 mb-2'>
                체크아웃 날짜
              </label>
              <input
                type='date'
                id='endDate'
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
                required
                disabled={isSubmitting}
                placeholder='날짜를 선택하세요'
              />
            </div>
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
              이메일 주소
            </label>
            <input
              type='email'
              id='email'
              value={formData.requester_email}
              onChange={(e) => handleInputChange('requester_email', e.target.value)}
              placeholder='your@email.com'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>{error}</div>}

          <button
            type='submit'
            disabled={isSubmitting || !formData.startDate || !formData.endDate}
            className='w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isSubmitting ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                예약 요청 중...
              </div>
            ) : (
              '예약 요청하기'
            )}
          </button>
        </form>
      </div>
    </Section>
  )
}
