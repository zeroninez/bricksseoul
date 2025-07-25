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
import { Header } from '@/components'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={classNames('max-w-3xl shadow-md m-auto min-h-screen h-fit bg-background')}>
      <Header />
      {/* Main content area */}
      <main className='space-y-4 p-6'>{children}</main>
      {/* Footer can be added here if needed */}
      <footer
        className='p-4 sm:p-6 lg:p-8 border-t
        border-gray-200 bg-background text-center text-sm text-foreground'
      >
        © {new Date().getFullYear()} Bricks Seoul. All rights reserved.
      </footer>
    </div>
  )
}
