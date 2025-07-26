// src/components/ProtectedRoute.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AccessCodeForm } from './AccessCodeForm'
import { Logo } from './Logo'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='w-full h-screen flex flex-col gap-4 items-center justify-center p-6'>
        <Logo className='w-12 h-12 animate-spin' />
        <p className='text-base text-gray-700'>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AccessCodeForm />
  }

  return <>{children}</>
}
