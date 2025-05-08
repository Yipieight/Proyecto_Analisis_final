# payment_backend_api_python/app.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sys
import os
from datetime import datetime
import requests

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
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Confirmada', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    payments = db.relationship('Payment', backref='reservation', lazy=True)

class Workshop(db.Model):
    __tablename__ = 'workshops'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
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
    
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='Pendiente', nullable=False)  # 'Pendiente', 'Pagado'
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
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
    user_id = get_jwt_identity()
    
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

@app.route('/api/payments', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = get_jwt_identity()
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
    
    if existing_payment and existing_payment.status == 'Pagado':
        return jsonify({'error': 'Payment already completed for this reservation'}), 400
    
    # If payment exists but pending, update it
    if existing_payment:
        existing_payment.amount = data['amount']
        existing_payment.payment_method = data['payment_method']
        existing_payment.status = 'Pagado'
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
        status='Pagado',
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
    user_id = get_jwt_identity()
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
    
    # Payment data to be used
    payment_data = {
        'amount': amount,
        'payment_method': data.get('payment_method', 'Credit Card'),
        'status': 'Pagado',
        'payment_date': datetime.utcnow()
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
    user_id = get_jwt_identity()
    
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