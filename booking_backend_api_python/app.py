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
LOGIN_SERVICE_URL = os.getenv('LOGIN_SERVICE_URL', 'http://login_service:5001')
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
def make_authenticated_request(url, method='GET', data=None, token=None, params=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params)
        elif method == 'POST':
            headers['Content-Type'] = 'application/json'
            response = requests.post(url, json=data, headers=headers, params=params)
        elif method == 'PUT':
            headers['Content-Type'] = 'application/json'
            response = requests.put(url, json=data, headers=headers, params=params)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, params=params)
        
        return response
    except requests.RequestException as e:
        return None

# =============================================================================
# AUTHENTICATION ENDPOINTS (Login Service)
# =============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Proxy to Login Service - User Registration"""
    url = f"{LOGIN_SERVICE_URL}/api/auth/register"
    data = request.get_json()
    
    try:
        response = requests.post(url, json=data)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Proxy to Login Service - User Login"""
    url = f"{LOGIN_SERVICE_URL}/api/auth/login"
    data = request.get_json()
    
    try:
        response = requests.post(url, json=data)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Proxy to Login Service - Get User Profile"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{LOGIN_SERVICE_URL}/api/auth/me"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/auth/users', methods=['GET'])
@jwt_required()
def get_users():
    """Proxy to Login Service - Get All Users (Admin)"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{LOGIN_SERVICE_URL}/api/auth/users"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# WORKSHOP ENDPOINTS (Workshop Service)
# =============================================================================

@app.route('/api/workshops', methods=['GET'])
def get_workshops():
    """Proxy to Workshop Service - Get All Workshops"""
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops"
    params = request.args.to_dict()
    
    try:
        response = requests.get(url, params=params)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshops/<int:workshop_id>', methods=['GET'])
def get_workshop_details(workshop_id):
    """Proxy to Workshop Service - Get Workshop Details"""
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops/{workshop_id}"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshops', methods=['POST'])
@jwt_required()
def create_workshop():
    """Proxy to Workshop Service - Create Workshop"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='POST', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshops/<int:workshop_id>', methods=['PUT'])
@jwt_required()
def update_workshop(workshop_id):
    """Proxy to Workshop Service - Update Workshop"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops/{workshop_id}"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='PUT', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshops/<int:workshop_id>', methods=['DELETE'])
@jwt_required()
def delete_workshop(workshop_id):
    """Proxy to Workshop Service - Delete Workshop"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{WORKSHOP_SERVICE_URL}/api/workshops/{workshop_id}"
    
    try:
        response = make_authenticated_request(url, method='DELETE', token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# INSTRUCTOR ENDPOINTS (Workshop Service)
# =============================================================================

@app.route('/api/instructors', methods=['GET'])
def get_instructors():
    """Proxy to Workshop Service - Get All Instructors"""
    url = f"{WORKSHOP_SERVICE_URL}/api/instructors"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/instructors/<int:instructor_id>', methods=['GET'])
def get_instructor(instructor_id):
    """Proxy to Workshop Service - Get Instructor Details"""
    url = f"{WORKSHOP_SERVICE_URL}/api/instructors/{instructor_id}"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# CATEGORY ENDPOINTS (Workshop Service)
# =============================================================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Proxy to Workshop Service - Get All Categories"""
    url = f"{WORKSHOP_SERVICE_URL}/api/categories"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Proxy to Workshop Service - Get Category Details"""
    url = f"{WORKSHOP_SERVICE_URL}/api/categories/{category_id}"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshop-categories', methods=['GET'])
def get_workshop_categories():
    """Proxy to Workshop Service - Get Workshop Categories (Legacy)"""
    url = f"{WORKSHOP_SERVICE_URL}/api/workshop-categories"
    
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# RESERVATION ENDPOINTS (Reservation Service)
# =============================================================================

@app.route('/api/reservations', methods=['POST'])
@jwt_required()
def create_reservations():
    """Proxy to Reservation Service - Create Reservations"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/reservations"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='POST', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/reservations', methods=['GET'])
@jwt_required()
def get_user_reservations():
    """Proxy to Reservation Service - Get User Reservations"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/reservations"
    params = request.args.to_dict()
    
    try:
        response = make_authenticated_request(url, params=params, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_reservation_details(reservation_id):
    """Proxy to Reservation Service - Get Reservation Details"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/reservations/{reservation_id}"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def update_reservation_status(reservation_id):
    """Proxy to Reservation Service - Update Reservation Status"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/reservations/{reservation_id}"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='PUT', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/reservations/<int:reservation_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(reservation_id):
    """Proxy to Reservation Service - Cancel Reservation"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/reservations/{reservation_id}/cancel"
    
    try:
        response = make_authenticated_request(url, method='PUT', token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/workshops/<int:workshop_id>/reservations', methods=['GET'])
@jwt_required()
def get_workshop_reservations(workshop_id):
    """Proxy to Reservation Service - Get Workshop Reservations"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{RESERVATION_SERVICE_URL}/api/workshops/{workshop_id}/reservations"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# PAYMENT ENDPOINTS (Payment Service)
# =============================================================================

@app.route('/api/payments/reservation/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_payment_by_reservation(reservation_id):
    """Proxy to Payment Service - Get Payment by Reservation"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{PAYMENT_SERVICE_URL}/api/payments/reservation/{reservation_id}"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/payments/verify-card', methods=['POST'])
@jwt_required()
def verify_card():
    """Proxy to Payment Service - Verify Card"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{PAYMENT_SERVICE_URL}/api/payments/verify-card"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='POST', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/payments', methods=['POST'])
@jwt_required()
def create_payment():
    """Proxy to Payment Service - Create Payment"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{PAYMENT_SERVICE_URL}/api/payments"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='POST', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/payments/simulate', methods=['POST'])
@jwt_required()
def simulate_payment():
    """Proxy to Payment Service - Simulate Payment"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{PAYMENT_SERVICE_URL}/api/payments/simulate"
    data = request.get_json()
    
    try:
        response = make_authenticated_request(url, method='POST', data=data, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/payments/user', methods=['GET'])
@jwt_required()
def get_user_payments():
    """Proxy to Payment Service - Get User Payments"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    url = f"{PAYMENT_SERVICE_URL}/api/payments/user"
    
    try:
        response = make_authenticated_request(url, token=token)
        if response:
            return jsonify(response.json()), response.status_code
        else:
            return jsonify({'error': 'Service communication error'}), 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

# =============================================================================
# LEGACY/CONVENIENCE ENDPOINTS (Mantiene compatibilidad con frontend)
# =============================================================================

@app.route('/api/booking/workshops', methods=['GET'])
def get_available_workshops():
    """Legacy endpoint - redirects to workshops"""
    return get_workshops()

@app.route('/api/booking/workshops/<int:workshop_id>', methods=['GET'])
def get_workshop_booking_details(workshop_id):
    """Legacy endpoint - redirects to workshop details"""
    return get_workshop_details(workshop_id)

@app.route('/api/booking/categories', methods=['GET'])
def get_booking_categories():
    """Legacy endpoint - redirects to categories"""
    return get_workshop_categories()

@app.route('/api/booking/reserve', methods=['POST'])
@jwt_required()
def make_reservation():
    """Legacy endpoint - simplified reservation creation"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'workshop_id' not in data:
        return jsonify({'error': 'Workshop ID is required'}), 400
    
    # Transform single workshop_id to array format for new reservation service
    reservation_data = {
        'workshop_ids': [data['workshop_id']]
    }
    
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    
    try:
        response = make_authenticated_request(
            f"{RESERVATION_SERVICE_URL}/api/reservations",
            method='POST',
            data=reservation_data,
            token=token
        )
        
        if response and response.status_code == 201:
            reservation_response = response.json()
            # Return first reservation for compatibility
            if reservation_response.get('reservations'):
                return jsonify({
                    'message': 'Reservation created successfully',
                    'reservation': reservation_response['reservations'][0],
                    'next_step': 'Proceed to payment'
                }), 201
            else:
                return jsonify(reservation_response), response.status_code
        else:
            return jsonify({'error': 'Failed to create reservation'}), response.status_code if response else 503
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/my-bookings', methods=['GET'])
@jwt_required()
def get_user_bookings():
    """Legacy endpoint - redirects to reservations"""
    return get_user_reservations()

@app.route('/api/booking/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking_details(booking_id):
    """Legacy endpoint - redirects to reservation details with payment info"""
    token = request.headers.get('Authorization').split(' ')[1] if request.headers.get('Authorization') else None
    
    try:
        # Get reservation details
        reservation_response = make_authenticated_request(
            f"{RESERVATION_SERVICE_URL}/api/reservations/{booking_id}",
            token=token
        )
        
        if not reservation_response or reservation_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch booking details'}), reservation_response.status_code if reservation_response else 503
        
        booking_data = reservation_response.json()
        
        # Try to get payment info
        try:
            payment_response = make_authenticated_request(
                f"{PAYMENT_SERVICE_URL}/api/payments/reservation/{booking_id}", 
                token=token
            )
            if payment_response and payment_response.status_code == 200:
                payment_info = payment_response.json().get('payment')
                if payment_info:
                    booking_data['payment'] = payment_info
        except:
            # If payment info cannot be retrieved, continue without it
            pass
        
        return jsonify(booking_data), 200
    except Exception as e:
        return jsonify({'error': f'Service communication error: {str(e)}'}), 503

@app.route('/api/booking/<int:booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    """Legacy endpoint - redirects to cancel reservation"""
    return cancel_reservation(booking_id)

# =============================================================================
# HEALTH CHECK ENDPOINTS
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """API Gateway Health Check"""
    return jsonify({
        'status': 'ok',
        'message': 'API Gateway is running',
        'time': datetime.utcnow().isoformat(),
        'services': {
            'login_service': LOGIN_SERVICE_URL,
            'workshop_service': WORKSHOP_SERVICE_URL,
            'reservation_service': RESERVATION_SERVICE_URL,
            'payment_service': PAYMENT_SERVICE_URL
        }
    }), 200

@app.route('/api/health/services', methods=['GET'])
def check_services_health():
    """Check health of all microservices"""
    services_status = {}
    
    # Check each service
    services = {
        'login_service': f"{LOGIN_SERVICE_URL}/api/auth/users",
        'workshop_service': f"{WORKSHOP_SERVICE_URL}/api/categories",
        'reservation_service': f"{RESERVATION_SERVICE_URL}/api/health-check",
        'payment_service': f"{PAYMENT_SERVICE_URL}/api/payments/user"
    }
    
    for service_name, service_url in services.items():
        try:
            if service_name in ['login_service', 'payment_service']:
                # These require authentication, just check if they respond
                response = requests.get(service_url.replace('/api/auth/users', '/api/auth/login').replace('/api/payments/user', '/api/payments/simulate'), timeout=5)
            else:
                response = requests.get(service_url, timeout=5)
            
            services_status[service_name] = {
                'status': 'ok' if response.status_code in [200, 401, 422] else 'error',  # 401/422 means service is up but needs auth
                'url': service_url,
                'response_time': response.elapsed.total_seconds()
            }
        except Exception as e:
            services_status[service_name] = {
                'status': 'error',
                'url': service_url,
                'error': str(e)
            }
    
    overall_status = 'ok' if all(s['status'] == 'ok' for s in services_status.values()) else 'degraded'
    
    return jsonify({
        'overall_status': overall_status,
        'services': services_status,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008, debug=True)