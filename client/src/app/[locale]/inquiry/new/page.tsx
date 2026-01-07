// client/src/app/inquiry/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { PageHeader, PageStart } from '@/components'
import { MdLock } from 'react-icons/md'
import { INQUIRY_CATEGORIES } from '@/types/inquiry'

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
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.subject.trim() || !form.email.trim() || !form.content.trim()) {
      alert('제목, 이메일, 내용을 입력해주세요.')
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
        alert('문의가 등록되었습니다.')
        router.push(`/inquiry/${json.data.id}`)
      } else {
        alert(json.error || '문의 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageStart />

      <form onSubmit={handleSubmit} className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        {/* 제목 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            제목 <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            maxLength={200}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
            placeholder='문의 제목을 입력하세요'
          />
        </div>

        <div>
          <label>
            문의유형 <span className='text-red-500'>*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          >
            <option value=''>선택하세요</option>
            {INQUIRY_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label_en}
              </option>
            ))}
          </select>
        </div>

        {/* 이메일 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            이메일 <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
            placeholder='답변 받을 이메일'
          />
        </div>

        {/* 작성자 이름 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>이름 (선택)</label>
          <input
            type='text'
            value={form.sender_name}
            onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
            maxLength={100}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
            placeholder='작성자 이름'
          />
        </div>

        {/* 예약 코드 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>예약 코드 (선택)</label>
          <input
            type='text'
            value={form.reservation_code}
            onChange={(e) => setForm({ ...form, reservation_code: e.target.value })}
            maxLength={20}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
            placeholder='예약과 연결하려면 입력하세요'
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-1'>
            <MdLock size={16} />
            비밀번호 (선택)
          </label>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                id='show-password'
                className='rounded'
              />
              <label htmlFor='show-password' className='text-sm text-gray-600'>
                비밀글로 설정
              </label>
            </div>
            {showPassword && (
              <input
                type='password'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
                placeholder='비밀번호 입력'
              />
            )}
          </div>
          <p className='text-xs text-gray-500 mt-1'>비밀번호를 설정하면 본인과 관리자만 조회할 수 있습니다.</p>
        </div>

        {/* 내용 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            내용 <span className='text-red-500'>*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none'
            placeholder='문의 내용을 입력하세요'
          />
        </div>

        {/* 제출 버튼 */}
        <div className='flex gap-3 pt-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
          >
            취소
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400'
          >
            {submitting ? '등록 중...' : '문의 등록'}
          </button>
        </div>
      </form>
    </>
  )
}
