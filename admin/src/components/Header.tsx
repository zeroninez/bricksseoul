// src/components/Header.tsx (admin 폴더용)
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Logo } from './Logo'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { PasswordChangeModal } from './PasswordChangeModal'
import { LiaAngleLeftSolid } from 'react-icons/lia'

export const Header = () => {
  const { logout } = useAdminAuth()

  const handleLogout = () => {
    if (confirm('정말로 로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  const router = useRouter()

  return (
    <>
      <header className='bg-background sticky top-0 border-b border-gray-200 z-50'>
        <div className='relative flex justify-between items-center h-14'>
          {/* Logo */}
          <motion.button
            className=' text-xl h-full aspect-square flex items-center justify-center'
            onClick={() => router.back()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
          >
            <LiaAngleLeftSolid />
          </motion.button>

          {/* 관리자 메뉴 */}
          <motion.div
            className='flex w-fit h-full justify-end items-center flex-row gap-0'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className='text-sm text-gray-600'>관리자님, 안녕하세요!</span>

            {/* 로그아웃 버튼 */}
            <motion.button
              onClick={handleLogout}
              className='flex items-center px-4 w-fit text-red-500 h-full active:opacity-50'
              whileTap={{ scale: 0.95 }}
              aria-label='로그아웃'
            >
              <span className='text-sm font-medium'>로그아웃</span>
            </motion.button>
          </motion.div>
        </div>
      </header>
    </>
  )
}
