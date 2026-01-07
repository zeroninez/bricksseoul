export const FormLabel = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <div className='w-full h-fit gap-4 flex flex-col'>
    <div className='w-fit h-fit flex flex-col justify-start items-start gap-2'>
      <span className='text-lg font-medium leading-none'>{title}</span>
      <span className='text-sm leading-none'>{description}</span>
    </div>
    {children}
  </div>
)
