import { useState, useEffect } from 'react';

export default function Testimonials() {
  // Track screen width for responsive design decisions
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);
    
    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Testimonial data for cleaner rendering
  const testimonials = [
    {
      id: 1,
      name: "Luis Fernández",
      title: "Aprender cocina nunca fue tan accesible y divertido.",
      quote: "Tenía miedo de no entender porque no soy chef, pero el formato práctico y el acompañamiento hicieron que cada clase fuera clara y útil. ¡Hasta mis amigos notaron el cambio en mis platillos!",
      image: "/Person-1.jpg"
    },
    {
      id: 2,
      name: "Mariana Gómez",
      title: "Un antes y un después en mi pasión por la cocina",
      quote: "Gracias a MasterCook Academy pude descubrir técnicas que antes solo veía en televisión. Ahora preparo platillos profesionales desde casa y estoy pensando en emprender mi propio servicio de catering.",
      image: "/Person-2.jpg"
    },
    {
      id: 3,
      name: "Alejandro Villatoro",
      title: "Más que un taller, fue una experiencia transformadora.",
      quote: "Desde el primer día sentí que estaba en el lugar correcto. Los chefs son cercanos y explican con claridad. ¡Aprendí más en un mes que en años de práctica autodidacta!",
      image: "/Person-3.jpg"
    },
    {
      id: 4,
      name: "Ricardo Guevara",
      title: "Cocinar ya no es una rutina, es mi pasión diaria.",
      quote: "Me inscribí por curiosidad y terminé enamorada de la repostería. Hoy preparo postres por encargo y cada día aplico lo aprendido en los talleres. ¡Totalmente recomendado!",
      image: "/Person-4.jpg"
    }
  ];

  return (
    <section className="flex flex-col justify-center p-4 md:p-8 gap-4">
      <h1 className="text-start text-3xl md:text-4xl text-main-text font-medium">Testimonios</h1>
      <div className="w-full border-b border-gray-400"></div>
      
      <div className="flex flex-col gap-8">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="flex flex-col md:grid md:grid-cols-2 items-center justify-center gap-4">
            {/* Person info - stacked on mobile, left column on desktop */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="mb-2 sm:mb-0">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="rounded-full object-cover w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32" 
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl text-main-text">{testimonial.name}</h2>
                <p className="text-secondary-text">{testimonial.title}</p>
              </div>
            </div>
            
            {/* Quote - stacked on mobile, right column on desktop */}
            <div className="flex flex-row gap-2 md:gap-3 mt-2 md:mt-0">
              <div className="text-6xl md:text-7xl lg:text-9xl text-main-text self-start">"</div>
              <p className="text-justify text-secondary-text text-sm md:text-base">{testimonial.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}