"""
Modèles de données pour les pharmacies
Définit la structure de la table des pharmacies dans la base de données
"""

from database import db
from datetime import datetime
import json

class Pharmacie(db.Model):
    """
    Modèle représentant une pharmacie dans la base de données
    
    Attributs:
        id: Identifiant unique de la pharmacie
        nom: Nom de la pharmacie
        adresse: Adresse complète de la pharmacie
        latitude: Coordonnée GPS latitude
        longitude: Coordonnée GPS longitude
        telephone: Numéro de téléphone de la pharmacie
        email: Adresse email de la pharmacie (optionnel)
        horaires: Horaires d'ouverture (optionnel)
        date_creation: Date de création de l'enregistrement
        date_maj: Date de dernière mise à jour
    """
    
    __tablename__ = 'pharmacies'
    
    # Champs principaux
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(200), nullable=False, index=True)
    adresse = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    telephone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    horaires = db.Column(db.String(200), nullable=True)
    
    # Métadonnées
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_maj = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        """Représentation string de l'objet pharmacie"""
        return f'<Pharmacie {self.nom}>'
    
    def to_dict(self):
        """
        Convertit l'objet pharmacie en dictionnaire
        
        Returns:
            dict: Dictionnaire représentant la pharmacie
        """
        return {
            'id': self.id,
            'nom': self.nom,
            'adresse': self.adresse,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'telephone': self.telephone,
            'email': self.email,
            'horaires': self.horaires,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'date_maj': self.date_maj.isoformat() if self.date_maj else None
        }
    
    def to_json(self):
        """
        Convertit l'objet pharmacie en JSON
        
        Returns:
            str: Représentation JSON de la pharmacie
        """
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)
    
    @classmethod
    def create_from_dict(cls, data):
        """
        Crée une nouvelle pharmacie à partir d'un dictionnaire
        
        Args:
            data (dict): Données de la pharmacie
            
        Returns:
            Pharmacie: Nouvelle instance de pharmacie
        """
        return cls(
            nom=data.get('nom'),
            adresse=data.get('adresse'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            telephone=data.get('telephone'),
            email=data.get('email'),
            horaires=data.get('horaires')
        )
    
    def update_from_dict(self, data):
        """
        Met à jour la pharmacie avec les données d'un dictionnaire
        
        Args:
            data (dict): Nouvelles données de la pharmacie
        """
        if 'nom' in data:
            self.nom = data['nom']
        if 'adresse' in data:
            self.adresse = data['adresse']
        if 'latitude' in data:
            self.latitude = data['latitude']
        if 'longitude' in data:
            self.longitude = data['longitude']
        if 'telephone' in data:
            self.telephone = data['telephone']
        if 'email' in data:
            self.email = data['email']
        if 'horaires' in data:
            self.horaires = data['horaires']
        
        # Mise à jour automatique de la date de modification
        self.date_maj = datetime.utcnow()

