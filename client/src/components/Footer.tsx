import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className='px-4 py-6 bg-zinc-50 flex flex-row justify-between items-center gap-4 '>
      <p className='text-base flex flex-row justify-center items-center gap-2 text-zinc-500'>
        <Logo /> {new Date().getFullYear()}
      </p>
    </footer>
  )
}
