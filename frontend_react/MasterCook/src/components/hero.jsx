import { useState } from 'react';

export default function Hero() {
  return (
    <section className="relative bg-light overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-6 md:py-8 mt-16 sm:mt-0">
        <div className="text-main-text text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-center md:text-left mb-6 md:mb-0">
          Aprende a cocinar
        </div>
        
        <div className="graphic w-full md:w-auto md:flex-1 flex items-center mx-0 md:mx-4 my-6 md:my-0">
          <div className="line flex-1 h-px bg-gray-400"></div>
          <div className="x-symbol mx-2 sm:mx-4 flex items-center justify-center">
            <svg className="hidden sm:block w-3 h-3 md:w-4 md:h-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13" stroke="#3E3A33" strokeWidth="1"></path>
              <path d="M1 1L13 13" stroke="#3E3A33" strokeWidth="1"></path>
            </svg>
            <img 
              src="https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu9qTfNuJycjaDbmvStoldZsnYTkJARN9PHMhX" 
              alt="Plato gourmet" 
              className="object-cover w-full max-w-[180px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px]" 
            />
            <svg className="hidden sm:block w-3 h-3 md:w-4 md:h-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13" stroke="#3E3A33" strokeWidth="1"></path>
              <path d="M1 1L13 13" stroke="#3E3A33" strokeWidth="1"></path>
            </svg>
          </div>
          <div className="line flex-1 h-px bg-gray-400"></div>
        </div>
        
        <div className="text-main-text text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-center md:text-right mb-6 md:mb-0">
          como un profesional
        </div>
      </div>
      
      <div className="flex flex-col justify-center items-center mt-0 sm:mt-[-50px] md:mt-[-80px] lg:mt-[-100px] z-20">
        <h1 className="text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] 2xl:text-[14rem] text-primary font-normal font-[Anton] leading-none tracking-tighter text-center">
          MasterCook
        </h1>
      </div>
      
    </section>
  );
}