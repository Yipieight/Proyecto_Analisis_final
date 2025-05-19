import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

const Decoration = () => {
  return (
    <div className="absolute -z-10 inset-0 overflow-hidden opacity-70 pointer-events-none">
      <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#D94F4F]/20 to-transparent blur-3xl" />
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-[#6B8E23]/20 to-transparent blur-3xl" />
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
      <div 
        className="h-full bg-gradient-to-r from-[#6B8E23] via-[#6B8E23]/70 to-[#FAFAFA]" 
        style={{ transform: `scaleX(${scrollProgress})`, transformOrigin: "0%" }}
      />
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
    const img = new Image();
    img.src = src || "/images/default-workshop.jpg";
    img.onload = () => {
      setImgSrc(img.src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setImgSrc("/images/default-workshop.jpg");
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative w-full aspect-[3/4] overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#333333] z-10 w-full h-full">
          <div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader />
          </div>
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

const CategoryButton = ({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 mb-2 w-full text-left flex items-center ${
      isSelected
        ? "bg-[#333333] text-[#FAFAFA] shadow-md"
        : "bg-[#FFFFFE]/90 text-[#333333] hover:bg-[#FFFFFE]"
    }`}
  >
    {isSelected && (
      <span className="w-1 h-5 bg-[#6B8E23] rounded-full mr-2 inline-block"></span>
    )}
    {category.name}
  </button>
);

const WorkshopCard = ({ workshop, workshopImages, index }) => {
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const getFormattedTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div>
      <a href={`/workshopsId/${workshop.id}`} className="block">
        <article className="group relative w-full h-full  overflow-hidden bg-[#FFFFFE] shadow-sm hover:shadow-md transition-all duration-300 border border-[#FFFFE3]/20">
          <div className="relative overflow-hidden bg-[#333333]">
            <OptimizedImage
              src={
                workshopImages[workshop.name] || 
                "/images/default-workshop.jpg"
              }
              alt={workshop.name}
              className="group-hover:scale-110 transition-transform duration-700"
            />
            
            <div className="absolute top-3 right-3">
              <div 
                className="bg-[#333333] text-[#FAFAFA] px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm"
              >
                <span className="font-medium">
                  {workshop.modality === 'presencial' ? 'PRESENCIAL' : 'VIRTUAL'}
                </span>
              </div>
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
                {getFormattedDate(workshop.date)} • {getFormattedTime(workshop.start_time)} - {getFormattedTime(workshop.end_time)}
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#FFFFE3]/30">
              <p className="text-base font-bold text-[#333333]">
                Q{workshop.price.toFixed(2)}
              </p>
              <span className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">
                {workshop.available_slots} disponibles
              </span>
            </div>
          </div>
        </article>
      </a>
    </div>
  );
};

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("todo");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  const workshopImages = {
    "Sabores de Italia": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuMuhOjpzB02MisAEvYjHQhPGucaFX54CJrUOn",
    "Pastelería Francesa": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu7htBM8RilvS4mGda0BVPYjrps1H5Lf6DObNF",
    "Comida Saludable para la Semana": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuBHsdxLPb6lrQWNcyYFdnfEzkeVHJXgoMawmD",
    "Cocina Vegetariana Creativa": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibutFnAGpualz2QAIYZWuOfsk5nxJDdbcVy1pe4",
    "Introducción a la Cocina Molecular": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibutHioByualz2QAIYZWuOfsk5nxJDdbcVy1pe4",
    "Cocina Primaveral": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibumctXQLNrPvHGd1j2UM5sACiWEgXI6atVnYyz",
    "Primeros Pasos en la Cocina": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuuXdUT8fyXR7wfFas8jC0PIStrJ3dMb4ZeBKD",
    "Cocineros Junior": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuInmtowlAyO8kqw0XmJiTH3EQFBVbCG4o2UaS",
    "Cocina Asiática": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuEbSDr1NQ3G5DiXUHsPJjl4xCBKmyotakWeFZ",
    "Decoración de Cupcakes": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu6VjN9FHvu4jTO7gzRm3dXnqYyJGwxA5VLMkc",
    "Bowls Saludables": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuabLKK2ABUdWKHfOIM621lGQbSXNs5CArhFxz",
    "Proteínas Vegetales": "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu5F9013ZRtlECNGU1HWj4bcvBhzO65xgwroMF"
  };
  

  useEffect(() => {
    const storedCategory = localStorage.getItem('selectedCategory');
    if (storedCategory) {
      setSelectedCategory(storedCategory);
      localStorage.removeItem('selectedCategory');
    }
  }, []);

  useEffect(() => {
    async function fetchWorkshops() {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5002/api/workshops');
        const data = await response.json();
        setWorkshops(data.workshops || []);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkshops();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
  try {
    const response = await fetch('http://localhost:5002/api/workshop-categories');
    const data = await response.json();
    
    const apiCategories = data.categories.map((categoryName, index) => ({
      id: String(index + 1), 
      name: categoryName,
    }));

    const allCategories = [
      { id: "todo", name: "Todos", description: "Todos los talleres disponibles" },
      ...apiCategories 
    ];
    
    setCategories(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    setCategories([{ id: "todo", name: "Todos", description: "Todos los talleres disponibles" }]);
  }
}

    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = [...workshops];
    
    if (selectedCategory.toLowerCase() !== "todo") {
      const categoryId = parseInt(selectedCategory);
      filtered = filtered.filter(workshop => workshop.category_id === categoryId);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(workshop => {
        const name = workshop.name?.toLowerCase() || "";
        const instructor = workshop.instructor_name?.toLowerCase() || "";
        const category = workshop.category_name?.toLowerCase() || "";
        return name.includes(query) || instructor.includes(query) || category.includes(query);
      });
    }
    
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break;
    }
    
    setFilteredWorkshops(filtered);
  }, [selectedCategory, workshops, searchQuery, sortBy]);

  const sortOptions = [
    { label: "Predeterminado", value: "default" },
    { label: "Precio: Menor a Mayor", value: "price-asc" },
    { label: "Precio: Mayor a Menor", value: "price-desc" },
    { label: "Fecha: Más cercana", value: "date-asc" },
    { label: "Fecha: Más lejana", value: "date-desc" },
  ];

  return (
    <>
      <ScrollIndicator />
      <div className="relative py-8 min-h-screen overflow-hidden bg-[#FAFAFA]">
        <Decoration />
        <main className="container mx-auto px-4 relative">
          <header 
            className="w-full mt-20 md:mt-24 border-b border-b-[#666666]/20 pb-8 overflow-hidden"
          >
            <div className="relative">
              <div className="mb-2">
                <span className="text-lg tracking-wide text-[#6B8E23] inline-block relative font-medium">
                  EXPLORA
                  <span 
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6B8E23]" 
                  />
                </span>
              </div>
              
              <h1
                className="text-[#333333] text-4xl md:text-5xl uppercase font-bold tracking-tight"
              >
                <span className="mr-3">Nuestros</span>
                <span className="relative inline-block">
                  Talleres
                  <span className="absolute -top-1 -right-6 w-4 h-4 bg-[#D94F4F] rounded-full" />
                </span>
              </h1>
            </div>
          </header>

          <section className="w-full pt-8 flex flex-col md:flex-row gap-8">
            <div
              className="w-full md:w-64 space-y-6 md:sticky md:top-24 md:self-start"
            >
              <div className="mb-6">
                <label className="block text-xs text-[#666666] mb-2 uppercase tracking-wider">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar talleres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-4 bg-[#FFFFFE] text-[#333333] rounded-lg border border-[#FFFFE3]/50 focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23]/50 transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs text-[#666666] mb-2 uppercase tracking-wider">Ordenar por</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-[#FFFFFE] text-[#333333] rounded-lg border border-[#FFFFE3]/50 focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23]/50 transition-all duration-300"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-[#333333] text-lg mb-4 flex tracking-wider uppercase items-center font-medium">
                  <span className="w-1 h-5 bg-[#D94F4F] rounded-full mr-2 inline-block"></span>
                  Categorías
                </h4>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category) => (
                    <CategoryButton
                      key={category.id}
                      category={category}
                      isSelected={selectedCategory === String(category.id)}
                      onClick={() => setSelectedCategory(String(category.id))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div 
                className="w-full flex items-center justify-between bg-[#FFFFFE]/80 backdrop-blur-sm p-4 rounded-lg border border-[#FFFFE3]/50 mb-8"
              >
                <div className="bg-[#F5F5F5] px-3 py-1 rounded-full border border-[#FFFFE3]/30">
                  <small className="text-sm text-[#333333] font-light tracking-wider uppercase whitespace-nowrap">
                    {filteredWorkshops.length}{" "}
                    {filteredWorkshops.length === 1 ? "TALLER" : "TALLERES"}
                  </small>
                </div>
                
                {selectedCategory !== "todo" && (
                  <div className="text-[#666666] text-sm">
                    Categoría: <span className="font-medium text-[#6B8E23]">
                      {categories.find(c => String(c.id) === selectedCategory)?.name || ""}
                    </span>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-6">
                    <Loader />
                    <p className="text-[#666666]">Cargando talleres...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
                    {filteredWorkshops.length > 0 ? (
                      filteredWorkshops.map((workshop, index) => (
                        <WorkshopCard 
                          key={workshop.id} 
                          workshop={workshop} 
                          workshopImages={workshopImages}
                          index={index}
                        />
                      ))
                    ) : (
                      <div 
                        className="col-span-full h-48 flex items-center justify-center text-center"
                      >
                        <div className="bg-[#FFFFFE] backdrop-blur-md rounded-lg border border-[#FFFFE3]/50 p-8 w-full max-w-md">
                          <h3 className="text-xl text-[#333333] mb-2">Sin resultados</h3>
                          <p className="text-[#666666] mb-4">No se encontraron talleres con los filtros seleccionados</p>
                          <button
                            onClick={() => {
                              setSelectedCategory("todo");
                              setSearchQuery("");
                              setSortBy("default");
                            }}
                            className="px-4 py-2 bg-[#D94F4F] text-white rounded-full hover:bg-[#D94F4F]/90 transition-colors"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
      
      <div 
        className="fixed bottom-5 right-5"
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
      </div>
    </>
  );
}