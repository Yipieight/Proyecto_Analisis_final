# booking_backend_api_python/app.py
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
WORKSHOP_SERVICE_URL = os.getenv('WORKSHOP_SERVICE_URL', 'http://workshop_service:5002')
RESERVATION_SERVICE_URL = os.getenv('RESERVATION_SERVICE_URL', 'http://reservation_service:5003')
PAYMENT_SERVICE_URL = os.getenv('PAYMENT_SERVICE_URL', 'http://payment_service:5004')

# Models imported for reference but actual operations will be performed via APIs
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

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

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Confirmada', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='Pendiente', nullable=False)
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

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

# Routes for Booking
@app.route('/api/booking/workshops', methods=['GET'])
def get_available_workshops():
    # Get query parameters for filtering
    category = request.args.get('category')
    
    # Build URL with parameters
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops"
    if category:
        url += f"?category={category}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to fetch workshops', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/workshops/<int:workshop_id>', methods=['GET'])
def get_workshop_details(workshop_id):
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops/{workshop_id}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to fetch workshop details', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/categories', methods=['GET'])
def get_workshop_categories():
    url = f"{WORKSHOP_SERVICE_URL}/api/workshop-categories"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to fetch categories', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/reserve', methods=['POST'])
@jwt_required()
def make_reservation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'workshop_id' not in data:
        return jsonify({'error': 'Workshop ID is required'}), 400
    
    workshop_id = data['workshop_id']
    
    # Get access token from request
    token = request.headers.get('Authorization').split(' ')[1]
    
    # Step 1: Check workshop details and availability
    try:
        workshop_response = requests.get(f"{WORKSHOP_SERVICE_URL}/api/workshops/{workshop_id}")
        if workshop_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch workshop details', 
                'details': workshop_response.json()
            }), workshop_response.status_code
        
        workshop_data = workshop_response.json()['workshop']
        available_slots = workshop_data.get('available_slots', 0)
        
        if available_slots <= 0:
            return jsonify({'error': 'Workshop is fully booked'}), 400
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503
    
    # Step 2: Create reservation
    try:
        reservation_data = {'workshop_id': workshop_id}
        reservation_response = make_authenticated_request(
            f"{RESERVATION_SERVICE_URL}/api/reservations",
            method='POST',
            data=reservation_data,
            token=token
        )
        
        if reservation_response.status_code != 201:
            return jsonify({
                'error': 'Failed to create reservation', 
                'details': reservation_response.json()
            }), reservation_response.status_code
        
        reservation = reservation_response.json()
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503
    
    return jsonify({
        'message': 'Reservation created successfully',
        'reservation': reservation['reservation'],
        'next_step': 'Proceed to payment'
    }), 201

@app.route('/api/booking/my-bookings', methods=['GET'])
@jwt_required()
def get_user_bookings():
    # Get access token from request
    token = request.headers.get('Authorization').split(' ')[1]
    status = request.args.get('status')
    
    # Build URL with parameters
    url = f"{RESERVATION_SERVICE_URL}/api/reservations"
    if status:
        url += f"?status={status}"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to fetch bookings', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking_details(booking_id):
    # Get access token from request
    token = request.headers.get('Authorization').split(' ')[1]
    
    url = f"{RESERVATION_SERVICE_URL}/api/reservations/{booking_id}"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response.status_code == 200:
            booking_data = response.json()
            
            # Get payment info if available
            payment_info = None
            try:
                payment_response = make_authenticated_request(
                    f"{PAYMENT_SERVICE_URL}/api/payments/reservation/{booking_id}", 
                    token=token
                )
                if payment_response.status_code == 200:
                    payment_info = payment_response.json().get('payment')
            except:
                # If payment info cannot be retrieved, continue without it
                pass
            
            # Add payment info to the response if available
            if payment_info:
                booking_data['payment'] = payment_info
            
            return jsonify(booking_data), 200
        else:
            return jsonify({'error': 'Failed to fetch booking details', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/<int:booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    # Get access token from request
    token = request.headers.get('Authorization').split(' ')[1]
    
    url = f"{RESERVATION_SERVICE_URL}/api/reservations/{booking_id}/cancel"
    
    try:
        response = make_authenticated_request(url, method='PUT', token=token)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to cancel booking', 'details': response.json()}), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008, debug=True)