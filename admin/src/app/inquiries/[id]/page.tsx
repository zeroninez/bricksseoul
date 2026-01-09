// admin/src/app/inquiries/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { PageHeader } from '@/components'
import { MdLock, MdPerson, MdAdminPanelSettings } from 'react-icons/md'
import { INQUIRY_CATEGORIES, InquiryType, MessageType } from '@/types/inquiry'

const STATUS_OPTIONS = [
  { value: 'pending', label: '답변 대기', color: 'bg-[#FFF4ED] text-[#A0613E] border-[#FFE4D1]' },
  { value: 'replied', label: '답변 완료', color: 'bg-[#F0F7F4] text-[#4A7C5F] border-[#D4E8DD]' },
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
      <div className='w-full min-h-dvh mt-14 px-5 pb-32'>
        <div className='text-center py-12 text-[#8E7D7D]'>로딩 중...</div>
      </div>
    )
  }

  if (!inquiry) {
    return null
  }

  return (
    <div className='w-full min-h-dvh mt-14 pb-32 space-y-6 px-5'>
      {/* 문의 정보 */}
      <span className='text-base font-medium text-black'>문의 정보</span>
      <div className='bg-white rounded-lg mt-2 p-4 relative flex flex-col items-start justify-start gap-3'>
        <span
          className={`absolute top-4 right-4 text-xs px-2 py-0.5 rounded uppercase ${
            inquiry.status === 'pending'
              ? 'bg-[#FFF4ED] text-[#A0613E]'
              : inquiry.status === 'replied'
                ? 'bg-[#F0F7F4] text-[#4A7C5F]'
                : 'bg-[#F5F5F5] text-[#3C2F2F]'
          }`}
        >
          {inquiry.status}
        </span>

        <div className='text-base text-black'>
          {inquiry.reservation_code && <span>{inquiry.reservation_code} | </span>}
          <span>{inquiry.email}</span>
        </div>

        <div className='text-lg font-medium text-black'>
          <span className='text-xs bg-[#F5F5F5] text-[#3C2F2F] px-2 py-1 rounded mr-2'>
            {INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_ko}
          </span>
          {inquiry.subject}
        </div>

        <div className='w-full flex items-center gap-2 text-sm text-[#8E7D7D]'>
          <span>{format(new Date(inquiry.created_at), 'yyyy-MM-dd HH:mm')}</span>
          <span>•</span>
          {inquiry.has_password ? (
            <span className='flex items-center gap-1'>
              <MdLock size={14} /> 비밀번호 설정됨
            </span>
          ) : (
            <span className='flex items-center gap-1'>
              <MdLock size={14} className='opacity-30' /> 비밀번호 없음
            </span>
          )}
        </div>

        {/* 상태 변경 */}
        <div className='w-full border-t border-gray-200 pt-3 mt-2'>
          <label className='block text-sm font-medium text-[#3C2F2F] mb-2'>상태 변경</label>
          <div className='flex gap-2'>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value as any)}
                disabled={updatingStatus || inquiry.status === option.value}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${
                  inquiry.status === option.value
                    ? option.color
                    : 'bg-white border-[#E5E5E5] text-[#3C2F2F] hover:bg-stone-50 active:bg-stone-100'
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 원글 (첫 번째 메시지) */}
      <span className='text-base font-medium text-black'>문의 내용</span>
      <div className='bg-white rounded-lg p-4 mt-2'>
        <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
          <p className='w-full min-h-24 h-fit text-black/90 whitespace-pre-wrap'>{messages[0]?.content}</p>
          <div className='w-full h-fit flex flex-row justify-between items-end'>
            <div className='flex items-center gap-1'>
              <MdPerson size={18} className='text-gray-600' />
              <span className='text-sm font-medium text-gray-900'>{messages[0]?.sender_name || inquiry.email}</span>
            </div>
            <span className='text-sm text-[#8E7D7D]'>
              {format(new Date(messages[0]?.created_at), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
        </div>
      </div>

      {/* 관리자 답변 및 대댓글들 */}
      {messages.length > 1 && (
        <>
          <span className='text-base font-medium text-black'>답변</span>
          <div className='mt-2 mb-6'>
            {/* 관리자 답변 (두 번째 메시지) */}
            <div className='bg-white rounded-lg p-4'>
              <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
                <p className='w-full h-fit text-black/90 whitespace-pre-wrap'>{messages[1]?.content}</p>
                <div className='w-full h-fit flex flex-row justify-between items-end'>
                  <div className='flex items-center gap-1'>
                    {messages[1]?.sender_type === 'admin' ? (
                      <MdAdminPanelSettings size={18} className='text-[#5E4646]' />
                    ) : (
                      <MdPerson size={18} className='text-gray-600' />
                    )}
                    <span className='text-sm font-medium text-gray-900'>
                      {messages[1]?.sender_type === 'admin' ? '관리자' : messages[1]?.sender_name || '고객'}
                    </span>
                  </div>
                  <span className='text-sm text-[#8E7D7D]'>
                    {format(new Date(messages[1]?.created_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {/* 대댓글들 (세 번째 메시지부터) */}
            {messages.length > 2 && (
              <div className='ml-6 mt-3 space-y-3 border-l-2 border-gray-200 pl-4'>
                {messages.slice(2).map((message) => (
                  <div key={message.id} className='bg-gray-50 rounded-lg p-4'>
                    <div className='w-full h-fit flex flex-col justify-start items-start gap-4'>
                      <p className='w-full h-fit text-black/90 whitespace-pre-wrap'>{message.content}</p>
                      <div className='w-full h-fit flex flex-row justify-between items-end'>
                        <div className='flex items-center gap-1'>
                          {message.sender_type === 'admin' ? (
                            <MdAdminPanelSettings size={18} className='text-[#5E4646]' />
                          ) : (
                            <MdPerson size={18} className='text-gray-600' />
                          )}
                          <span className='text-sm font-medium text-gray-900'>
                            {message.sender_type === 'admin' ? '관리자' : message.sender_name || '고객'}
                          </span>
                        </div>
                        <span className='text-sm text-[#8E7D7D]'>
                          {format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 관리자 답글 작성 폼 */}
      <form onSubmit={handleReply} className='bg-white border border-gray-200 rounded-lg p-4'>
        <label className='block text-sm font-medium text-[#3C2F2F] mb-2'>관리자 답글</label>
        <TextareaItem
          placeholder='답글을 입력하세요'
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={5}
        />
        <div className='flex gap-3 mt-3'>
          <button
            type='button'
            onClick={() => router.push('/inquiries')}
            className='flex-1 px-4 py-2 border border-gray-300 text-[#3C2F2F] rounded-lg font-medium hover:bg-gray-50 active:bg-stone-100 transition-colors'
          >
            목록으로
          </button>
          <button
            type='submit'
            disabled={replying}
            className='flex-1 px-4 py-2 bg-[#5E4646] text-white rounded-lg font-medium hover:bg-[#2A2323] active:bg-[#2A2323] disabled:bg-gray-400 transition-colors'
          >
            {replying ? '작성 중...' : '답글 작성'}
          </button>
        </div>
      </form>
    </div>
  )
}

const TextareaItem = ({
  placeholder,
  value,
  onChange,
  rows,
}: {
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}) => {
  return (
    <div className='px-3 py-2 rounded-md bg-white active:bg-stone-100 flex flex-row gap-2 justify-start items-center focus-within:bg-stone-200 transition-all'>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e)}
        rows={rows || 4}
        className='w-full placeholder:text-[#B4B4B4] focus:outline-none bg-transparent resize-none'
      />
    </div>
  )
}
