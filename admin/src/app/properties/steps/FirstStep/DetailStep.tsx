'use client'

import React from 'react'
import { JusoItem } from '.'
import { motion } from 'motion/react'
import { MdClose } from 'react-icons/md'
import { useInputFocus } from '@/hooks/useInputFocus'

// 상세 입력 스텝
interface DetailStepProps {
  form: any
  selectedJuso: JusoItem | null
  iframePreview: boolean
  setIframePreview: (value: boolean) => void
  onResearch: () => void
  updateAddress: (field: string, value: string) => void
  updateForm: (field: string, value: string) => void
}

export const DetailStep = ({
  form,
  selectedJuso,
  iframePreview,
  setIframePreview,
  onResearch,
  updateAddress,
  updateForm,
}: DetailStepProps) => (
  <div className='w-full h-fit flex flex-col gap-6 p-5 pb-32'>
    <Field label='기본주소 (영문)' rightText='재검색' rightAction={onResearch}>
      <div className='w-full h-fit p-4 bg-stone-100 rounded-md flex flex-col gap-3 justify-start items-start'>
        <div className='w-fit h-fit flex flex-col gap-2 justify-start items-start'>
          <div className='w-full h-fit text-sm break-words'>{form.address.address1 || '—'}</div>
        </div>
      </div>
    </Field>

    <Field label='상세주소' required='영문작성'>
      <input
        type='text'
        placeholder='상세주소 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.address.address2 || ''}
        onChange={(e) => updateAddress('address2', e.target.value)}
        onFocus={useInputFocus}
      />
    </Field>

    <Field label='숙소명' required='영문작성'>
      <input
        type='text'
        placeholder='숙소명 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.name || ''}
        onChange={(e) => updateForm('name', e.target.value)}
        onFocus={useInputFocus}
      />
    </Field>

    <Field label='길 안내' required='영문작성'>
      <textarea
        placeholder='길 안내 입력'
        className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all outline-none resize-none'
        value={form.address.guide || ''}
        onChange={(e) => updateAddress('guide', e.target.value)}
        onFocus={useInputFocus}
      />
    </Field>

    <Field
      label='구글 지도 임베드 링크'
      rightText='미리보기'
      rightAction={() => form.address.iframe_src && setIframePreview(true)}
    >
      <input
        type='text'
        placeholder='구글 지도 임베드 링크 입력'
        className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
        value={form.address.iframe_src || ''}
        onChange={(e) => updateAddress('iframe_src', e.target.value)}
        onFocus={useInputFocus}
      />
    </Field>

    {iframePreview && <IframePreview src={form.address.iframe_src} onClose={() => setIframePreview(false)} />}

    <Field label='숙소 설명' required='영문작성'>
      <textarea
        placeholder='숙소 설명 입력'
        className='w-full min-h-24 bg-stone-100 px-4 py-2 rounded-md focus:bg-stone-200 transition-all outline-none resize-none'
        value={form.description || ''}
        onChange={(e) => updateForm('description', e.target.value)}
        onFocus={useInputFocus}
      />
    </Field>
  </div>
)

// 아이프레임 미리보기 모달
const IframePreview = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-5'
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className='absolute top-5 right-5 text-white text-xl rounded-full active:scale-75 active:opacity-50 transition-all'
      aria-label='닫기'
    >
      <MdClose />
    </button>

    <span className='absolute top-5 text-white text-base font-medium'>구글 지도 미리보기</span>

    <div
      onClick={(e) => e.stopPropagation()}
      className='w-full h-auto aspect-square rounded-lg overflow-hidden bg-black relative'
    >
      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-0'>로딩 중...</span>
      <iframe
        src={src}
        width='100%'
        height='100%'
        style={{ border: 0 }}
        className='absolute top-0 left-0 w-full h-full z-10'
        allowFullScreen
        loading='eager'
        referrerPolicy='no-referrer-when-downgrade'
        title='구글 지도'
      />
    </div>
  </motion.div>
)

// Field 컴포넌트
const Field = ({
  label,
  required,
  rightText,
  rightAction,
  children,
}: {
  label?: string
  required?: string
  rightText?: string
  rightAction?: () => void
  children: React.ReactNode
}) => {
  return (
    <div className='w-full h-fit flex flex-col gap-2'>
      <div className='w-full h-fit flex flex-row justify-between items-center'>
        <span className='text-sm font-medium'>
          {label && `${label}${required ? '*' : ''}`}
          {required && <span className='text-xs text-black/50 font-normal ml-2'>{required}</span>}
        </span>
        {rightText && rightAction && (
          <button
            onClick={rightAction}
            className='text-sm text-stone-400 active:opacity-70 cursor-pointer transition-all'
          >
            {rightText}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
