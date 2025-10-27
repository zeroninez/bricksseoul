'use client'
import { Sheet } from 'react-modal-sheet'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const Drawer = ({ isOpen, onClose }: DrawerProps) => {
  return (
    <>
      <Sheet detent='full' disableDrag isOpen={isOpen} onClose={onClose}>
        <Sheet.Container className='!rounded-t-none'>
          <Sheet.Content>
            {/* header */}
            <div className='relative flex flex-row justify-center items-center p-4'>
              <button className='absolute left-0 p-4 active:scale-90 transition-all' onClick={onClose}>
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                  <path d='M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z' fill='black' />
                </svg>
              </button>
              <div className='w-fit h-6 text-base font-semibold'>숙소</div>
            </div>
            {/* content */}
            <div className='w-full h-full p-5'>
              <div className='flex flex-row justify-between items-center bg-stone-100 rounded-lg'>
                <span className='w-fit h-fit px-5 py-4 text-sm font-normal leading-none'>주소/숙소명</span>
                <button className='w-fit h-fit px-2 py-2'>
                  <svg className='w-6 h-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'>
                    <path d='M9 6.75L14.25 12L9 17.25' stroke='currentColor' strokeWidth={1.2} />
                  </svg>
                </button>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  )
}
