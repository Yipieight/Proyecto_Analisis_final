import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';

const Decoration = () => {
  return (
    <div className="absolute -z-10 inset-0 overflow-hidden opacity-70 pointer-events-none">
      <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#D94F4F]/20 to-transparent blur-3xl" />
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-[#6B8E23]/20 to-transparent blur-3xl" />
    </div>
  );
};

const Loader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function LoginC() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("que dio" + data)

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      Cookies.set('auth_token', data.access_token, { expires: 7, path: '/' });
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/';  
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Ocurrió un error durante el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <Decoration />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-xl border border-[#e0dfdf] overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6 border-b border-[#E5E5E5]">
          <h1 className="text-2xl font-bold text-[#333333] mb-2">Inicia sesión</h1>
          <p className="text-[#666666]">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>
        
        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#D94F4F]/10 border border-[#D94F4F]/20 rounded-lg flex items-center gap-3 text-[#D94F4F]"
            >
              <AlertCircle size={18} />
              <p>{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#6B8E23]/10 border border-[#6B8E23]/20 rounded-lg flex items-center gap-3 text-[#6B8E23]"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>¡Sesión iniciada correctamente! Redirigiendo...</p>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-[#333333]">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] outline-none text-[#333333] placeholder:text-[#999999]"
                  disabled={isLoading || success}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-[#333333]">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] outline-none text-[#333333]"
                  disabled={isLoading || success}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-[#6B8E23] focus:ring-[#6B8E23] border-[#E5E5E5] rounded"
                  disabled={isLoading || success}
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-[#666666]">
                  Recordarme
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                isLoading || success 
                  ? 'bg-[#D94F4F]/70 text-white cursor-not-allowed' 
                  : 'bg-[#D94F4F] text-white hover:bg-[#c04545] shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <Loader />
              ) : success ? (
                'Sesión iniciada'
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[#666666]">
              ¿No tienes una cuenta?{' '}
              <a href="/signup" className="font-medium text-[#6B8E23] hover:text-[#566f1c] transition-colors">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}