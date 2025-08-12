// src/components/Location.tsx

import { Section } from '@/components'

interface PropertyLocationProps {
  latitude: number
  longitude: number
}

export const Location = ({ latitude, longitude }: PropertyLocationProps) => {
  return (
    <Section>
      <h3 className='text-xl font-semibold mb-2'>Location</h3>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium text-gray-700'>Latitude:</span>
            <span className='ml-2 text-gray-600'>{latitude.toFixed(6)}</span>
          </div>
          <div>
            <span className='font-medium text-gray-700'>Longitude:</span>
            <span className='ml-2 text-gray-600'>{longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
