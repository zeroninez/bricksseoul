'use client'

import { motion } from 'motion/react'
import { Logo } from '../../../admin/src/components/Logo'

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className='inset-0 w-full h-full flex flex-col items-start justify-between p-6 z-50'
    >
      {/* 중앙 로딩바 */}
      <div className='w-full h-auto aspect-square flex flex-col justify-center items-center gap-4 z-10'>
        <div className='text-base animate-pulse font-light leading-tight text-zinc-700'>Loading pages...</div>
      </div>
    </motion.div>
  )
}
