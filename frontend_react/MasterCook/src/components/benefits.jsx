export default function Benefits() {
  return (
    <section className="p-4 md:p-8">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex flex-col items-center lg:items-start order-1">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibul0EGpfM5nEibusH69PMzehYFxCka0yLvVwto" 
              alt="MasterCook Academy" 
              className="w-full max-w-xs md:max-w-md" 
            />
          </div>
          <h1 className="text-center lg:text-start text-2xl md:text-3xl lg:text-4xl font-medium text-main-text mt-4">
            Por qué elegir MasterCook Academy
          </h1>
        </div>

        <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 items-center lg:items-start justify-center order-2">
          <div className="flex flex-row gap-4 items-start md:items-center">
            <img src="/Icon-1.webp" alt="" className="w-8 md:w-10 mt-1 md:mt-0" />
            <div>
              <p className="text-base md:text-lg lg:text-xl text-secondary-text">
                <i className="text-sm md:text-base text-main-text font-medium block mb-1">
                  Instructores con experiencia internacional
                </i>
                Nuestros chefs han trabajado en cocinas de renombre y están listos para enseñarte con pasión y técnica.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-4 items-start md:items-center">
            <img src="/Icon-2.webp" alt="" className="w-8 md:w-10 mt-1 md:mt-0" />
            <div>
              <p className="text-base md:text-lg lg:text-xl text-secondary-text">
                <i className="text-sm md:text-base text-main-text font-medium block mb-1">
                  Talleres prácticos y actualizados
                </i>
                Contenidos diseñados para aprender haciendo, con recetas modernas y aplicables desde el primer día.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-4 items-start md:items-center">
            <img src="/Icon-3.webp" alt="" className="w-8 md:w-10 mt-1 md:mt-0" />
            <div>
              <p className="text-base md:text-lg lg:text-xl text-secondary-text">
                <i className="text-sm md:text-base text-main-text font-medium block mb-1">
                  Certificación y acompañamiento personalizado
                </i>
                Al finalizar, obtén un diploma digital y recibe feedback directo de tu instructor para seguir mejorando.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}