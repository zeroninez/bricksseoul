'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from './Logo'
import { useAuth } from '@/contexts/AuthContext'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
            <span
              className='ml-2 text-lg tracking-tight
 font-bodoniModa font-bold'
            >
              Bricks Seoul
            </span>
          </Link>
        </motion.div>

        {/* Mobile CTA + Menu Button */}
        <motion.div
          className='flex items-center space-x-3'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button onClick={handleLogout} className='text-foreground p-2 rounded-lg' aria-label='Logout'>
            Logout
          </button>
          <motion.button
            onClick={toggleMobileMenu}
            className='text-foreground p-2 rounded-lg'
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
            className='absolute top-14 left-0 w-full h-fit bg-white border-t border-gray-200 py-3 overflow-hidden shadow-lg'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.nav className='space-y-1 px-4'>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <Link
                    href={item.href}
                    className='block py-3 text-foreground border-b border-gray-100 last:border-b-0 hover:font-semibold transition-all duration-200'
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
