'use client'

export default function Home() {
  return (
    <>
      <section className='w-full h-80 flex flex-col items-center text-center justify-center p-6'>
        <h1 className='text-3xl font-bold font-bodoniModa tracking-tighter mb-4'>Welcome to Bricks Seoul</h1>
        <p className='text-lg text-gray-700'>Your journey to rejuvenate your mind, body & soul starts here.</p>
      </section>

      <section className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
        <h2 className='text-2xl font-semibold font-bodoniModa tracking-tight mb-4'>Explore Our Services</h2>
        <p className='text-base text-gray-600'>
          Discover a range of activities and properties designed to enhance your well-being.
        </p>
      </section>
      <section className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
        <div className='w-full h-auto aspect-landscape bg-gray-200 flex items-center justify-center'></div>
      </section>
    </>
  )
}
