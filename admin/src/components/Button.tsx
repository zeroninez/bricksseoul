'use client'

import React, { ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const Button = ({ children, disabled, className, ...props }: ButtonProps) => {
  return (
    <button
      className={classNames(
        'w-full h-14 px-6 py-3  text-white text-[18px] rounded-xl font-medium active:opacity-70 transition-all disabled:text-white disabled:bg-stone-300 disabled:cursor-not-allowed',
        className ? className : '',
        'bg-black',
      )}
      disabled={disabled || false}
      {...props}
    >
      {children}
    </button>
  )
}
