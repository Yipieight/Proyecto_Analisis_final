export default function Subscribe() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[15rem] sm:min-h-[20rem] md:min-h-[25rem] lg:min-h-[30rem] p-4 gap-2 sm:gap-3 md:gap-4 text-center">
      <h1 className="text-main-text text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold">INSCRIBETE</h1>
      <p className="text-secondary-text text-base sm:text-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
      <button className="bg-secondary w-32 sm:w-36 md:w-40 h-8 sm:h-9 md:h-10 hover:bg-[#fce6c7] mt-2 sm:mt-3 md:mt-4">Ir a inscripción</button>
    </section>
  );
}