export default function Testimonials(){
    return(
        <section className="flex flex-col justify-center p-8 gap-4">
            <h1 className="text-start text-4xl text-main-text font-medium">Testimonios</h1>
            <div className="w-full border-b border-gray-400"></div>
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 items-center justify-center">
                    <div>
                        <div>
                            <img src="/Person-1.jpg" alt="" className="rounded-full object-cover w-32 h-32" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-main-text">Luis Fernández</h1>
                            <p className="text-secondary-text">Aprender cocina nunca fue tan accesible y divertido.</p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <div className="text-9xl text-main-text">"</div>
                        <p className="text-justify text-secondary-text">Tenía miedo de no entender porque no soy chef, pero el formato práctico y el acompañamiento hicieron que cada clase fuera clara y útil. ¡Hasta mis amigos notaron el cambio en mis platillos!</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 items-center justify-center">
                    <div>
                        <div>
                            <img src="/Person-2.jpg" alt="" className="rounded-full object-cover w-32 h-32" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-main-text">Mariana Gómez</h1>
                            <p className="text-secondary-text">Un antes y un después en mi pasión por la cocina</p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <div className="text-9xl text-main-text">"</div>
                        <p className="text-justify text-secondary-text">Gracias a MasterCook Academy pude descubrir técnicas que antes solo veía en televisión. Ahora preparo platillos profesionales desde casa y estoy pensando en emprender mi propio servicio de catering.</p>

                    </div>
                </div>
                <div className="grid grid-cols-2 items-center justify-center">
                    <div>
                        <div>
                            <img src="/Person-3.jpg" alt="" className="rounded-full object-cover w-32 h-32" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-main-text">Alejandro Villatoro</h1>
                            <p className="text-secondary-text">Más que un taller, fue una experiencia transformadora. </p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <div className="text-9xl text-main-text">"</div>
                        <p className="text-justify text-secondary-text">Desde el primer día sentí que estaba en el lugar correcto. Los chefs son cercanos y explican con claridad. ¡Aprendí más en un mes que en años de práctica autodidacta!</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 items-center justify-center">
                    <div>
                        <div>
                            <img src="/Person-4.jpg" alt="" className="rounded-full object-cover w-32 h-32" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-main-text"> Ricardo Guevara</h1>
                            <p className="text-secondary-text">Cocinar ya no es una rutina, es mi pasión diaria. </p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <div className="text-9xl text-main-text">"</div>
                        <p className="text-justify text-secondary-text">Me inscribí por curiosidad y terminé enamorada de la repostería. Hoy preparo postres por encargo y cada día aplico lo aprendido en los talleres. ¡Totalmente recomendado!</p>
                    </div>
                </div>
            </div>
     
            
           
        </section>
    )
}