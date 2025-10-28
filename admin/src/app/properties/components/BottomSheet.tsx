'use client'
import { Button } from '@/components'
import { Sheet } from 'react-modal-sheet'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  nextAction?: {
    text?: string
    onClick: () => void
    disabled?: boolean
  }
}

interface HeaderProps {
  title?: string
  leftAction?: {
    text?: string
    onClick: () => void
  }
  rightAction?: {
    text?: string
    onClick: () => void
  }
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  leftAction,
  rightAction,
  nextAction,
}: BottomSheetProps & HeaderProps) => {
  return (
    <>
      <Sheet detent='full' disableDrag isOpen={isOpen} onClose={onClose}>
        <Sheet.Container className='!rounded-t-none'>
          <Sheet.Content>
            {/* header */}
            <div className='w-full h-fit sticky top-0 flex bg-white flex-row justify-center items-center p-4'>
              {leftAction && (
                <button className='absolute left-0 p-4 active:scale-90 transition-all' onClick={leftAction?.onClick}>
                  {leftAction.text ? (
                    leftAction.text
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                      <path d='M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z' fill='black' />
                    </svg>
                  )}
                </button>
              )}
              <div className='w-fit h-6 text-base font-semibold'>{title}</div>
              {rightAction && (
                <button className='absolute right-0 p-4 active:scale-90 transition-all' onClick={rightAction?.onClick}>
                  {rightAction.text}
                </button>
              )}
            </div>

            {/* content */}
            <div className='w-full flex flex-col h-fit pb-24'>{children}</div>
            {/* button */}
            <div className='absolute bottom-0 w-full h-fit px-5 pb-5 z-10'>
              <Button onClick={nextAction?.onClick} disabled={nextAction?.disabled}>
                {nextAction?.text || '다음'}
              </Button>
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  )
}
