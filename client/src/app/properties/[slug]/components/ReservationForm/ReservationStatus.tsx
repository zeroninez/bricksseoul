import { useState } from 'react'

interface PropertyReservation {
  id: number
  start_date: string
  end_date: string
  status: string
}

interface ReservationStatusProps {
  reservations: PropertyReservation[]
}

export const ReservationStatus = ({ reservations }: ReservationStatusProps) => {
  const [showReservations, setShowReservations] = useState(false)

  return (
    <div className='bg-white border-b border-gray-200'>
      <button
        onClick={() => setShowReservations(!showReservations)}
        className='w-full p-6 text-left hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center justify-between'>
          <h4 className='font-medium text-gray-800'>Reservation Status</h4>
          <div className='flex items-center space-x-2'>
            {reservations?.length > 0 && (
              <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium'>
                {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                showReservations ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </div>
        </div>
      </button>

      {showReservations && (
        <div className='px-6 pb-6 border-t border-gray-100'>
          <div className='space-y-3 mt-4'>
            {reservations?.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
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
                        {reservation.status === 'approved' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {new Date(reservation.start_date).toLocaleDateString('en-US')} -{' '}
                      {new Date(reservation.end_date).toLocaleDateString('en-US')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-4 text-gray-500 bg-gray-50 rounded-lg'>
                <p className='text-sm'>No current reservations.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
