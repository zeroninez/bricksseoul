'use client'
import { Sheet } from 'react-modal-sheet'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePropertyGet } from '@/hooks/useProperty'
import { BottomSheet, ListItem } from './components'

interface EditSheetProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
}

export const EditSheet = ({ isOpen, onClose, propertyId }: EditSheetProps) => {
  const [depth, setDepth] = useState(0)

  const DEPTH_LIST = ['주소/숙소명', '공간 정보/어메니티/규율', '객실 사진', '체크인/아웃 시간', '요금']

  //mode가 edit이고 propertyId가 있을 때만 호출
  const { data: propertyData } = usePropertyGet(propertyId)

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title='숙소'
        leftAction={{
          onClick: onClose,
        }}
      >
        <main className='w-full h-fit flex flex-col justify-start items-start gap-6 p-5'>
          <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
            {DEPTH_LIST.map((title, index) => (
              <ListItem
                key={index}
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
        <AnimatePresence>
          {depth > 0 && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2 }}
              className='fixed top-0 left-0 w-full h-full bg-white z-50 shadow-lg flex flex-col'
            >
              {/* content */}
              <div className='w-full h-full flex flex-col justify-start items-start p-5 gap-4'></div>
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>
    </>
  )
}
