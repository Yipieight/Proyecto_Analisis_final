import { useState, useEffect } from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import Cart from './cart'; 

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    // Verificar si existe el auth_token al cargar el componente
    useEffect(() => {
        const checkAuthToken = () => {
            const cookies = document.cookie.split(';');
            const hasAuthToken = cookies.some(cookie => 
                cookie.trim().startsWith('auth_token=')
            );
            setIsAuthenticated(hasAuthToken);
        };
        
        checkAuthToken();
        
        // Opcional: verificar periódicamente o escuchar cambios en cookies
        const intervalId = setInterval(checkAuthToken, 5000);
        
        return () => clearInterval(intervalId);
    }, []);
    
    const openCart = () => {
        setIsCartOpen(true);
    };
    
    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };
    
    const handleLogout = () => {
        // Eliminar la cookie auth_token
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setIsAuthenticated(false);
        setIsUserMenuOpen(false);
        // Aquí podrías redirigir al usuario a la página de inicio o mostrar alguna notificación
    };
    
    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/30 backdrop-blur-md border-b border-gray-200">
                <div className="grid grid-cols-3 w-full">
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
                        <button 
                            onClick={openCart}
                            className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-l border-r border-gray-300"
                        >
                            <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                            <span className="relative z-10 group-hover:text-primary transition-colors duration-300 flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Carrito
                            </span>
                        </button>
                        
                        {isAuthenticated ? (
                            <div className="relative">
                                <button 
                                    onClick={toggleUserMenu}
                                    className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300"
                                >
                                    <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                                    <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                                        Mi Cuenta
                                    </span>
                                </button>
                                
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                        <a 
                                            href="/profile" 
                                            className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Mi Perfil
                                        </a>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <a 
                                href="/login" 
                                className="group relative overflow-hidden flex items-center h-16 px-10 text-main-text border-r border-gray-300"
                            >
                                <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                                <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                                    Usuario
                                </span>
                            </a>
                        )}
                    </div>
                </div>
            </nav>
            
            {isUserMenuOpen && isAuthenticated && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsUserMenuOpen(false)}
                ></div>
            )}
            
            <Cart isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
        </>
    );
}