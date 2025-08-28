export const Empty = ({ message }: { message?: string }) => {
  return (
    <div className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
      <p className='text-gray-600'>{message || 'Empty Space...!'}</p>
    </div>
  )
}
