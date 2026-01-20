//steps/BasicInfoStep/index.tsx

'use client'

import { Button } from '@/components'
import { BottomSheet } from '@/app/properties/components'
import { useState, useCallback, useEffect } from 'react'
import { SearchStep } from './SearchStep'
import { DetailStep } from './DetailStep'
import { useVisualViewportHeightVar } from '@/hooks/useVisualViewportHeight'

interface StepProps {
  isOpen: boolean
  onClose: () => void
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  mode?: 'create' | 'edit'
}

export type JusoItem = {
  korAddr: string
  roadAddr: string
}

export const BasicInfoStep = ({ isOpen, onClose, form, setForm, mode = 'create' }: StepProps) => {
  // 초기 depth 설정: 수정 모드이거나 이미 주소가 있으면 DetailStep(1)으로 시작
  const getInitialDepth = () => {
    if (mode === 'edit' && form.address?.address1) {
      return 1 // DetailStep
    }
    return 0 // SearchStep
  }

  const [depth, setDepth] = useState(getInitialDepth())
  const [iframePreview, setIframePreview] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedJuso, setSelectedJuso] = useState<JusoItem | null>(null)

  // 모달이 열릴 때마다 초기 depth 재설정
  useEffect(() => {
    if (isOpen) {
      setDepth(getInitialDepth())
    }
  }, [isOpen, mode, form.address?.address1])

  // Validation
  const step1ValidCheck = Boolean(form.address.address1?.length)
  const step2ValidCheck = Boolean(form.name?.length && form.address.address2?.length)

  // SearchStep에서 위치 선택 완료
  const handleLocationSelect = useCallback(
    (data: { korAddr: string; engAddr: string; lat: number; lng: number; embedUrl: string }) => {
      console.log('✅ 위치 선택 완료:', data)

      setSelectedJuso({
        korAddr: data.korAddr,
        roadAddr: data.engAddr,
      })

      setForm((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          address1: data.engAddr, // 영문 주소
          address2: prev.address.address2 || null,
          guide: prev.address.guide || null,
          iframe_src: data.embedUrl, // 임베드 링크
        },
      }))

      // 자동으로 다음 단계로
      setDepth(1)
    },
    [setForm],
  )

  useVisualViewportHeightVar('--viewport-height')

  const handleClose = useCallback(() => {
    setSelectedJuso(null)
    setIframePreview(false)
    setDepth(getInitialDepth()) // 닫을 때 초기 depth로 리셋
    onClose()
  }, [onClose, mode, form.address?.address1])

  const handleBack = useCallback(() => {
    if (depth < 1) {
      handleClose()
    } else {
      // 수정 모드에서 뒤로가기 시 모달 닫기 (SearchStep으로 안 감)
      if (mode === 'edit') {
        handleClose()
      } else {
        setDepth(0)
      }
    }
  }, [depth, handleClose, mode])

  const handleResearch = useCallback(() => {
    setDepth(0)
    // 재검색 시 주소 데이터 초기화
    setForm((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        address1: null,
        iframe_src: null,
      },
    }))
  }, [setForm])

  const handleNext = useCallback(() => {
    if (depth < 1) {
      // SearchStep에서는 위치 선택 시 자동으로 넘어감
      return
    } else {
      handleClose()
    }
  }, [depth, handleClose])

  const updateAddress = useCallback(
    (field: string, value: string) => {
      setForm((prev: any) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }))
    },
    [setForm],
  )

  const updateForm = useCallback(
    (field: string, value: string) => {
      setForm((prev: any) => ({ ...prev, [field]: value }))
    },
    [setForm],
  )

  const scrollOffset = 80

  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      const element = e.target
      const container = element.closest('[data-rsbs-scroll]')

      if (container) {
        const elementRect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - scrollOffset

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 300)
  }, [])

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} leftAction={{ onClick: handleBack }} title='숙소 등록'>
      {depth === 0 ? (
        <SearchStep
          onLocationSelect={handleLocationSelect}
          selectedAddress={form.address.address1}
          isMapLoaded={isMapLoaded}
          setIsMapLoaded={setIsMapLoaded}
        />
      ) : (
        <DetailStep
          form={form}
          selectedJuso={selectedJuso}
          iframePreview={iframePreview}
          setIframePreview={setIframePreview}
          onResearch={handleResearch}
          updateAddress={updateAddress}
          updateForm={updateForm}
          onInputFocus={handleInputFocus}
        />
      )}

      {/* DetailStep일 때만 완료 버튼 표시 */}
      {depth === 1 && (
        <div className='absolute bottom-0 w-full h-fit px-5 pb-5 z-10'>
          <Button onClick={handleNext} disabled={!step2ValidCheck}>
            완료
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
