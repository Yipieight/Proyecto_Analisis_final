import { useState, useEffect } from 'react';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import Cart from './cart';

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    
    useEffect(() => {
        const checkAuthToken = () => {
            const cookies = document.cookie.split(';');
            let token = null;
            
            for (const cookie of cookies) {
                const trimmedCookie = cookie.trim();
                if (trimmedCookie.startsWith('auth_token=')) {
                    token = trimmedCookie.substring('auth_token='.length);
                    break;
                }
            }
            
            if (token) {
                setAuthToken(token);
                verifyAuthToken(token);
            } else {
                setIsAuthenticated(false);
            }
        };
        
        checkAuthToken();
        
        const intervalId = setInterval(checkAuthToken, 5000);
        
        return () => clearInterval(intervalId);
    }, []);
    
    const verifyAuthToken = async (token) => {
        try {
            const response = await fetch('http://localhost:5001/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                console.error('Token inválido o expirado');
                removeAuthTokenCookie();
                setAuthToken(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Error al verificar el token:', err);
            removeAuthTokenCookie();
            setAuthToken(null);
            setIsAuthenticated(false);
        }
    };

    const removeAuthTokenCookie = () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
    
    const openCart = () => {
        setIsCartOpen(true);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    
    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    
    const handleLogout = () => {
        removeAuthTokenCookie();
        setAuthToken(null);
        setIsAuthenticated(false);
        setIsUserMenuOpen(false);
    };
    
    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/30 backdrop-blur-md border-b border-gray-200">
                <div className="hidden lg:grid grid-cols-3 w-full">
                    <div className="flex items-stretch">
                        <a href="/" className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-r border-gray-300">
                            <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                            <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Inicio</span>
                        </a>

                        <a href="/workshops" className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-r border-gray-300">
                            <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                            <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Talleres</span>
                        </a>
                        <a href="/" className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-r border-gray-300">
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
                        <a href="/" className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-l border-r border-gray-300">
                            <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                            <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Contacto</span>
                        </a>
                        <button 
                            onClick={openCart}
                            className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-l border-r border-gray-300"
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
                                    className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-r border-gray-300"
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
                                className="group relative overflow-hidden flex items-center h-16 px-6 md:px-10 text-main-text border-r border-gray-300"
                            >
                                <span className="absolute inset-0 bg-light-background translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></span>
                                <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                                    Usuario
                                </span>
                            </a>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-between items-center px-4 lg:hidden">
                    <button 
                        onClick={toggleMobileMenu}
                        className="p-2 text-gray-600 focus:outline-none"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                    
                    <div className="flex justify-center items-center py-3">
                        <a href="/" className="text-primary font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5a5 5 0 0 0-2 9.584v2.666h14v-2.666a5.001 5.001 0 0 0-2.737-9.53a4.502 4.502 0 0 0-8.526 0A5 5 0 0 0 7 5m11.998 13.75H5.002c.01 1.397.081 2.162.584 2.664C6.172 22 7.114 22 9 22h6c1.886 0 2.828 0 3.414-.586c.503-.502.574-1.267.584-2.664"/></svg>
                        </a>
                    </div>
                    
                    <button
                        onClick={openCart}
                        className="p-2 text-gray-600 focus:outline-none"
                    >
                        <ShoppingBag className="w-6 h-6" />
                    </button>
                </div>
                
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-200">
                        <div className="flex flex-col">
                            <a href="/" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50">
                                Inicio
                            </a>
                            <a href="/workshops" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50">
                                Talleres
                            </a>
                            <a href="/" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50">
                                Sobre Nosotros
                            </a>
                            <a href="/" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50">
                                Contacto
                            </a>
                            
                            {isAuthenticated ? (
                                <>
                                    <a href="/profile" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50 flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Mi Perfil
                                    </a>
                                    <button 
                                        onClick={handleLogout}
                                        className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50 flex items-center w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5 mr-2" />
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <a href="/login" className="py-4 px-6 border-b border-gray-200 text-main-text hover:bg-gray-50">
                                    Usuario
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            
            {isUserMenuOpen && isAuthenticated && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsUserMenuOpen(false)}
                ></div>
            )}
            
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden" 
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
            
            <Cart isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
        </>
    );
}