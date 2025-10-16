'use client'
import { useEffect, useState, useRef } from 'react'
import { usePropertyGet } from '@/hooks/useProperty'

import { HEADER_HEIGHT } from '@/theme/constants'
import classNames from 'classnames'
import { motion } from 'motion/react'

import { Cover, RoomGallery } from './components'

export default function DetailClient({ id }: { id: string }) {
  const { data, isLoading, error } = usePropertyGet(id)

  const DETAILS_TABS = ['Info', 'Amenities', 'Places', 'Rules'] as const

  const [currentDetailTab, setCurrentDetailTab] = useState<(typeof DETAILS_TABS)[number]>('Info')

  // Section refs for scroll spy
  const infoRef = useRef<HTMLDivElement | null>(null)
  const amenitiesRef = useRef<HTMLDivElement | null>(null)
  const placesRef = useRef<HTMLDivElement | null>(null)
  const rulesRef = useRef<HTMLDivElement | null>(null)

  // Scroll spy without IntersectionObserver
  const SCROLL_OFFSET = 250 // match scroll-mt-[250px]
  const programmaticScrollUntil = useRef<number>(0)

  useEffect(() => {
    let ticking = false

    const sections = [
      { key: 'Info' as const, ref: infoRef },
      { key: 'Amenities' as const, ref: amenitiesRef },
      { key: 'Places' as const, ref: placesRef },
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
      Places: placesRef,
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
      {isLoading && <div className='text-zinc-500'>Loading...</div>}
      {error && <div className='text-red-500'>Failed to load</div>}
      {!isLoading && !data && <div>Not found</div>}
      {data && (
        <>
          <Cover data={data} />
          {/* 이미지 슬라이더 */}
          <RoomGallery images={data.images || []} />
          <div className='w-full h-fit flex flex-row sticky top-[200px] bg-background z-10'>
            {DETAILS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentDetailTab(tab)
                  scrollToSection(tab)
                }}
                className={classNames(
                  'flex-1 h-fit py-3 flex items-center justify-center border-b-2',
                  currentDetailTab === tab ? 'border-primary font-medium' : 'border-stone-200 text-stone-500',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <section id='Info' ref={infoRef} className='w-full h-screen flex flex-col checking scroll-mt-[250px]'>
            <div className='w-full h-fit text-2xl font-bold p-5'>Info</div>
          </section>
          <section
            id='Amenities'
            ref={amenitiesRef}
            className='w-full h-screen flex flex-col checking scroll-mt-[250px]'
          >
            <div className='w-full h-fit text-2xl font-bold p-5'>Amenities</div>
          </section>
          <section id='Places' ref={placesRef} className='w-full h-screen flex flex-col checking scroll-mt-[250px]'>
            <div className='w-full h-fit text-2xl font-bold p-5'>Places</div>
          </section>
          <section id='Rules' ref={rulesRef} className='w-full h-screen flex flex-col checking scroll-mt-[250px]'>
            <div className='w-full h-fit text-2xl font-bold p-5'>Rules</div>
          </section>

          <motion.div className='w-full h-fit min-h-screen flex flex-col '>
            <section className='w-full flex flex-col gap-4 p-5'>
              <div className='text-zinc-600'>
                {data.price_per_night.toLocaleString()} {data.currency} / night
              </div>

              {/* 위치 */}
              {data.address && (
                <div className='text-sm text-zinc-500'>
                  {data.address.address1} {data.address.address2 ?? ''}
                </div>
              )}

              {/* 설명 */}
              {data.description && <p className='text-zinc-700'>{data.description}</p>}

              {/* 공간 정보 */}
              {data.space_info && (
                <div className='text-sm text-zinc-600'>
                  인원 {data.space_info.available_people ?? '-'} · 거실 {data.space_info.living_rooms ?? 0} · 침실{' '}
                  {data.space_info.bedrooms ?? 0} · 욕실 {data.space_info.bathrooms ?? 0}
                </div>
              )}

              {/* 어메니티 */}
              {data.amenities?.length ? (
                <ul className='flex flex-wrap gap-2 text-sm text-zinc-600'>
                  {data.amenities.map((a) => (
                    <li key={a} className='px-2 py-1 bg-zinc-100 rounded'>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </motion.div>
        </>
      )}
    </>
  )
}
