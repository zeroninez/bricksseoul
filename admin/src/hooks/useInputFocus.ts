'use client'

import { useCallback } from 'react'

const SCROLL_OFFSET = 80

interface UseInputFocusProps {
  scrollOffset?: number
}

// Input focus 시 스크롤
export const useInputFocus = useCallback(
  (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    { scrollOffset = SCROLL_OFFSET }: UseInputFocusProps = {},
  ) => {
    setTimeout(() => {
      const element = e.target
      const container = element.closest('[data-rsbs-scroll]')

      if (container) {
        const elementRect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - scrollOffset

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 300)
  },
  [],
)
