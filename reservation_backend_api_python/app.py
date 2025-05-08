# reservation_backend_api_python/app.py
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

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    reservations = db.relationship('Reservation', backref='user', lazy=True)

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
    
    reservations = db.relationship('Reservation', backref='workshop', lazy=True)

class Instructor(db.Model):
    __tablename__ = 'instructors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    specialization = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    workshops = db.relationship('Workshop', backref='instructor', lazy=True)

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Confirmada', nullable=False)  # 'Confirmada', 'Cancelada', 'Completada'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    payments = db.relationship('Payment', backref='reservation', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'workshop_id': self.workshop_id,
            'workshop_name': self.workshop.name if self.workshop else None,
            'workshop_date': self.workshop.date.isoformat() if self.workshop and self.workshop.date else None,
            'workshop_start_time': self.workshop.start_time.isoformat() if self.workshop and self.workshop.start_time else None,
            'workshop_end_time': self.workshop.end_time.isoformat() if self.workshop and self.workshop.end_time else None,
            'workshop_price': float(self.workshop.price) if self.workshop and self.workshop.price else None,
            'workshop_modality': self.workshop.modality if self.workshop else None,
            'reservation_date': self.reservation_date.isoformat() if self.reservation_date else None,
            'status': self.status,
            'payment_status': self.payments[0].status if self.payments else 'Pendiente',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

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

# Create tables within application context
with app.app_context():
    db.create_all()

# Helper function to check workshop availability
def check_workshop_availability(workshop_id):
    workshop = Workshop.query.get(workshop_id)
    if not workshop:
        return False, "Workshop not found", None
    
    # Check if there are available slots
    reserved_count = Reservation.query.filter_by(workshop_id=workshop_id, status='Confirmada').count()
    if reserved_count >= workshop.capacity:
        return False, "Workshop is fully booked", None
    
    return True, None, workshop

# Routes
@app.route('/api/reservations', methods=['POST'])
@jwt_required()
def create_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'workshop_id' not in data:
        return jsonify({'error': 'Workshop ID is required'}), 400
    
    workshop_id = data['workshop_id']
    
    # Check workshop availability
    is_available, error_message, workshop = check_workshop_availability(workshop_id)
    if not is_available:
        return jsonify({'error': error_message}), 400
    
    # Check if user already has a reservation for this workshop
    existing_reservation = Reservation.query.filter_by(
        user_id=user_id,
        workshop_id=workshop_id,
        status='Confirmada'
    ).first()
    
    if existing_reservation:
        return jsonify({'error': 'You already have a reservation for this workshop'}), 400
    
    # Create reservation
    reservation = Reservation(
        user_id=user_id,
        workshop_id=workshop_id,
        reservation_date=datetime.utcnow(),
        status='Confirmada'
    )
    
    db.session.add(reservation)
    db.session.commit()
    
    # Create initial payment entry (pending)
    payment = Payment(
        reservation_id=reservation.id,
        amount=workshop.price,
        status='Pendiente'
    )
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify({
        'message': 'Reservation created successfully',
        'reservation': reservation.to_dict()
    }), 201

@app.route('/api/reservations', methods=['GET'])
@jwt_required()
def get_user_reservations():
    user_id = get_jwt_identity()
    status = request.args.get('status')
    
    query = Reservation.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    reservations = query.all()
    
    return jsonify({
        'message': 'Reservations retrieved successfully',
        'reservations': [reservation.to_dict() for reservation in reservations]
    }), 200

@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_reservation(reservation_id):
    user_id = get_jwt_identity()
    
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    # Ensure the user can only access their own reservations
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to reservation'}), 403
    
    return jsonify({
        'message': 'Reservation retrieved successfully',
        'reservation': reservation.to_dict()
    }), 200

@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def update_reservation_status(reservation_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    new_status = data['status']
    if new_status not in ['Confirmada', 'Cancelada', 'Completada']:
        return jsonify({'error': 'Invalid status value'}), 400
    
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    # Ensure the user can only modify their own reservations
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to reservation'}), 403
    
    # Update reservation status
    reservation.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Reservation status updated successfully',
        'reservation': reservation.to_dict()
    }), 200

@app.route('/api/reservations/<int:reservation_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(reservation_id):
    user_id = get_jwt_identity()
    
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    # Ensure the user can only cancel their own reservations
    if reservation.user_id != user_id:
        return jsonify({'error': 'Unauthorized access to reservation'}), 403
    
    # Update reservation status to canceled
    reservation.status = 'Cancelada'
    db.session.commit()
    
    return jsonify({
        'message': 'Reservation cancelled successfully',
        'reservation': reservation.to_dict()
    }), 200

@app.route('/api/workshops/<int:workshop_id>/reservations', methods=['GET'])
@jwt_required()
def get_workshop_reservations(workshop_id):
    # This endpoint might be for instructors or admins
    reservations = Reservation.query.filter_by(workshop_id=workshop_id).all()
    
    return jsonify({
        'message': 'Workshop reservations retrieved successfully',
        'reservations': [reservation.to_dict() for reservation in reservations]
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)