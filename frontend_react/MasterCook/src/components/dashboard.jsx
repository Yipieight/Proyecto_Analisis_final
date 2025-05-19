import { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Search, ChevronDown, ChevronUp, X, Tag, AlertTriangle } from 'lucide-react';

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

const Dashboard = () => {
    const [authToken, setAuthToken] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [workshops, setWorkshops] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [cancelingReservation, setCancelingReservation] = useState(null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        getAuthTokenFromCookies();
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (authToken) {
            verifyAuthToken();
        } else {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const getAuthTokenFromCookies = () => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        
        if (authCookie) {
            const token = authCookie.trim().substring('auth_token='.length);
            setAuthToken(token);
        } else {
            console.log('No se encontró token de autenticación en cookies');
            setLoading(false);
        }
    };

    const verifyAuthToken = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                setIsAuthenticated(true);
                fetchReservations();
            } else {
                console.error('Token inválido o expirado');
                removeAuthTokenCookie();
                setAuthToken(null);
                setIsAuthenticated(false);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error al verificar el token:', err);
            setError('Error al verificar la autenticación');
            setLoading(false);
        }
    };

    const removeAuthTokenCookie = () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    const fetchReservations = async () => {
        if (!authToken) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const reservationsResponse = await fetch('http://localhost:5003/api/reservations', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
            });
            
            if (!reservationsResponse.ok) {
                if (reservationsResponse.status === 401) {
                    removeAuthTokenCookie();
                    setAuthToken(null);
                    setIsAuthenticated(false);
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
                throw new Error(`Error al cargar las reservas: ${reservationsResponse.status}`);
            }
            
            const reservationsData = await reservationsResponse.json();
            let userReservations = reservationsData.reservations || [];
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const updatedReservations = userReservations.map(reservation => {
                const workshopDate = new Date(reservation.workshop_date);
                workshopDate.setHours(0, 0, 0, 0);
                
                if (workshopDate < today && 
                    reservation.status === 'Confirmada') {
                    return { ...reservation, status: 'Completada' };
                }
                return reservation;
            });
            
            const reservationsToUpdate = updatedReservations.filter((reservation, index) => 
                reservation.status === 'Completada' && userReservations[index].status !== 'Completada'
            );
            
            await Promise.all(reservationsToUpdate.map(reservation => 
                updateReservationStatus(reservation.id, 'Completada', false)
            ));
            
            const workshopIds = [...new Set(updatedReservations.map(res => res.workshop_id))];
            
            const workshopPromises = workshopIds.map(id => 
                fetch(`http://localhost:5002/api/workshops/${id}`)
                    .then(res => res.ok ? res.json() : { workshop: null })
                    .then(data => [id, data.workshop])
                    .catch(err => {
                        console.error(`Error fetching workshop ${id}:`, err);
                        return [id, null];
                    })
            );
            
            const workshopsResults = await Promise.all(workshopPromises);
            
            const workshopData = Object.fromEntries(workshopsResults.filter(item => item[1] !== null));
            
            if (reservationsToUpdate.length > 0) {
                userReservations = updatedReservations;
            }
            
            setReservations(userReservations);
            setWorkshops(workshopData);
            setLoading(false);
        } catch (err) {
            console.error('Error in fetchReservations:', err);
            setError(err.message || 'Error al cargar las reservas');
            setLoading(false);
        }
    };

    const updateReservationStatus = async (reservationId, newStatus, showFeedback = true) => {
        try {
            const response = await fetch(`http://localhost:5003/api/reservations/${reservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar la reserva: ${response.status}`);
            }

            setReservations(prev => 
                prev.map(res => 
                    res.id === reservationId 
                    ? { ...res, status: newStatus }
                    : res
                )
            );

            if (selectedReservation && selectedReservation.id === reservationId) {
                setSelectedReservation(prev => ({ ...prev, status: newStatus }));
            }

            if (showFeedback) {
                const statusMessages = {
                    'Cancelada': 'Reserva cancelada exitosamente',
                    'Confirmada': 'Reserva confirmada exitosamente',
                    'Completada': 'Reserva marcada como completada'
                };
                
                setSuccessMessage(statusMessages[newStatus] || 'Estado de reserva actualizado');
            }

            return true;
        } catch (err) {
            console.error('Error updating reservation status:', err);
            setError(`Error al ${newStatus === 'Cancelada' ? 'cancelar' : 'actualizar'} la reserva. Por favor, inténtalo de nuevo.`);
            return false;
        }
    };

    const cancelReservation = async () => {
        if (!cancelingReservation) return;
        
        setIsCanceling(true);
        const success = await updateReservationStatus(cancelingReservation.id, 'Cancelada');
        setIsCanceling(false);
        
        if (success) {
            setCancelingReservation(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    };

    const formatTime = (timeString) => {
        return timeString;
    };

    const filteredReservations = reservations.filter(reservation => {
        const matchesSearch = 
            reservation.workshop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.status.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'all' || 
            reservation.status.toLowerCase() === statusFilter.toLowerCase();
        
        return matchesSearch && matchesStatus;
    });

    const viewReservationDetails = (reservation) => {
        setSelectedReservation(reservation);
    };

    const closeDetails = () => {
        setSelectedReservation(null);
    };

    const ConfirmCancelModal = ({ reservation }) => {
        if (!reservation) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                    <div className="flex items-center mb-4 text-red-600">
                        <AlertTriangle size={24} className="mr-2" />
                        <h2 className="text-xl font-bold">¿Cancelar reserva?</h2>
                    </div>
                    
                    <p className="mb-6">
                        ¿Estás seguro de que deseas cancelar tu reserva para <strong>{reservation.workshop_name}</strong> del {formatDate(reservation.workshop_date)}? Esta acción no se puede deshacer.
                    </p>
                    
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={() => setCancelingReservation(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isCanceling}
                        >
                            Volver
                        </button>
                        
                        <button 
                            onClick={cancelReservation}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            disabled={isCanceling}
                        >
                            {isCanceling ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Cancelando...
                                </>
                            ) : (
                                'Cancelar Reserva'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ReservationDetails = ({ reservation }) => {
        if (!reservation) return null;
        
        const workshopImage = workshopImagesById[reservation.workshop_id] || '/api/placeholder/400/300';
        
        const today = new Date();
        const workshopDate = new Date(reservation.workshop_date);
        const canCancel = workshopDate > today && reservation.status !== 'Cancelada' && reservation.status !== 'Completada';
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg border border-[#e0dfdf] w-full max-w-3xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Detalles de la Reserva</h2>
                            <button 
                                onClick={closeDetails} 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <img 
                                    src={workshopImage} 
                                    alt={reservation.workshop_name} 
                                    className="w-full h-64 object-cover"
                                />
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{reservation.workshop_name}</h3>
                                
                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center">
                                        <Calendar className="text-gray-500 mr-2" size={16} />
                                        <span>{formatDate(reservation.workshop_date)}</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <Clock className="text-gray-500 mr-2" size={16} />
                                        <span>
                                            {formatTime(reservation.workshop_start_time)} - {formatTime(reservation.workshop_end_time)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <Tag className="text-gray-500 mr-2" size={16} />
                                        <span>Modalidad: {reservation.workshop_modality}</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                                            reservation.payment_status?.toLowerCase() === 'pagado' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            Pago: {reservation.payment_status || 'Pendiente'}
                                        </div>
                                        
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            reservation.status?.toLowerCase() === 'confirmada' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : reservation.status?.toLowerCase() === 'cancelada'
                                                ? 'bg-red-100 text-red-800'
                                                : reservation.status?.toLowerCase() === 'completada'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            Estado: {reservation.status || 'Pendiente'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <p className="font-semibold">Precio:</p>
                                    <p className="text-2xl font-bold text-accent-color">${reservation.workshop_price}</p>
                                </div>
                                
                                {canCancel && (
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => {
                                                closeDetails();
                                                setCancelingReservation(reservation);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Cancelar Reserva
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 border-t pt-4">
                            <p className="text-sm text-gray-500">
                                Reserva #{reservation.id} • Creada el {new Date(reservation.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const statusOptions = [
        { value: 'all', label: 'Todos los estados' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'cancelada', label: 'Cancelada' },
        { value: 'completada', label: 'Completada' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-color border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Cargando tus reservas...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && !loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-center p-8 bg-secondary-color bg-opacity-20 rounded-lg">
                    <h2 className="text-2xl font-bold text-main-text-color mb-4">Sesión no iniciada</h2>
                    <p className="text-secondary-text-color mb-6">
                        Para ver tus reservas, por favor inicia sesión o crea una nueva cuenta.
                    </p>
                    <div className="flex justify-center gap-4 items-center">
                        <a 
                            href="/login" 
                            className="px-6 py-3 bg-primary-color text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Iniciar Sesión
                        </a>
                        <a 
                            href="/signup" 
                            className="px-6 py-3 bg-secondary-color text-main-text-color rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Crear Cuenta
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-center p-8 bg-red-50 rounded-lg">
                    <p className="text-red-500 font-semibold text-lg">¡Ups! {error}</p>
                    <p className="mt-2 text-gray-600">Por favor, intenta recargar la página.</p>
                    <button 
                        onClick={() => {
                            getAuthTokenFromCookies();
                            setError(null);
                        }}
                        className="mt-4 px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-between">
                    <p>{successMessage}</p>
                    <button onClick={() => setSuccessMessage(null)}>
                        <X size={20} />
                    </button>
                </div>
            )}
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-main-text-color">Mis Reservas</h1>
                <p className="text-secondary-text-color mt-2">
                    Gestiona tus talleres de cocina y revisa detalles importantes de tus clases.
                </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o estado..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>
                
                <div className="relative">
                    <button
                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary-color text-main-text-color rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                        <Filter size={18} />
                        <span>Filtrar</span>
                        {isFilterMenuOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {isFilterMenuOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-10 border">
                            <div className="p-4">
                                <h3 className="font-medium mb-3">Estado de Reserva</h3>
                                <div className="space-y-2">
                                    {statusOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`status-${option.value}`}
                                                name="status"
                                                value={option.value}
                                                checked={statusFilter === option.value}
                                                onChange={() => {
                                                    setStatusFilter(option.value);
                                                    setIsFilterMenuOpen(false);
                                                }}
                                                className="w-4 h-4 text-primary-color focus:ring-primary-color"
                                            />
                                            <label htmlFor={`status-${option.value}`} className="ml-2 text-sm text-gray-700">
                                                {option.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mb-4 text-secondary-text-color">
                Mostrando {filteredReservations.length} de {reservations.length} reservas
            </div>
            
            {filteredReservations.length === 0 ? (
                <div className="text-center p-8 bg-secondary-color bg-opacity-20 rounded-lg">
                    <p className="text-secondary-text-color">No se encontraron reservas con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReservations.map(reservation => {
                        const workshopImage = workshopImagesById[reservation.workshop_id] || '/api/placeholder/400/300';
                        
                        return (
                            <div 
                                key={reservation.id}
                                className="bg-white border border-[#e0dfdf] overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                onClick={() => viewReservationDetails(reservation)}
                            >
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={workshopImage} 
                                        alt={reservation.workshop_name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-main-text-color mb-2 truncate">
                                        {reservation.workshop_name}
                                    </h3>
                                    
                                    <div className="flex items-center mb-2">
                                        <Calendar className="text-primary-color mr-2" size={16} />
                                        <span className="text-sm text-secondary-text-color">
                                            {formatDate(reservation.workshop_date)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center mb-4">
                                        <Clock className="text-primary-color mr-2" size={16} />
                                        <span className="text-sm text-secondary-text-color">
                                            {formatTime(reservation.workshop_start_time)} - {formatTime(reservation.workshop_end_time)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            reservation.payment_status?.toLowerCase() === 'pagado' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {reservation.payment_status || 'Pendiente'}
                                        </div>
                                        
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            reservation.status?.toLowerCase() === 'confirmada' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : reservation.status?.toLowerCase() === 'cancelada'
                                                ? 'bg-red-100 text-red-800'
                                                : reservation.status?.toLowerCase() === 'completada'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {reservation.status || 'Pendiente'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {selectedReservation && <ReservationDetails reservation={selectedReservation} />}
            {cancelingReservation && <ConfirmCancelModal reservation={cancelingReservation} />}
        </div>
    );
};

export default Dashboard;