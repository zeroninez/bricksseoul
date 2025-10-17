import { AmenityItem } from '@/types/property'
import { PropertyGetResponse } from '@/types/property'

interface TabContainerProps {
  id: string
  ref: React.RefObject<HTMLDivElement | null>
  data: PropertyGetResponse
}

export const TabAmenities = ({ id, ref, data }: TabContainerProps) => {
  return (
    <>
      <section id={id} ref={ref} className='w-full h-fit scroll-mt-[240px] px-5'>
        <div className='w-full min-h-[55vh] h-fit flex flex-col justify-start gap-8 pt-5 pb-12 border-b-2 border-stone-200'>
          {/* 1 */}
          <div className='w-full h-fit flex flex-col gap-4'>
            <span className='text-xl font-bold'>Amenities</span>
            {data.amenities && data.amenities.length > 0 ? (
              <div className='w-full h-fit grid grid-cols-1 gap-4'>
                {data.amenities.map((amenity: AmenityItem) => (
                  <AmenitiesItem key={amenity.code} amenity={amenity} />
                ))}
              </div>
            ) : (
              <p className='text-base py-1'>No amenities listed.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

const AmenitiesItem = ({ amenity }: { amenity: AmenityItem }) => (
  <div key={amenity.code} className='text-base flex items-center w-full h-fit flex-row gap-3 py-1'>
    <div className='w-6 h-6 bg-stone-300 rounded-lg flex-shrink-0'></div>
    {amenity.label}
  </div>
)
