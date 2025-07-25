'use client'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

// import required modules
import { Pagination } from 'swiper/modules'

export default function Home() {
  const slides = Array.from({ length: 4 }, (_, index) => `Slide ${index + 1}`)

  const pagination = {
    clickable: true,
    renderBullet: function (index: number, className: string) {
      return (
        '<span class="' +
        className +
        ' text-white !text-xxs !bg-black !w-4 !rounded-none !h-4 flex flex-col items-center justify-center">' +
        (index + 1) +
        '</span>'
      )
    },
  }

  return (
    <>
      <section className='w-full h-fit flex flex-col items-center justify-center '>
        <Swiper
          pagination={pagination}
          modules={[Pagination]}
          className='w-full h-[80vh]'
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          onSlideChange={() => console.log('slide change')}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className='w-full h-full flex items-center justify-center bg-black p-4'>
              <h2 className='w-fit h-fit text-lg text-white'>{slide}</h2>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <section className='w-full h-96 flex flex-col items-center text-center justify-center p-6'>
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
