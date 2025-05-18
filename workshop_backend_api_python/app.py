# workshop_backend_api_python/app.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sys
import os
from datetime import datetime

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import create_app, db, init_app

# Create Flask application
app = create_app(__name__)
init_app(app)

# Models
class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    workshops = db.relationship('Workshop', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

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
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'bio': self.bio,
            'specialization': self.specialization,
            'email': self.email,
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
    modality = db.Column(db.String(20), nullable=False)  # 'presencial' or 'virtual'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    reservations = db.relationship('Reservation', backref='workshop', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'price': float(self.price) if self.price else None,
            'capacity': self.capacity,
            'instructor_id': self.instructor_id,
            'instructor_name': self.instructor.name if self.instructor else None,
            'modality': self.modality,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'available_slots': self.capacity - len([r for r in self.reservations if r.status == 'Confirmada']) if self.reservations else self.capacity
        }

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Confirmada', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())


# Create tables within application context
with app.app_context():
    db.create_all()

# Routes for Workshops
@app.route('/api/workshops', methods=['GET'])
def get_workshops():
    category_id = request.args.get('category_id')
    
    query = Workshop.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    workshops = query.all()
    
    if not workshops:
        return jsonify({'message': 'No workshops available', 'workshops': []}), 200
    
    return jsonify({
        'message': 'Workshops retrieved successfully',
        'workshops': [workshop.to_dict() for workshop in workshops]
    }), 200

@app.route('/api/workshops/<int:workshop_id>', methods=['GET'])
def get_workshop(workshop_id):
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({'error': 'Workshop not found'}), 404
    
    return jsonify({
        'message': 'Workshop retrieved successfully',
        'workshop': workshop.to_dict()
    }), 200

@app.route('/api/workshops', methods=['POST'])
@jwt_required()
def create_workshop():
    data = request.get_json()
    
    # Check for required fields
    required_fields = [
        'name', 'description', 'category_id', 'date', 
        'start_time', 'end_time', 'price', 'capacity', 
        'instructor_id', 'modality'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if category exists
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if instructor exists
    instructor = Instructor.query.get(data['instructor_id'])
    if not instructor:
        return jsonify({'error': 'Instructor not found'}), 404
    
    # Parse date and times
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M:%S').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M:%S').time()
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400
    
    # Create new workshop
    workshop = Workshop(
        name=data['name'],
        description=data['description'],
        category_id=data['category_id'],
        date=date,
        start_time=start_time,
        end_time=end_time,
        price=data['price'],
        capacity=data['capacity'],
        instructor_id=data['instructor_id'],
        modality=data['modality']
    )
    
    db.session.add(workshop)
    db.session.commit()
    
    return jsonify({
        'message': 'Workshop created successfully',
        'workshop': workshop.to_dict()
    }), 201

@app.route('/api/workshops/<int:workshop_id>', methods=['PUT'])
@jwt_required()
def update_workshop(workshop_id):
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({'error': 'Workshop not found'}), 404
    
    data = request.get_json()
    
    # Update workshop fields
    if 'name' in data:
        workshop.name = data['name']
    if 'description' in data:
        workshop.description = data['description']
    if 'category_id' in data:
        # Check if category exists
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        workshop.category_id = data['category_id']
    if 'date' in data:
        try:
            workshop.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    if 'start_time' in data:
        try:
            workshop.start_time = datetime.strptime(data['start_time'], '%H:%M:%S').time()
        except ValueError:
            return jsonify({'error': 'Invalid time format'}), 400
    if 'end_time' in data:
        try:
            workshop.end_time = datetime.strptime(data['end_time'], '%H:%M:%S').time()
        except ValueError:
            return jsonify({'error': 'Invalid time format'}), 400
    if 'price' in data:
        workshop.price = data['price']
    if 'capacity' in data:
        workshop.capacity = data['capacity']
    if 'instructor_id' in data:
        # Check if instructor exists
        instructor = Instructor.query.get(data['instructor_id'])
        if not instructor:
            return jsonify({'error': 'Instructor not found'}), 404
        workshop.instructor_id = data['instructor_id']
    if 'modality' in data:
        workshop.modality = data['modality']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Workshop updated successfully',
        'workshop': workshop.to_dict()
    }), 200

@app.route('/api/workshops/<int:workshop_id>', methods=['DELETE'])
@jwt_required()
def delete_workshop(workshop_id):
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({'error': 'Workshop not found'}), 404
    
    # Check if workshop has reservations
    if workshop.reservations:
        return jsonify({'error': 'Cannot delete workshop with existing reservations'}), 400
    
    db.session.delete(workshop)
    db.session.commit()
    
    return jsonify({'message': 'Workshop deleted successfully'}), 200

# Routes for Instructors
@app.route('/api/instructors', methods=['GET'])
def get_instructors():
    instructors = Instructor.query.all()
    return jsonify({
        'message': 'Instructors retrieved successfully',
        'instructors': [instructor.to_dict() for instructor in instructors]
    }), 200

@app.route('/api/instructors/<int:instructor_id>', methods=['GET'])
def get_instructor(instructor_id):
    instructor = Instructor.query.get(instructor_id)
    
    if not instructor:
        return jsonify({'error': 'Instructor not found'}), 404
    
    return jsonify({
        'message': 'Instructor retrieved successfully',
        'instructor': instructor.to_dict()
    }), 200

# Routes for Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify({
        'message': 'Categories retrieved successfully',
        'categories': [category.to_dict() for category in categories]
    }), 200

@app.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({
        'message': 'Category retrieved successfully',
        'category': category.to_dict()
    }), 200

# Routes for workshop categories (legacy route - mantiene retrocompatibilidad)
@app.route('/api/workshop-categories', methods=['GET'])
def get_workshop_categories():
    categories = Category.query.all()
    category_list = [category.name for category in categories]
    
    return jsonify({
        'message': 'Categories retrieved successfully',
        'categories': category_list
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)