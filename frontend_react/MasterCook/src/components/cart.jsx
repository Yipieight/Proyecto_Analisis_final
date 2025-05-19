import { useState, useEffect } from 'react';
import { ShoppingBag, Trash, X, ArrowRight, LogIn } from 'lucide-react';

export default function Cart({ isOpen, setIsOpen }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCart();
      checkAuthentication();
    }
  }, [isOpen]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('salsasCart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotals(parsedCart);
    }
  };

  const checkAuthentication = () => {
    const cookies = document.cookie.split(';');
    const authToken = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    setIsAuthenticated(!!authToken);
  };

  const calculateTotals = (items) => {
    const itemCount = items.length;
    const price = items.reduce((sum, item) => sum + item.price, 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
    localStorage.setItem('salsasCart', JSON.stringify(updatedCart));
  };

  const removeAllItems = () => {
  setCartItems([]);
  setTotalItems(0);
  setTotalPrice(0);
  localStorage.removeItem('salsasCart');
};


  const closeCart = () => {
    setIsOpen(false);
  };

  const handleCheckoutClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.location.href = `/login?redirect=${encodeURIComponent('/checkout')}`;
    } else {
      closeCart();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={closeCart}
        style={{
          animation: 'fadeIn 0.3s ease-out forwards'
        }}
      />
      
      <div 
        className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-[#FAFAFA] shadow-xl overflow-hidden flex flex-col"
        style={{
          animation: 'slideIn 0.3s ease-out forwards'
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="border-b border-[#E5E5E5] p-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-[#333333] m-0">Tu Carrito</h2>
              <span className="ml-2 text-sm bg-[#D94F4F] text-white px-2 py-0.5 rounded-full w-7 h-7 flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <button 
              onClick={closeCart}
              className="rounded-full hover:bg-[#FFF3E2] p-2 transition-colors"
            >
              <X className="w-5 h-5 text-[#333333]" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFF3E2] flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-[#D94F4F]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Tu carrito está vacío</h3>
              <p className="text-[#666666] max-w-xs">Reserva un taller de cocina y vuelve aquí para completar tu compra.</p>
              <a
                href="/talleres"
                onClick={closeCart}
                className="block py-2 mt-6 bg-[#D94F4F] text-white hover:bg-[#c04545] font-medium rounded-lg px-6 shadow-md transition-all"
              >
                Explorar talleres
              </a>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group  bg-white p-4 border border-[#E5E5E5] hover:border-[#D94F4F] hover:shadow-md transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.3s ease-out forwards ${index * 0.1}s`
                  }}
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative overflow-hidden  aspect-square h-20 w-20 bg-[#FFF3E2]">
                      <img
                        src={item.imageUrl || "/images/placeholder.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {item.discount && item.discount !== 0 && (
                        <div className="absolute top-0 right-0 bg-[#D94F4F] text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-md">
                          -{item.discount}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-[#333333]">{item.name.length > 24 ? item.name.slice(0, 22) + "..." : item.name}</h3>
                          <p className="text-xs text-[#666666]">{item.date} - {item.time}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-full hover:bg-[#FFF3E2] text-[#666666] hover:text-[#D94F4F] -mt-1 -mr-1 h-8 w-8 flex items-center justify-center"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-end">
                        <div className="text-right">
                          {item.discount && item.discount !== 0 ? (
                            <>
                              <span className="text-xs line-through text-[#666666]">
                                GTQ {item.originalPrice.toFixed(2)}
                              </span>
                              <span className="block text-[#D94F4F] font-medium">
                                GTQ {item.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#D94F4F] font-medium">
                              GTQ {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="border-t border-[#E5E5E5] pt-4 pb-6 px-4">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center text-sm text-[#666666] mb-2">
                    <span>Subtotal</span>
                    <span>GTQ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[#666666] mb-2">
                    <span>Impuestos</span>
                    <span>Incluidos</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#333333]">Total</span>
                    <span className="font-bold text-xl text-[#D94F4F]">
                      GTQ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FFF3E2] text-[#D94F4F] rounded-lg text-sm">
                      Para finalizar tu compra, debes iniciar sesión como miembro de MasterCook Academy.
                    </div>
                    <a 
                      href="/login?redirect=/checkout"
                      className="block w-full bg-[#D94F4F] hover:bg-[#c04545] text-white font-bold py-3 rounded-lg transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-md"
                    >
                      Iniciar sesión
                      <LogIn className="w-5 h-5" />
                    </a>
                  </div>
                ) : (
                  <a 
                    href="/checkout"
                    onClick={handleCheckoutClick}
                    className="block w-full bg-[#D94F4F] hover:bg-[#c04545] text-white font-bold py-3 rounded-lg transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-md"
                  >
                    Finalizar compra
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}