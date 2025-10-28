export const ListItem = ({ text, onClick, value }: { text: string; onClick: () => void; value?: string }) => {
  return (
    <div
      onClick={onClick}
      className='w-full h-fit flex flex-row justify-between items-center bg-stone-100 rounded-lg active:opacity-50 active:translate-y-0.5 transition-all'
    >
      <span className='w-fit h-fit flex-shrink-0 px-5 py-4 text-sm font-normal leading-none'>{text}</span>
      <div className='w-full h-fit flex flex-row justify-end items-center'>
        {value && <div className='max-w-40 truncate text-sm text-stone-400 text-right'>{value}</div>}
        <div className='w-fit h-fit flex-shrink-0 px-2 py-2'>
          <svg className='w-6 h-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'>
            <path d='M9 6.75L14.25 12L9 17.25' stroke='currentColor' strokeWidth={1.2} />
          </svg>
        </div>
      </div>
    </div>
  )
}
