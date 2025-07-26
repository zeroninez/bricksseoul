// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Logo } from './Logo'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export const Header = () => {
  const { logout } = useAdminAuth()

  const handleLogout = () => {
    if (confirm('정말로 로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  return (
    <header className='bg-background sticky top-0 shadow-sm border-b border-gray-200 z-50'>
      <div className='relative flex px-4 justify-between items-center h-14'>
        {/* Logo */}
        <motion.div
          className='flex-shrink-0'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href='/' className='flex items-center'>
            <Logo className='w-8 h-8' />
            <span className='ml-2 text-lg tracking-tight font-bodoniModa font-bold'>Bricks Seoul</span>
          </Link>
        </motion.div>

        {/* 관리자 정보 및 로그아웃 */}
        <motion.div
          className='flex items-center space-x-3'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className='text-sm text-gray-600 hidden sm:inline'>관리자님, 안녕하세요!</span>
          <motion.button
            onClick={handleLogout}
            className='flex items-center space-x-1 text-foreground hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors'
            whileTap={{ scale: 0.95 }}
            aria-label='로그아웃'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            <span className='text-sm font-medium'>로그아웃</span>
          </motion.button>
        </motion.div>
      </div>
    </header>
  )
}
