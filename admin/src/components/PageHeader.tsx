import { Breadcrumbs } from '@/components'

export const PageHeader = ({ title }: { title: string } = { title: 'Admin' }) => {
  return (
    <section className='w-full mt-12 p-4 '>
      <h1 className='text-base text-black font-medium'>{title}</h1>
    </section>
  )
}
