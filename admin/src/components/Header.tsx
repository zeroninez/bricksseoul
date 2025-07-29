// src/components/Header.tsx (admin 폴더용)
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Logo } from './Logo'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { PasswordChangeModal } from './PasswordChangeModal'

export const Header = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const { logout } = useAdminAuth()

  const handleLogout = () => {
    if (confirm('정말로 로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  return (
    <>
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

          {/* 관리자 메뉴 */}
          <motion.div
            className='flex items-center space-x-3'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className='text-sm text-gray-600 hidden sm:inline'>관리자님, 안녕하세요!</span>

            {/* 비밀번호 변경 버튼 */}
            <motion.button
              onClick={() => setIsPasswordModalOpen(true)}
              className='flex items-center space-x-1 text-foreground hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors'
              whileTap={{ scale: 0.95 }}
              aria-label='비밀번호 변경'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                />
              </svg>
              <span className='text-sm font-medium hidden sm:inline'>비밀번호 변경</span>
            </motion.button>

            {/* 로그아웃 버튼 */}
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

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </>
  )
}
