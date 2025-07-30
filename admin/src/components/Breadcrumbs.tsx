// src/components/Breadcrumbs.tsx
'use client' // 클라이언트 컴포넌트

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter((segment) => segment)

  return (
    <nav className='w-full h-fit text-left text-sm px-6 pt-6 text-gray-500'>
      <ul className='flex'>
        <li>
          <Link href='/' className='active:underline '>
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/')
          const isLast = index === pathSegments.length - 1

          return (
            <li key={href} className='flex items-center'>
              <span className='mx-2'>/</span>
              {isLast ? (
                <span className='text-gray-700 capitalize'>{decodeURIComponent(segment)}</span>
              ) : (
                <Link href={href} className='active:underline capitalize'>
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
