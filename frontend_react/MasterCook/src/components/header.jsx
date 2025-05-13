export default function Header() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md border-b border-gray-200">
            <div className="grid grid-cols-3 w-full ">
                <div className="flex items-stretch">
                    <a href="/" className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300">
                        <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Inicio</span>
                    </a>

                   <a href="/workshops" className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300">
                        <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Talleres</span>
                    </a>
                    <a href="/" className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300">
                        <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Sobre Nosotros</span>
                    </a>
                </div>
                
                <div className="flex justify-center items-center">
                    <a href="/" className="text-primary font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5a5 5 0 0 0-2 9.584v2.666h14v-2.666a5.001 5.001 0 0 0-2.737-9.53a4.502 4.502 0 0 0-8.526 0A5 5 0 0 0 7 5m11.998 13.75H5.002c.01 1.397.081 2.162.584 2.664C6.172 22 7.114 22 9 22h6c1.886 0 2.828 0 3.414-.586c.503-.502.574-1.267.584-2.664"/></svg>
                    </a>
                </div>
                
                <div className="flex items-stretch justify-end">
                    <a href="/" className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-l border-r border-gray-300">
                        <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Contacto</span>
                    </a>
                    <a href="/" className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300">
                        <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Usuario</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}