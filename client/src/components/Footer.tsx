import { Logo } from './Logo'
import { FOOTER_HEIGHT } from '@/theme/constants'

export const Footer = () => {
  return (
    <footer
      style={{
        height: FOOTER_HEIGHT,
      }}
      className='w-full bg-black text-white px-5 py-6 flex flex-col justify-between items-start gap-4'
    >
      <Logo className='text-xl' />
      <div className='text-sm text-zinc-300'>© {new Date().getFullYear()} Wellncher. All rights reserved.</div>
    </footer>
  )
}
