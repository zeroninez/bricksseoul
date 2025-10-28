import React from 'react'

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

export const Header = ({ title, leftAction, rightAction }: HeaderProps) => {
  return (
    <div className='relative flex flex-row justify-center items-center p-4'>
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
  )
}
