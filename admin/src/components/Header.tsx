// src/components/Header.tsx (admin 폴더용)
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Logo } from './Logo'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export const Header = () => {
  const { logout } = useAdminAuth()

  const router = useRouter()
  const pathname = usePathname()
  const [currentTab, setCurrentTab] = useState<string>('reservations')
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleLogout = () => {
    if (confirm('정말로 로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const pathSegment = pathname?.split('/')[1]
    setCurrentTab(pathSegment || 'reservations')
  }, [pathname])

  // 스크롤 방향 감지 및 헤더 표시/숨김 처리
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight

      // 최상단이면 항상 보이기
      if (currentScrollY <= 0) {
        setIsHeaderVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      // 최하단이면 항상 보이기
      if (currentScrollY + clientHeight >= scrollHeight - 10) {
        setIsHeaderVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      // 스크롤 방향 감지
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // 아래로 스크롤 중 - 헤더 숨기기
        setIsHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // 위로 스크롤 중 - 헤더 보이기
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return (
    <>
      <motion.header
        className='max-w-md m-auto fixed top-0 z-50 bg-background w-full h-fit flex flex-col'
        animate={{
          y: isHeaderVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        <div className='relative flex justify-between items-center h-14 px-4'>
          {/* Logo */}
          <motion.div
            onClick={() => router.push('/')}
            whileTap={{ scale: 0.95 }}
            className='flex w-fit h-fit justify-start items-center flex-row gap-0 cursor-pointer'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Logo className='text-black' />
          </motion.div>

          {/* 관리자 메뉴 */}
          <motion.div
            className='flex w-fit h-full justify-end items-center flex-row gap-4'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <button className='opacity-30 active:opacity-70 active:scale-95 transition-all cursor-pointer'>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 28 28' fill='none'>
                <path
                  d='M21.5827 21.5833L24.4994 24.5M4.66602 7H23.3327M4.66602 14H9.33268M4.66602 21H9.33268M12.8327 17.5C12.8327 18.7377 13.3243 19.9247 14.1995 20.7998C15.0747 21.675 16.2617 22.1667 17.4993 22.1667C18.737 22.1667 19.924 21.675 20.7992 20.7998C21.6744 19.9247 22.166 18.7377 22.166 17.5C22.166 16.2623 21.6744 15.0753 20.7992 14.2002C19.924 13.325 18.737 12.8333 17.4993 12.8333C16.2617 12.8333 15.0747 13.325 14.1995 14.2002C13.3243 15.0753 12.8327 16.2623 12.8327 17.5Z'
                  stroke='#1A1A1A'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            <button className='active:opacity-70 active:scale-95 transition-all cursor-pointer'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-6 h-6 active:'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M3 5.25V17.25C3 17.6478 3.15804 18.0294 3.43934 18.3107C3.72064 18.592 4.10218 18.75 4.5 18.75H19.5C19.8978 18.75 20.2794 18.592 20.5607 18.3107C20.842 18.0294 21 17.6478 21 17.25V5.25H3ZM3 3.75H21C21.3978 3.75 21.7794 3.90804 22.0607 4.18934C22.342 4.47064 22.5 4.85218 22.5 5.25V17.25C22.5 18.0456 22.1839 18.8087 21.6213 19.3713C21.0587 19.9339 20.2956 20.25 19.5 20.25H4.5C3.70435 20.25 2.94129 19.9339 2.37868 19.3713C1.81607 18.8087 1.5 18.0456 1.5 17.25V5.25C1.5 4.85218 1.65804 4.47064 1.93934 4.18934C2.22064 3.90804 2.60218 3.75 3 3.75Z' />
                <path d='M21.1875 5.25L15.387 11.88C14.9646 12.3628 14.4439 12.7498 13.8598 13.0149C13.2756 13.28 12.6415 13.4172 12 13.4172C11.3585 13.4172 10.7244 13.28 10.1402 13.0149C9.55609 12.7498 9.03537 12.3628 8.613 11.88L2.8125 5.25H21.1875ZM4.806 5.25L9.741 10.8915C10.0226 11.2135 10.3698 11.4715 10.7592 11.6483C11.1487 11.8251 11.5715 11.9166 11.9992 11.9166C12.427 11.9166 12.8498 11.8251 13.2393 11.6483C13.6287 11.4715 13.9759 11.2135 14.2575 10.8915L19.194 5.25H4.806Z' />
              </svg>
            </button>
            <button
              className='active:opacity-70 active:scale-95 transition-all cursor-pointer'
              onClick={() => router.push('/settings')}
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M20.2509 12.5696V11.4221L21.6909 10.1621C21.9564 9.92811 22.1306 9.60784 22.1827 9.25787C22.2349 8.9079 22.1616 8.55076 21.9759 8.24957L20.2059 5.24957C20.0744 5.02177 19.8853 4.83256 19.6575 4.70092C19.4298 4.56928 19.1715 4.49984 18.9084 4.49957C18.7454 4.49832 18.5833 4.52366 18.4284 4.57457L16.6059 5.18957C16.2917 4.9798 15.9634 4.79185 15.6234 4.62707L15.2409 2.73707C15.1723 2.39178 14.9845 2.0816 14.7103 1.86085C14.436 1.6401 14.0929 1.52283 13.7409 1.52957H10.2309C9.87895 1.52283 9.53581 1.6401 9.26158 1.86085C8.98735 2.0816 8.79951 2.39178 8.73092 2.73707L8.34842 4.62707C8.00639 4.79256 7.67567 4.98047 7.35842 5.18957L5.57342 4.54457C5.41689 4.50379 5.2548 4.48859 5.09342 4.49957C4.83038 4.49984 4.57203 4.56928 4.34429 4.70092C4.11656 4.83256 3.92744 5.02177 3.79592 5.24957L2.02592 8.24957C1.85086 8.55031 1.78581 8.90257 1.84191 9.246C1.89801 9.58943 2.07176 9.90267 2.33342 10.1321L3.75092 11.4296V12.5771L2.33342 13.8371C2.06437 14.0681 1.88586 14.3869 1.82957 14.737C1.77328 15.0871 1.84284 15.4459 2.02592 15.7496L3.79592 18.7496C3.92744 18.9774 4.11656 19.1666 4.34429 19.2982C4.57203 19.4299 4.83038 19.4993 5.09342 19.4996C5.25643 19.5008 5.41856 19.4755 5.57342 19.4246L7.39592 18.8096C7.71016 19.0194 8.03843 19.2073 8.37842 19.3721L8.76092 21.2621C8.82951 21.6074 9.01735 21.9175 9.29158 22.1383C9.56581 22.3591 9.90895 22.4763 10.2609 22.4696H13.8009C14.1529 22.4763 14.496 22.3591 14.7703 22.1383C15.0445 21.9175 15.2323 21.6074 15.3009 21.2621L15.6834 19.3721C16.0255 19.2066 16.3562 19.0187 16.6734 18.8096L18.4884 19.4246C18.6433 19.4755 18.8054 19.5008 18.9684 19.4996C19.2315 19.4993 19.4898 19.4299 19.7175 19.2982C19.9453 19.1666 20.1344 18.9774 20.2659 18.7496L21.9759 15.7496C22.151 15.4488 22.216 15.0966 22.1599 14.7532C22.1038 14.4097 21.9301 14.0965 21.6684 13.8671L20.2509 12.5696ZM18.9084 17.9996L16.3359 17.1296C15.7334 17.6391 15.0452 18.0378 14.3034 18.3071L13.7709 20.9996H10.2309L9.69842 18.3371C8.96248 18.0602 8.27804 17.6623 7.67342 17.1596L5.09342 17.9996L3.32342 14.9996L5.36342 13.1996C5.22474 12.4232 5.22474 11.6284 5.36342 10.8521L3.32342 8.99957L5.09342 5.99957L7.66592 6.86957C8.26849 6.36001 8.95665 5.96134 9.69842 5.69207L10.2309 2.99957H13.7709L14.3034 5.66207C15.0394 5.9389 15.7238 6.3369 16.3284 6.83957L18.9084 5.99957L20.6784 8.99957L18.6384 10.7996C18.7771 11.5759 18.7771 12.3707 18.6384 13.1471L20.6784 14.9996L18.9084 17.9996Z' />
                <path d='M12 16.5C11.11 16.5 10.24 16.2361 9.49994 15.7416C8.75991 15.2471 8.18314 14.5443 7.84254 13.7221C7.50195 12.8998 7.41283 11.995 7.58647 11.1221C7.7601 10.2492 8.18868 9.44736 8.81802 8.81802C9.44736 8.18868 10.2492 7.7601 11.1221 7.58647C11.995 7.41283 12.8998 7.50195 13.7221 7.84254C14.5443 8.18314 15.2471 8.75991 15.7416 9.49994C16.2361 10.24 16.5 11.11 16.5 12C16.506 12.5926 16.3937 13.1805 16.1697 13.7292C15.9457 14.2779 15.6145 14.7763 15.1954 15.1954C14.7763 15.6145 14.2779 15.9457 13.7292 16.1697C13.1805 16.3937 12.5926 16.506 12 16.5ZM12 9C11.6035 8.99077 11.2093 9.06205 10.8411 9.20954C10.473 9.35704 10.1386 9.57768 9.85812 9.85812C9.57768 10.1386 9.35704 10.473 9.20954 10.8411C9.06205 11.2093 8.99077 11.6035 9 12C8.99077 12.3965 9.06205 12.7907 9.20954 13.1589C9.35704 13.527 9.57768 13.8615 9.85812 14.1419C10.1386 14.4223 10.473 14.643 10.8411 14.7905C11.2093 14.938 11.6035 15.0092 12 15C12.3965 15.0092 12.7907 14.938 13.1589 14.7905C13.527 14.643 13.8615 14.4223 14.1419 14.1419C14.4223 13.8615 14.643 13.527 14.7905 13.1589C14.938 12.7907 15.0092 12.3965 15 12C15.0092 11.6035 14.938 11.2093 14.7905 10.8411C14.643 10.473 14.4223 10.1386 14.1419 9.85812C13.8615 9.57768 13.527 9.35704 13.1589 9.20954C12.7907 9.06205 12.3965 8.99077 12 9Z' />
              </svg>
            </button>
          </motion.div>
        </div>
      </motion.header>
      {/* 하단 토글 탭 네비게이션 */}
      {/* reservations 또는 properties 경로에서만 표시 */}
      <AnimatePresence>
        {(pathname.split('/')[1] == 'reservations' || pathname.split('/')[1] == 'properties') && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className='fixed left-1/2 -translate-x-1/2 bottom-4 rounded-full z-50 bg-[#3C2F2F] text-white w-fit h-fit flex flex-row justify-center items-center p-2 gap-1 shadow-lg'
          >
            {/* 슬라이딩 배경 */}
            <motion.div
              animate={{
                left:
                  currentTab === 'reservations'
                    ? '8px'
                    : currentTab === 'properties'
                      ? 'calc(50% - 0px)'
                      : 'calc(100% - 8px - 60px)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='absolute w-15 h-10 rounded-full bg-white'
            ></motion.div>
            {/* 예약 관리 탭 */}
            <motion.button
              onClick={() => {
                setCurrentTab('reservations')
                scrollToTop()
                router.push('/reservations')
              }}
              whileTap={{ scale: 0.95 }}
              className='w-15 h-10 z-10 rounded-full flex justify-center items-center cursor-pointer transition-colors'
              aria-label='예약 관리'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                className={currentTab === 'reservations' ? 'text-[#3C2F2F]' : 'text-white'}
              >
                <path
                  d='M11.1358 21.8757H3.20833C2.58949 21.8757 1.996 21.6298 1.55842 21.1922C1.12083 20.7546 0.875 20.1612 0.875 19.5423V5.54232C0.875 4.92348 1.12083 4.32999 1.55842 3.8924C1.996 3.45482 2.58949 3.20898 3.20833 3.20898H17.2083C17.8272 3.20898 18.4207 3.45482 18.8582 3.8924C19.2958 4.32999 19.5417 4.92348 19.5417 5.54232V10.209'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M14.875 0.875V5.54167M5.54167 0.875V5.54167M0.875 10.2083H19.5417M13.7083 18.375C13.7083 19.6127 14.2 20.7997 15.0752 21.6748C15.9503 22.55 17.1373 23.0417 18.375 23.0417C19.6127 23.0417 20.7997 22.55 21.6748 21.6748C22.55 20.7997 23.0417 19.6127 23.0417 18.375C23.0417 17.1373 22.55 15.9503 21.6748 15.0752C20.7997 14.2 19.6127 13.7083 18.375 13.7083C17.1373 13.7083 15.9503 14.2 15.0752 15.0752C14.2 15.9503 13.7083 17.1373 13.7083 18.375Z'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M18.375 16.6211V18.3758L19.5417 19.5424'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.button>

            {/* 숙소 관리 탭 */}
            <motion.button
              onClick={() => {
                setCurrentTab('properties')
                scrollToTop()
                router.push('/properties')
              }}
              whileTap={{ scale: 0.95 }}
              className='w-15 h-10 z-10 rounded-full flex justify-center items-center cursor-pointer transition-colors'
              aria-label='숙소 관리'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='23'
                height='22'
                viewBox='0 0 23 22'
                fill='none'
                className={currentTab === 'properties' ? 'text-[#3C2F2F]' : 'text-white'}
              >
                <path
                  d='M0.875 20.7083H21.875M2.04167 20.7083V3.20833C2.04167 2.58949 2.2875 1.996 2.72508 1.55842C3.16267 1.12083 3.75616 0.875 4.375 0.875H18.375C18.9938 0.875 19.5873 1.12083 20.0249 1.55842C20.4625 1.996 20.7083 2.58949 20.7083 3.20833V20.7083'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M7.875 20.7083V11.375C7.875 10.4467 8.24375 9.5565 8.90013 8.90013C9.5565 8.24375 10.4467 7.875 11.375 7.875C12.3033 7.875 13.1935 8.24375 13.8499 8.90013C14.5063 9.5565 14.875 10.4467 14.875 11.375V20.7083'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
