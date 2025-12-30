// src/components/PasswordChangeModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PasswordChangeModal = ({ isOpen, onClose }: PasswordChangeModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { login, changePassword } = useAdminAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 현재 비밀번호 확인
      const isCurrentPasswordValid = await login(currentPassword)

      if (!isCurrentPasswordValid) {
        setError('현재 비밀번호가 올바르지 않습니다.')
        setIsLoading(false)
        return
      }

      // 새 비밀번호로 변경
      const changeSuccess = await changePassword(newPassword)

      if (changeSuccess) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        }, 2000)
      } else {
        setError('비밀번호 변경에 실패했습니다.')
      }
    } catch (err) {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 max-w-md mx-auto bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50'
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-white p-6 w-full max-w-md rounded-xl shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className='text-lg mb-4'>관리자 비밀번호 변경</h2>

            {success ? (
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <p className='text-green-600 font-medium'>비밀번호가 성공적으로 변경되었습니다!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>현재 비밀번호</label>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className='w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent'
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>새 비밀번호</label>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent'
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>새 비밀번호 확인</label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent'
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className='p-3 bg-red-50 border rounded-lg border-red-200 text-red-700 text-sm'>{error}</div>
                )}

                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={handleClose}
                    className='flex-1 px-4 py-3 rounded-lg border border-[#CFC7C7] bg-[#EFECEC] text-[#3C2F2F] hover:bg-gray-400 transition-colors'
                    disabled={isLoading}
                  >
                    취소
                  </button>
                  <button
                    type='submit'
                    className='flex-1 px-4 py-3 rounded-lg bg-[#3C2F2F] text-white hover:opacity-90 transition-colors disabled:opacity-50'
                    disabled={isLoading}
                  >
                    {isLoading ? '변경 중...' : '변경'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
