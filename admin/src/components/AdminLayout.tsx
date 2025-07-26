// src/components/AdminLayout.tsx
'use client'

import classNames from 'classnames'
import React from 'react'
import { Header, Footer, AdminLogin } from '@/components'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, login, isLoading } = useAdminAuth()

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>로딩 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않았을 때 로그인 화면 표시
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  // 인증된 사용자에게 관리자 페이지 표시
  return (
    <div className={classNames('max-w-5xl shadow-md m-auto min-h-screen h-fit flex flex-col bg-background')}>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  )
}
