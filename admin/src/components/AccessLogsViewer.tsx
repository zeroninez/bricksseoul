// src/components/AccessLogsViewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'
import { TbRefresh } from 'react-icons/tb'
import { MdAccessTime, MdMyLocation, MdDevicesOther, MdChevronLeft, MdChevronRight } from 'react-icons/md'

interface AccessLog {
  id: number
  access_code_id: number
  accessed_at: string
  user_agent: string | null
  ip_address: string | null
  access_codes: {
    code: string
    name: string
  }
}

export const AccessLogsViewer = () => {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all') // 'all', 'today', 'week'

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 페이지네이션 계산
  const totalPages = Math.ceil(logs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = logs.slice(startIndex, endIndex)

  // 접근 로그 조회
  const fetchAccessLogs = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('access_logs')
        .select(
          `
          *,
          access_codes!inner(code, name)
        `,
        )
        .order('accessed_at', { ascending: false })

      // 필터 적용
      const now = new Date()
      if (filter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        query = query.gte('accessed_at', today.toISOString())
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('accessed_at', weekAgo.toISOString())
      }

      const { data, error } = await query.limit(500) // 최근 500개로 늘림

      if (error) throw error
      setLogs(data || [])
      setCurrentPage(1) // 새로운 데이터 로드 시 첫 페이지로
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 브라우저 정보 파싱
  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return '알 수 없음'

    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return '기타'
  }

  // 상대 시간 계산
  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
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
    fetchAccessLogs()
  }, [filter])

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
        <div className='flex gap-2'>
          {[
            { value: 'all', label: '전체' },
            { value: 'today', label: '오늘' },
            { value: 'week', label: '일주일' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === option.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 새로고침 버튼을 위로 이동 */}
        <button
          onClick={fetchAccessLogs}
          className='px-2 py-1 text-sm flex flex-row justify-center items-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg transition-colors'
        >
          <TbRefresh />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 통계 카드 */}
      <div className='flex flex-row gap-2'>
        <div className='w-full p-2 bg-blue-50 rounded-lg text-center'>
          <div className='text-xs text-blue-700'>총 접근</div>
          <div className='text-lg font-bold text-blue-600'>{logs.length}</div>
        </div>
        <div className='w-full p-2 bg-green-50 rounded-lg text-center'>
          <div className='text-xs text-green-700'>고유 IP</div>
          <div className='text-lg font-bold text-green-600'>{new Set(logs.map((log) => log.ip_address)).size}</div>
        </div>
        <div className='w-full p-2 bg-purple-50 rounded-lg text-center'>
          <div className='text-xs text-purple-700'>사용된 코드</div>
          <div className='text-lg font-bold text-purple-600'>{new Set(logs.map((log) => log.access_code_id)).size}</div>
        </div>
        <div className='w-full p-2 bg-orange-50 rounded-lg text-center'>
          <div className='text-xs text-orange-700'>오늘 접근</div>
          <div className='text-lg font-bold text-orange-600'>
            {
              logs.filter((log) => {
                const date = new Date(log.accessed_at)
                const today = new Date()
                return date.toDateString() === today.toDateString()
              }).length
            }
          </div>
        </div>
      </div>

      {/* 페이지네이션 정보 */}
      {logs.length > 0 && (
        <div className='flex justify-between items-center text-sm text-gray-600'>
          <span>
            총 {logs.length}개 중 {startIndex + 1}-{Math.min(endIndex, logs.length)}개 표시
          </span>
          <span>
            {currentPage} / {totalPages} 페이지
          </span>
        </div>
      )}

      {/* 로그 목록 */}
      <div className='space-y-3'>
        {logs.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            {filter === 'today' ? '오늘' : filter === 'week' ? '이번 주' : ''} 접근 기록이 없습니다.
          </div>
        ) : (
          <div className='space-y-2'>
            {currentLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='p-3 border border-gray-200 rounded-lg bg-white active:shadow-sm transition-shadow'
              >
                <div className='flex flex-col items-start justify-center gap-2'>
                  <div className='flex items-center gap-3 mb-1'>
                    <span className='font-mono text-sm font-bold text-black'>{log.access_codes.code}</span>
                    <span className='text-sm text-gray-600'>{log.access_codes.name}</span>
                  </div>

                  <div className='flex flex-col gap-2 justify-center items-start'>
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span className='inline-flex items-center gap-1'>
                        <MdAccessTime />
                        {getRelativeTime(log.accessed_at)}
                      </span>
                      <span className='inline-flex items-center gap-1'>
                        <MdMyLocation /> {log.ip_address || '알 수 없음'}
                      </span>
                      <span className='inline-flex items-center gap-1'>
                        <MdDevicesOther /> {getBrowserInfo(log.user_agent)}
                      </span>
                    </div>
                    <div className='text-xs text-gray-400'>{new Date(log.accessed_at).toLocaleString('ko-KR')}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center space-x-2'>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className='flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg active:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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
                    currentPage === pageNum
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-300 active:bg-gray-50'
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
            className='flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg active:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            다음
            <MdChevronRight className='w-4 h-4 ml-1' />
          </button>
        </div>
      )}
    </div>
  )
}
