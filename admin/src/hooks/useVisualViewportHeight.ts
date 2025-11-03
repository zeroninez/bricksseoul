// useVisualViewportHeight.ts
'use client'
import { useEffect } from 'react'

/**
 * visualViewport가 있으면 그 height를,
 * 없으면 window.innerHeight를 --viewport-height CSS 변수로 넣습니다.
 */

export function useVisualViewportHeightVar(varName = '--viewport-height') {
  useEffect(() => {
    // SSR 방어
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const root = document.documentElement
    const setVar = (h: number) => {
      // 소수점 방지 원하면 Math.round(h)
      root.style.setProperty(varName, `${h}px`)
    }

    const update = () => {
      const vv = window.visualViewport
      if (vv) setVar(vv.height)
      else if (window.innerHeight) setVar(window.innerHeight)
    }

    // 초기 1회 세팅
    update()

    // 이벤트 바인딩 (iOS 키보드/주소창 변화는 resize/scroll 모두 반응)
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update) // 키보드 열림/닫힘 시 높이 변동 대응
    } else {
      window.addEventListener('resize', update)
      window.addEventListener('orientationchange', update as any)
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update)
        vv.removeEventListener('scroll', update)
      } else {
        window.removeEventListener('resize', update)
        window.removeEventListener('orientationchange', update as any)
      }
    }
  }, [varName])
}
