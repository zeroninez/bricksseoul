// client/src/app/inquiry/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { format } from 'date-fns'
import { PageStart, SplashScreen } from '@/components'
import { MdLock, MdPerson, MdAdminPanelSettings } from 'react-icons/md'
import { INQUIRY_CATEGORIES, InquiryType, MessageType } from '@/types/inquiry'

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

        // If no password, show content immediately
        if (!inquiryData.has_password) {
          setMessages(json.data.messages)
          setVerified(true)
        } else {
          // Show password modal if password protected
          setShowPasswordModal(true)
        }
      } else {
        alert('Unable to load inquiry.')
        router.push('/inquiry')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('An error occurred.')
      router.push('/inquiry')
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      alert('Please enter password.')
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
        // Reload messages
        const detailRes = await fetch(`/api/inquiries/${id}`)
        const detailJson = await detailRes.json()
        if (detailRes.ok) {
          setMessages(detailJson.data.messages)
        }
      } else {
        alert('Incorrect password.')
      }
    } catch (error) {
      console.error('Verify error:', error)
      alert('An error occurred.')
    } finally {
      setVerifying(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      alert('Please enter reply content.')
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

      // Parse response text as JSON
      const text = await res.text()
      let json

      try {
        json = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text)
        alert('Unable to process server response.')
        return
      }

      if (res.ok) {
        setMessages([...messages, json.data])
        setReplyContent('')
        // Refresh inquiry info
        fetchInquiry()
      } else {
        alert(json.error || 'Failed to submit reply.')
      }
    } catch (error) {
      console.error('Reply error:', error)
      alert('An error occurred.')
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <>
        <SplashScreen />
      </>
    )
  }

  if (!inquiry) {
    return null
  }

  // Password verification modal
  if (showPasswordModal && !verified) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50'>
        <div className='bg-background rounded-md p-5 max-w-md w-full space-y-5'>
          <div className='flex items-center text-black gap-2'>
            <h2 className='text-lg font-medium'>Password Required</h2>
          </div>
          <p className='text-sm text-black/50 mb-4'>This inquiry is password protected.</p>

          <InputItem
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='flex gap-3'>
            <button
              onClick={() => router.push('/inquiry')}
              className='flex-1 px-4 py-2 bg-white border border-gray-300 text-black rounded-lg font-medium hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={verifyPassword}
              disabled={verifying}
              className='flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-black/80 disabled:bg-black/50'
            >
              {verifying ? 'Verifying...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageStart />
      <div className='space-y-6 px-4'>
        {/* Inquiry Info */}
        <span className='text-base font-medium text-black'>Inquiry</span>
        <div className='bg-white rounded-lg mt-2 p-4 relative flex flex-col items-start justify-start gap-1'>
          <span className={`absolute top-4 right-4 text-xs px-2 py-0.5 rounded text-black bg-[#DFDADA] uppercase`}>
            {inquiry.status}
          </span>
          <div className='text-base text-black'>
            {inquiry.reservation_code && <span>{inquiry.reservation_code} | </span>}
            <span>{inquiry.email}</span>
          </div>
          <div className='text-lg font-medium text-black'>
            [{INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_en || 'Unknown'}] {inquiry.subject}
          </div>
          <div className='w-full h-fit flex mt-1 flex-col justify-start items-start gap-4'>
            <p className='w-full min-h-24 h-fit text-black/90 whitespace-pre-wrap'>{messages[0]?.content}</p>
            <span className='self-end text-sm text-[#8E7D7D]'>
              {format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>

        {/* Admin Reply and Nested Replies */}
        {messages.length > 1 && (
          <>
            <span className='text-base font-medium text-black'>Admin Reply</span>
            <div className='mt-2 mb-6'>
              {/* 관리자 답변 (두 번째 메시지) */}
              <div className='bg-white rounded-lg p-4'>
                <div className='w-full h-fit flex mt-1 flex-col justify-start items-start gap-4'>
                  <p className='w-full h-fit text-black/90 whitespace-pre-wrap'>{messages[1]?.content}</p>
                  <div className='w-full h-fit flex flex-row justify-between items-end'>
                    <div className='flex items-center gap-1'>
                      {messages[1]?.sender_type === 'admin' ? (
                        <MdAdminPanelSettings size={18} className='text-blue-600' />
                      ) : (
                        <MdPerson size={18} className='text-gray-600' />
                      )}
                      <span className='text-sm font-medium text-gray-900'>
                        {messages[1]?.sender_type === 'admin' ? 'Admin' : messages[1]?.sender_name || 'Customer'}
                      </span>
                    </div>
                    <span className='text-sm text-[#8E7D7D]'>
                      {format(new Date(messages[1]?.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 대댓글들 (세 번째 메시지부터) */}
              {messages.length > 2 && (
                <div className='ml-6 mt-3 space-y-3 border-l-2 border-gray-200 pl-4'>
                  {messages.slice(2).map((message) => (
                    <div key={message.id} className='bg-gray-50 rounded-lg p-4'>
                      <div className='w-full h-fit flex mt-1 flex-col justify-start items-start gap-4'>
                        <p className='w-full h-fit text-black/90 whitespace-pre-wrap'>{message.content}</p>
                        <div className='w-full h-fit flex flex-row justify-between items-end'>
                          <div className='flex items-center gap-1'>
                            {message.sender_type === 'admin' ? (
                              <MdAdminPanelSettings size={18} className='text-blue-600' />
                            ) : (
                              <MdPerson size={18} className='text-gray-600' />
                            )}
                            <span className='text-sm font-medium text-gray-900'>
                              {message.sender_type === 'admin' ? 'Admin' : message.sender_name || 'Customer'}
                            </span>
                          </div>
                          <span className='text-sm text-[#8E7D7D]'>
                            {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
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

        {/* Reply Form */}
        {messages.some((m) => m.sender_type === 'admin') && (
          <form onSubmit={handleReply} className='bg-white border border-gray-200 rounded-lg p-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Write Reply</label>
            <TextareaItem
              label=''
              placeholder='Enter your reply'
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
            />
            <div className='flex gap-3 mt-3'>
              <button
                type='button'
                onClick={() => router.push('/inquiry')}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50'
              >
                Back to List
              </button>
              <button
                type='submit'
                disabled={replying}
                className='flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400'
              >
                {replying ? 'Submitting...' : 'Submit Reply'}
              </button>
            </div>
          </form>
        )}

        {inquiry.status === 'closed' && (
          <div className='bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-600'>
            This inquiry has been closed.
          </div>
        )}
      </div>
    </>
  )
}

const InputItem = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  maxLength,
  required,
  caption,
}: {
  label?: string
  type?: string
  placeholder: any
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  maxLength?: number
  required?: boolean
  caption?: string
}) => {
  return (
    <div>
      {label && (
        <label className='block text-sm font-medium text-black mb-3'>
          {label}
          {required && <span className='ml-1'>*</span>}
        </label>
      )}
      <div className='px-3 py-2 rounded-md bg-white active:bg-stone-100 flex flex-row gap-2 justify-start items-center focus-within:bg-stone-200 transition-all'>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          maxLength={maxLength}
          required={required}
          className='w-full placeholder:text-[#B4B4B4] focus:outline-none bg-transparent'
        />
      </div>
      {caption && <p className='text-xs text-gray-500 mt-2 px-0.5'>{caption}</p>}
    </div>
  )
}

const TextareaItem = ({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  required,
  caption,
  rows,
}: {
  label?: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  maxLength?: number
  required?: boolean
  caption?: string
  rows?: number
}) => {
  return (
    <div>
      {label && (
        <label className='block text-sm font-medium text-black mb-3'>
          {label}
          {required && <span className='ml-1'>*</span>}
        </label>
      )}
      <div className='px-3 py-2 rounded-md bg-white active:bg-stone-100 flex flex-row gap-2 justify-start items-center focus-within:bg-stone-200 transition-all'>
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          rows={rows || 4}
          maxLength={maxLength}
          required={required}
          className='w-full placeholder:text-[#B4B4B4] focus:outline-none bg-transparent resize-none'
        />
      </div>
      {caption && <p className='text-xs text-gray-500 mt-2 px-0.5'>{caption}</p>}
    </div>
  )
}
