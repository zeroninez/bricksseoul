import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className='px-4 pt-6 pb-10 flex flex-col gap-4 '>
      <div className='flex flex-row items-center justify-start'>
        <Logo className='w-10' />
        <span className='text-xl tracking-tight font-bodoniModa font-bold'>Bricks Seoul</span>
      </div>
      <p className='text-base'> © {new Date().getFullYear()} Bricks Seoul. All rights reserved.</p>
    </footer>
  )
}
