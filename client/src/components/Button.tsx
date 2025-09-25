'use client'

import React, { ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={classNames(
        'w-full h-14 px-6 py-3 bg-orange-500 text-white text-[18px] font-semibold rounded-2xl active:opacity-70 transition-all disabled:bg-zinc-400 disabled:cursor-not-allowed',
        className ? className : '',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
