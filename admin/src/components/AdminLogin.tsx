// src/components/AdminLogin.tsx
'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Logo } from './Logo'

interface AdminLoginProps {
  onLogin: (password: string) => boolean
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    // 잠시 로딩 효과를 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 500))

    const isValid = onLogin(password)

    if (!isValid) {
      setError('잘못된 비밀번호입니다.')
      setPassword('')
    }

    setIsLoading(false)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-md'
      >
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* 로고 및 제목 */}
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='inline-block'
            >
              <Logo className='w-16 h-16 mx-auto mb-4 text-primary' />
            </motion.div>
            <h1 className='text-2xl font-bodoniModa font-bold text-gray-900 mb-2'>관리자 로그인</h1>
            <p className='text-gray-600'>
              Bricks Seoul 관리자 페이지에 접속하려면
              <br />
              비밀번호를 입력해주세요.
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                관리자 비밀번호
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg'
                placeholder='비밀번호를 입력하세요'
                disabled={isLoading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'
              >
                {error}
              </motion.div>
            )}

            {/* 로그인 버튼 */}
            <motion.button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </motion.button>
          </form>

          {/* 하단 정보 */}
          <div className='mt-8 text-center'>
            <p className='text-xs text-gray-500'>비밀번호를 잊으셨나요? 시스템 관리자에게 문의하세요.</p>
          </div>
        </div>

        {/* 보안 알림 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'
        >
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg className='w-5 h-5 text-blue-600 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-blue-800'>보안 알림</h3>
              <p className='text-sm text-blue-700 mt-1'>
                이 페이지는 관리자 전용입니다. 승인되지 않은 접근은 기록됩니다.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
