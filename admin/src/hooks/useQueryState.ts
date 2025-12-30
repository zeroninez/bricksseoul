'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type UseQueryStateOptions<T extends string> = {
  syncDefault?: boolean // 기본값을 URL에 강제로 기록할지
  mode?: 'replace' | 'push' // 히스토리 처리
  scroll?: boolean
  allowed?: readonly T[] // 허용값(검증/정규화)
}

export function useQueryState<T extends string>(key: string, defaultValue: T, options: UseQueryStateOptions<T> = {}) {
  const { syncDefault = true, mode = 'replace', scroll = false, allowed } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const raw = searchParams.get(key)
  const value = useMemo(() => {
    const v = (raw ?? defaultValue) as T
    if (allowed && !allowed.includes(v)) return defaultValue
    return v
  }, [raw, defaultValue, allowed])

  const setValue = useCallback(
    (nextValue: T) => {
      const sp = new URLSearchParams(searchParams.toString())

      // default면 URL에서 제거(권장 패턴)
      if (nextValue === defaultValue) sp.delete(key)
      else sp.set(key, nextValue)

      const url = sp.toString() ? `${pathname}?${sp.toString()}` : pathname
      if (mode === 'push') router.push(url, { scroll })
      else router.replace(url, { scroll })
    },
    [router, pathname, searchParams, key, defaultValue, mode, scroll],
  )

  // (선택) URL에 default를 “명시적으로” 써넣고 싶을 때만 사용
  useEffect(() => {
    if (!syncDefault) return

    const current = searchParams.get(key)
    const isMissing = current === null
    const isInvalid = allowed ? current !== null && !allowed.includes(current as T) : false

    if (isMissing || isInvalid) {
      const sp = new URLSearchParams(searchParams.toString())
      sp.set(key, defaultValue)
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
    }
  }, [syncDefault, searchParams, key, defaultValue, allowed, router, pathname])

  return [value, setValue] as const
}
