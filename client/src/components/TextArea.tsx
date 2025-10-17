'use client'

import React, { useRef, useEffect } from 'react'
import classNames from 'classnames'

interface TextAreaProps {
  label?: string
  id?: string
  placeholder?: string
  value: string
  setValue: (value: string) => void
  disabled?: boolean
  required?: boolean
  error?: string
  labelClassName?: string
  textareaClassName?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
  action?: {
    icon: React.ReactNode
    onClick?: () => void
    /** textarea에 포커스 주고 실행할지 여부 (기본 true) */
    focus?: boolean
  }
}

export const TextArea = ({
  label,
  id,
  placeholder,
  value,
  setValue,
  disabled = false,
  required = false,
  error,
  labelClassName,
  textareaClassName,
  rows = 4,
  maxLength,
  showCount = false,
  autoResize = true,
  action,
}: TextAreaProps) => {
  const ref = useRef<HTMLTextAreaElement>(null)

  // 자동 리사이즈
  useEffect(() => {
    if (!autoResize || !ref.current) return
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value, autoResize])

  const handleActionClick = () => {
    if (action?.focus !== false) ref.current?.focus()
    action?.onClick?.()
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
          {required && <span className='ml-0.5 text-primary align-middle'>*</span>}
        </label>
      )}

      <div className='w-full flex flex-row gap-1 text-base bg-white rounded-lg border border-stone-200 focus-within:bg-stone-200 transition-all'>
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={classNames(
            'w-full resize-none focus:outline-none placeholder:text-stone-400 px-4 py-3 min-h-[3rem]',
            error ? 'text-rose-500 ' : 'text-stone-800 ',
            textareaClassName,
          )}
        />
        {action && (
          <button
            type='button'
            onClick={handleActionClick}
            className='w-fit h-full flex justify-center items-center text-stone-800 text-lg active:opacity-70 transition-all pr-4'
          >
            {action.icon}
          </button>
        )}
      </div>

      <div className='flex items-start justify-between'>
        {error && <div className='text-xs text-rose-500 text-left'>*{error}</div>}
        {showCount && typeof maxLength === 'number' && (
          <div className='ml-auto text-xs text-stone-400'>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}
