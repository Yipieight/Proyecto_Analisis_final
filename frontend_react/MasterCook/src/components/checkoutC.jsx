import { useState, useEffect } from 'react';
import Cart from './cart';
import { ChevronLeft, CreditCard, Calendar, Clock, User, ShoppingBag, Check, ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function CheckoutC() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [paymentMethod, setPaymentMethod] = useState('Débito');
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [reservationId, setReservationId] = useState(null);
  const [existingReservations, setExistingReservations] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    loadCart();
    getAuthTokenFromCookies();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (step === 3) {
      window.scrollTo(0, 0);
    }
  }, [step]);

  useEffect(() => {
    if (authToken) {
      fetchExistingReservations();
    }
  }, [authToken]);

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    
    if (authCookie) {
      const token = authCookie.trim().substring('auth_token='.length);
      setAuthToken(token);
    } else {
      console.error('Auth token not found in cookies');
      setErrors({
        ...errors,
        auth: 'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.'
      });
    }
  };

  const fetchExistingReservations = async () => {
    try {
      const reservationsResponse = await fetch('http://localhost:5003/api/reservations', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
      });
      
      if (!reservationsResponse.ok) {
        if (reservationsResponse.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error al cargar las reservas: ${reservationsResponse.status}`);
      }
      
      const reservationsData = await reservationsResponse.json();
      setExistingReservations(reservationsData.reservations || []);
    } catch (error) {
      console.error('Error al cargar reservaciones existentes:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('salsasCart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal(parsedCart);
    }
  };

  const calculateTotal = (items) => {
    const price = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setTotalPrice(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentError(null); 
    
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted.substring(0, 19) });
    } 
    else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 2) {
        setFormData({ ...formData, [name]: cleaned });
      } else {
        setFormData({ ...formData, [name]: `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}` });
      }
    } 
    else if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: cleaned.substring(0, 4) });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateContactInfo = () => {
    const newErrors = {};
    
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un email válido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Por favor, ingresa un teléfono de contacto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Por favor, ingresa el nombre del titular';
    }
    
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Por favor, ingresa un número de tarjeta válido';
    }
    
    if (!formData.expiryDate.trim() || !formData.expiryDate.includes('/')) {
      newErrors.expiryDate = 'Formato inválido (MM/YY)';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; 
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'La tarjeta ha expirado';
      }
    }
    
    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateContactInfo()) {
        setStep(2);
        window.scrollTo(0, 0);
      }
    } else if (step === 2) {
      const contactInfoValid = validateContactInfo();
      const paymentFormValid = validatePaymentForm();
      
      if (contactInfoValid && paymentFormValid) {
        if (reservationId) {
          processPaymentOnly();
        } else {
          createReservationAndProcessPayment();
        }
      }
    }
  };

  const clearCart = () => {
    localStorage.removeItem('salsasCart');
    setCartItems([]);
    setTotalPrice(0);
  };

  const checkExistingReservation = () => {
    const workshopId = cartItems[0]?.id;
    if (!workshopId) return null;
    
    const existingReservation = existingReservations.find(
      res => res.workshop_id === workshopId && !res.payment_completed
    );
    
    return existingReservation?.id || null;
  };

  const createReservationAndProcessPayment = async () => {
    setIsLoading(true);
    setPaymentError(null);

    if (!authToken) {
      setErrors({
        ...errors,
        auth: 'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.'
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const workshopId = cartItems[0]?.id; 
      
      if (!workshopId) {
        throw new Error('No workshop selected');
      }
      
      const existingReservationId = checkExistingReservation();
      
      if (existingReservationId) {
        console.log('Usando reserva existente con ID:', existingReservationId);
        setReservationId(existingReservationId);
        await processPayment(existingReservationId);
        return;
      }
      
      console.log('Enviando solicitud de reserva con workshop_ids:', [workshopId]);
      
      const reservationResponse = await fetch('http://localhost:5003/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          workshop_ids: [workshopId]
        }),
      });
      
      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        console.error('Error de respuesta:', errorData);
        throw new Error(`Error al crear la reserva: ${errorData.error || 'Error desconocido'}`);
      }
      
      const reservationData = await reservationResponse.json();
      console.log('Respuesta de reserva:', reservationData);
      
      let createdReservationId;
      if (reservationData.reservations && reservationData.reservations.length > 0) {
        createdReservationId = reservationData.reservations[0].id;
      } else if (reservationData.reservation) {
        createdReservationId = reservationData.reservation.id;
      } else {
        throw new Error('No se pudo obtener el ID de reserva de la respuesta');
      }
      
      setReservationId(createdReservationId);
      
      await processPayment(createdReservationId);
      
    } catch (error) {
      console.error('Error en el proceso de reserva:', error);
      setErrors({
        ...errors,
        payment: `Error: ${error.message}`
      });
      setIsLoading(false);
    }
  };

  const processPaymentOnly = async () => {
    setIsLoading(true);
    setPaymentError(null);
    
    try {
      await processPayment(reservationId);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setErrors({
        ...errors,
        payment: `Error: ${error.message}`
      });
      setIsLoading(false);
    }
  };

  const processPayment = async (reservationId) => {
    try {
      const card = formData.cardNumber.replace(/\s/g, '');
      const cvc = formData.cvv;
      const expiryParts = formData.expiryDate.split('/');
      const expiryMonth = expiryParts[0];
      const expiryYear = expiryParts.length > 1 ? `20${expiryParts[1]}` : ''; 
      console.log('Procesando pago para reserva:', reservationId);

      const paymentResponse = await fetch('http://localhost:5004/api/payments/verify-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          card_number: card, 
          exp_month: expiryMonth,
          exp_year: expiryYear,
          cvc: cvc,
          reservation_ids: [reservationId] 
        }),
      });
      
      const paymentData = await paymentResponse.json();
      console.log('Respuesta de pago:', paymentData);
      
      if (!paymentResponse.ok || paymentData.is_valid === false) {
        setPaymentError(paymentData.message || 'Error al procesar el pago');
        throw new Error(paymentData.error || 'Error al procesar el pago');
      }
      
      setPaymentStatus(paymentData.status || 'Procesado');
      
      clearCart();
      setStep(3);
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const formatCreditCard = (cardNumber) => {
    if (!cardNumber) return '';
    
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const Decoration = () => {
    return (
      <div className="absolute -z-10 inset-0 overflow-hidden opacity-70 pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#D94F4F]/20 to-transparent blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-[#6B8E23]/20 to-transparent blur-3xl" />
      </div>
    );
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Resumen de compra';
      case 2: return 'Información de pago';
      case 3: return 'Confirmación de compra';
      default: return 'Checkout';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      <Decoration />
      
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <a 
            href={step === 1 ? "/workshops" : "#"} 
            onClick={(e) => {
              if (step !== 1) {
                e.preventDefault();
                setStep(step - 1);
              }
            }}
            className="text-[#333333] hover:text-[#D94F4F] transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">{step === 1 ? 'Continuar comprando' : 'Volver'}</span>
          </a>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[#D94F4F]' : 'bg-[#E5E5E5]'}`}></span>
            <span className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#D94F4F]' : 'bg-[#E5E5E5]'}`}></span>
            <span className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-[#D94F4F]' : 'bg-[#E5E5E5]'}`}></span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-[#333333] mb-8">{getStepTitle()}</h1>
        
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white  border border-[#E5E5E5] p-6">
                <h2 className="text-xl font-medium text-[#333333] mb-4">Talleres seleccionados</h2>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto text-[#E5E5E5] mb-4" />
                    <p className="text-[#666666]">No hay talleres en tu carrito</p>
                    <a href="/workshops" className="mt-4 inline-block text-[#D94F4F] hover:underline">
                      Explorar talleres disponibles
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4 border-b border-[#E5E5E5] last:border-b-0">
                        <div className="h-24 w-24 bg-[#F5F5F5] overflow-hidden">
                          <img 
                            src={item.imageUrl || "/api/placeholder/100/100"} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#333333]">{item.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#666666]">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-[#D94F4F]" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-[#D94F4F]" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-[#D94F4F]">
                            GTQ {parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-white  border border-[#E5E5E5] p-6">
                <h2 className="text-xl font-medium text-[#333333] mb-4">Información de contacto</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#666666] mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F4F]/50`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#666666] mb-1">
                      Teléfono de contacto
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F4F]/50`}
                      placeholder="(+502) 1234-5678"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E5E5E5] p-6 sticky top-24">
                <h2 className="text-xl font-medium text-[#333333] mb-4">Resumen</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Subtotal</span>
                    <span className="font-medium">GTQ {totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Impuestos</span>
                    <span className="text-[#666666]">Incluidos</span>
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] my-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#333333]">Total</span>
                      <span className="font-bold text-xl text-[#D94F4F]">GTQ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextStep}
                    disabled={cartItems.length === 0}
                    className={`w-full mt-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                      cartItems.length === 0
                        ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
                        : "bg-[#D94F4F] text-white hover:bg-[#c04545] shadow-md"
                    }`}
                  >
                    Continuar al pago
                    <ArrowRight size={18} />
                  </button>
                    
                  {(errors.email || errors.phone) && (
                    <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      Por favor completa todos los campos requeridos.
                    </div>
                  )}
                  
                  {errors.payment && (
                    <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {errors.payment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#E5E5E5] p-6">
                <h2 className="text-xl font-medium text-[#333333] mb-4">Método de pago</h2>
                
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Error de pago</p>
                      <p className="text-sm text-red-600">{paymentError}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => handlePaymentMethodChange('Débito')}
                    className={`flex-1 min-w-[120px] p-3 rounded-lg border ${
                      paymentMethod === 'Débito'
                        ? 'border-[#D94F4F] bg-[#FFF3E2] text-[#D94F4F]'
                        : 'border-[#E5E5E5] text-[#666666]'
                    } transition-all flex items-center justify-center gap-2`}
                  >
                    <CreditCard size={18} />
                    <span>Débito</span>
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethodChange('Crédito')}
                    className={`flex-1 min-w-[120px] p-3 rounded-lg border ${
                      paymentMethod === 'Crédito'
                        ? 'border-[#D94F4F] bg-[#FFF3E2] text-[#D94F4F]'
                        : 'border-[#E5E5E5] text-[#666666]'
                    } transition-all flex items-center justify-center gap-2`}
                  >
                    <CreditCard size={18} />
                    <span>Crédito</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-[#666666] mb-1">
                      Nombre del titular
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.cardHolder ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F4F]/50`}
                      placeholder="Nombre como aparece en la tarjeta"
                    />
                    {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-[#666666] mb-1">
                      Número de tarjeta
                    </label>
                    <div className={`flex items-center w-full p-3 border ${errors.cardNumber ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus-within:ring-2 focus-within:ring-[#D94F4F]/50`}>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="flex-1 focus:outline-none"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      <CreditCard size={18} className="text-[#666666]" />
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-[#666666] mb-1">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full p-3 border ${errors.expiryDate ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F4F]/50`}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-[#666666] mb-1">
                        CVV/CVC
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full p-3 border ${errors.cvv ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F4F]/50`}
                        placeholder="123"
                        maxLength="4"
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E5E5E5] p-6 sticky top-24">
                <h2 className="text-xl font-medium text-[#333333] mb-4">Resumen</h2>
                
                <div className="space-y-4">
                  {cartItems.length > 0 && (
                    <div className="text-sm text-[#666666]">
                      <p>
                        {cartItems.length} {cartItems.length === 1 ? 'taller' : 'talleres'} seleccionados
                      </p>
                      <p className="font-medium text-[#333333] line-clamp-1 mt-1">
                        {cartItems[0]?.name}
                        {cartItems.length > 1 && ` y ${cartItems.length - 1} más`}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Subtotal</span>
                    <span className="font-medium">GTQ {totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Impuestos</span>
                    <span className="text-[#666666]">Incluidos</span>
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] my-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#333333]">Total</span>
                      <span className="font-bold text-xl text-[#D94F4F]">GTQ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-[#666666] gap-2 py-2">
                    <Lock size={14} />
                    <span>Pago seguro. Tus datos están protegidos.</span>
                  </div>
                  
                  <button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className={`w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                      isLoading
                        ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
                        : "bg-[#D94F4F] text-white hover:bg-[#c04545] shadow-md"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Realizar pago</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  
                  {errors.payment && (
                    <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {errors.payment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-[#6B8E23]/20 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-[#6B8E23]" />
              </div>
              
              <h2 className="text-2xl font-bold text-[#333333] mb-2">¡Pago completado con éxito!</h2>
              <p className="text-[#666666] mb-6">
                Tu reservación para el taller ha sido confirmada. Hemos enviado los detalles a tu correo electrónico.
              </p>
              
              <div className="bg-[#F5F5F5] rounded-lg p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-[#666666]">Número de reservación:</p>
                    <p className="font-medium text-[#333333]">#{reservationId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#666666]">Estado:</p>
                    <p className="font-medium text-[#333333]">Confirmada</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#666666]">Fecha:</p>
                    <p className="font-medium text-[#333333]">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#666666]">Método de pago:</p>
                    <p className="font-medium text-[#333333]">{paymentMethod}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#666666]">Número de tarjeta:</p>
                    <p className="font-medium text-[#333333]">{formatCreditCard(formData.cardNumber)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="px-6 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-[#333333] hover:bg-[#F5F5F5] transition-colors"
                >
                  Volver al inicio
                </a>
                <a
                  href="/workshops"
                  className="px-6 py-3 bg-[#D94F4F] text-white rounded-lg hover:bg-[#c04545] transition-colors"
                >
                  Explorar más talleres
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}