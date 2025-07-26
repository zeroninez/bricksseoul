'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from './Logo'

export const Header = () => {
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
          <button onClick={() => {}} className='text-foreground p-2 rounded-lg' aria-label='Logout'>
            Logout
          </button>
        </motion.div>
      </div>
    </header>
  )
}
