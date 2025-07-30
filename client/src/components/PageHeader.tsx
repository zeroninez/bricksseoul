import { Breadcrumbs } from '@/components'

export const PageHeader = ({ title }: { title: string } = { title: 'Admin' }) => {
  return (
    <section className='w-full bg-white border-b border-gray-200'>
      <Breadcrumbs />
      <div className='w-full flex flex-col items-start justify-center pt-4 px-6 pb-6'>
        <h1 className='font-medium'>{title}</h1>
      </div>
    </section>
  )
}
