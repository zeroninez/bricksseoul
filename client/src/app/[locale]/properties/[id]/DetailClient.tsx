// app/[locale]/properties/[id]/DetailClient.tsx

'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { usePropertyGet } from '@/hooks/useProperty'
import { Cover, RoomGallery, TabInfo, TabAmenities, TabLocation, TabRules, Tabs, ReservationButton } from './components'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from '@/i18n/routing'

export default function DetailClient({
  id,
  moveInDate,
  moveOutDate,
}: {
  id: string
  moveInDate?: string
  moveOutDate?: string
}) {
  const router = useRouter()
  const { data, isLoading, error } = usePropertyGet(id)

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
          {/* Reservation section */}
          <ReservationButton
            data={data}
            moveInDate={moveInDate}
            moveOutDate={moveOutDate}
            action={{
              label: 'Continue',
              onClick: () => {
                router.push(`${data.id}/reservation?in=${moveInDate}&out=${moveOutDate}`)
              },
            }}
          />
        </>
      )}
    </>
  )
}
