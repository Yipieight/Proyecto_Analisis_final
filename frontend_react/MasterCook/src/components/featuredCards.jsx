export default function FeaturedCards() {
  return (
    <section className="p-4 md:p-8 bg-light-background">
      <div className="flex flex-col border border-gray-400 rounded-xl">
        {/* Card 01 */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 w-full border-b border-gray-400">
          <div className="w-full lg:col-span-1 flex text-main-text items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-400 py-6 text-6xl md:text-8xl lg:text-[165px]">
            01
          </div>
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl lg:text-6xl text-main-text text-center mb-2">Repostería Francesa</h1>
            <p className="text-base lg:text-lg text-secondary-text max-w-[40em] text-center lg:text-justify">
              Este mes lidera en inscripciones y reseñas positivas.
              Nuestros alumnos están fascinados con la técnica de macarons y los postres de vitrina. ¡Incluye acceso a recetario exclusivo por tiempo limitado!
            </p>
          </div>
        </div>
        
        {/* Card 02 */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 w-full border-b border-gray-400">
          <div className="w-full lg:col-span-1 flex text-main-text items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-400 py-6 text-6xl md:text-8xl lg:text-[165px]">
            02
          </div>
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl lg:text-6xl text-main-text text-center mb-2">Italiana desde Cero</h1>
            <p className="text-base lg:text-lg text-secondary-text max-w-[40em] text-center lg:text-justify">
              Taller más esperado del mes por su chef internacional.
              Directo desde Nápoles, nuestro chef invitado comparte secretos auténticos de la pasta fresca. ¡Inscripciones abiertas solo esta semana!
            </p>
          </div>
        </div>
        
        {/* Card 03 */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 w-full">
          <div className="w-full lg:col-span-1 flex text-main-text items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-400 py-6 text-6xl md:text-8xl lg:text-[165px]">
            03
          </div>
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl lg:text-6xl text-main-text text-center mb-2">Saludable para el Día a Día</h1>
            <p className="text-base lg:text-lg text-secondary-text max-w-[40em] text-center lg:text-justify">
              Se destacó por su utilidad y resultados inmediatos.
              Pensado para quienes quieren comer mejor sin perder tiempo. Más de 60 personas ya mejoraron su rutina alimentaria con este taller.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}