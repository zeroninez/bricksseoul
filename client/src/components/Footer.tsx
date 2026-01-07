import { Logo } from './Logo'
import { FOOTER_HEIGHT } from '@/theme/constants'

export const Footer = () => {
  return (
    <footer
      style={{
        height: FOOTER_HEIGHT,
      }}
      className='w-full bg-background text-black px-5 py-6 flex flex-col justify-end gap-4 items-start'
    >
      <Logo />
      <div className='text-sm text-stone-700'>© {new Date().getFullYear()} Wellncher. All rights reserved.</div>
    </footer>
  )
}
