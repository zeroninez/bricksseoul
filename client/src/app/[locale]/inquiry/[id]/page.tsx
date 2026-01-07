// client/src/app/inquiry/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { PageHeader, PageStart } from '@/components'
import { MdLock, MdPerson, MdAdminPanelSettings } from 'react-icons/md'
import { InquiryType, MessageType } from '@/types/inquiry'

export default function InquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [inquiry, setInquiry] = useState<InquiryType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    fetchInquiry()
  }, [id])

  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/inquiries/${id}`)
      const json = await res.json()

      if (res.ok) {
        const inquiryData = json.data.inquiry
        setInquiry(inquiryData)

        // 비밀번호가 없으면 바로 내용 표시
        if (!inquiryData.has_password) {
          setMessages(json.data.messages)
          setVerified(true)
        } else {
          // 비밀번호가 있으면 모달 표시
          setShowPasswordModal(true)
        }
      } else {
        alert('문의를 불러올 수 없습니다.')
        router.push('/inquiry')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('오류가 발생했습니다.')
      router.push('/inquiry')
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      alert('비밀번호를 입력하세요.')
      return
    }

    try {
      setVerifying(true)
      const res = await fetch(`/api/inquiries/${id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const json = await res.json()

      if (res.ok && json.verified) {
        setVerified(true)
        setShowPasswordModal(false)
        // 메시지 다시 불러오기
        const detailRes = await fetch(`/api/inquiries/${id}`)
        const detailJson = await detailRes.json()
        if (detailRes.ok) {
          setMessages(detailJson.data.messages)
        }
      } else {
        alert('비밀번호가 일치하지 않습니다.')
      }
    } catch (error) {
      console.error('Verify error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setVerifying(false)
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
          sender_name: inquiry?.email || undefined,
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
        // 문의 정보 갱신
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
      <>
        <PageStart />
        <div className='text-center py-12 text-gray-500'>로딩 중...</div>
      </>
    )
  }

  if (!inquiry) {
    return null
  }

  // 비밀번호 확인 모달
  if (showPasswordModal && !verified) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50'>
        <div className='bg-white rounded-lg p-6 max-w-md w-full'>
          <div className='flex items-center gap-2 mb-4'>
            <MdLock size={24} className='text-gray-700' />
            <h2 className='text-lg font-medium'>비밀번호 확인</h2>
          </div>
          <p className='text-sm text-gray-600 mb-4'>이 문의는 비밀글로 설정되어 있습니다.</p>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4'
            placeholder='비밀번호 입력'
            autoFocus
          />
          <div className='flex gap-3'>
            <button
              onClick={() => router.push('/inquiry')}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50'
            >
              취소
            </button>
            <button
              onClick={verifyPassword}
              disabled={verifying}
              className='flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400'
            >
              {verifying ? '확인 중...' : '확인'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageStart />
      <div className='space-y-10 px-4'>
        {/* 문의 정보 */}
        <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <span>{inquiry.email}</span>
              {inquiry.has_password && <MdLock size={14} className='text-gray-400' />}
            </div>
            <span className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded'>{inquiry.status}</span>
          </div>
          <div className='text-xs text-gray-500'>
            작성일: {format(new Date(inquiry.created_at), 'yyyy-MM-dd HH:mm')}
          </div>
          {inquiry.reservation_code && (
            <div className='text-xs text-gray-500 mt-1'>예약 코드: {inquiry.reservation_code}</div>
          )}
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
                <span className='text-xs text-gray-500'>
                  {format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}
                </span>
                {index === 0 && <span className='text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded'>원글</span>}
              </div>
              <p className='text-gray-800 whitespace-pre-wrap'>{message.content}</p>
            </div>
          ))}
        </div>

        {/* 답글 작성 폼 */}
        {inquiry.status !== 'closed' && (
          <form onSubmit={handleReply} className='bg-white border border-gray-200 rounded-lg p-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>답글 작성</label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none mb-3'
              placeholder='답글을 입력하세요'
            />
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => router.push('/inquiry')}
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
        )}

        {inquiry.status === 'closed' && (
          <div className='bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-600'>
            이 문의는 종료되었습니다.
          </div>
        )}
      </div>
    </>
  )
}
