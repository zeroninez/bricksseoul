import { Breadcrumbs } from '@/components'

export const PageHeader = ({ title }: { title: string } = { title: 'Admin' }) => {
  return (
    <section className='w-full h-fit pt-8 px-4 pb-4 flex flex-col gap-4'>
      <Breadcrumbs />
      <div className='w-full flex flex-col items-start justify-center '>
        <h1 className='font-medium'>{title}</h1>
      </div>
    </section>
  )
}
