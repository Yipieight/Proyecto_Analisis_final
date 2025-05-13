import { useState, useEffect, useRef } from 'react';

export default function Featured() {
  const words = [
    { name: "DESCUBRE", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuadc4t8BUdWKHfOIM621lGQbSXNs5CArhFxzP" },
    { name: "NUESTROS", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuE7uIFunNQ3G5DiXUHsPJjl4xCBKmyotakWeF" },
    { name: "TALLERES", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuE5VH1YNQ3G5DiXUHsPJjl4xCBKmyotakWeFZ" },
    { name: "ESTRELLA", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuyl3MHoRAsabYELF97nAUxrDB0CiN83WOwfRJ" },
    { name: "DEL", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuUSfmULWcIwjqbxDBoXO9VQtFgSlpMK64yH35" },
    { name: "MES.", imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibursc6VD106UMnlq97hFP5WBS8o4GATz1XcRHd" }
  ];

  return (
    <div className="w-full overflow-hidden bg-light-background py-4">
      <div className="w-full flex items-center justify-center px-8 mb-4">
        <div className="w-full flex flex-row items-center justify-between">
          <a href="/" className="flex flex-row gap-1 items-center">
            <h2 className="text-secondary-text font-medium text-xl">¡Inscríbete ya!</h2>
            <div className="text-secondary-text">
              <svg width="20" height="20" viewBox="0 0 17 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.1836 26.0662C6.32574 20.7266 11.2081 16.5218 16.4082 13.2568C11.1598 10.0406 6.48457 5.68956 3.19051 0.447478L0.0552734 0.447478C3.34243 5.52248 7.30636 9.93614 12.1957 13.2568C7.29945 16.6262 3.1836 21.0886 2.47955e-05 26.0662L3.1905 26.0662L3.1836 26.0662Z" fill="currentColor"></path>
              </svg>
            </div>
          </a>
          <a href="/" className="flex flex-row gap-1 items-center">
            <h2 className="text-secondary-text font-medium text-xl">Nuevos talleres</h2>
            <div className="text-secondary-text">
              <svg width="20" height="20" viewBox="0 0 17 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.1836 26.0662C6.32574 20.7266 11.2081 16.5218 16.4082 13.2568C11.1598 10.0406 6.48457 5.68956 3.19051 0.447478L0.0552734 0.447478C3.34243 5.52248 7.30636 9.93614 12.1957 13.2568C7.29945 16.6262 3.1836 21.0886 2.47955e-05 26.0662L3.1905 26.0662L3.1836 26.0662Z" fill="currentColor"></path>
              </svg>
            </div>
          </a>
          <a href="/" className="flex flex-row gap-1 items-center">
            <h2 className="text-secondary-text font-medium text-xl">Chefs invitados</h2>
            <div className="text-secondary-text">
              <svg width="20" height="20" viewBox="0 0 17 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.1836 26.0662C6.32574 20.7266 11.2081 16.5218 16.4082 13.2568C11.1598 10.0406 6.48457 5.68956 3.19051 0.447478L0.0552734 0.447478C3.34243 5.52248 7.30636 9.93614 12.1957 13.2568C7.29945 16.6262 3.1836 21.0886 2.47955e-05 26.0662L3.1905 26.0662L3.1836 26.0662Z" fill="currentColor"></path>
              </svg>
            </div>
          </a>
          <a href="/" className="flex flex-row gap-1 items-center">
            <h2 className="text-secondary-text font-medium text-xl">Sorteos</h2>
            <div className="text-secondary-text">
              <svg width="20" height="20" viewBox="0 0 17 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.1836 26.0662C6.32574 20.7266 11.2081 16.5218 16.4082 13.2568C11.1598 10.0406 6.48457 5.68956 3.19051 0.447478L0.0552734 0.447478C3.34243 5.52248 7.30636 9.93614 12.1957 13.2568C7.29945 16.6262 3.1836 21.0886 2.47955e-05 26.0662L3.1905 26.0662L3.1836 26.0662Z" fill="currentColor"></path>
              </svg>
            </div>
          </a>
        </div>
      </div>

      <div className="marquee-container">
        <div className="marquee-content">
          {words.map((item, index) => (
            <div key={`item1-${index}`} className="marquee-item">
              <img 
                src={item.imageUrl} 
                alt={`${item.name}`} 
                className="h-16 w-16 object-cover"
              />
              <h2 className="text-8xl font-bold text-main-text mx-10">{item.name}</h2>
            </div>
          ))}
        </div>
        <div className="marquee-content">
          {words.map((item, index) => (
            <div key={`item2-${index}`} className="marquee-item">
              <img 
                src={item.imageUrl} 
                alt={`${item.name}`} 
                className="h-16 w-16 object-cover"
              />
              <h2 className="text-8xl font-bold text-main-text mx-10">{item.name}</h2>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          white-space: nowrap;
        }
        
        .marquee-content {
          display: inline-flex;
          animation: marquee 10s linear infinite;
        }
        
        .marquee-item {
          display: inline-flex;
          align-items: center;
          padding: 0 1rem;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}