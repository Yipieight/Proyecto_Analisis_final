# login_backend_api_python/app.py
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import create_app, db, init_app

# Create Flask application
app = create_app(__name__)
init_app(app)

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'tu-google-client-id-aqui')

# User model
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
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

# Create tables within application context
with app.app_context():
    db.create_all()

# Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check for required fields
    required_fields = ['name', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate email is unique
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already in use'}), 400
    
    # Validate password length
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    # Create new user
    user = User(
        name=data['name'], 
        email=data['email'],
        auth_provider='local'
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check for required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if user is using Google authentication
    if user.auth_provider == 'google':
        return jsonify({'error': 'This account uses Google authentication. Please sign in with Google.'}), 400
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    """
    Endpoint para autenticación con Google OAuth
    Espera recibir un token de Google en el campo 'credential'
    """
    try:
        data = request.get_json()
        
        if not data or 'credential' not in data:
            return jsonify({'error': 'Google credential token is required'}), 400
        
        credential = data['credential']
        
        # Verificar el token de Google
        idinfo = id_token.verify_oauth2_token(
            credential, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Extraer información del payload
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']
        picture = idinfo.get('picture', '')
        
        # Verificar que el email esté verificado por Google
        if not idinfo.get('email_verified'):
            return jsonify({'error': 'Google email not verified'}), 400
        
        # Buscar usuario existente por Google ID o email
        user = User.query.filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()
        
        if user:
            # Usuario existente - actualizar información si es necesario
            if not user.google_id:
                # Usuario existía con email pero sin Google ID
                if user.auth_provider == 'local':
                    # Vincular cuenta local con Google
                    user.google_id = google_id
                    user.picture = picture
                    user.auth_provider = 'both'  # Puede usar ambos métodos
                else:
                    user.google_id = google_id
                    user.picture = picture
            else:
                # Actualizar información de perfil
                user.name = name
                user.picture = picture
            
            db.session.commit()
        else:
            # Crear nuevo usuario
            user = User(
                name=name,
                email=email,
                google_id=google_id,
                picture=picture,
                auth_provider='google'
            )
            
            db.session.add(user)
            db.session.commit()
        
        # Crear access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Google authentication successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except ValueError as e:
        # Token inválido
        return jsonify({
            'success': False,
            'error': 'Invalid Google token',
            'details': str(e)
        }), 400
    except Exception as e:
        # Error general
        return jsonify({
            'success': False,
            'error': 'Authentication failed',
            'details': str(e)
        }), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@app.route('/api/auth/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route('/api/auth/unlink-google', methods=['POST'])
@jwt_required()
def unlink_google():
    """
    Endpoint para desvincular cuenta de Google (solo si el usuario tiene contraseña local)
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.auth_provider == 'google' and not user.password_hash:
        return jsonify({'error': 'Cannot unlink Google account without setting a local password first'}), 400
    
    # Desvincular Google
    user.google_id = None
    user.picture = None
    user.auth_provider = 'local'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Google account unlinked successfully',
        'user': user.to_dict()
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)