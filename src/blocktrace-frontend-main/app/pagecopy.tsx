'use client';

import React from 'react';
import Footer from '@/components/footer';
import Hero from '@/components/Hero';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { EvervaultCard } from '@/components/ui/evervault-card';
import { useRouter } from 'next/navigation'; // ← Add this

const Home = () => {
  const router = useRouter(); // ← Create router instance

  return (
    <>
      {/* Background Beams Layer */}
      <div className="fixed top-0 left-0 w-full h-screen z-5 pointer-events-none">
        <BackgroundBeamsWithCollision className="h-screen w-full bg-transparent">
          <div className="w-full h-full" />
        </BackgroundBeamsWithCollision>
      </div>

      {/* Main Content */}
      <div 
        className="min-h-screen flex flex-col text-white relative z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/path/to/your/image.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

        {/* Header */}
        <header className="flex flex-col items-center py-6 relative z-10">
          <div className="bg-black bg-opacity-70 px-8 py-4 rounded-lg">
            <Hero />
            <p className="text-lg text-center">
              Track your product from origin to consumer transparently
            </p>
          </div>
        </header>

        {/* Buttons */}
        <main className="flex flex-col items-center my-16 flex-grow relative z-10">
          <div className="flex space-x-8 bg-black bg-opacity-70 px-8 py-4 rounded-lg relative z-10">
            {/* ✅ Track a Product */}
            <div
              onClick={() => router.push('/track')} // ← Navigate on click
              className="w-64 h-20 cursor-pointer transition-transform hover:scale-105"
            >
              <EvervaultCard text="Track a Product" className="" />
            </div>

          <div
  onClick={() => router.push('/add-step')}  // ✅ This line
  className="w-64 h-20 cursor-pointer transition-transform hover:scale-105"
>
  <EvervaultCard text="Add a Step" />
</div>


            
          </div>

        
        </main>

        {/* Footer */}
        <div className="relative z-10 bg-gray-900 bg-opacity-90">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;
