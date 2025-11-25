// app/[locale]/properties/[id]/DetailClient.tsx

'use client'
import { useEffect, useState, useRef } from 'react'
import { usePropertyGet } from '@/hooks/useProperty'
import { PropertyGetResponse } from '@/types/property'

import { Cover, RoomGallery, TabInfo, TabAmenities, TabLocation, TabRules, Tabs } from './components'
import { AnimatePresence, motion } from 'motion/react'

import { Sheet } from 'react-modal-sheet'
import classNames from 'classnames'
import { HEADER_HEIGHT } from '@/theme/constants'
import { Input } from '@/components'

export default function DetailClient({
  id,
  moveInDate,
  moveOutDate,
}: {
  id: string
  moveInDate?: string
  moveOutDate?: string
}) {
  const { data, isLoading, error } = usePropertyGet(id)
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)

  const DETAILS_TABS = ['Info', 'Amenities', 'Location', 'Rules'] as const

  const [currentDetailTab, setCurrentDetailTab] = useState<(typeof DETAILS_TABS)[number]>('Info')

  // Section refs for scroll spy
  const infoRef = useRef<HTMLDivElement | null>(null)
  const amenitiesRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const rulesRef = useRef<HTMLDivElement | null>(null)

  // Scroll spy without IntersectionObserver
  const SCROLL_OFFSET = 250 // match scroll-mt-[250px]
  const programmaticScrollUntil = useRef<number>(0)

  useEffect(() => {
    let ticking = false

    const sections = [
      { key: 'Info' as const, ref: infoRef },
      { key: 'Amenities' as const, ref: amenitiesRef },
      { key: 'Location' as const, ref: locationRef },
      { key: 'Rules' as const, ref: rulesRef },
    ]

    const updateActive = () => {
      ticking = false
      // If we're in a programmatic scroll window, skip auto-updating
      if (performance.now() < (programmaticScrollUntil.current || 0)) return

      const distances = sections.map(({ key, ref }) => {
        const el = ref.current
        if (!el) return { key, dist: Number.POSITIVE_INFINITY, top: Number.POSITIVE_INFINITY }
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top - SCROLL_OFFSET)
        return { key, dist, top: rect.top }
      })

      distances.sort((a, b) => {
        const aAbove = a.top <= SCROLL_OFFSET ? 0 : 1
        const bAbove = b.top <= SCROLL_OFFSET ? 0 : 1
        if (aAbove !== bAbove) return aAbove - bAbove
        if (a.dist !== b.dist) return a.dist - b.dist
        return 0
      })

      const next = distances[0]?.key
      if (next && next !== currentDetailTab) setCurrentDetailTab(next)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateActive)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // initialize once
    updateActive()
    return () => window.removeEventListener('scroll', onScroll)
  }, [currentDetailTab])

  // Smooth scroll to section with header offset handled by CSS scroll-margin
  const scrollToSection = (tab: (typeof DETAILS_TABS)[number]) => {
    const map = {
      Info: infoRef,
      Amenities: amenitiesRef,
      Location: locationRef,
      Rules: rulesRef,
    } as const
    const ref = map[tab]
    // suppress scroll spy for 500ms while smooth-scrolling
    programmaticScrollUntil.current = performance.now() + 500
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    // 페이지 로드 시 스크롤을 최상단으로
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id]) // id가 변경될 때마다 실행

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='w-full h-dvh bg-background text-primary flex items-center justify-center'
          >
            Loading...
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='w-full h-dvh bg-background text-red-500 flex items-center justify-center '
          >
            Failed to load
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && !data && <div>Not found</div>}
      {data && moveInDate && moveOutDate && (
        <>
          <Cover data={data} />
          {/* 이미지 슬라이더 */}
          <RoomGallery images={data.images || []} />
          {/* 탭 */}
          <Tabs
            tabs={DETAILS_TABS}
            currentDetailTab={currentDetailTab}
            onHandleClick={(tab: (typeof DETAILS_TABS)[number]) => {
              setCurrentDetailTab(tab)
              scrollToSection(tab)
            }}
          />
          <TabInfo id='Info' ref={infoRef} data={data} />
          <TabAmenities id='Amenities' ref={amenitiesRef} data={data} />
          <TabLocation id='Location' ref={locationRef} data={data} />
          <TabRules id='Rules' ref={rulesRef} data={data} />
          {/* Purchase section */}
          <PurchaseSection
            data={data}
            moveInDate={moveInDate}
            moveOutDate={moveOutDate}
            isPaymentSheetOpen={isPaymentSheetOpen}
            setIsPaymentSheetOpen={setIsPaymentSheetOpen}
          />
        </>
      )}
    </>
  )
}

const PurchaseSection = ({
  data,
  moveInDate,
  moveOutDate,
  isPaymentSheetOpen,
  setIsPaymentSheetOpen,
}: {
  data: PropertyGetResponse
  moveInDate: string
  moveOutDate: string
  isPaymentSheetOpen: boolean
  setIsPaymentSheetOpen: (open: boolean) => void
}) => {
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [bookingForm, setBookingForm] = useState<{
    email: string
  }>({
    email: '',
  })

  useEffect(() => {
    // Calculate total amount based on move-in and move-out dates
    const inDate = new Date(moveInDate)
    const outDate = new Date(moveOutDate)
    const timeDiff = outDate.getTime() - inDate.getTime()
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24))
    setTotalAmount(dayCount * data.price_per_night)
  }, [moveInDate, moveOutDate, data.price_per_night])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const formatCurrency = (value: number, currency: string = 'KRW', locale: string = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const FormLabel = ({
    title,
    description,
    children,
  }: {
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <div className='w-full h-fit gap-4 flex flex-col'>
      <div className='w-fit h-fit flex flex-col justify-start items-start gap-2'>
        <span className='text-lg font-bold leading-none'>{title}</span>
        <span className='text-sm leading-none'>{description}</span>
      </div>
      {children}
    </div>
  )

  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={classNames(
          'fixed max-w-md mx-auto bottom-0 inset-x-0 z-[99999] bg-background flex flex-row items-center justify-between',
          'pl-4 pr-2 py-2 shadow-[0_-4px_6px_rgba(0,0,0,0.1)]',
          'w-full h-20',
        )}
      >
        <div className='w-fit h-fit flex flex-col justify-start gap-2 items-start'>
          <h2 className='text-lg leading-none font-bold'>{formatCurrency(totalAmount, data.currency)}</h2>
          {/* Selected period */}
          <div className='w-fit h-fit leading-none text-sm flex flex-row flex-wrap gap-2 justify-start items-center'>
            <p className=''>
              {formatDate(moveInDate)} - {formatDate(moveOutDate)}
            </p>
            <p className='underline'>
              {Math.ceil((new Date(moveOutDate).getTime() - new Date(moveInDate).getTime()) / (1000 * 3600 * 24))}
              {' nights'}
            </p>
          </div>
        </div>

        <button
          className='w-30 bg-black h-14 px-4 py-4 text-white text-[18px] rounded-xl font-medium active:opacity-50 active:scale-95 transition-all disabled:text-white/50 disabled:bg-disabled disabled:cursor-not-allowed flex justify-center items-center'
          onClick={() => {
            isPaymentSheetOpen ? null : setIsPaymentSheetOpen(true)
          }}
        >
          {isPaymentSheetOpen ? 'Confirm' : 'Continue'}
        </button>
      </motion.div>

      <Sheet
        isOpen={isPaymentSheetOpen}
        onClose={() => {
          setIsPaymentSheetOpen(false)
        }}
        detent='full'
        className='max-w-md mx-auto relative'
      >
        <Sheet.Container className='!rounded-none !bg-background'>
          <Sheet.Header>
            <div style={{ height: HEADER_HEIGHT }} className='w-full flex items-center justify-center relative'>
              <h2 className='text-lg font-bold'>Booking Overview</h2>
              <button
                className='absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl active:scale-95 active:opacity-70 transition-all'
                onClick={() => setIsPaymentSheetOpen(false)}
              >
                &times;
              </button>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div className='w-full h-fit p-4 mb-20 flex flex-col justify-start items-center gap-8'>
              <div className='w-full h-fit mb-2 flex flex-row gap-3 bg-primary/10 p-2 rounded-lg justify-between items-start'>
                <div className='w-28 h-20 bg-black/10 rounded-lg overflow-hidden'>
                  <img
                    src={data.images && data.images.length > 0 ? data.images[0].url : ''}
                    alt={data.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='w-full h-fit flex flex-col gap-0.5 justify-center items-start'>
                  <div className='w-full text-base leading-tight font-bold mb-1 text-stone-800'>{data.name}</div>
                  <div className='w-full text-sm leading-tight text-stone-700'>{data.address?.address1}</div>
                  <div className='w-full text-sm leading-tight text-stone-600'>{data.address?.address2}</div>
                </div>
              </div>
              <FormLabel title='Email' description='Email is required to verify your booking.'>
                <Input
                  type='email'
                  placeholder='Enter your Email.'
                  value={bookingForm.email}
                  setValue={(val) => setBookingForm({ ...bookingForm, email: val })}
                />
              </FormLabel>
              {/*   */}
              <FormLabel title='Total Cost' description='No refunds after booking is confirmed.'>
                <div className='w-full bg-primary/10 rounded-lg px-4 py-3 h-fit text-left flex flex-col gap-2'>
                  <div className='w-full h-fit flex flex-col'>
                    <span className='text-base text-stone-600'>Room charge</span>
                    <span className='text-base font-medium text-black'>
                      {formatCurrency(data.price_per_night, data.currency)} x{' '}
                      {Math.ceil(
                        (new Date(moveOutDate).getTime() - new Date(moveInDate).getTime()) / (1000 * 3600 * 24),
                      )}{' '}
                      nights
                    </span>
                  </div>
                  <div className='w-full h-px bg-stone-400' />
                  <div className='w-full h-fit flex flex-col'>
                    <span className='text-base text-stone-600'>Total</span>
                    <span className='text-lg font-semibold text-black'>
                      {formatCurrency(totalAmount, data.currency)}
                    </span>
                  </div>
                </div>
              </FormLabel>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  )
}
