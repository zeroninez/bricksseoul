// src/components/AccessCodeForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from './Logo'

export const AccessCodeForm = () => {
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
      setError('Invalid access code.')
    }

    setIsLoading(false)
  }

  return (
    <div
      style={{
        backgroundImage: "url('/img/intro.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className='h-dvh relative flex flex-col items-center justify-between px-6 py-6 gap-10'
    >
      <div className='absolute inset-0 bg-black/30 z-0' />

      <div className='w-full h-1/2 flex flex-col justify-between items-center z-10'>
        <div className='w-full flex flex-col justify-start items-start gap-0.5 text-white'>
          <div className='text-lg font-bold leading-none'>WELLNCHER</div>
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
        <div className='w-full h-fit flex flex-col gap-1.5'>
          <label htmlFor='accessCode' className='block text-sm font-medium text-white'>
            Code
          </label>
          <input
            type='text'
            id='accessCode'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder='Enter your access code'
            className='w-full px-4 py-3 bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] rounded-xl focus:outline-none '
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 p-3'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !code.trim()}
          className='w-full bg-black text-white py-3 px-4 rounded-xl hover:bg-black/90 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? 'Verifying...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
