// client/src/app/inquiry/page.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { MdLock, MdLockOpen } from 'react-icons/md'
import { IoMdAdd } from 'react-icons/io'
import { InquiryType, INQUIRY_CATEGORIES } from '@/types/inquiry'
import { PageStart } from '@/components'
import classNames from 'classnames'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6'

export default function InquiryListPage() {
  const [inquiries, setInquiries] = useState<InquiryType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchInquiries()
  }, [searchQuery, currentDate])

  const fetchInquiries = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      // 검색 파라미터
      if (searchQuery.trim()) {
        params.append('search_query', searchQuery.trim())
      }

      // 월별 파라미터
      params.append('year', currentDate.getFullYear().toString())
      params.append('month', (currentDate.getMonth() + 1).toString())

      const url = `/api/inquiries?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json()

      if (res.ok) {
        setInquiries(json.data)
      } else {
        console.error('Failed to fetch inquiries:', json.error)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth()
  }

  return (
    <>
      <PageStart />
      {/* Search Input */}
      <div className='mb-4 px-5'>
        <div className='px-3 py-2 rounded-md bg-white active:bg-stone-100 flex flex-row gap-2 justify-start items-center focus-within:bg-stone-200 transition-all'>
          <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 15 15' fill='none'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M9.13621 10.0195C8.01301 10.917 6.58881 11.3503 5.15612 11.2304C3.72343 11.1106 2.39101 10.4467 1.43251 9.37515C0.474005 8.30359 -0.03781 6.90569 0.00217846 5.46855C0.0421669 4.03141 0.630923 2.66413 1.64753 1.64753C2.66413 0.630923 4.03141 0.0421669 5.46855 0.00217846C6.90568 -0.03781 8.30359 0.474005 9.37515 1.43251C10.4467 2.39101 11.1106 3.72343 11.2304 5.15612C11.3503 6.58881 10.917 8.01301 10.0195 9.13621L14.3162 13.432C14.3776 13.4893 14.4269 13.5583 14.461 13.6349C14.4952 13.7116 14.5136 13.7944 14.515 13.8783C14.5165 13.9622 14.5011 14.0456 14.4696 14.1234C14.4382 14.2012 14.3914 14.2719 14.3321 14.3312C14.2727 14.3906 14.202 14.4374 14.1242 14.4688C14.0464 14.5002 13.963 14.5157 13.8791 14.5142C13.7952 14.5127 13.7124 14.4944 13.6358 14.4602C13.5591 14.426 13.4901 14.3768 13.4329 14.3154L9.13621 10.0195ZM2.53121 8.71788C1.91958 8.10618 1.50301 7.3269 1.33414 6.47852C1.16527 5.63014 1.25169 4.75074 1.58247 3.95146C1.91326 3.15218 2.47355 2.4689 3.19256 1.98796C3.91156 1.50703 4.757 1.25003 5.62202 1.24945C6.48704 1.24887 7.33283 1.50473 8.05248 1.98469C8.77213 2.46466 9.33335 3.14719 9.6652 3.94602C9.99706 4.74486 10.0847 5.62414 9.91694 6.47275C9.74921 7.32135 9.33369 8.1012 8.72288 8.71371L8.71871 8.71788L8.71455 8.72121C7.89379 9.54007 6.78157 9.99966 5.62219 9.99903C4.46281 9.99841 3.35109 9.53762 2.53121 8.71788Z'
              fill='#B4B4B4'
            />
          </svg>
          <input
            type='text'
            placeholder='Search by email or subject...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full focus:outline-none bg-transparent'
          />
        </div>
      </div>

      {/* Month Navigation & New Inquiry Button */}
      <div className='w-full h-fit px-5 flex flex-row justify-between items-center mb-4'>
        {/* Month Navigation */}
        <div className='flex items-center gap-2'>
          <div className='w-fit h-full flex gap-1 items-center justify-center'>
            <button onClick={goToPreviousMonth} className='w-fit h-fit p-1 opacity-50 transition-colors'>
              <FaCaretLeft className='text-lg text-[#5E4646]' />
            </button>
            <MonthTitleAsNativeInput
              year={currentDate.getFullYear()}
              month={currentDate.getMonth() + 1}
              onChange={({ year, month }) => setCurrentDate(new Date(year, month - 1, 1))}
            />
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth()}
              className={classNames(
                'w-fit h-fit p-1 transition-colors',
                isCurrentMonth() ? 'cursor-not-allowed opacity-20' : 'opacity-50',
              )}
            >
              <FaCaretRight className='text-lg text-[#5E4646]' />
            </button>
          </div>
        </div>

        {/* New Inquiry Button */}
        <Link
          href='/inquiry/new'
          className='w-fit pl-3 pr-4 py-2 bg-[#3C2F2F] text-white text-center rounded-lg font-medium active:bg-[#2A2323] transition-colors flex items-center justify-center gap-2'
        >
          <IoMdAdd size={20} />
          New
        </Link>
      </div>

      {/* Inquiry List */}
      {loading ? (
        <div className='text-center py-12 text-gray-500'>Loading...</div>
      ) : inquiries.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>{searchQuery ? 'No results found.' : 'No inquiries.'}</div>
      ) : (
        <div className='space-y-3 px-5'>
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/inquiry/${inquiry.id}`}
              className='block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    {inquiry.has_password ? (
                      <MdLock className='text-gray-400 flex-shrink-0' size={16} />
                    ) : (
                      <MdLockOpen className='text-gray-400 flex-shrink-0' size={16} />
                    )}
                    <h3 className='font-medium text-gray-900 truncate'>{inquiry.subject}</h3>
                    <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                      {INQUIRY_CATEGORIES.find((c) => c.value === inquiry.category)?.label_en}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <span>{format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0`}>{inquiry.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

function MonthTitleAsNativeInput({
  mini,
  year,
  month,
  onChange,
}: {
  mini?: boolean
  year: number
  month: number
  onChange: (next: { year: number; month: number }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const value = useMemo(() => {
    const mm = String(month).padStart(2, '0')
    return `${year}-${mm}` // YYYY-MM
  }, [year, month])

  const titleClass = classNames(
    mini ? 'text-sm' : 'text-[17px] font-medium text-[#3C2F2F] w-fit h-6 text-center flex items-center leading-[26px]',
  )

  const openPicker = () => {
    const el = inputRef.current
    if (!el) return
    ;(el as any).showPicker?.()
    el.focus()
  }

  // Month names in English
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div
      className='relative inline-flex items-center'
      onClick={openPicker}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPicker()
      }}
    >
      <h2 className={classNames(titleClass, 'select-none')}>
        {monthNames[month - 1]} {year}
      </h2>

      <input
        ref={inputRef}
        type='month'
        value={value}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-').map(Number)
          if (!Number.isFinite(y) || !Number.isFinite(m)) return
          onChange({ year: y, month: m })
        }}
        aria-label='Select month'
        className='absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer'
      />
    </div>
  )
}
