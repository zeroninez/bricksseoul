import { PropertyGetResponse } from '@/types/property'
import { useRef } from 'react'

interface TabContainerProps {
  id: string
  ref: React.RefObject<HTMLDivElement | null>
  data: PropertyGetResponse
}

export const TabLocation = ({ id, ref, data }: TabContainerProps) => {
  const getLocalizedMapUrl = (baseUrl: string, language: string = 'en') => {
    if (!baseUrl) return ''
    return baseUrl.includes('language=') ? baseUrl : `${baseUrl}&language=${language}`
  }

  return (
    <>
      <section id={id} ref={ref} className='w-full h-fit scroll-mt-[240px] px-5'>
        <div className='w-full min-h-[55vh] h-fit flex flex-col justify-start gap-8 pt-5 pb-12 border-b-2 border-stone-200'>
          {/* 1 */}
          <div className='w-full h-fit flex flex-col gap-4'>
            <span className='text-xl font-bold'>Location</span>
            <div
              onClick={(e) => e.stopPropagation()}
              className='w-full h-auto aspect-square rounded-lg overflow-hidden bg-black relative'
            >
              <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-0'>
                로딩 중...
              </span>
              <iframe
                src={getLocalizedMapUrl(data.address?.iframe_src || '', 'en')}
                width='100%'
                height='100%'
                style={{
                  border: 0,
                }}
                className='absolute top-0 left-0 w-full h-full z-0'
                allowFullScreen={true}
                loading='eager'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>
            <div className='w-full h-fit flex flex-col gap-2'>
              <span className='text-base'>{data.address?.address1}</span>
              <span className='text-base text-stone-500'>{data.address?.address2}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
