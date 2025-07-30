// src/components/Breadcrumbs.tsx
'use client' // 클라이언트 컴포넌트

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter((segment) => segment)

  return (
    <nav className='w-full h-fit text-left px-1 md:px-2 text-sm text-gray-500 py-2'>
      <ul className='flex space-x-2'>
        <li>
          <Link href='/' className='hover:underline '>
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
                <span className='text-gray-700'>{decodeURIComponent(segment)}</span>
              ) : (
                <Link href={href} className='hover:underline'>
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
