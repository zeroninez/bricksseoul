'use client'
import { Sheet } from 'react-modal-sheet'
import { Header } from './components'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePropertyGet } from '@/hooks/useProperty'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  propertyId?: string
}

export const Drawer = ({ isOpen, onClose, mode, propertyId }: DrawerProps) => {
  const [depth, setDepth] = useState(0)

  const DEPTH_LIST = ['주소/숙소명', '공간 정보/어메니티/규율', '객실 사진', '체크인/아웃 시간', '요금']

  //mode가 edit이고 propertyId가 있을 때만 호출
  const { data: propertyData } = usePropertyGet(mode === 'edit' && propertyId ? propertyId : undefined)

  return (
    <>
      <Sheet detent='full' disableDrag isOpen={isOpen} onClose={onClose}>
        <Sheet.Container className='!rounded-t-none'>
          <Sheet.Content>
            {/* header */}
            <Header
              title='숙소'
              leftAction={{
                onClick: onClose,
              }}
            />
            {/* content */}
            <main className='w-full h-full flex flex-col justify-start items-start gap-6 p-5'>
              <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
                {DEPTH_LIST.map((title, index) => (
                  <Item
                    key={index}
                    mode={mode}
                    text={title}
                    onClick={() => {
                      setDepth(index + 1)
                    }}
                    value={
                      index === 0
                        ? propertyData?.name
                        : index === 1
                          ? ''
                          : index === 2
                            ? `${propertyData?.images.length || 0}장`
                            : index === 3
                              ? `${propertyData?.check_in} 입실 / ${propertyData?.check_out} 퇴실`
                              : index === 4
                                ? `${propertyData?.price_per_night.toLocaleString()}원 / 1박`
                                : 'null'
                    }
                  />
                ))}
              </div>
              <div className='w-fit h-fit text-sm text-blue-500'>게스트 사이트 미리보기</div>
            </main>
          </Sheet.Content>
          <AnimatePresence>
            {depth > 0 && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.2 }}
                className='fixed top-0 left-0 w-full h-full bg-white z-50 shadow-lg flex flex-col'
              >
                <Header
                  leftAction={{
                    onClick: () => {
                      setDepth(0)
                    },
                  }}
                />
                {/* content */}
                <div className='w-full h-full flex flex-col justify-start items-start p-5 gap-4'></div>
              </motion.div>
            )}
          </AnimatePresence>
        </Sheet.Container>
      </Sheet>
    </>
  )
}

const Item = ({
  mode,
  text,
  onClick,
  value,
}: {
  mode?: 'create' | 'edit'
  text: string
  onClick: () => void
  value?: string | undefined
}) => {
  return (
    <div
      onClick={onClick}
      className='w-full h-fit flex flex-row justify-between items-center bg-stone-100 rounded-lg active:opacity-50 active:translate-y-0.5 transition-all'
    >
      <span className='w-fit h-fit flex-shrink-0 px-5 py-4 text-sm font-normal leading-none'>{text}</span>
      <div className='w-full h-fit flex flex-row justify-end items-center'>
        {value && mode == 'edit' && <div className='max-w-40 truncate text-sm text-stone-400 text-right'>{value}</div>}
        <div className='w-fit h-fit flex-shrink-0 px-2 py-2'>
          <svg className='w-6 h-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'>
            <path d='M9 6.75L14.25 12L9 17.25' stroke='currentColor' strokeWidth={1.2} />
          </svg>
        </div>
      </div>
    </div>
  )
}
