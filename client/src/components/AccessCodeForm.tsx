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
    <div className='h-dvh bg-background flex items-center justify-center p-4'>
      <div className='w-full bg-white shadow-lg p-8 border border-gray-200'>
        <div className='text-center mb-8'>
          <Logo className='w-16 h-16 mx-auto mb-4' />
          <h1 className='text-2xl font-bold font-bodoniModa tracking-tighter mb-2'>Bricks Seoul</h1>
          <p className='text-gray-600'>Please enter your access code</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='accessCode' className='block text-sm font-medium text-gray-700 mb-2'>
              Access Code
            </label>
            <input
              type='text'
              id='accessCode'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='Enter your access code'
              className='w-full px-4 py-3 border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-black focus:border-black'
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
            className='w-full bg-black text-white py-3 px-4 hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
