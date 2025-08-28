// Layout.tsx

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
import { Header, Footer, ProtectedRoute } from '@/components'
import { AuthProvider } from '@/contexts/AuthContext'
import { HEADER_HEIGHT } from '@/theme/constants'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <AuthProvider>
      <div className={classNames('max-w-3xl shadow-md m-auto min-h-screen h-fit flex flex-col bg-background')}>
        <ProtectedRoute>
          <Header />
          {/* Main content area */}
          <main
            style={{
              marginTop: HEADER_HEIGHT,
            }}
            className='flex-1'
          >
            {children}
          </main>
          {/* Footer can be added here if needed */}
          <Footer />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  )
}
