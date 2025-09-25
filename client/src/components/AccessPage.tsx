// src/components/AccessPage.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo, Screen, LocaleDropdown, Input, Button } from '.'
import { FaRegKeyboard } from 'react-icons/fa6'

import { useTranslations } from 'next-intl'
import classNames from 'classnames'

export const AccessPage = () => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const getClientIP = async (): Promise<string | null> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch (err) {
      console.error('Failed to fetch IP address:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    // const location = await ipify({ useIPv6: false })

    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError('')

    const ip = await getClientIP()
    const success = await login(code.trim(), ip)

    if (!success) {
      setError('*Invalid invitation code. Please try again.')
    }

    setIsLoading(false)
  }
  const t = useTranslations('HomePage')

  return (
    <div
      style={{
        backgroundImage: "url('/img/intro.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className='fixed z-10 w-screen inset-0 flex flex-col items-center justify-between px-6 py-6 gap-10'
    >
      <div className='absolute inset-0 bg-black/30 z-0' />

      <div className='w-full h-1/2 flex flex-col justify-between items-center z-10'>
        <div className='w-full flex flex-col justify-start items-start gap-0.5 text-white'>
          <Logo className='text-lg' />
          <div className='text-base font-light leading-none'>Place to relax</div>
        </div>

        <div className='w-full flex flex-col justify-start items-start gap-2 text-white'>
          <div className='text-2xl font-bold leading-10'>WELCOME</div>
          <div className='text-lg font-semibold leading-tight'>
            Find your place to relax,
            <br />
            feel at home Where comfort
            <br />
            meets covenience.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='w-full h-1/2 flex flex-col justify-between items-center z-10'>
        <Input
          label='Code'
          type='text'
          id='accessCode'
          value={code}
          setValue={(v) => {
            setCode(v)
            if (error) setError('') // 값 변경 시 에러 지우기
          }}
          disabled={isLoading}
          placeholder='Enter 4-digit invitation code'
          error={error}
          required
          labelClassName='text-white'
          onFocus
          action={{
            icon: <FaRegKeyboard />,
          }}
        />
        <Button type='submit' disabled={isLoading || !code.trim()}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </div>
  )
}
