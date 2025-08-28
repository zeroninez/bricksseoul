import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className='px-4 py-6 border-t border-gray-200 flex flex-row justify-between items-center gap-4 '>
      <p className='text-base'> © BRICKS SEOUL - {new Date().getFullYear()} </p>
    </footer>
  )
}
