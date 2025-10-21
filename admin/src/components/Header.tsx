// src/components/Header.tsx (admin 폴더용)
'use client'

import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  const pages = [
    { name: '예약내역', path: '/reservations' },
    { name: '공간정보', path: '/properties' },
    { name: '고객문의', path: '/cs' },
    { name: '설정', path: '/settings' },
  ]

  return (
    <>
      <header className='bg-white sticky top-0 z-50'>
        <div className='relative flex justify-between items-center h-14'>
          {/* Logo */}

          <motion.div
            className='flex w-fit h-full justify-start items-center flex-row gap-0 px-4'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Logo className='text-lg' />
            <div className='w-fit h-fit rounded-full px-2 py-1.5 leading-none bg-black text-white text-xs ml-2'>
              관리자
            </div>
          </motion.div>

          {/* 관리자 메뉴 */}
          <motion.div
            className='flex w-fit h-full justify-end items-center flex-row gap-0'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
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
        <div className='w-full h-fit flex flex-row overflow-x-scroll justify-start border-b border-stone-200 items-center'>
          {pages.map((page) => (
            <button
              key={page.path}
              onClick={() => router.push(page.path)}
              className={`w-fit h-12 px-4 text-sm font-medium ${
                pathname === page.path
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      </header>
    </>
  )
}
