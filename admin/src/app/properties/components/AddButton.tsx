interface AddButtonProps {
  onClick?: () => void
}

export const AddButton = (props: AddButtonProps) => {
  const { onClick } = props
  return (
    <button
      className='fixed bottom-5 z-10 right-5 w-fit h-fit p-3 rounded-xl bg-black active:opacity-75 active:scale-90 transition-all'
      onClick={onClick}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='white'
        className='w-8 h-8 m-auto'
      >
        <path strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
      </svg>
    </button>
  )
}
