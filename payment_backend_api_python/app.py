# payment_backend_api_python/app.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sys
import os
from datetime import datetime
import requests
import stripe

stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_BQokikJOvBiI2HlWgH4olfQ2')

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import create_app, db, init_app

# Create Flask application
app = create_app(__name__)
init_app(app)

# Configuration for microservices
RESERVATION_SERVICE_URL = os.getenv('RESERVATION_SERVICE_URL', 'http://reservation_service:5003')

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable para usuarios de Google
    google_id = db.Column(db.String(100), unique=True, nullable=True)  # ID de Google
    picture = db.Column(db.String(255), nullable=True)  # URL de la foto de perfil
    auth_provider = db.Column(db.String(20), default='local', nullable=False)  # 'local' o 'google'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'google_id': self.google_id,
            'picture': self.picture,
            'auth_provider': self.auth_provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='confirmada', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    payments = db.relationship('Payment', backref='reservation', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'workshop_id': self.workshop_id,
            'reservation_date': self.reservation_date.isoformat() if self.reservation_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Workshop(db.Model):
    __tablename__ = 'workshops'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    category = db.relationship('Category', backref='workshops', lazy=True)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.id'))
    modality = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column('id_payments', db.Integer, primary_key=True)  # ← CAMBIAR AQUÍ
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='Pendiente', nullable=False)  # 'Pendiente', 'Pagado'
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
    number_auth = db.Column(db.String(64))  # Tamaño para hash SHA-256
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'reservation_id': self.reservation_id,
            'amount': float(self.amount) if self.amount else None,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Create tables within application context
with app.app_context():
    db.create_all()

# Helper function to make authenticated requests to other microservices
def make_authenticated_request(url, method='GET', data=None, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    if method == 'GET':
        response = requests.get(url, headers=headers)
    elif method == 'POST':
        headers['Content-Type'] = 'application/json'
        response = requests.post(url, json=data, headers=headers)
    elif method == 'PUT':
        headers['Content-Type'] = 'application/json'
        response = requests.put(url, json=data, headers=headers)
    elif method == 'DELETE':
        response = requests.delete(url, headers=headers)
    
    return response

# Routes
@app.route('/api/payments/reservation/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_payment_by_reservation(reservation_id):
    user_id = int(get_jwt_identity())
    
    # First, verify that the reservation belongs to the user
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to reservation payment'}), 403
    
    # Get the payment for the reservation
    payment = Payment.query.filter_by(reservation_id=reservation_id).first()
    
    if not payment:
        return jsonify({'error': 'Payment not found for this reservation'}), 404
    
    return jsonify({
        'message': 'Payment retrieved successfully',
        'payment': payment.to_dict()
    }), 200

# Versión actualizada del endpoint para manejar múltiples reservas
@app.route('/api/payments/verify-card', methods=['POST'])
@jwt_required()
def verify_card():
    """
    Este endpoint verifica una tarjeta de crédito/débito sin procesar un pago real
    y puede confirmar múltiples reservas simultáneamente.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Verificar que tenemos los datos requeridos de la tarjeta
    if not data or 'card_number' not in data or 'exp_month' not in data or 'exp_year' not in data or 'cvc' not in data:
        return jsonify({'error': 'Se requieren todos los datos de la tarjeta (número, mes de expiración, año de expiración y CVC)'}), 400
    
    # Verificar que tenemos al menos una reserva para procesar
    if 'reservation_ids' not in data or not isinstance(data['reservation_ids'], list) or not data['reservation_ids']:
        return jsonify({'error': 'Se requiere al menos un ID de reserva en el campo reservation_ids'}), 400
    
    reservation_ids = data['reservation_ids']
    
    # Verificar que todas las reservas existen y pertenecen al usuario
    reservations = []
    for res_id in reservation_ids:
        reservation = Reservation.query.get(res_id)
        if not reservation:
            return jsonify({'error': f'Reserva con ID {res_id} no encontrada'}), 404
        
        if reservation.user_id != user_id:
            return jsonify({'error': f'Acceso no autorizado a la reserva con ID {res_id}'}), 403
        
        # Verificar que la reserva no esté ya confirmada y pagada
        existing_payment = Payment.query.filter_by(reservation_id=res_id).first()
        if existing_payment and existing_payment.status == 'pagado':
            return jsonify({'error': f'La reserva con ID {res_id} ya está pagada'}), 400
        
        reservations.append(reservation)
    
    try:
        # Crear un token de tarjeta con Stripe
        token = stripe.Token.create(
            card={
                "number": data['card_number'],
                "exp_month": data['exp_month'],
                "exp_year": data['exp_year'],
                "cvc": data['cvc']
            },
        )
        
        # Crear un PaymentIntent de $1 que solo autoriza sin capturar fondos
        intent = stripe.PaymentIntent.create(
            amount=100,  # $1.00 en centavos
            currency="usd",
            payment_method_types=["card"],
            capture_method="manual",  # Esto solo autoriza sin capturar
        )
        
        # Confirmamos el PaymentIntent con el token de la tarjeta
        payment_method = stripe.PaymentMethod.create(
            type="card",
            card={
                "token": token.id,
            },
        )
        
        # Asociamos el método de pago con el intent
        intent = stripe.PaymentIntent.confirm(
            intent.id,
            payment_method=payment_method.id,
        )
        
        # Verificamos el estado
        if intent.status == "requires_capture":
            # La tarjeta es válida y tiene fondos disponibles
            # Cancelamos el intent para no capturar fondos
            stripe.PaymentIntent.cancel(intent.id)
            
            auth_number = intent.id  # Usamos el ID del PaymentIntent
            hashed_auth = hashlib.sha256(auth_number.encode()).hexdigest()
            # Guardamos los últimos 4 dígitos de la tarjeta para referencia
            card_last_4 = data['card_number'][-4:]
            
            # Procesar todas las reservas
            processed_reservations = []
            processed_payments = []
            
            # Iniciar una transacción para que todo sea atómico
            try:
                for reservation in reservations:
                    # 1. Actualizar estado de la reserva a "Confirmada"
                    reservation.status = 'confirmada'
                    
                    # 2. Obtener o crear el pago para esta reserva
                    payment = Payment.query.filter_by(reservation_id=reservation.id).first()
                    
                    # Obtener el precio del taller
                    workshop = Workshop.query.get(reservation.workshop_id)
                    if not workshop:
                        return jsonify({'error': f'Taller para la reserva {reservation.id} no encontrado'}), 404
                    
                    amount = float(workshop.price) if workshop.price else 0
                    
                    if payment:
                        # Actualizar pago existente
                        payment.payment_method = f"Tarjeta terminada en {card_last_4}"
                        payment.status = "pagado"
                        payment.payment_date = datetime.utcnow()
                        payment.amount = amount
                        payment.number_auth = hashed_auth
                    else:
                        # Crear nuevo pago
                        payment = Payment(
                            reservation_id=reservation.id,
                            amount=amount,
                            payment_method=f"Tarjeta terminada en {card_last_4}",
                            status="pagado",
                            payment_date=datetime.utcnow(),
                            number_auth=hashed_auth

                        )
                        db.session.add(payment)
                    
                    processed_reservations.append(reservation.to_dict())
                    processed_payments.append(payment.to_dict())
                
                # Confirmar todos los cambios
                db.session.commit()
                
                return jsonify({
                    'message': 'Tarjeta verificada exitosamente y reservas confirmadas',
                    'card_last_4': card_last_4,
                    'is_valid': True,
                    'reservations': processed_reservations,
                    'payments': processed_payments
                }), 200
            
            except Exception as e:
                # En caso de error, revertir los cambios
                db.session.rollback()
                return jsonify({'error': f'Error al procesar reservas: {str(e)}'}), 500
        else:
            # La tarjeta no pudo ser autorizada
            return jsonify({
                'message': 'La tarjeta no pudo ser verificada',
                'is_valid': False,
                'reason': intent.status
            }), 200
            
    except stripe.error.CardError as e:
        # Error específico de la tarjeta (tarjeta rechazada, etc.)
        return jsonify({
            'message': 'Error con la tarjeta',
            'is_valid': False,
            'error': str(e)
        }), 200
    except stripe.error.StripeError as e:
        # Otros errores de Stripe
        return jsonify({'error': f'Error de Stripe: {str(e)}'}), 500
    except Exception as e:
        # Errores generales
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

@app.route('/api/payments', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'reservation_id' not in data or 'amount' not in data or 'payment_method' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    reservation_id = data['reservation_id']
    
    # Verify that the reservation belongs to the user
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to create payment'}), 403
    
    # Check if payment already exists
    existing_payment = Payment.query.filter_by(reservation_id=reservation_id).first()
    
    if existing_payment and existing_payment.status == 'pagado':
        return jsonify({'error': 'Payment already completed for this reservation'}), 400
    
    # If payment exists but pending, update it
    if existing_payment:
        existing_payment.amount = data['amount']
        existing_payment.payment_method = data['payment_method']
        existing_payment.status = 'pagado'
        existing_payment.payment_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment updated successfully',
            'payment': existing_payment.to_dict()
        }), 200
    
    # Create new payment
    payment = Payment(
        reservation_id=reservation_id,
        amount=data['amount'],
        payment_method=data['payment_method'],
        status='pagado',
        payment_date=datetime.utcnow()
    )
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify({
        'message': 'Payment created successfully',
        'payment': payment.to_dict()
    }), 201

@app.route('/api/payments/simulate', methods=['POST'])
@jwt_required()
def simulate_payment():
    """
    This endpoint simulates a payment process for a reservation.
    It's a mock service as specified in the project requirements.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'reservation_id' not in data:
        return jsonify({'error': 'Reservation ID is required'}), 400
    
    reservation_id = data['reservation_id']
    
    # Verify that the reservation belongs to the user
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to simulate payment'}), 403
    
    # Get the workshop price
    workshop = Workshop.query.get(reservation.workshop_id)
    if not workshop:
        return jsonify({'error': 'Workshop not found'}), 404
    
    amount = float(workshop.price)
    
    # Check if payment already exists
    existing_payment = Payment.query.filter_by(reservation_id=reservation_id).first()
    
    # ↓↓↓ NUEVO CÓDIGO: Generar autorización simulada ↓↓↓
    simulated_auth = f"SIM_{secrets.token_hex(8)}"  # 8 bytes = 16 caracteres hex
    hashed_auth = hashlib.sha256(simulated_auth.encode()).hexdigest()

    # Payment data to be used
    payment_data = {
    'amount': amount,
    'payment_method': data.get('payment_method', 'Credit Card'),
    'status': 'pagado',
    'payment_date': datetime.utcnow(),
    'number_auth': hashed_auth
}
    
    # If payment exists, update it
    if existing_payment:
        for key, value in payment_data.items():
            setattr(existing_payment, key, value)
        
        db.session.commit()
        payment = existing_payment
    else:
        # Create new payment
        payment = Payment(
            reservation_id=reservation_id,
            **payment_data
        )
        
        db.session.add(payment)
        db.session.commit()
    
    return jsonify({
        'message': 'Payment simulation successful',
        'payment': payment.to_dict(),
        'reservation_status': 'Confirmed'
    }), 200

@app.route('/api/payments/user', methods=['GET'])
@jwt_required()
def get_user_payments():
    user_id = int(get_jwt_identity())
    
    # Get all reservations for the user
    reservations = Reservation.query.filter_by(user_id=user_id).all()
    reservation_ids = [reservation.id for reservation in reservations]
    
    # Get all payments for those reservations
    payments = Payment.query.filter(Payment.reservation_id.in_(reservation_ids)).all()
    
    return jsonify({
        'message': 'User payments retrieved successfully',
        'payments': [payment.to_dict() for payment in payments]
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)