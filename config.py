# config.py
import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import pymysql
import logging

# Para usar PyMySQL como controlador de MySQL
pymysql.install_as_MySQLdb()

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DB_USER = os.getenv('DB_USER', 'avnadmin')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'AVNS_Ndhucmx5Rv2r1Ni7ocS')
DB_HOST = os.getenv('DB_HOST', 'mysql-3bbd1558-xboxgar56-040e.g.aivencloud.com')
DB_PORT = os.getenv('DB_PORT', '16152')
DB_NAME = os.getenv('DB_NAME', 'defaultdb')

# Log configuration
logger.info(f"Configuración de DB: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

# Common functions to create Flask application
def create_app(name):
    app = Flask(name)
    
    # URL de conexión simplificada
    DATABASE_URL = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'
    
    logger.info(f"DATABASE_URL: mysql+pymysql://{DB_USER}:****@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    
    # Configuración mínima para debugging
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'echo': True,  # Esto mostrará todas las queries SQL
        'connect_args': {
            'connect_timeout': 60,
            'charset': 'utf8mb4'
        }
    }
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'mastercook-super-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600
    
    # Enable CORS
    CORS(app, origins="*")
    
    return app

# Initialize database and JWT manager
db = SQLAlchemy()
jwt = JWTManager()

def init_app(app):
    try:
        logger.info("Inicializando aplicación...")
        db.init_app(app)
        jwt.init_app(app)
        logger.info("Aplicación inicializada correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar la aplicación: {str(e)}")
        raise