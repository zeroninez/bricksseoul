interface ReservationHeaderProps {
  propertyName: string
  startDate: string
  endDate: string
  onClear: () => void
}

export const ReservationHeader = ({ propertyName, startDate, endDate, onClear }: ReservationHeaderProps) => (
  <div className='bg-white border-b border-gray-200 p-6'>
    <div className='flex justify-between items-center mb-4 gap-4'>
      <h4 className='w-full flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold text-gray-800'>
        {propertyName}
      </h4>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className='text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full border border-gray-300 hover:border-gray-400 transition-colors'
        >
          Clear
        </button>
      )}
    </div>

    {(startDate || endDate) && (
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-blue-700 flex flex-col justify-center items-start'>
            {startDate ? (
              <span className='font-medium'>Check-in: {new Date(startDate).toLocaleDateString('en-US')} →</span>
            ) : (
              <span className='text-gray-500'>Check-in: Please select a date</span>
            )}
            {endDate ? (
              <span className='font-medium'>Check-out: {new Date(endDate).toLocaleDateString('en-US')}</span>
            ) : (
              <span className='text-gray-500'>Check-out: Please select a date</span>
            )}
          </div>
          {startDate && endDate && (
            <div className='bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
              {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}{' '}
              {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) === 1
                ? 'night'
                : 'nights'}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
