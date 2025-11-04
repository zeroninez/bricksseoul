// src/components/AdminLayout.tsx
'use client'

import classNames from 'classnames'
import React, { useEffect } from 'react'
import { Header, Footer, AdminLogin } from '@/components'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { SplashScreen } from '@/components'
import { usePathname } from 'next/navigation'
interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, login, isLoading } = useAdminAuth()

  // 로딩 중일 때
  if (isLoading) {
    return <SplashScreen />
  }

  // 인증되지 않았을 때 로그인 화면 표시
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  // 인증된 사용자에게 관리자 페이지 표시
  return (
    <div className={classNames('max-w-5xl shadow-md m-auto min-h-svh h-fit flex flex-col bg-white')}>
      <Header />
      <main className='flex w-full h-fit flex-col'>{children}</main>
    </div>
  )
}
