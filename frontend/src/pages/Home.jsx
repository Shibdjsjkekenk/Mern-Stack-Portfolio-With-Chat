import React from 'react'
import LogoSlider from '../components/LogoSlider'
import AboutUs from '../components/AboutUs'
import CategoryCarousel from '../components/CategoryCarousel'
import Experience from '../components/Experience'
import RelevantExperience from '../components/RelevantExperience'
import Services from '../components/Services'
import TimeLine from '../components/TimeLine'
import Testimonials from '../components/Testimonials'
import HeroSection from '@/components/HeroSection'

function Home() {


  return (
    <>

      <HeroSection />
      <LogoSlider />
      <AboutUs />
      <TimeLine />
      <CategoryCarousel />
      <Experience />
      <RelevantExperience />
      <Services />
      <Testimonials />

    </>
  )
}

export default Home
