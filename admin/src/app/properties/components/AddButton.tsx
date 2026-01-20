interface AddButtonProps {
  onClick?: () => void
}

export const AddButton = (props: AddButtonProps) => {
  const { onClick } = props
  return (
    <>
      <button
        className='w-fit h-8 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#5E4646] text-white gap-1 inline-flex justify-center items-center  active:opacity-75 active:scale-90 transition-all'
        onClick={onClick}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 20 20' fill='none'>
          <path
            d='M15 10H10M10 10H5M10 10V5M10 10V15'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <span className='text-xs font-medium'>공간 추가하기</span>
      </button>
    </>
  )
}
