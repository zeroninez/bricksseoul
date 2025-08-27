interface ReservationRequest {
  startDate: string
  endDate: string
  requester_email: string
}

interface BookingFormProps {
  formData: ReservationRequest
  isSubmitting: boolean
  error: string | null
  onInputChange: (field: keyof ReservationRequest, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export const BookingForm = ({ formData, isSubmitting, error, onInputChange, onSubmit }: BookingFormProps) => (
  <div className='p-6'>
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 mb-2'>
            Check-in Date
          </label>
          <input
            type='date'
            id='startDate'
            value={formData.startDate}
            onChange={(e) => onInputChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white'
            required
            disabled={isSubmitting}
            placeholder='Select date'
          />
        </div>

        <div>
          <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 mb-2'>
            Check-out Date
          </label>
          <input
            type='date'
            id='endDate'
            value={formData.endDate}
            onChange={(e) => onInputChange('endDate', e.target.value)}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white'
            required
            disabled={isSubmitting}
            placeholder='Select date'
          />
        </div>
      </div>

      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
          Email Address
        </label>
        <input
          type='email'
          id='email'
          value={formData.requester_email}
          onChange={(e) => onInputChange('requester_email', e.target.value)}
          placeholder='your@email.com'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white'
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
            Submitting Request...
          </div>
        ) : (
          'Book Now'
        )}
      </button>
    </form>
  </div>
)
