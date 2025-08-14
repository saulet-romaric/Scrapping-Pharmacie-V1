"""
Module de configuration de la base de données
Gère la connexion et l'initialisation de la base SQLite
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Instance de SQLAlchemy pour Flask
db = SQLAlchemy()

def init_database(app):
    """
    Initialise la base de données avec l'application Flask
    
    Args:
        app: Instance de l'application Flask
    """
    # Configuration de la base de données SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharmacies.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialisation de SQLAlchemy avec l'app
    db.init_app(app)
    
    # Création des tables si elles n'existent pas
    with app.app_context():
        db.create_all()
        print("✅ Base de données initialisée avec succès")

def get_db_session():
    """
    Retourne une session de base de données
    
    Returns:
        Session: Session SQLAlchemy
    """
    return db.session

