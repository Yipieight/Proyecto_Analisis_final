import { useState, useEffect } from 'react';

export default function Workshops({ initialCategory = "todo" }) {
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch workshops
  useEffect(() => {
    async function fetchWorkshops() {
      setIsLoading(true);
      try {
        // Replace with your actual workshop data API endpoint
        const response = await fetch('/api/workshops');
        const data = await response.json();
        setWorkshops(data);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkshops();
  }, []);

  // Filter workshops based on selected category
  useEffect(() => {
    if (selectedCategory.toLowerCase() === "todo") {
      setFilteredWorkshops(workshops);
    } else {
      setFilteredWorkshops(
        workshops.filter(
          (workshop) => workshop.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  }, [selectedCategory, workshops]);

  // Categorías estáticas (puedes reemplazar esto con una llamada a la API más adelante)
  const categories = [
    { id: "todo", name: "Todos" },
    { id: "panaderia", name: "Panadería" },
    { id: "pasteleria", name: "Pastelería" },
    { id: "cocina", name: "Cocina" }
  ];

  return (
    <section className="w-full h-full mt-20 pb-24 px-6">
      <div className="w-full">
        {/* Navegación de categorías simplificada */}
        <div className="w-full overflow-x-auto">
          <div className="inline-flex space-x-4 py-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Workshops */}
        <div className="mt-8">
          <h3 className="text-2xl font-normal tracking-tight mb-4">
            Talleres
          </h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando talleres...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWorkshops.length > 0 ? (
                filteredWorkshops.map((workshop) => (
                  <a key={workshop.id} href={`/taller/${workshop.id}`} className="block">
                    <article>
                      <div className="w-full relative">
                        <div className="aspect-[3/4]">
                          <img
                            src={workshop.image}
                            alt={workshop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="px-2 py-4">
                        <h4 className="text-base leading-4 tracking-tight font-normal">
                          {workshop.title}
                        </h4>
                        <p className="text-sm font-bold text-black/70">
                          GTQ{workshop.price}
                        </p>
                      </div>
                    </article>
                  </a>
                ))
              ) : (
                <p>No hay talleres disponibles para esta categoría.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-5 right-5">
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="bg-black text-white rounded-full p-3"
          aria-label="Volver arriba"
        >
          ↑
        </button>
      </div>
    </section>
  );
}