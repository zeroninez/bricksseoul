// src/components/Details.tsx

import { Section } from '@/components'

interface PropertyFeature {
  icon: string
  name: string
}

interface PropertyInfo {
  property: {
    name: string
    address: string
    description: string
    features: PropertyFeature[]
  }
}

export const Summary = ({ property }: PropertyInfo) => {
  return (
    <>
      <Section>
        <div className='flex flex-col gap-6'>
          <span className='text-4xl font-semibold leading-[1.1]'>{property.name}</span>
          <div className='flex flex-col gap-2'>
            <p className='text-lg font-medium'>{property.address}</p>
            <p className='text-base'>{property.description}</p>
          </div>
        </div>

        {/* Features */}

        <div className='flex flex-wrap gap-2 justify-start items-start mt-4'>
          {property.features.map((feature, index) => (
            <span key={index} className='inline-flex border bg-black text-white items-center gap-2 px-3 py-1 text-sm'>
              <span>{feature.icon}</span>
              <span>{feature.name}</span>
            </span>
          ))}
        </div>
      </Section>
    </>
  )
}
