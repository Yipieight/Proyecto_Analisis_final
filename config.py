# config.py
import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import pymysql

# Para usar PyMySQL como controlador de MySQL
pymysql.install_as_MySQLdb()

# Database configuration
DB_USER = os.getenv('DB_USER', 'avnadmin')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'AVNS_Ndhucmx5Rv2r1Ni7ocS')
DB_HOST = os.getenv('DB_HOST', 'mysql-3bbd1558-xboxgar56-040e.g.aivencloud.com')
DB_PORT = os.getenv('DB_PORT', '16152')
DB_NAME = os.getenv('DB_NAME', 'defaultdb')

# Common functions to create Flask application
def create_app(name):
    app = Flask(name)
    
    # Configura la conexión a la base de datos
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    
    # Si necesitas SSL, usa esto en lugar de ssl_mode en la URL
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {
            'ssl': {
                'check_hostname': False,
                'verify_mode': False  # Cambia a True si tienes un certificado SSL válido
            }
        }
    }
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'mastercook-super-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
    
    # Enable CORS
    CORS(app)
    
    return app

# Initialize database and JWT manager
db = SQLAlchemy()
jwt = JWTManager()

def init_app(app):
    db.init_app(app)
    jwt.init_app(app)