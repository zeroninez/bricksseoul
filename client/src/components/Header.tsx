// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Variants } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { HEADER_HEIGHT } from '@/theme/constants'
import { useRouter, usePathname } from 'next/navigation'

interface MenuItem {
  href: string
  label: string
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/about', label: 'About' },
  { href: '/properties', label: 'Properties' },
  { href: '/activities', label: 'Activities' },
  { href: '/request', label: 'Request' },
]

// Animation variants
const headerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
}

const menuContainerVariants: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: '100%', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
}

const menuItemVariants: Variants = {
  closed: { x: -20, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, delay: (i + 1) * 0.05, ease: 'easeOut' },
  }),
}

export const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const { logout, accessCode } = useAuth()
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [isAuthOpen, setAuthOpen] = useState(false)

  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), [])
  const toggleAuth = useCallback(() => setAuthOpen((prev) => !prev), [])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : 'auto'
  }, [isMobileOpen])

  const goHome = () => {
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.div
        style={{
          height: HEADER_HEIGHT,
        }}
        className='fixed top-0 inset-x-0 w-full px-4 py-6 border-b border-gray-200 bg-white text-black z-50 flex items-center justify-between'
        variants={headerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* logo */}
        <span onClick={goHome} className='text-base active:opacity-70 transition-all'>
          BRICKS SEOUL
        </span>
        <motion.svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isMobileOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleMobile}
        >
          {isMobileOpen ? (
            <motion.path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M6 18L18 6M6 6l12 12'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M4 6h16M4 12h16M4 18h16'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.svg>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            className='fixed top-0 right-0 w-full h-full z-40 bg-white'
            initial='closed'
            animate='open'
            exit='closed'
            style={{
              marginTop: HEADER_HEIGHT,
            }}
            variants={menuContainerVariants}
          >
            <nav className='flex flex-col justify-end px-4'>
              {MENU_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.href}
                  custom={idx}
                  initial='closed'
                  animate='open'
                  exit='closed'
                  whileTap={{ scale: 0.95 }}
                  variants={menuItemVariants}
                >
                  <Link
                    href={item.href}
                    className='block py-4 text-base text-black'
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {accessCode && (
                <motion.div
                  custom={MENU_ITEMS.length}
                  initial='closed'
                  animate='open'
                  exit='closed'
                  whileTap={{ scale: 0.95 }}
                  variants={menuItemVariants}
                >
                  <button onClick={toggleAuth} className='block py-4 text-base text-red-500'>
                    Log Out
                  </button>
                </motion.div>
              )}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Auth Confirmation Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div
            className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleAuth}
          >
            <motion.div
              className='bg-white shadow-lg p-6 w-80'
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='mb-4'>
                <h3 className='text-lg font-medium'>Do you want to log out?</h3>
                <p className='text-sm text-gray-600'>Access Code: {accessCode?.code || '-'}</p>
              </div>
              <div className='flex gap-4'>
                <button
                  onClick={() => {
                    logout()
                    setAuthOpen(false)
                  }}
                  className='flex-1 bg-black text-white py-2'
                >
                  Okay
                </button>
                <button onClick={toggleAuth} className='flex-1 border border-red-500 text-red-500 py-2'>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
