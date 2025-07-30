// src/components/Header.tsx (client 폴더용)
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import { PiBarcode } from 'react-icons/pi'
import { a } from 'motion/react-client'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false)
  const { logout, accessCode } = useAuth()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const menuItems = [
    // { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/properties', label: 'Properties' },
    { href: '/activities', label: 'Activities' },
    { href: '/request', label: 'Request' },
  ]

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

        {/* Mobile CTA + Menu Button */}
        <motion.div
          className='flex items-center space-x-2'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {accessCode && (
            <motion.button
              className='bg-black mr-4 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-xs font-mono cursor-pointer hover:bg-black/90 active:scale-95 transition-all'
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => {
                setIsAuthMenuOpen(!isAuthMenuOpen)
              }}
            >
              <PiBarcode className='w-4 h-4' />
              <span className='font-semibold'>{accessCode.code}</span>
            </motion.button>
          )}
          <AnimatePresence>
            {isAuthMenuOpen && (
              <motion.div
                className='fixed w-full h-full top-0 left-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsAuthMenuOpen(false)}
              >
                <motion.div
                  className='bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col gap-4'
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className=''>
                    <span className=''>Your Access Code:</span>
                    <p className='text-sm text-gray-600'>{accessCode ? accessCode.code : ''}</p>
                  </div>
                  <div className='flex flex-row items-center justify-between gap-4'>
                    <button
                      onClick={() => setIsAuthMenuOpen(false)}
                      className='block bg-black/10 rounded-xl w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      Okay
                    </button>
                    <button
                      onClick={handleLogout}
                      className='block bg-black/10 rounded-xl w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* <button
            onClick={handleLogout}
            className='text-foreground p-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors'
            aria-label='Logout'
          >
            Logout
          </button> */}
          <motion.button
            onClick={toggleMobileMenu}
            className='text-foreground p-2 rounded-lg cursor-pointer'
            aria-label='Toggle menu'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <motion.path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className='absolute top-14 left-0 w-full h-fit bg-white border-t border-gray-200 overflow-hidden shadow-lg'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.nav className='space-y-1'>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: (index + 1) * 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <Link
                    href={item.href}
                    className='block py-4 px-4 text-foreground border-b border-gray-100 last:border-b-0 hover:font-semibold transition-all duration-200'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
