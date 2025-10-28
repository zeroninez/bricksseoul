'use client'
import { Sheet } from 'react-modal-sheet'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePropertyCreate, usePropertyGet } from '@/hooks/useProperty'
import { BottomSheet, ListItem } from './components'
import { PropertyCreatePayload, PropertyUpdatePayload } from '@/types/property'
import { Button } from '@/components'
import { FirstStep } from './steps'

interface CreateSheetProps {
  isOpen: boolean
  onClose: () => void
}

type StepKey = 1 | 2 | 3 | 4 | 5

export const CreateSheet = ({ isOpen, onClose }: CreateSheetProps) => {
  const [depth, setDepth] = useState<StepKey | 0>(0)

  const DEPTH_LIST = ['주소/숙소명', '공간 정보/어메니티/규율', '객실 사진', '체크인/아웃 시간', '요금']

  // 폼 상태 (create/edit 공용)
  const [form, setForm] = useState<{
    name: string
    description?: string
    address: {
      address1?: string | null
      address2?: string | null
      guide?: string | null
      iframe_src?: string | null
    }
    space_info: {
      available_people?: number | null
      living_rooms?: number
      bedrooms?: number
      bathrooms?: number
    }
    check_in?: string | null
    check_out?: string | null
    price_per_night: number
    currency?: string
    rules: string[]
    amenities: string[]
    images: { url: string; is_primary?: boolean; sort_order?: number; category?: string | null }[]
  }>({
    name: '',
    description: '',
    address: { address1: null, address2: null, guide: null, iframe_src: null },
    space_info: { available_people: null, living_rooms: 0, bedrooms: 0, bathrooms: 0 },
    check_in: null,
    check_out: null,
    price_per_night: 0,
    currency: 'KRW',
    rules: [],
    amenities: [],
    images: [],
  })

  // 생성/수정 훅
  const { mutate: createMutate, isPending: creating } = usePropertyCreate()

  // 저장 핸들러
  const handleSave = () => {
    const payload: PropertyCreatePayload = {
      name: form.name,
      description: form.description,
      check_in: form.check_in ?? undefined,
      check_out: form.check_out ?? undefined,
      price_per_night: form.price_per_night,
      currency: form.currency,
      address: form.address,
      space_info: form.space_info,
      rules: form.rules,
      amenities: form.amenities,
      images: form.images,
    }
    createMutate(payload, {
      onSuccess: () => {
        setDepth(0)
        onClose()
      },
    })
  }

  const onExit = () => {
    setForm({
      name: '',
      description: '',
      address: { address1: null, address2: null, guide: null, iframe_src: null },
      space_info: { available_people: null, living_rooms: 0, bedrooms: 0, bathrooms: 0 },
      check_in: null,
      check_out: null,
      price_per_night: 0,
      currency: 'KRW',
      rules: [],
      amenities: [],
      images: [],
    })
    setDepth(0)
    onClose()
  }

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onExit}
        title='숙소'
        leftAction={{
          onClick: onExit,
        }}
        nextAction={{
          text: creating ? '저장 중...' : '등록하기',
          onClick: handleSave,
          disabled: creating || !form.name || form.price_per_night <= 0,
        }}
      >
        <main className='w-full h-full flex flex-col justify-start items-start gap-6 p-5'>
          <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
            {DEPTH_LIST.map((title, index) => (
              <ListItem
                key={index}
                text={title}
                onClick={() => {
                  setDepth((index + 1) as StepKey)
                }}
              />
            ))}
          </div>
          <div className='w-fit h-fit text-sm text-blue-500'>게스트 사이트 미리보기</div>
        </main>

        <FirstStep
          isOpen={depth === 1}
          onClose={() => {
            setDepth(0)
          }}
          form={form}
          setForm={setForm}
        />
      </BottomSheet>
    </>
  )
}
