'use client'

import React, { ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  preset?: 'primary' | 'black'
}

export const Button = ({ children, className, preset = 'primary', ...props }: ButtonProps) => {
  return (
    <button
      className={classNames(
        'w-full h-14 px-6 py-3  text-white text-[18px] rounded-lg font-medium active:opacity-70 transition-all disabled:text-white/50 disabled:bg-disabled disabled:cursor-not-allowed',
        className ? className : '',
        preset === 'black' ? 'bg-black' : preset === 'primary' && 'bg-primary',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
