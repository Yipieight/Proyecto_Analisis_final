import { useState, useEffect } from 'react';

const categoryMappings = {
  "COCINA INTERNACIONAL": 1,
  "REPOSTERÍA CREATIVA": 2,
  "COCINA SALUDABLE": 3,
  "COCINA VEGETARIANA": 4,
  "COCINA MOLECULAR": 5,
  "COCINA DE TEMPORADA": 6,
  "COCINA DE PRINCIPIANTES": 7,
  "COCINA PARA NIÑOS": 8
};

const categories = [
  {
    id: 1,
    title: "COCINA INTERNACIONAL",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuGp1bZAdST36YIKb4wOqk5Bh18de9pVNuzLxm", 
    dataZoom: "livraison"
  },
  {
    id: 2,
    title: "REPOSTERÍA CREATIVA",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuGpftzbdST36YIKb4wOqk5Bh18de9pVNuzLxm", 
    dataZoom: "emporter"
  },
  {
    id: 3,
    title: "COCINA SALUDABLE",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuhb7Putj3e1J6DSgYMyaCiBw5LslkPtv9brEj", 
    dataZoom: "surplace"
  },
  {
    id: 4,
    title: "COCINA VEGETARIANA",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibu0dMKe8sc6uyP5nLA7TKRrHzZ4CiFfwdqSeGV", 
    dataZoom: "shop"
  },
  {
    id: 5,
    title: "COCINA MOLECULAR",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuOGY0Shx71g7WHn3LiTroDRy6zBQO80cAsCxk", 
    dataZoom: "pizza"
  },
  {
    id: 6,
    title: "COCINA DE TEMPORADA",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibufqztBjU8QwLP1DhIBuKNojVamz5qcldgyxA7", 
    dataZoom: "pasta"
  },
  {
    id: 7,
    title: "COCINA DE PRINCIPIANTES",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuOGFIWwH71g7WHn3LiTroDRy6zBQO80cAsCxk", 
    dataZoom: "salad"
  },
  {
    id: 8,
    title: "COCINA PARA NIÑOS",
    imageUrl: "https://hd51x5cptm.ufs.sh/f/lhdSxG5nEibuKXQbKrlYgniuMETeVqQIDa4XrF5fP7sWRB2w", 
    dataZoom: "dessert"
  }
];

export default function Categories() {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 4;
  
  useEffect(() => {
    setTotalPages(Math.ceil(categories.length / itemsPerPage));
  }, []);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(0);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(totalPages - 1);
    }
  };
  
  // Navegar a la página de workshops con el ID de categoría
  const navigateToWorkshops = (categoryId) => {
    // Navegación simple con JavaScript, pero con un estado para mantener la categoría
    localStorage.setItem('selectedCategory', categoryId);
    window.location.href = `/workshops`;
  };
  
  const startIndex = currentPage * itemsPerPage;
  const visibleCategories = categories.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <section className="relative flex flex-col font-medium text-main-text">
      <div className='p-8'>
        <h1 className='text-4xl'>Categorías</h1>
      </div>
      <div className="grid grid-cols-4 gap-0">
        {visibleCategories.map((category) => (
          <div key={category.id} className="relative outline outline-2 outline-primary">
            <div className="relative" data-zoom={category.dataZoom}>
              <div className="title-container"
                  onMouseEnter={(e) => {
                    const imgElement = e.currentTarget.parentElement.querySelector('img');
                    if (imgElement) imgElement.classList.add('scale-105');
                  }}
                  onMouseLeave={(e) => {
                    const imgElement = e.currentTarget.parentElement.querySelector('img');
                    if (imgElement) imgElement.classList.remove('scale-105');
                  }}
              >
                <div 
                  onClick={() => navigateToWorkshops(categoryMappings[category.title])}
                  className="block cursor-pointer"
                >
                  <div className="flex justify-between items-center p-4 lg:p-6 font-bold text-2xl lg:text-3xl bg-[#e58c8c] text-secondary hover:bg-secondary hover:text-[#df6f6f] border-b-2 border-primary transition-colors duration-200">
                    <h2>{category.title}</h2>
                    <div className="w-6 h-6">
                      <svg width="100%" height="100%" viewBox="0 0 17 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.1836 26.0662C6.32574 20.7266 11.2081 16.5218 16.4082 13.2568C11.1598 10.0406 6.48457 5.68956 3.19051 0.447478L0.0552734 0.447478C3.34243 5.52248 7.30636 9.93614 12.1957 13.2568C7.29945 16.6262 3.1836 21.0886 2.47955e-05 26.0662L3.1905 26.0662L3.1836 26.0662Z" fill="currentColor"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="h-[25rem] overflow-hidden cursor-pointer" 
                onClick={() => navigateToWorkshops(categoryMappings[category.title])}
              >
                <img 
                  src={category.imageUrl} 
                  alt={`Categoría ${category.title}`} 
                  className="w-full h-full object-cover transition-transform duration-[350ms] pointer-events-none" 
                  data-zoom={category.dataZoom}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-4">
        <button 
          onClick={prevPage} 
          className="p-3 rounded-full bg-primary text-secondary"
          aria-label="Página anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextPage} 
          className="p-3 rounded-full bg-primary text-secondary"
          aria-label="Página siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center items-center h-10 bg-light-background">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`h-3 w-3 mx-1 rounded-full ${currentPage === index ? 'bg-accent' : 'bg-gray-400'}`}
            aria-label={`Ir a página ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}