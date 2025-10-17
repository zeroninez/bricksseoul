import { PropertyGetResponse } from '@/types/property'

interface TabContainerProps {
  id: string
  ref: React.RefObject<HTMLDivElement | null>
  data: PropertyGetResponse
}

export const TabInfo = ({ id, ref, data }: TabContainerProps) => {
  return (
    <>
      <section id={id} ref={ref} className='w-full h-fit scroll-mt-[240px] px-5'>
        <div className='w-full min-h-[55vh] h-fit flex flex-col justify-start gap-8 pt-5 pb-12 border-b-2 border-stone-200'>
          {/* 1 */}
          <div className='w-full h-fit flex flex-col gap-4'>
            <span className='text-xl font-bold'>Info</span>
            <p className='text-base'>{data.description}</p>
          </div>
          {/* 2 */}
          <div className='w-full h-fit flex flex-col gap-4'>
            <span className='text-xl font-bold'>Space Info</span>
            <div className='w-full h-fit flex flex-col gap-4'>
              <SpaceInfoItem label='Base occupancy' value={data.space_info?.available_people} unit='adults' />
              <SpaceInfoItem label='Living Rooms' value={data.space_info?.living_rooms} unit='rooms' />
              <SpaceInfoItem label='Bedrooms' value={data.space_info?.bedrooms} unit='rooms' />
              <SpaceInfoItem label='Bathrooms' value={data.space_info?.bathrooms} unit='rooms' />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const SpaceInfoItem = ({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) => (
  <div className='w-full h-full  flex flex-row gap-2 justify-between items-center py-1'>
    <div className='w-full h-fit flex flex-col justify-center items-start gap-1'>
      <div className='text-base leading-tight'>{label}</div>
    </div>
    <div className='w-fit h-fit flex flex-row justify-center items-center gap-1'>
      <div className='w-fit text-lg font-semibold text-right leading-none'>{value}</div>
      <span className='text-stone-400 leading-none'>/</span>
      <div className='w-fit text-sm text-stone-400 leading-none'>{unit}</div>
    </div>
  </div>
)
