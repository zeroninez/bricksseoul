import { Section } from '@/components'

interface ReservationSuccessMessageProps {
  property: { payment_link: string }
}

export const ReservationSuccessMessage = ({ property }: ReservationSuccessMessageProps) => (
  <Section>
    <h3 className='text-xl font-semibold mb-2'>Reservation</h3>
    <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
      <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
        <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-green-800 mb-2'>Reservation Request Completed!</h3>
      <p className='text-green-600'>
        {property.payment_link ? 'Payment page has opened in a new tab.' : 'We will contact you soon.'}
      </p>
    </div>
  </Section>
)
