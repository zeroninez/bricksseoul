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
              className='flex items-center p-2 rounded-lg text-black/70 active:bg-black/20 transition-colors'
              whileTap={{ scale: 0.95 }}
              aria-label='비밀번호 변경'
            >
              <span className='text-sm font-medium'>비밀번호 변경</span>
            </motion.button>

            {/* 로그아웃 버튼 */}
            <motion.button
              onClick={handleLogout}
              className='flex items-center p-2 rounded-lg bg-black/10 text-black/70 active:bg-transparent transition-colors'
              whileTap={{ scale: 0.95 }}
              aria-label='로그아웃'
            >
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
