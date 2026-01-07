import { Logo } from './Logo'

export const SplashScreen = () => {
  return (
    <div className='fixed  inset-0 max-w-md mx-auto w-full h-dvh flex flex-col items-start justify-between p-6 bg-zinc-50 z-50'>
      {/* 중앙 로딩바 */}
      <div className='w-full h-full flex flex-col justify-center items-center gap-4 z-10'>
        <div className='w-12 h-12 border-2 border-t-primary border-r-primary border-b-stone-200 border-l-stone-200 rounded-full animate-spin' />
        <Logo className='text-lg' />
        <div className='text-base font-light leading-none'>Place to relax</div>
      </div>
    </div>
  )
}
