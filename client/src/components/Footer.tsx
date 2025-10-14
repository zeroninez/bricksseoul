import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className='w-full h-fit px-5 py-6 flex flex-row justify-between items-center gap-4'>
      <div className='text-base flex flex-row justify-center items-center gap-2 text-zinc-500'>
        <Logo /> {new Date().getFullYear()}
      </div>
    </footer>
  )
}
