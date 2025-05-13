export default function Benefits(){
    return(
        <section className="grid grid-cols-2 justify-around items-center p-8">
            <div className="flex flex-col">
                <div className="flex items-center justify-center">
                    <img src="https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibul0EGpfM5nEibusH69PMzehYFxCka0yLvVwto" alt="" width="300" />

                </div>
                <h1 className="text-start text-4xl font-medium text-main-text">Por qué elegir MasterCook Academy</h1>
            </div>
            <div className="flex flex-col gap-10 items-center justify-center">
                <div className="flex flex-row gap-5 items-center">
                    <img src="/Icon-1.webp" alt="" className="w-10" />
                    <p className="text-xl text-secondary-text"><i className="text-base text-main-text">Instructores con experiencia internacional</i> <br />
Nuestros chefs han trabajado en cocinas de renombre y están listos para enseñarte con pasión y técnica. </p>
                </div>
                <div className="flex flex-row gap-5 items-center">
                    <img src="/Icon-2.webp" alt="" className="w-10"/>
                    <p className="text-xl text-secondary-text"><i className="text-base text-main-text">Talleres prácticos y actualizados</i><br />
Contenidos diseñados para aprender haciendo, con recetas modernas y aplicables desde el primer día.</p>
                </div>
                <div className="flex flex-row gap-5 items-center">
                    <img src="/Icon-3.webp" alt="" className="w-10"/>
                    <p className="text-xl text-secondary-text"><i className="text-base text-main-text">Certificación y acompañamiento personalizado</i><br />
Al finalizar, obtén un diploma digital y recibe feedback directo de tu instructor para seguir mejorando.</p>
                </div>
            </div>
        </section>
    )
    
}