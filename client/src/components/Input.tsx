'use client'

import React, { useRef } from 'react'
import classNames from 'classnames'
import { IoChevronDown } from 'react-icons/io5'

interface InputProps {
  label?: string
  type: string
  id?: string
  placeholder?: string
  value: string
  setValue: (value: string) => void
  disabled?: boolean
  required?: boolean
  error?: string
  labelClassName?: string
  inputClassName?: string
  onFocus?: boolean
  action?: {
    icon: React.ReactNode
    onClick?: () => void
  }
  options?: { value: string; label: string }[]
  mini?: boolean
}

export const Input = ({
  label,
  id,
  placeholder,
  value,
  setValue,
  disabled = false,
  required = false,
  type,
  error,
  labelClassName,
  inputClassName,
  onFocus,
  action,
  options,
  mini = false,
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleActionClick = () => {
    // input에 포커스 주기
    onFocus && inputRef.current?.focus()
    // onClick 실행
    action?.onClick && action.onClick()
  }

  const selectRef = useRef<HTMLSelectElement>(null)

  if (type === 'select') {
    return (
      <div
        className={classNames(
          mini
            ? 'w-fit h-8 flex flex-row justify-center items-center gap-1 pl-4 pr-2 py-3 text-base bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]'
            : 'w-full h-fit flex flex-row justify-between items-center gap-1 px-4 py-3 text-base bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]',
          'relative ',
        )}
        onClick={() => {
          selectRef.current?.focus()
          selectRef.current?.click()
        }}
      >
        <select
          ref={selectRef}
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={classNames(
            mini ? 'w-14 truncate' : 'w-full',
            'font-medium z-10 focus:outline-none placeholder:text-zinc-400 group',
            error ? 'text-rose-500 ' : 'text-zinc-800 ',
          )}
          disabled={disabled}
          required={required}
        >
          {placeholder && <option value=''>{placeholder}</option>}
          {options &&
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        <div
          onClick={() => {
            selectRef.current?.focus()
            selectRef.current?.click()
          }}
          className='absolute right-0 top-0 w-fit h-full flex justify-center items-center text-primary text-base px-2'
        >
          {/* dropdown indicator */}
          <IoChevronDown />
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-fit flex flex-col gap-1.5'>
      {label && (
        <label
          htmlFor={id}
          className={classNames(
            'w-full text-left block text-sm font-medium',
            labelClassName ? labelClassName : 'text-zinc-800',
          )}
        >
          {label}
        </label>
      )}
      <div className='w-full flex flex-row gap-1 px-4 py-3 text-base bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]'>
        <input
          ref={inputRef}
          type={type}
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={classNames(
            'w-full focus:outline-none placeholder:text-zinc-400',
            error ? 'text-rose-500 ' : 'text-zinc-800 ',
            inputClassName,
          )}
          disabled={disabled}
          required={required}
        />
        {action && (
          <button
            type='button'
            onClick={handleActionClick}
            className='w-fit h-full flex justify-center items-center text-zinc-800 text-lg active:opacity-70 transition-all'
          >
            {action.icon}
          </button>
        )}
      </div>
      {error && <div className='text-xs text-rose-500 text-left'>*{error}</div>}
    </div>
  )
}
