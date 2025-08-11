import { Breadcrumbs } from '@/components'

export const PageHeader = ({ title }: { title: string } = { title: 'Admin' }) => {
  return (
    <section className='w-full bg-gray-100 border-b border-gray-200'>
      <div className='w-full flex flex-col items-start justify-center pt-12 pb-6 px-6'>
        <h1 className='text-xl text-black'>{title}</h1>
      </div>
    </section>
  )
}
