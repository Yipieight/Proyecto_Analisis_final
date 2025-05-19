import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, Clock, Users, Calendar } from 'lucide-react';

const Decoration = () => {
  return (
    <div className="absolute -z-10 inset-0 overflow-hidden opacity-70 pointer-events-none">
      <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#D94F4F]/20 to-transparent blur-3xl" />
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-[#6B8E23]/20 to-transparent blur-3xl" />
    </div>
  );
};

const Loader = () => (
  <div className="flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#D94F4F]/30 border-t-[#D94F4F] rounded-full animate-spin"></div>
  </div>
);

const OptimizedImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src || "/api/placeholder/500/300";
    img.onload = () => {
      setImgSrc(img.src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setImgSrc("/api/placeholder/500/300");
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#333333]/10 z-10 w-full h-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader />
          </motion.div>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 w-full h-full object-cover`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

const ScrollIndicator = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(currentScroll / totalScroll);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-50">
      <motion.div 
        className="h-full bg-gradient-to-r from-[#6B8E23] via-[#6B8E23]/70 to-[#FAFAFA]" 
        style={{ scaleX: scrollProgress, transformOrigin: "0%" }}
      />
    </div>
  );
};

export default function WorkshopId({ workshopId }) {
  const [workshop, setWorkshop] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedWorkshops, setRelatedWorkshops] = useState([]);
  const [error, setError] = useState(null);
  const [allWorkshops, setAllWorkshops] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [isAlreadyReserved, setIsAlreadyReserved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const workshopImagesById = {
    1: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuMuhOjpzB02MisAEvYjHQhPGucaFX54CJrUOn", 
    2: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu7htBM8RilvS4mGda0BVPYjrps1H5Lf6DObNF", 
    3: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuBHsdxLPb6lrQWNcyYFdnfEzkeVHJXgoMawmD", 
    4: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibutFnAGpualz2QAIYZWuOfsk5nxJDdbcVy1pe4", 
    5: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibutHioByualz2QAIYZWuOfsk5nxJDdbcVy1pe4", 
    6: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibumctXQLNrPvHGd1j2UM5sACiWEgXI6atVnYyz", 
    7: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuuXdUT8fyXR7wfFas8jC0PIStrJ3dMb4ZeBKD", 
    8: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuInmtowlAyO8kqw0XmJiTH3EQFBVbCG4o2UaS", 
    9: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuEbSDr1NQ3G5DiXUHsPJjl4xCBKmyotakWeFZ", 
    10: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu6VjN9FHvu4jTO7gzRm3dXnqYyJGwxA5VLMkc", 
    11: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuabLKK2ABUdWKHfOIM621lGQbSXNs5CArhFxz", 
    12: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu5F9013ZRtlECNGU1HWj4bcvBhzO65xgwroMF"  
  };

  useEffect(() => {
    getAuthTokenFromCookies();
    window.scrollTo(0, 0);
  }, []);

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    
    if (authCookie) {
      const token = authCookie.trim().substring('auth_token='.length);
      setAuthToken(token);
      verifyAuthToken(token);
    } else {
      console.log('No auth token found in cookies');
      loadWorkshopData(workshopId);
      setLoading(false);
    }
  };

  const verifyAuthToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        loadWorkshopData(workshopId);
        loadUserReservations(token);
      } else {
        console.error('Invalid or expired token');
        removeAuthTokenCookie();
        setAuthToken(null);
        setIsAuthenticated(false);
        loadWorkshopData(workshopId);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      loadWorkshopData(workshopId);
      setLoading(false);
    }
  };

  const removeAuthTokenCookie = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const loadUserReservations = async (token) => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5003/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          removeAuthTokenCookie();
          setAuthToken(null);
          setIsAuthenticated(false);
          console.log('Session expired, please log in again');
          return;
        }
        
        console.log(`Error loading reservations: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      
      if (data && data.reservations) {
        setUserReservations(data.reservations);
        
        const isReserved = data.reservations.some(
          reservation => reservation.workshop_id.toString() === workshopId.toString()
        );
        
        setIsAlreadyReserved(isReserved);
      }
    } catch (error) {
      console.error("Error loading user reservations:", error);
    }
  };
  
  const loadAllWorkshops = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/workshops');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.workshops) {
        setAllWorkshops(data.workshops);
        return data.workshops;
      }
      
      return [];
    } catch (error) {
      console.error("Error loading all workshops:", error);
      return [];
    }
  };
  
  const loadWorkshopData = async (id) => {
    setLoading(true);
    try {
      let allWorkshopsData = allWorkshops;
      if (allWorkshopsData.length === 0) {
        allWorkshopsData = await loadAllWorkshops();
      }
      
      const response = await fetch(`http://localhost:5002/api/workshops/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.workshop) {
        const processedWorkshop = {
          ...data.workshop,
          instructor: data.workshop.instructor_name,
          time: `${data.workshop.start_time.substring(0, 5)} - ${data.workshop.end_time.substring(0, 5)}`,
          imageUrl: workshopImagesById[data.workshop.id] || "/api/placeholder/500/300", 
          availability: data.workshop.available_slots > 5 ? "Alta disponibilidad" : "Pocas plazas",
          stock: data.workshop.available_slots,
          location: "Cocina Central, Zona 10", 
          discountedPrice: data.workshop.price,
          discount: 0, 
          includes: [
            "Material didáctico",
            "Ingredientes necesarios",
            "Certificado de participación",
            "Degustación de productos"
          ], 
          capacity: data.workshop.capacity || 20 
        };
        
        setWorkshop(processedWorkshop);
        
        if (allWorkshopsData.length > 0) {
          const sameCategory = allWorkshopsData.filter(w => 
            w.category_id === data.workshop.category_id && 
            w.id !== data.workshop.id
          );
          
          let related = [...sameCategory];
          if (related.length < 3) {
            const otherWorkshops = allWorkshopsData.filter(w => 
              w.category_id !== data.workshop.category_id && 
              w.id !== data.workshop.id
            );
            
            related = [...related, ...otherWorkshops.slice(0, 3 - related.length)];
          }
          
          setRelatedWorkshops(related.slice(0, 3));
        }
      } else {
        setError("No se encontró información del taller");
      }
    } catch (error) {
      console.error("Error al cargar los datos del taller:", error);
      setError("Error al cargar el taller. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingCart = localStorage.getItem('salsasCart');
    let cart = existingCart ? JSON.parse(existingCart) : [];
    
    const itemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (itemIndex !== -1) {
      cart[itemIndex].quantity += 1;
    } else {
      cart.push({
        ...item,
        quantity: 1
      });
    }
    
    localStorage.setItem('salsasCart', JSON.stringify(cart));
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-[#6B8E23] text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = `${item.name} ha sido añadido al carrito`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return "";
    
    if (dateString.includes("de")) return dateString;
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const navigateToCategory = (categoryId) => {
    localStorage.setItem('selectedCategory', categoryId);
    window.location.href = '/workshops';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-6">
          <Loader />
          <p className="text-[#666666] animate-pulse">Cargando información del taller...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-[#333333]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <a href="/workshops" className="bg-[#D94F4F] text-white px-6 py-3 rounded-lg hover:bg-[#c04545] transition-colors">
            Ver todos los talleres
          </a>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-[#333333]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Taller no encontrado</h2>
          <p className="mb-6">El taller que buscas no existe o ha sido eliminado.</p>
          <a href="/workshops" className="bg-[#D94F4F] text-white px-6 py-3 rounded-lg hover:bg-[#c04545] transition-colors">
            Ver todos los talleres
          </a>
        </div>
      </div>
    );
  }

  const WorkshopCard = ({ workshop, index }) => {
    const formattedDate = getFormattedDate(workshop.date);
    const workshopImage = workshopImagesById[workshop.id] || "/api/placeholder/400/300";
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <a href={`/workshopsId/${workshop.id}`} className="block">
          <article className="group relative w-full h-full overflow-hidden bg-[#FFFFFE] shadow-sm hover:shadow-md transition-all duration-300 border border-[#FFFFE3]/20">
            <div className="relative overflow-hidden  bg-[#333333] h-40">
              <OptimizedImage 
                src={workshopImage} 
                alt={workshop.name} 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-3 right-3">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                  className="bg-[#333333] text-[#FAFAFA] px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm"
                >
                  <span className="font-medium">
                    {workshop.modality === 'presencial' ? 'PRESENCIAL' : 'VIRTUAL'}
                  </span>
                </motion.div>
              </div>
            </div>
            
            <div className="p-4">
              <div>
                <h4 className="text-sm text-[#6B8E23] font-medium tracking-wide mb-1">
                  {workshop.category_name || "Categoría"}
                </h4>
                <h3 className="text-lg text-[#333333] font-medium tracking-tight line-clamp-1 group-hover:text-[#D94F4F] transition-colors">
                  {workshop.name}
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  Por {workshop.instructor_name}
                </p>
                <p className="text-xs text-[#666666] mt-2">
                  {formattedDate} • {workshop.start_time.substring(0, 5)} - {workshop.end_time.substring(0, 5)}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#FFFFE3]/30">
                <p className="text-base font-bold text-[#333333]">
                  Q{parseFloat(workshop.price).toFixed(2)}
                </p>
                <span className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">
                  {workshop.available_slots} disponibles
                </span>
              </div>
            </div>
          </article>
        </a>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-14">
      <ScrollIndicator />
      <Decoration />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-[400px] md:h-[500px] overflow-hidden  bg-[#FFF3E2]"
          >
            <a href="/workshops" className="absolute top-4 left-4 z-30 flex items-center text-[#333333] hover:text-[#D94F4F] transition-colors gap-2 bg-white/90 px-4 py-2 rounded-full shadow-md">
              <ChevronLeft size={18} />
              <span className="uppercase text-sm tracking-wide font-medium">Volver</span>
            </a>
            
            <div className="w-full h-full relative">
              <OptimizedImage 
                src={workshop.imageUrl} 
                alt={workshop.name} 
                className="w-full h-full object-cover"
              />
              {workshop.discount > 0 && (
                <div className="absolute top-4 right-4 bg-[#D94F4F] text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{workshop.discount}% OFF
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm tracking-widest text-[#666666] uppercase block mb-1"
                >
                  Taller {workshop.modality === 'presencial' ? 'Presencial' : 'Virtual'}
                </motion.span>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl md:text-4xl font-bold text-[#333333]"
                >
                  {workshop.name}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#666666] mt-2"
                >
                  Instructor: <span className="text-[#333333] font-medium">{workshop.instructor}</span>
                </motion.p>
                
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  onClick={() => navigateToCategory(workshop.category_id)}
                  className="text-sm text-[#6B8E23] hover:underline mt-2 inline-flex items-center"
                >
                  <span>Ver más en {workshop.category_name}</span>
                </motion.button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 tracking-wide px-3 py-1 bg-[#6B8E23] w-fit text-white text-sm rounded-full">
                  {workshop.availability}
                </span>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Calendar size={18} className="text-[#D94F4F]" />
                    <span>{getFormattedDate(workshop.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Clock size={18} className="text-[#D94F4F]" />
                    <span>{workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Users size={18} className="text-[#D94F4F]" />
                    <span>Máximo {workshop.capacity} personas</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="py-4 border-t border-b border-[#E5E5E5]"
              >
                {workshop.discount > 0 ? (
                  <div className="flex items-baseline space-x-3">
                    <span className="text-xl text-[#666666] line-through">
                      GTQ {workshop.price.toFixed(2)}
                    </span>
                    <span className="text-3xl font-medium text-[#D94F4F]">
                      GTQ {workshop.discountedPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-[#D94F4F]/20 text-[#D94F4F] text-sm rounded-sm">
                      -{workshop.discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-medium text-[#D94F4F]">
                    GTQ {workshop.price.toFixed(2)}
                  </span>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-lg font-medium text-[#333333] mb-2">Descripción</h3>
                <p className="text-[#666666] leading-relaxed">{workshop.description}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-lg font-medium text-[#333333] mb-2">Incluye</h3>
                <ul className="list-disc pl-5 text-[#666666] space-y-1">
                  {workshop.includes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-4"
              >
                <button
                  onClick={() => addToCart({
                    id: workshop.id,
                    name: workshop.name,
                    price: workshop.discount > 0 ? workshop.discountedPrice : workshop.price,
                    originalPrice: workshop.price,
                    discount: workshop.discount,
                    imageUrl: workshop.imageUrl,
                    type: 'workshop',
                    date: getFormattedDate(workshop.date),
                    time: workshop.time
                  })}
                  disabled={workshop.available_slots < 1 || isAlreadyReserved}
                  className={`w-full py-4 flex items-center justify-center gap-3 text-lg tracking-wide transition-all rounded-lg ${
                    workshop.available_slots < 1 
                      ? "bg-[#E5E5E5] text-[#666666] cursor-not-allowed" 
                      : isAlreadyReserved
                        ? "bg-[#6B8E23] text-white cursor-not-allowed"
                        : "bg-[#D94F4F] text-white hover:bg-[#c04545] shadow-md hover:shadow-lg"
                  }`}
                >
                  <ShoppingBag size={18} />
                  {workshop.available_slots < 1 
                    ? "Agotado" 
                    : isAlreadyReserved 
                      ? "Ya reservado" 
                      : "Reservar mi lugar"}
                </button>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-6 mt-6 border-t border-[#E5E5E5]"
            >
              <p className="text-[#666666] text-sm">
                Ubicación: <span className="text-[#333333]">{workshop.location}</span>
              </p>
              <p className="text-[#666666] text-sm mt-2">
                * El pago reserva tu lugar. Cupos limitados, ¡no te lo pierdas!
              </p>
            </motion.div>
          </motion.div>
        </div>
        
        {relatedWorkshops.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-16 pt-8 border-t border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#333333]">
                <span className="relative">
                  Talleres relacionados
                  <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-[#D94F4F] rounded-full"></span>
                </span>
              </h2>
              <a href="/workshops" className="text-[#6B8E23] hover:text-[#6B8E23]/80 text-sm font-medium transition-colors">
                Ver todos los talleres
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorkshops.map((relatedWorkshop, index) => (
                <WorkshopCard key={relatedWorkshop.id} workshop={relatedWorkshop} index={index} />
              ))}
            </div>
          </motion.section>
        )}
        
        <motion.div 
          className="fixed bottom-5 right-5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="bg-[#333333] text-white rounded-full w-12 h-12 p-3 flex items-center justify-center shadow-lg hover:bg-[#333333]/90 transition-all duration-300 hover:transform hover:translate-y-1"
            aria-label="Volver arriba"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </motion.div>
      </main>
    </div>
  );
}