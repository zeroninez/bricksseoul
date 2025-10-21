// hooks/useBodyScrollLock.ts
import { useEffect } from 'react'

/**
 * 잠금/해제 호출이 겹쳐도 안전하게 동작하도록 ref-count 방식.
 */
let lockCount = 0
let previousScrollY = 0

function getScrollbarWidth() {
  if (typeof window === 'undefined') return 0
  return window.innerWidth - document.documentElement.clientWidth
}

function lockBody() {
  const doc = document.documentElement
  const body = document.body

  // 이미 잠금 중이면 카운트만 증가
  if (lockCount === 0) {
    previousScrollY = window.scrollY

    const scrollBarW = getScrollbarWidth()
    // 레이아웃 흔들림 방지용 padding-right
    const currentPaddingRight = parseFloat(getComputedStyle(doc).paddingRight || '0')
    doc.style.paddingRight = `${currentPaddingRight + scrollBarW}px`

    // iOS까지 안정적인 방식: body를 fixed로 고정
    body.style.position = 'fixed'
    body.style.top = `-${previousScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockBody() {
  const doc = document.documentElement
  const body = document.body

  if (lockCount > 0) lockCount -= 1
  if (lockCount === 0) {
    // 원상 복구
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    body.style.overflow = ''
    doc.style.paddingRight = ''

    // 원래 위치로 복귀
    window.scrollTo(0, previousScrollY)
  }
}

/**
 * isLocked가 true일 때 바디 스크롤을 막고, 컴포넌트 언마운트 시 해제.
 * - 중첩 모달을 고려해 ref-count로 안전하게 동작
 * - 스크롤바 보정으로 레이아웃 튐 방지
 * - iOS Safari 대응
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isLocked) {
      lockBody()
      return () => unlockBody()
    }

    // isLocked가 false일 경우엔 아무 것도 하지 않음
    return
  }, [isLocked])
}
