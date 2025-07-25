import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className='p-4 sm:p-6 lg:p-8 bg-background border-t border-black/10 text-center'>
      <Logo className='mx-auto mb-4 w-12' />
      <div className='mb-4 text-xl font-bodoniModa font-bold'>
        Rejuvenate your <br />
        mind, body & soul
      </div>
      <p className='text-base'> © {new Date().getFullYear()} Bricks Seoul. All rights reserved.</p>
    </footer>
  )
}
