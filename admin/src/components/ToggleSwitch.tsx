'use client'

import { motion } from 'framer-motion'
import classNames from 'classnames'
import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
  className?: string
  size?: number
}

/**
 * Tailwind + Framer Motion 토글 스위치
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  size = 10,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (disabled) return
    onChange?.(!checked)
  }

  const sizeConfig = {
    thumbSize: size,
    padding: 4,
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={classNames(
        'inline focus:outline-none',
        'w-fit',
        disabled && 'opacity-60 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className,
      )}
    >
      {/* 트랙 + 썸(동그라미) */}
      <div
        className={classNames(
          'relative rounded-full flex items-center',
          'transition-colors duration-200 ease-in-out',
          checked ? 'bg-stone-500' : 'bg-stone-300',
        )}
        style={{
          width: sizeConfig.thumbSize * 2 + sizeConfig.padding * 2 + sizeConfig.padding,
          height: sizeConfig.thumbSize + sizeConfig.padding * 2,
        }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className='rounded-full bg-white shadow-md'
          style={{
            width: sizeConfig.thumbSize,
            height: sizeConfig.thumbSize,
          }}
          initial={{
            x: sizeConfig.padding,
          }}
          animate={{
            x: checked ? sizeConfig.padding + sizeConfig.thumbSize + sizeConfig.padding : sizeConfig.padding,
          }}
        />
      </div>
    </button>
  )
}
