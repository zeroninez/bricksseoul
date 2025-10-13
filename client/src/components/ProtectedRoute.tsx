// src/components/ProtectedRoute.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AccessPage, Logo, SplashScreen } from '.'
import { motion } from 'motion/react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return <AccessPage />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  )
}
