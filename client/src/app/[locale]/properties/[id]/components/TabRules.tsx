import { useRef } from 'react'

interface TabContainerProps {
  id: string
  ref: React.RefObject<HTMLDivElement | null>
  data: any
}

export const TabRules = ({ id, ref, data }: TabContainerProps) => {
  return (
    <>
      <section id={id} ref={ref} className='w-full h-fit scroll-mt-[240px] px-5'>
        <div className='w-full min-h-[30vh] h-fit flex flex-col justify-start gap-8 pt-5 pb-12 border-b-2 border-stone-200'>
          {/* 1 */}
          <div className='w-full h-fit flex flex-col gap-4'>
            <span className='text-xl font-bold'>Rules</span>
            <div className='w-full h-fit flex flex-col gap-2'>
              {data.rules && data.rules.length > 0 ? (
                data.rules.map((rule: string, index: number) => (
                  <span key={index} className='w-full h-fit text-left text-base py-1'>
                    {rule}
                  </span>
                ))
              ) : (
                <p className='text-base py-1'>No rules listed.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
