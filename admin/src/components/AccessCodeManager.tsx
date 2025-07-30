// src/components/AccessCodeManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase, AccessCode } from '@/lib/supabase'
import { TbRefresh } from 'react-icons/tb'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export const AccessCodeManager = () => {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newCode, setNewCode] = useState({ code: '', name: '' })

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 페이지네이션 계산
  const totalPages = Math.ceil(accessCodes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCodes = accessCodes.slice(startIndex, endIndex)

  // 초대코드 목록 조회
  const fetchAccessCodes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false })

      if (error) throw error
      setAccessCodes(data || [])
      setCurrentPage(1) // 새로운 데이터 로드 시 첫 페이지로
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 새 초대코드 추가
  const addAccessCode = async () => {
    if (!newCode.code.trim() || !newCode.name.trim()) {
      setError('코드와 이름을 모두 입력해주세요.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('access_codes')
        .insert([{ code: newCode.code.trim().toUpperCase(), name: newCode.name.trim() }])
        .select()

      if (error) throw error

      setAccessCodes((prev) => [data[0], ...prev])
      setNewCode({ code: '', name: '' })
      setIsAddingNew(false)
      setError(null)
      setCurrentPage(1) // 새 코드 추가 시 첫 페이지로
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대코드 추가에 실패했습니다.')
    }
  }

  // 초대코드 활성화/비활성화 토글
  const toggleCodeStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('access_codes').update({ is_active: !currentStatus }).eq('id', id)

      if (error) throw error

      setAccessCodes((prev) => prev.map((code) => (code.id === id ? { ...code, is_active: !currentStatus } : code)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
    }
  }

  // 초대코드 삭제
  const deleteAccessCode = async (id: number) => {
    if (!confirm('정말로 이 초대코드를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('access_codes').delete().eq('id', id)

      if (error) throw error

      setAccessCodes((prev) => prev.filter((code) => code.id !== id))

      // 현재 페이지에 데이터가 없으면 이전 페이지로
      const newTotal = accessCodes.length - 1
      const newTotalPages = Math.ceil(newTotal / itemsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  // 페이지 변경
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  // 이전 페이지
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 다음 페이지
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  useEffect(() => {
    fetchAccessCodes()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      {/* 헤더 */}
      <div className='flex justify-between items-center'>
        <motion.button
          onClick={() => setIsAddingNew(true)}
          className='px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-black/90 transition-colors'
          whileTap={{ scale: 0.95 }}
        >
          새 코드 추가
        </motion.button>

        {/* 새로고침 버튼 */}
        <button
          onClick={fetchAccessCodes}
          className='px-3 py-2 flex text-sm flex-row justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors'
        >
          <TbRefresh className='w-4 h-4' />
          새로고침
        </button>
      </div>

      {/* 에러 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'
          >
            {error}
            <button onClick={() => setError(null)} className='ml-2 text-red-500 hover:text-red-700'>
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 코드 추가 폼 */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='overflow-hidden'
          >
            <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4'>
              <h3 className='text-lg font-semibold'>새 초대코드 추가</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>초대코드</label>
                  <input
                    type='text'
                    value={newCode.code}
                    onChange={(e) => setNewCode((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    placeholder='예: BRICKS2024'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>코드 이름</label>
                  <input
                    type='text'
                    value={newCode.name}
                    onChange={(e) => setNewCode((prev) => ({ ...prev, name: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    placeholder='예: 2024년 1월 이벤트'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={addAccessCode}
                  className='px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors'
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewCode({ code: '', name: '' })
                    setError(null)
                  }}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
                >
                  취소
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 페이지네이션 정보 */}
      {accessCodes.length > 0 && (
        <div className='flex justify-between items-center text-sm text-gray-600'>
          <span>
            총 {accessCodes.length}개 중 {startIndex + 1}-{Math.min(endIndex, accessCodes.length)}개 표시
          </span>
          <span>
            {currentPage} / {totalPages} 페이지
          </span>
        </div>
      )}

      {/* 초대코드 목록 */}
      <div className='space-y-3'>
        {accessCodes.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
            <div className='text-4xl mb-4'>📝</div>
            <p className='text-gray-500 mb-4'>등록된 초대코드가 없습니다.</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className='px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors'
            >
              첫 번째 코드 만들기
            </button>
          </div>
        ) : (
          currentCodes.map((code, index) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <span className='font-mono font-bold text-black'>{code.code}</span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {code.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className='text-sm text-gray-700 mb-1'>{code.name}</p>
                  <p className='text-sm text-gray-500'>
                    생성일: {new Date(code.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => toggleCodeStatus(code.id, code.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      code.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {code.is_active ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => deleteAccessCode(code.id)}
                    className='px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors'
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center space-x-2'>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className='flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <MdChevronLeft className='w-4 h-4 mr-1' />
            이전
          </button>

          <div className='flex space-x-1'>
            {/* 페이지 번호 버튼들 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === pageNum ? 'bg-black text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className='flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            다음
            <MdChevronRight className='w-4 h-4 ml-1' />
          </button>
        </div>
      )}

      {/* 통계 */}
      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>통계</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-black'>{accessCodes.length}</div>
            <div className='text-sm text-gray-600'>총 코드</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-green-600'>
              {accessCodes.filter((code) => code.is_active).length}
            </div>
            <div className='text-sm text-gray-600'>활성 코드</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-red-600'>
              {accessCodes.filter((code) => !code.is_active).length}
            </div>
            <div className='text-sm text-gray-600'>비활성 코드</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-600'>
              {Math.round((accessCodes.filter((code) => code.is_active).length / (accessCodes.length || 1)) * 100)}%
            </div>
            <div className='text-sm text-gray-600'>활성 비율</div>
          </div>
        </div>
      </div>
    </div>
  )
}
