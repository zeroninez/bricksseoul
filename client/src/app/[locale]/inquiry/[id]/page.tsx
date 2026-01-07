// client/src/app/inquiry/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { PageHeader, PageStart, SplashScreen } from '@/components'
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
      <div className='space-y-10 px-4'>
        {/* Inquiry Info */}
        <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4 relative'>
          <div className='flex flex-col items-start justify-start mb-2'>
            <span className='text-lg font-semibold text-gray-900'>
              [{INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_en || 'Unknown'}] {inquiry.subject}
            </span>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              {inquiry.has_password && <MdLock size={14} className='text-gray-400' />}
              <span>{inquiry.email}</span>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded absolute top-4 right-4 uppercase`}>{inquiry.status}</span>

          <div className='text-xs text-gray-500'>
            Posted: {format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}
          </div>
          {inquiry.reservation_code && (
            <div className='text-xs text-gray-500 mt-1'>Reservation Code: {inquiry.reservation_code}</div>
          )}
          <div className='mt-4 min-h-[80px]'>
            <p className='text-gray-800 whitespace-pre-wrap'>{messages[0]?.content}</p>
          </div>
        </div>

        {/* Messages (Board style) exclude original */}
        <div className='space-y-3 mb-6'>
          {messages.slice(1).map((message, index) => (
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
                  {message.sender_type === 'admin' ? 'Admin' : message.sender_name || 'Customer'}
                </span>
                <span className='text-xs text-gray-500'>
                  {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                </span>
                {index === 0 && <span className='text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded'>Original</span>}
              </div>
              <p className='text-gray-800 whitespace-pre-wrap'>{message.content}</p>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {messages.some((m) => m.sender_type === 'admin') && (
          <form onSubmit={handleReply} className='bg-white border border-gray-200 rounded-lg p-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Write Reply</label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none mb-3'
              placeholder='Enter your reply'
            />
            <div className='flex gap-3'>
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
