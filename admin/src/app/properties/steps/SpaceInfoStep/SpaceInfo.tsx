interface SpaceInfoProps {
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export const SpaceInfo = ({ form, setForm }: SpaceInfoProps) => {
  return (
    <>
      <div className='w-full h-fit flex flex-col gap-12 px-5 pt-4 pb-5'>
        <div className='text-xl font-bold'>
          숙박 공간의
          <br />
          정보를 입력해주세요
        </div>

        <div className='w-full h-fit flex flex-col gap-3'>
          <OptionItem
            label='허용 인원'
            value={form.space_info.available_people || 1}
            onIncrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: { ...prev.space_info, available_people: (prev.space_info.available_people || 1) + 1 },
              }))
            }
            onDecrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: {
                  ...prev.space_info,
                  available_people: Math.max((prev.space_info.available_people || 1) - 1, 1),
                },
              }))
            }
          />
          <OptionItem
            label='거실'
            value={form.space_info.living_rooms || 0}
            onIncrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: { ...prev.space_info, living_rooms: (prev.space_info.living_rooms || 0) + 1 },
              }))
            }
            onDecrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: {
                  ...prev.space_info,
                  living_rooms: Math.max((prev.space_info.living_rooms || 0) - 1, 0),
                },
              }))
            }
          />
          <OptionItem
            label='침실'
            value={form.space_info.bedrooms || 0}
            onIncrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: { ...prev.space_info, bedrooms: (prev.space_info.bedrooms || 0) + 1 },
              }))
            }
            onDecrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: {
                  ...prev.space_info,
                  bedrooms: Math.max((prev.space_info.bedrooms || 0) - 1, 0),
                },
              }))
            }
          />
          <OptionItem
            label='욕실'
            value={form.space_info.bathrooms || 0}
            onIncrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: { ...prev.space_info, bathrooms: (prev.space_info.bathrooms || 0) + 1 },
              }))
            }
            onDecrease={() =>
              setForm((prev: any) => ({
                ...prev,
                space_info: {
                  ...prev.space_info,
                  bathrooms: Math.max((prev.space_info.bathrooms || 0) - 1, 0),
                },
              }))
            }
          />
        </div>
      </div>
    </>
  )
}

const OptionItem = ({
  label,
  value,
  onIncrease,
  onDecrease,
}: {
  label: string
  value: number
  onIncrease: () => void
  onDecrease: () => void
}) => (
  <div className='w-full h-fit flex flex-row justify-between items-center'>
    <span className='text-base font-semibold'>{label}</span>
    <div className='w-40 h-fit rounded-full flex flex-row justify-between items-center px-2 py-1 bg-stone-100'>
      <button onClick={onDecrease} className='p-2.5 text-black/20 active:scale-75 transition-all'>
        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 20 2' fill='currentColor'>
          <path d='M20 0V1.81818H0V0Z' />
        </svg>
      </button>
      <span className='text-base font-medium text-center'>{value}</span>
      <button onClick={onIncrease} className='p-2.5 text-black active:scale-75 transition-all'>
        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
          <path d='M20 9.09091V10.9091H0V9.09091Z' />
          <path d='M9.09091 0H10.9091V20H9.09091Z' />
        </svg>
      </button>
    </div>
  </div>
)
