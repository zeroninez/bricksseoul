import { Logo } from './Logo'

export const SplashScreen = () => {
  return (
    <div className='fixed  inset-0 max-w-md mx-auto w-full h-dvh flex flex-col items-start justify-between p-6 bg-zinc-50 z-50'>
      {/* 상단 로고 */}
      <div className='w-full h-fit flex flex-col justify-start items-start gap-1 z-10'>
        <Logo className='text-lg' />
        <div className='text-base font-light leading-none'>Place to relax</div>
      </div>

      {/* 중앙 로딩바 */}
      <div className='w-full h-full flex flex-col justify-center items-center gap-4 z-10'>
        <div className='text-base animate-pulse font-light leading-tight text-zinc-700'>Loading pages...</div>
      </div>
    </div>
  )
}
