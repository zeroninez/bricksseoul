// src/components/Details.tsx

import { Section } from '@/components'

interface PropertyAmenity {
  icon: string
  name: string
}

interface PropertyDetail {
  detail: {
    description_blocks: string
    nearby_info: string
    amenities: PropertyAmenity[]
  }
}

export const Details = ({ detail }: PropertyDetail) => {
  return (
    <>
      {/* Detailed Information */}
      <Section className='gap-8'>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Description</h3>
          <p className='text-gray-600'>{detail.description_blocks}</p>
        </div>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Nearby</h3>
          <p className='text-gray-600'>{detail.nearby_info}</p>
        </div>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Amenities</h3>
          <div className='flex flex-wrap gap-2'>
            {detail.amenities.map((amenity: PropertyAmenity, index: number) => (
              <span key={index} className='inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-sm'>
                <span>{amenity.icon}</span>
                <span>{amenity.name}</span>
              </span>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
