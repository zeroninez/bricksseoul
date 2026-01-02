// src/app/settings/page.tsx
'use client'

import { PageHeader, PasswordChangeModal } from '@/components'
import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

export default function Settings() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const navigationItems = [
    { name: '전체 예약내역', key: 'reservations', link: '/reservations/request' },
    {
      name: '로그 관리',
      key: 'logs',
      link: null,
      subItems: [
        { name: '초대 코드 관리', key: 'codes', link: '/settings/codes' },
        { name: '접속 로그 관리', key: 'access-logs', link: '/settings/logs' },
      ],
    },
    { name: '비밀번호 변경', key: 'password', description: '관리자 비밀번호를 변경합니다' },
  ]
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  return (
    <>
      <div className='fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full min-h-dvh h-full overflow-y-scroll bg-[#F4F3F1] z-50'>
        <div className='w-full h-fit flex flex-row justify-between items-center'>
          <button
            className='w-fit px-4 h-fit py-3 active:scale-90 active:opacity-70 transition-all text-black flex justify-center items-center'
            onClick={handleBack}
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M3.63654 11.2932C3.44907 11.4807 3.34375 11.735 3.34375 12.0002C3.34375 12.2653 3.44907 12.5197 3.63654 12.7072L9.29354 18.3642C9.48214 18.5463 9.73474 18.6471 9.99694 18.6449C10.2591 18.6426 10.5099 18.5374 10.6954 18.352C10.8808 18.1666 10.9859 17.9158 10.9882 17.6536C10.9905 17.3914 10.8897 17.1388 10.7075 16.9502L6.75754 13.0002H20.0005C20.2658 13.0002 20.5201 12.8948 20.7076 12.7073C20.8952 12.5198 21.0005 12.2654 21.0005 12.0002C21.0005 11.735 20.8952 11.4806 20.7076 11.2931C20.5201 11.1055 20.2658 11.0002 20.0005 11.0002H6.75754L10.7075 7.05018C10.8897 6.86158 10.9905 6.60898 10.9882 6.34678C10.9859 6.08458 10.8808 5.83377 10.6954 5.64836C10.5099 5.46295 10.2591 5.35778 9.99694 5.35551C9.73474 5.35323 9.48214 5.45402 9.29354 5.63618L3.63654 11.2932Z' />
            </svg>
            <span className='ml-2 text-base font-medium'>설정</span>
          </button>
        </div>
        <div className='pl-6'>
          {navigationItems.map((item, index) => (
            <Fragment key={item.key || item.name}>
              <div
                onClick={() => {
                  if (item.key === 'password') {
                    setIsPasswordModalOpen(true)
                  } else if (item.link) {
                    router.push(item.link)
                  }
                }}
                key={item.key || item.name}
                className={classNames(
                  'py-3 pr-4 flex flex-row text-sm justify-between items-center w-full text-left ',
                  item.link ? 'cursor-pointer active:bg-gray-200/50 transition-colors' : 'cursor-default',
                )}
              >
                {item.name}
                {item.link && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-5 h-5 text-gray-300'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </div>
              {item.subItems &&
                item.subItems.map((subItem, index) => (
                  <div key={subItem.key} className='pl-4'>
                    <div
                      key={subItem.key}
                      onClick={() => {
                        if (subItem.link) {
                          router.push(subItem.link)
                        }
                      }}
                      className={classNames(
                        'py-4 w-full pr-4 flex flex-row text-sm  justify-between items-center text-left active:bg-gray-200/50 transition-colors',
                        subItem.link ? 'cursor-pointer' : 'cursor-default',
                      )}
                    >
                      {subItem.name}
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5 text-gray-300'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    {index < item.subItems.length - 1 && <div className='w-full h-[0.5px] bg-gray-300' />}
                  </div>
                ))}
              {index < navigationItems.length - 1 && <div className='w-full h-[0.5px] bg-gray-300' />}
            </Fragment>
          ))}
        </div>
      </div>

      {/* // item.key === 'password' ? (
          //   <button
          //     key={item.key}
          //     onClick={() => setIsPasswordModalOpen(true)}
          //     className='px-6 py-4 flex flex-col text-sm items-start w-full text-left bg-background border-b border-gray-200 active:bg-gray-50 transition-colors'
          //   >
          //     <span className='font-medium'>{item.name}</span>
          //     <span className='text-xs text-gray-500 mt-1'>{item.description}</span>
          //   </button>
          // ) : (
          //   <Link
          //     key={item.key}
          //     href={`/${item.key}`}
          //     className='px-6 py-4 flex flex-col text-sm items-start w-full text-left bg-background border-b border-gray-200 active:bg-gray-50 transition-colors'
          //   >
          //     <span className='font-medium'>{item.name}</span>
          //     <span className='text-xs text-gray-500 mt-1'>{item.description}</span>
          //   </Link>
          // ), */}
      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </>
  )
}
