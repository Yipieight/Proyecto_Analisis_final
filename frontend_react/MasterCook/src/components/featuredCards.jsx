export default function FeaturedCards(){
    return(
        <section className="p-8 bg-light-background">
            <div className="flex flex-col border border-gray-400 rounded-xl">
                <div className="grid grid-cols-3 w-full border-b border-gray-400">
                    <div className="col-span-1 flex text-main-text items-center justify-center border-r border-gray-400 text-[165px]">
                        01
                    </div>
                    <div className="col-span-2 flex flex-col items-center justify-center">
                        <h1 className="text-6xl text-main-text">Repostería Francesa</h1>
                        <p className="text-lg text-secondary-text max-w-[40em] text-justify">Este mes lidera en inscripciones y reseñas positivas.
                        Nuestros alumnos están fascinados con la técnica de macarons y los postres de vitrina. ¡Incluye acceso a recetario exclusivo por tiempo limitado!</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 w-full border-b border-gray-400 ">
                    <div className="col-span-1 text-main-text flex items-center  justify-center border-r border-gray-400 text-[165px]">
                        02
                    </div>
                    <div className="col-span-2 flex flex-col items-center justify-center w-full">
                        <h1 className="text-6xl text-main-text">Italiana desde Cero</h1>
                        <p className="text-lg text-secondary-text max-w-[40em] text-justify">Taller más esperado del mes por su chef internacional.
                        Directo desde Nápoles, nuestro chef invitado comparte secretos auténticos de la pasta fresca. ¡Inscripciones abiertas solo esta semana!</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 w-full ">
                    <div className="col-span-1 text-main-text flex items-center justify-center border-r border-gray-400 text-[165px]">
                        03
                    </div>
                    <div className="col-span-2 flex flex-col items-center justify-center">
                        <h1 className="text-6xl text-main-text">Saludable para el Día a Día</h1>
                        <p className="text-lg text-secondary-text max-w-[40em] text-justify">Se destacó por su utilidad y resultados inmediatos.
                        Pensado para quienes quieren comer mejor sin perder tiempo. Más de 60 personas ya mejoraron su rutina alimentaria con este taller.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}