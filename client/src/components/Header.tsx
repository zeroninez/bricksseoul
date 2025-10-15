// src/components/Header.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Variants } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { HEADER_HEIGHT } from '@/theme/constants'
import { useRouter, usePathname, Link } from '@/i18n/routing'
import { Logo } from './Logo'
import { GoChevronRight } from 'react-icons/go'
import { GoArrowLeft } from 'react-icons/go'
import { HiPhone } from 'react-icons/hi2'
import { BsFillSuitcaseLgFill } from 'react-icons/bs'
import { MdMarkEmailUnread } from 'react-icons/md'
import { MdOutlineLanguage } from 'react-icons/md'
import classNames from 'classnames'

interface MenuItem {
  href: string
  label: string
  icon?: string
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/contact', label: 'Contact us', icon: 'phone' },
  { href: '/business', label: 'For business', icon: 'briefcase' },
  { href: '/check-bookings', label: 'My bookings', icon: 'mailsearch' },
  { href: '/language', label: 'Language', icon: 'language' },
]

export const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const { logout, accessCode } = useAuth()
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [isAuthOpen, setAuthOpen] = useState(false)

  const isPropertyDetail = pathname?.includes('/properties/') && pathname !== '/properties'

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
        initial={{ opacity: 0, y: -HEADER_HEIGHT, height: HEADER_HEIGHT }}
        animate={{
          opacity: 1,
          y: 0,
          height: isMobileOpen ? '100%' : HEADER_HEIGHT,
        }}
        exit={{ opacity: 0, y: -HEADER_HEIGHT, height: HEADER_HEIGHT }}
        transition={{ duration: 0.3 }}
        className={classNames(
          'fixed top-0 inset-x-0 w-full z-50',
          isPropertyDetail && !isMobileOpen ? 'bg-transparent' : 'bg-background',
        )}
      >
        <div
          style={{
            height: HEADER_HEIGHT,
          }}
          className='w-full flex items-center justify-between pl-5'
        >
          {/* logo */}
          {isPropertyDetail && !isMobileOpen ? (
            <GoArrowLeft className='text-xl cursor-pointer text-white' onClick={router.back} />
          ) : (
            <Logo className='text-[18px] cursor-pointer text-black' onClick={goHome} />
          )}

          {isPropertyDetail && !isMobileOpen && (
            <span
              style={{
                height: HEADER_HEIGHT,
              }}
              className='absolute top-0 flex justify-center items-center left-1/2 -translate-x-1/2 text-[18px] text-white'
            >
              Details
            </span>
          )}

          <motion.button
            className='py-3 px-5'
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={toggleMobile}
          >
            <motion.svg
              animate={{ rotate: isMobileOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMobileOpen ? (
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
                  className={classNames('text-black', isPropertyDetail && 'text-white')}
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
        </div>
        <div className='w-full h-fit px-5 pt-3 flex flex-col gap-3 items-center justify-center'>
          <AnimatePresence>
            {isMobileOpen && (
              <>
                <motion.nav
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className='w-full flex flex-col justify-end rounded-[20px] bg-white border border-zinc-200 h-fit'
                >
                  {MENU_ITEMS.map((item, idx) => (
                    <div
                      key={item.href}
                      className='pl-3.5 pr-2 py-4 w-full h-fit text-sm font-medium flex flex-row justify-between items-center active:opacity-70 transition-all cursor-pointer'
                      onClick={() => {
                        router.push(item.href)
                        setMobileOpen(false)
                      }}
                    >
                      <div className='w-full h-fit flex flex-row justify-start items-center gap-3'>
                        {item.icon === 'phone' && <HiPhone className='text-lg' />}
                        {item.icon === 'briefcase' && <BsFillSuitcaseLgFill className='text-lg' />}
                        {item.icon === 'mailsearch' && <MdMarkEmailUnread className='text-lg' />}
                        {item.icon === 'language' && <MdOutlineLanguage className='text-lg' />}
                        {item.label}
                      </div>
                      <button className='block w-fit h-full text-lg text-black'>
                        <GoChevronRight />
                      </button>
                    </div>
                  ))}
                </motion.nav>
                <motion.div
                  custom={MENU_ITEMS.length}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAuth}
                  className='w-full border border-zinc-200 bg-white rounded-2xl h-fit px-5 text-sm text-rose-500 py-4 flex items-center justify-start'
                >
                  Log out
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
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
