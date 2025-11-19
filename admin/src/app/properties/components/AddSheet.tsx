import React from 'react'
import { Sheet } from 'react-modal-sheet'
import classNames from 'classnames'

const CREATE_STEP_LIST = [
  {
    key: 'housing',
    text: '숙소 (Housing)',
    description: '장기 거주하는 투숙객을 위한 숙박 공간입니다.',
    disabled: false,
  },
  {
    key: 'rental',
    text: '공간 대여 (Rental)',
    description: '모임, 워크숍 등 시간 단위로 빌릴 수 있는 공간입니다.',
    disabled: true,
  },
]

interface AddSheetProps {
  isClickedAdd: boolean
  setIsClickedAdd: React.Dispatch<React.SetStateAction<boolean>>
  onClickHousing: () => void
  onClickRental: () => void
}

export const AddSheet = (props: AddSheetProps) => {
  const { isClickedAdd, setIsClickedAdd, onClickHousing, onClickRental } = props

  return (
    <>
      <Sheet detent='content' className='max-w-md mx-auto' isOpen={isClickedAdd} onClose={() => setIsClickedAdd(false)}>
        <Sheet.Container className='!rounded-t-2xl'>
          <Sheet.Header>
            <div className=' flex flex-row justify-end items-center p-4'>
              <button onClick={() => setIsClickedAdd(false)}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-[28px] h-[28px] text-black'
                >
                  <path strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div className='px-5 flex flex-col gap-10 pb-10'>
              <span className='text-xl font-bold'>Space 유형을 선택해주세요</span>
              <div className='w-full h-fit flex flex-col gap-4'>
                <Item item={CREATE_STEP_LIST[0]} onClick={onClickHousing} />
                <Item item={CREATE_STEP_LIST[1]} onClick={onClickRental} />
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  )
}

const Item = ({ item, onClick }: { item: any; onClick: () => void }) => {
  return (
    <div
      className={classNames(
        'w-full h-fit flex flex-col px-5 py-8 border-[1.5px] rounded-xl active:bg-black active:border-black active:text-white transition-all cursor-pointer',
        item.disabled ? 'border-stone-200 bg-stone-50 text-stone-300 pointer-events-none' : '',
      )}
      key={item.key}
      onClick={onClick}
    >
      <span className='text-lg font-bold'>{item.text}</span>
      <p className='text-base'>{item.description}</p>
    </div>
  )
}
