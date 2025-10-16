// Layout.tsx

'use client'

/**
 * Layout
 * - Layout은 페이지의 전체적인 레이아웃을 담당하는 컴포넌트입니다.
 * - children으로 받은 컴포넌트를 렌더링합니다.
 * @param children : React.ReactNode
 * @returns {JSX.Element} JSX.Element
 * @example
 * return (
 *    <Layout>
 *      <Header />
 *      <Component />
 *      <Footer />
 *    </Layout>
 * )
 **/

import classNames from 'classnames'
import React from 'react'
import { motion } from 'motion/react'
import { Header, Footer, ProtectedRoute } from '@/components'
import { AuthProvider } from '@/contexts/AuthContext'
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '@/theme/constants'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  console.log('Layout rendered')
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Header />
        <div style={{ minHeight: `calc(100dvh - ${FOOTER_HEIGHT})` }} className='w-full h-fit flex flex-col'>
          {children}
        </div>
        <Footer />
      </ProtectedRoute>
    </AuthProvider>
  )
}
