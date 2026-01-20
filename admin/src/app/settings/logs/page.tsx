'use client'

import { AccessLogsViewer } from '@/components/AccessLogsViewer'
import { useRouter } from 'next/navigation'

export default function Logs() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <div className='fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full min-h-dvh h-full overflow-y-scroll bg-[#F4F3F1] z-50'>
        <div className='w-full h-fit flex flex-row justify-between items-center mb-4'>
          <button
            className='w-fit px-4 h-fit py-3 active:scale-90 active:opacity-70 transition-all text-black flex justify-center items-center'
            onClick={handleBack}
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M3.63654 11.2932C3.44907 11.4807 3.34375 11.735 3.34375 12.0002C3.34375 12.2653 3.44907 12.5197 3.63654 12.7072L9.29354 18.3642C9.48214 18.5463 9.73474 18.6471 9.99694 18.6449C10.2591 18.6426 10.5099 18.5374 10.6954 18.352C10.8808 18.1666 10.9859 17.9158 10.9882 17.6536C10.9905 17.3914 10.8897 17.1388 10.7075 16.9502L6.75754 13.0002H20.0005C20.2658 13.0002 20.5201 12.8948 20.7076 12.7073C20.8952 12.5198 21.0005 12.2654 21.0005 12.0002C21.0005 11.735 20.8952 11.4806 20.7076 11.2931C20.5201 11.1055 20.2658 11.0002 20.0005 11.0002H6.75754L10.7075 7.05018C10.8897 6.86158 10.9905 6.60898 10.9882 6.34678C10.9859 6.08458 10.8808 5.83377 10.6954 5.64836C10.5099 5.46295 10.2591 5.35778 9.99694 5.35551C9.73474 5.35323 9.48214 5.45402 9.29354 5.63618L3.63654 11.2932Z' />
            </svg>
            <span className='ml-2 text-base font-medium'>접속 로그 관리</span>
          </button>
        </div>
        <div className='w-full h-fit'>
          <AccessLogsViewer />
        </div>
      </div>
    </>
  )
}
