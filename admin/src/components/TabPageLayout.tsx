'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

interface TabPageLayoutProps {
  tabs: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
  children: React.ReactNode
  refreshHandler?: {
    isLoading: boolean
    error: unknown
    onRefetch: () => void
  }
}

export const TabPageLayout = ({ tabs, activeTab, setActiveTab, children, refreshHandler }: TabPageLayoutProps) => {
  const router = useRouter()
  return (
    <>
      <div className='fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full min-h-dvh overflow-y-auto bg-white z-50'>
        <div className='sticky top-0 w-full h-fit flex flex-col justify-start items-center border-b bg-background border-b-[#E6E0E0]'>
          <div className='w-full relative py-1 h-fit px-4 flex flex-row justify-between items-center '>
            <button
              className='w-fit pr-1 h-8 z-10 active:scale-90 active:opacity-70 transition-all text-black flex justify-center items-center'
              onClick={() => {
                router.back()
              }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M3.63654 11.2932C3.44907 11.4807 3.34375 11.735 3.34375 12.0002C3.34375 12.2653 3.44907 12.5197 3.63654 12.7072L9.29354 18.3642C9.48214 18.5463 9.73474 18.6471 9.99694 18.6449C10.2591 18.6426 10.5099 18.5374 10.6954 18.352C10.8808 18.1666 10.9859 17.9158 10.9882 17.6536C10.9905 17.3914 10.8897 17.1388 10.7075 16.9502L6.75754 13.0002H20.0005C20.2658 13.0002 20.5201 12.8948 20.7076 12.7073C20.8952 12.5198 21.0005 12.2654 21.0005 12.0002C21.0005 11.735 20.8952 11.4806 20.7076 11.2931C20.5201 11.1055 20.2658 11.0002 20.0005 11.0002H6.75754L10.7075 7.05018C10.8897 6.86158 10.9905 6.60898 10.9882 6.34678C10.9859 6.08458 10.8808 5.83377 10.6954 5.64836C10.5099 5.46295 10.2591 5.35778 9.99694 5.35551C9.73474 5.35323 9.48214 5.45402 9.29354 5.63618L3.63654 11.2932Z' />
              </svg>
            </button>
            <span className='absolute inset-0 flex justify-center items-center text-black'>전체 내역 조회</span>
            {refreshHandler && (
              <button
                className={classNames(
                  'w-fit pl-1 h-8 z-10 active:scale-90 active:opacity-70 transition-all flex justify-center items-center',
                  refreshHandler.isLoading ? 'animate-spin text-gray-400' : 'text-black',
                )}
                onClick={refreshHandler.onRefetch}
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M2.00003 12.0799C1.99403 11.2179 2.91003 10.7239 3.61803 11.1049L3.71303 11.1629L6.39103 12.9669C7.36303 13.6219 6.76803 15.1099 5.65703 14.9739L5.54003 14.9539L4.47703 14.7199C5.01733 16.2148 5.99057 17.5149 7.27267 18.4544C8.55477 19.3939 10.0876 19.9303 11.6758 19.9953C13.264 20.0602 14.8355 19.6506 16.19 18.8188C17.5445 17.987 18.6206 16.7707 19.281 15.3249C19.3946 15.0896 19.5957 14.908 19.8415 14.8191C20.0872 14.7301 20.358 14.7409 20.5958 14.8492C20.8337 14.9574 21.0198 15.1544 21.1142 15.3981C21.2086 15.6418 21.2039 15.9127 21.101 16.1529C19.114 20.5229 14.205 22.9459 9.41403 21.6619C7.30001 21.0961 5.42998 19.8524 4.09076 18.1215C2.75154 16.3907 2.01708 14.2683 2.00003 12.0799ZM2.90303 7.85195C4.89003 3.48195 9.79903 1.05995 14.59 2.34295C16.7039 2.90877 18.5738 4.15235 19.913 5.88298C21.2522 7.61361 21.9868 9.73574 22.004 11.9239C22.011 12.7869 21.094 13.2819 20.387 12.8999L20.291 12.8419L17.613 11.0379C16.641 10.3829 17.236 8.89495 18.347 9.03095L18.464 9.05095L19.527 9.28495C18.9867 7.7901 18.0135 6.49003 16.7314 5.55049C15.4493 4.61096 13.9164 4.07455 12.3283 4.00964C10.7401 3.94474 9.16857 4.35429 7.81408 5.18607C6.45959 6.01785 5.3835 7.23417 4.72303 8.67995C4.6706 8.80241 4.59424 8.91316 4.49841 9.0057C4.40259 9.09824 4.28925 9.1707 4.16504 9.21883C4.04082 9.26696 3.90825 9.28979 3.77509 9.28597C3.64193 9.28216 3.51088 9.25178 3.38963 9.19661C3.26838 9.14145 3.15937 9.06262 3.069 8.96474C2.97864 8.86687 2.90874 8.75192 2.86341 8.62666C2.81808 8.5014 2.79823 8.36834 2.80504 8.23531C2.81184 8.10227 2.84516 7.97193 2.90303 7.85195Z' />
                </svg>
              </button>
            )}
          </div>
          <div className='w-full h-fit inline-flex relative'>
            {tabs.map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className='w-full h-fit py-3 flex justify-center items-center active:opacity-70 transition-all cursor-pointer'
              >
                <span className='text-base font-medium text-[#3C2F2F]'>{tab}</span>
              </div>
            ))}
            <div
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`,
              }}
              className='absolute bottom-0 z-10 transition-all duration-300'
            >
              <div className='w-18 h-0.5  bg-[#3C2F2F] mx-auto rounded-full' />
            </div>
          </div>
        </div>
        <div className='w-full h-full pb-32'>{children}</div>
      </div>
    </>
  )
}
