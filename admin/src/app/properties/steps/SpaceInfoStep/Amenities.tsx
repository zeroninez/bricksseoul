import { useAmenities } from '@/hooks/useAmenities'
import classNames from 'classnames'

interface AmenitiesProps {
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export const Amenities = ({ form, setForm }: AmenitiesProps) => {
  const { data: amenities, isLoading } = useAmenities()

  return (
    <>
      <div className='w-full h-full overflow-auto snap-y flex flex-col gap-12 px-5 pb-5'>
        <div className='text-xl font-bold snap-start pt-4'>
          시설 및 어메니티를
          <br />
          추가해주세요
        </div>
        <div className='w-full h-fit flex flex-col gap-3 pb-32 snap-start'>
          <span className='text-sm font-semibold text-black/50'>어메니티 옵션</span>
          <div className='w-full grid grid-cols-4 gap-3'>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              amenities &&
              amenities.map((item) => {
                const selected = form.amenities.includes(item.code)
                return (
                  <div
                    key={item.code}
                    onClick={() =>
                      setForm((prev: any) => ({
                        ...prev,
                        amenities: selected
                          ? prev.amenities.filter((c: string) => c !== item.code)
                          : [...prev.amenities, item.code],
                      }))
                    }
                    className={classNames(
                      'aspect-square rounded-lg bg-stone-100 flex flex-col justify-between items-center gap-2 p-3 transition-all',
                      { 'border-[1.5px] border-black': selected },
                    )}
                  >
                    <img
                      src={`/svgs/amenities/${item.code}.svg`}
                      alt={item.label}
                      className='w-8 h-8 object-contain opacity-50'
                    />
                    <span className='truncate text-xxs'>{item.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
