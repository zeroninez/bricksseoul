//steps/SpaceInfoStep/index.tsx

'use client'

import { Button } from '@/components'
import { BottomSheet } from '../../components'
import { useEffect, useState, useCallback } from 'react'
import { SpaceInfo } from './SpaceInfo'
import { Amenities } from './Amenities'
import { Rules } from './Rules'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  mode: 'create' | 'edit'
}

export const SpaceInfoStep = ({ isOpen, onClose, form, setForm, mode = 'create' }: StepProps) => {
  const [depth, setDepth] = useState(0)

  // 공통 핸들러
  const handleClose = useCallback(() => onClose(), [onClose])
  const handleBack = useCallback(() => (depth === 0 ? handleClose() : setDepth(depth - 1)), [depth, handleClose])
  const handleNext = useCallback(() => (depth < 2 ? setDepth(depth + 1) : handleClose()), [depth, handleClose])

  // Visual Viewport Height 적용
  useVisualViewportHeightVar('--viewport-height')

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      leftAction={{ onClick: handleBack }}
      title='공간 정보 / 어메니티 / 규율'
    >
      {/* 1단계: 공간 정보 */}
      {depth === 0 && <SpaceInfo form={form} setForm={setForm} />}

      {/* 2단계: 어메니티 */}
      {depth === 1 && <Amenities form={form} setForm={setForm} />}

      {/* 3단계: 규율 (간단 CRUD 버전) */}
      {depth === 2 && <Rules form={form} setForm={setForm} />}

      {/* 하단 버튼 */}
      <div className='fixed bottom-0 w-full h-fit px-5 pb-5 z-10'>
        <Button onClick={handleNext}>{depth < 2 ? '다음으로' : '완료'}</Button>
      </div>
    </BottomSheet>
  )
}
