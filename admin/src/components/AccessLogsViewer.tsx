// src/components/AccessLogsViewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'

interface AccessLog {
  id: number
  access_code_id: number
  accessed_at: string
  user_agent: string | null
  location: string | null
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

      const { data, error } = await query.limit(100) // 최근 100개만

      if (error) throw error
      setLogs(data || [])
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

  useEffect(() => {
    fetchAccessLogs()
  }, [filter])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex justify-between items-center'>
        <h3 className='text-xl font-bodoniModa font-bold'>접근 로그</h3>
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
                filter === option.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='p-4 bg-blue-50 rounded-lg text-center'>
          <div className='text-2xl font-bold text-blue-600'>{logs.length}</div>
          <div className='text-sm text-blue-700'>총 접근</div>
        </div>
        <div className='p-4 bg-green-50 rounded-lg text-center'>
          <div className='text-2xl font-bold text-green-600'>{new Set(logs.map((log) => log.location)).size}</div>
          <div className='text-sm text-green-700'>고유 IP</div>
        </div>
        <div className='p-4 bg-purple-50 rounded-lg text-center'>
          <div className='text-2xl font-bold text-purple-600'>
            {new Set(logs.map((log) => log.access_code_id)).size}
          </div>
          <div className='text-sm text-purple-700'>사용된 코드</div>
        </div>
        <div className='p-4 bg-orange-50 rounded-lg text-center'>
          <div className='text-2xl font-bold text-orange-600'>
            {
              logs.filter((log) => {
                const date = new Date(log.accessed_at)
                const today = new Date()
                return date.toDateString() === today.toDateString()
              }).length
            }
          </div>
          <div className='text-sm text-orange-700'>오늘 접근</div>
        </div>
      </div>

      {/* 로그 목록 */}
      <div className='space-y-3'>
        {logs.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            {filter === 'today' ? '오늘' : filter === 'week' ? '이번 주' : ''} 접근 기록이 없습니다.
          </div>
        ) : (
          <div className='max-h-96 overflow-y-auto space-y-2'>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-1'>
                      <span className='font-mono text-sm font-bold text-primary'>{log.access_codes.code}</span>
                      <span className='text-sm text-gray-600'>{log.access_codes.name}</span>
                    </div>
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span>🕒 {getRelativeTime(log.accessed_at)}</span>
                      <span>🌐 {log.location || '알 수 없음'}</span>
                      <span>💻 {getBrowserInfo(log.user_agent)}</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-400'>{new Date(log.accessed_at).toLocaleString('ko-KR')}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <div className='flex justify-center'>
        <button
          onClick={fetchAccessLogs}
          className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors'
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  )
}
