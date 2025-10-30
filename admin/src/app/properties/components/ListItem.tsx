export const ListItem = ({
  text,
  onClick,
  value,
  children,
}: {
  text: string
  onClick: () => void
  value?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      onClick={onClick}
      className='w-full h-fit flex flex-col relative justify-start px-5 py-4 items-start bg-stone-100 rounded-lg active:opacity-50 active:translate-y-0.5 transition-all'
    >
      <div className='w-full h-fit flex flex-row justify-between items-center'>
        <span className='w-full h-4 flex-shrink-0 text-sm font-normal leading-none'>{text}</span>
        <div className='absolute right-0 top-0 w-fit h-fit flex-shrink-0 p-3'>
          <svg className='w-6 h-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'>
            <path d='M9 6.75L14.25 12L9 17.25' stroke='currentColor' strokeWidth={1.2} />
          </svg>
        </div>
      </div>
      {children && (
        <div className='w-full h-fit flex flex-col justify-start items-start text-xs text-stone-400'>{children}</div>
      )}
    </div>
  )
}
