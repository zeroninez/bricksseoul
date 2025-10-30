'use client'
import { Sheet } from 'react-modal-sheet'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePropertyCreate, usePropertyGet } from '@/hooks/useProperty'
import { BottomSheet, ListItem } from './components'
import { PropertyCreatePayload, PropertyUpdatePayload } from '@/types/property'
import { Button } from '@/components'
import { FirstStep, SecondStep } from './steps'

interface CreateSheetProps {
  isOpen: boolean
  onClose: () => void
}

type StepKey = 1 | 2 | 3 | 4 | 5

export const CreateSheet = ({ isOpen, onClose }: CreateSheetProps) => {
  const [depth, setDepth] = useState<StepKey | 0>(0)

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
      >
        <main className='w-full h-full flex flex-col justify-start items-start gap-6 p-5'>
          <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
            <ListItem
              text='주소/숙소명'
              onClick={() => {
                setDepth(1)
              }}
            >
              {form.name && (
                <div className='mt-2'>
                  <span className='text-stone-400 font-medium mr-1.5'>숙소명</span>
                  {form.name}
                </div>
              )}
              {form.address.address1 && (
                <div className=''>
                  <span className='text-stone-400 font-medium mr-1.5'>주소</span>
                  {form.address.address1}
                </div>
              )}
            </ListItem>
            <ListItem
              text='공간 정보/어메니티/규율'
              onClick={() => {
                setDepth(2)
              }}
            >
              {form.space_info.available_people && (
                <div className='mt-2 w-full flex flex-row flex-wrap h-fit justify-start items-center'>
                  <span className='text-stone-400 font-medium mr-1.5'>수용 인원</span>
                  {form.space_info.available_people}명 / <span className='text-stone-400 font-medium mr-1.5'>거실</span>
                  {form.space_info.living_rooms}개 / <span className='text-stone-400 font-medium mr-1.5'>침실</span>
                  {form.space_info.bedrooms}개 / <span className='text-stone-400 font-medium mr-1.5'>욕실</span>
                  {form.space_info.bathrooms}개
                </div>
              )}
            </ListItem>
            <ListItem
              text='객실 사진'
              onClick={() => {
                setDepth(3)
              }}
              // value={form.images.length > 0 ? `${form.images.length}장` : ''}
            />
            <ListItem
              text='체크인/아웃 시간'
              onClick={() => {
                setDepth(4)
              }}
              // value={form.check_in && form.check_out ? `${form.check_in} ~ ${form.check_out}` : ''}
            />
            <ListItem
              text='요금'
              onClick={() => {
                setDepth(5)
              }}
              // value={form.price_per_night > 0 ? `${form.price_per_night.toLocaleString()} ${form.currency}` : ''}
            />
          </div>
          <div className='w-fit h-fit text-sm text-blue-500'>게스트 사이트 미리보기</div>
        </main>
        <div className='absolute bottom-0 w-full h-fit px-5 pb-5 z-10'>
          <Button onClick={handleSave} disabled={creating || !form.name || form.price_per_night <= 0}>
            {creating ? '저장 중...' : '등록하기'}
          </Button>
        </div>

        <FirstStep
          isOpen={depth === 1}
          onClose={() => {
            setDepth(0)
          }}
          form={form}
          setForm={setForm}
        />
        <SecondStep
          isOpen={depth === 2}
          onClose={() => {
            setDepth(0)
          }}
          form={form}
          setForm={setForm}
        />
        {/* ThirdStep, FourthStep, FifthStep 컴포넌트도 동일한 패턴으로 추가 */}
      </BottomSheet>
    </>
  )
}
