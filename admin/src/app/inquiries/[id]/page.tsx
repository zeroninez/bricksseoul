// admin/src/app/inquiries/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { PageHeader } from '@/components'
import { MdLock, MdPerson, MdAdminPanelSettings } from 'react-icons/md'
import { INQUIRY_CATEGORIES, InquiryType, MessageType } from '@/types/inquiry'

const STATUS_OPTIONS = [
  { value: 'pending', label: '답변 대기', color: 'bg-orange-100 text-orange-700' },
  { value: 'replied', label: '답변 완료', color: 'bg-green-100 text-green-700' },
]

export default function AdminInquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [inquiry, setInquiry] = useState<InquiryType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchInquiry()
  }, [id])

  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/inquiries/${id}`)
      const json = await res.json()

      if (res.ok) {
        setInquiry(json.data.inquiry)
        setMessages(json.data.messages)
      } else {
        alert('문의를 불러올 수 없습니다.')
        router.push('/inquiries')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('오류가 발생했습니다.')
      router.push('/inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'pending' | 'replied' | 'closed') => {
    if (!inquiry || inquiry.status === newStatus) return

    try {
      setUpdatingStatus(true)
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setInquiry({ ...inquiry, status: newStatus })
      } else {
        const json = await res.json()
        alert(json.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      alert('답글 내용을 입력하세요.')
      return
    }

    try {
      setReplying(true)
      const res = await fetch(`/api/inquiries/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          sender_name: 'Admin',
        }),
      })

      // 응답 텍스트 확인 후 JSON 파싱
      const text = await res.text()
      let json

      try {
        json = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text)
        alert('서버 응답을 처리할 수 없습니다.')
        return
      }

      if (res.ok) {
        setMessages([...messages, json.data])
        setReplyContent('')
        // 문의 정보 갱신 (상태가 자동으로 replied로 변경됨)
        fetchInquiry()
      } else {
        alert(json.error || '답글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Reply error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className='w-full min-h-dvh mt-14 px-4 pb-32'>
        <div className='text-center py-12 text-gray-500'>로딩 중...</div>
      </div>
    )
  }

  if (!inquiry) {
    return null
  }

  return (
    <div className='w-full min-h-dvh mt-14 px-4 pb-32'>
      {/* 문의 정보 */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>
          {INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_ko}
        </span>
        <h2 className='text-xl font-medium text-gray-900 mb-3'>{inquiry.subject}</h2>

        <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
          <div>
            <span className='text-gray-600'>이메일:</span> <span className='text-gray-900'>{inquiry.email}</span>
          </div>
          <div>
            <span className='text-gray-600'>작성일:</span>{' '}
            <span className='text-gray-900'>{format(new Date(inquiry.created_at), 'yyyy-MM-dd HH:mm')}</span>
          </div>
          {inquiry.reservation_code && (
            <div>
              <span className='text-gray-600'>예약 코드:</span>{' '}
              <span className='text-blue-600 font-medium'>{inquiry.reservation_code}</span>
            </div>
          )}
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>비밀번호:</span>
            {inquiry.has_password ? (
              <span className='flex items-center gap-1 text-gray-900'>
                <MdLock size={14} /> 설정됨
              </span>
            ) : (
              <span className='text-gray-500'>없음</span>
            )}
          </div>
        </div>

        {/* 상태 변경 */}
        <div className='border-t pt-3'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>상태</label>
          <div className='flex gap-2'>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value as any)}
                disabled={updatingStatus || inquiry.status === option.value}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  inquiry.status === option.value
                    ? option.color
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메시지 목록 (게시판 형식) */}
      <div className='space-y-3 mb-6'>
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`bg-white border rounded-lg p-4 ${
              message.sender_type === 'admin' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center gap-2 mb-2'>
              {message.sender_type === 'admin' ? (
                <MdAdminPanelSettings size={18} className='text-blue-600' />
              ) : (
                <MdPerson size={18} className='text-gray-600' />
              )}
              <span className='text-sm font-medium text-gray-900'>
                {message.sender_type === 'admin' ? '관리자' : message.sender_name || '고객'}
              </span>
              <span className='text-xs text-gray-500'>{format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}</span>
              {index === 0 && <span className='text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded'>원글</span>}
            </div>
            <p className='text-gray-800 whitespace-pre-wrap'>{message.content}</p>
          </div>
        ))}
      </div>

      {/* 관리자 답글 작성 폼 */}
      <form onSubmit={handleReply} className='bg-white border border-gray-200 rounded-lg p-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>관리자 답글</label>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={5}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none mb-3'
          placeholder='답글을 입력하세요'
        />
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={() => router.push('/inquiries')}
            className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50'
          >
            목록으로
          </button>
          <button
            type='submit'
            disabled={replying}
            className='flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400'
          >
            {replying ? '작성 중...' : '답글 작성'}
          </button>
        </div>
      </form>
    </div>
  )
}
