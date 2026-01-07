// client/src/app/inquiry/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { PageStart } from '@/components'
import { MdLock, MdMarkEmailUnread } from 'react-icons/md'
import { INQUIRY_CATEGORIES } from '@/types/inquiry'
import { RxCaretDown } from 'react-icons/rx'

export default function NewInquiryPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    category: '',
    email: '',
    password: '',
    reservation_code: '',
    content: '',
    sender_name: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.subject.trim() || !form.email.trim() || !form.content.trim()) {
      alert('Please enter a subject, email, and message.')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject.trim(),
          category: form.category,
          email: form.email.trim(),
          password: form.password.trim() || undefined,
          reservation_code: form.reservation_code.trim() || undefined,
          content: form.content.trim(),
          sender_name: form.sender_name.trim() || undefined,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        alert('Your inquiry has been submitted.')
        router.push(`/inquiry/${json.data.id}`)
      } else {
        alert(json.error || 'Failed to submit your inquiry.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageStart />
      <div className='w-full h-fit px-5 flex flex-row items-center justify-start gap-3 py-2'>
        <MdMarkEmailUnread className='text-xl' />{' '}
        <span className='text-xl font-medium text-black -translate-y-0.5'>New Inquiry</span>
      </div>

      <form onSubmit={handleSubmit} className='p-5 space-y-6'>
        {/* Subject */}
        <InputItem
          label='Subject'
          type='text'
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          maxLength={200}
          placeholder='Enter a subject'
          required
        />

        {/* Message */}
        <TextareaItem
          label='Message'
          value={form.content}
          rows={8}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder='Enter your message'
          required
        />

        {/* Category */}
        <SelectItem
          required
          label='Inquiry Type'
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={INQUIRY_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label_en }))}
        />

        {/* Email */}
        <InputItem
          label='Email'
          type='email'
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder='Email for reply'
          required
        />

        {/* Reservation Code */}
        <InputItem
          label='Reservation Code (optional)'
          type='text'
          value={form.reservation_code}
          onChange={(e) => setForm({ ...form, reservation_code: e.target.value })}
          maxLength={20}
          placeholder='Enter if related to a reservation'
        />

        {/* Password */}
        <InputItem
          label='Password'
          type='password'
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder='Enter a password'
          required
          caption='If you set a password, only you and the admin can view this inquiry.'
        />

        {/* Buttons */}
        <div className='flex gap-3 pb-32 pt-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='flex-1 px-4 py-3 border border-[#DFDADA] text-black rounded-lg font-medium hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-[#DFDADA] transition-colors disabled:bg-[#DFDADA]'
          >
            {submitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
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

const SelectItem = ({
  label,
  value,
  required,
  onChange,
  options,
  caption,
}: {
  label?: string
  value: any
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: {
    value: string
    label: string
  }[]
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
      <div className='px-3 py-2 rounded-md bg-white relative active:bg-stone-100 flex flex-row gap-2 justify-start items-center focus-within:bg-stone-200 transition-all'>
        <select
          value={value}
          onChange={(e) => onChange(e)}
          className='w-full placeholder:text-[#B4B4B4] focus:outline-none bg-transparent'
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <RxCaretDown
          size={20}
          className='text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'
        />
      </div>
      {caption && <p className='text-xs text-gray-500 mt-2 px-0.5'>{caption}</p>}
    </div>
  )
}
