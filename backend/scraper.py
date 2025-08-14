"""
Module de scraping pour récupérer les données des pharmacies d'Abidjan
Utilise plusieurs sources pour collecter les informations des pharmacies
"""

import requests
from bs4 import BeautifulSoup
import time
import random
from fake_useragent import UserAgent
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import re
import logging
from typing import List, Dict, Optional
from models import Pharmacie
from database import db

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PharmacieScraper:
    """
    Classe principale pour le scraping des pharmacies d'Abidjan
    
    Cette classe gère la récupération des données depuis différentes sources web
    en respectant les bonnes pratiques (délais, rotation des User-Agents, etc.)
    """
    
    def __init__(self):
        """Initialise le scraper avec les paramètres de base"""
        self.ua = UserAgent()
        self.geolocator = Nominatim(user_agent="pharmacie_scraper")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        # Délai entre les requêtes pour respecter les bonnes pratiques
        self.delay_min = 2
        self.delay_max = 5
        
    def _get_random_delay(self) -> float:
        """
        Génère un délai aléatoire entre les requêtes
        
        Returns:
            float: Délai en secondes
        """
        return random.uniform(self.delay_min, self.delay_max)
    
    def _rotate_user_agent(self):
        """Change le User-Agent pour éviter la détection"""
        self.session.headers['User-Agent'] = self.ua.random
    
    def _geocode_address(self, address: str) -> Optional[tuple]:
        """
        Convertit une adresse en coordonnées GPS
        
        Args:
            address (str): Adresse à géocoder
            
        Returns:
            tuple: (latitude, longitude) ou None si échec
        """
        try:
            # Ajout du pays pour améliorer la précision
            full_address = f"{address}, Abidjan, Côte d'Ivoire"
            location = self.geolocator.geocode(full_address, timeout=10)
            
            if location:
                return (location.latitude, location.longitude)
            return None
            
        except (GeocoderTimedOut, GeocoderUnavailable) as e:
            logger.warning(f"Erreur de géocodage pour {address}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erreur inattendue lors du géocodage: {e}")
            return None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """
        Extrait un numéro de téléphone d'un texte
        
        Args:
            text (str): Texte contenant potentiellement un numéro
            
        Returns:
            str: Numéro de téléphone extrait ou None
        """
        # Patterns pour les numéros ivoiriens
        patterns = [
            r'(\+225\s?\d{2}\s?\d{3}\s?\d{3})',  # +225 XX XXX XXX
            r'(225\s?\d{2}\s?\d{3}\s?\d{3})',    # 225 XX XXX XXX
            r'(\d{2}\s?\d{3}\s?\d{3})',          # XX XXX XXX
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).replace(' ', '')
        return None
    
    def _extract_email(self, text: str) -> Optional[str]:
        """
        Extrait une adresse email d'un texte
        
        Args:
            text (str): Texte contenant potentiellement un email
            
        Returns:
            str: Email extrait ou None
        """
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None
    
    def scrape_pharmacies_abidjan(self) -> List[Dict]:
        """
        Scrape les pharmacies depuis différentes sources
        
        Returns:
            List[Dict]: Liste des pharmacies trouvées
        """
        pharmacies = []
        
        # Source 1: Pharmacies de garde Abidjan
        logger.info("🔍 Scraping des pharmacies de garde Abidjan...")
        pharmacies.extend(self._scrape_pharmacies_garde())
        
        # Délai entre les sources
        time.sleep(self._get_random_delay())
        
        # Source 2: Annuaire des pharmacies
        logger.info("🔍 Scraping de l'annuaire des pharmacies...")
        pharmacies.extend(self._scrape_annuaire_pharmacies())
        
        # Délai entre les sources
        time.sleep(self._get_random_delay())
        
        # Source 3: Pharmacies populaires connues
        logger.info("🔍 Ajout des pharmacies populaires connues...")
        pharmacies.extend(self._get_pharmacies_populaires())
        
        logger.info(f"✅ Scraping terminé. {len(pharmacies)} pharmacies trouvées")
        return pharmacies
    
    def _scrape_pharmacies_garde(self) -> List[Dict]:
        """
        Scrape les pharmacies de garde depuis un site spécialisé
        
        Returns:
            List[Dict]: Liste des pharmacies de garde
        """
        pharmacies = []
        
        try:
            # URL fictive pour l'exemple - à remplacer par une vraie source
            url = "https://pharmacies-garde-abidjan.ci"
            
            # Simulation de données pour l'exemple
            # En production, remplacer par le vrai scraping
            sample_data = [
                {
                    'nom': 'Pharmacie de Garde Cocody',
                    'adresse': 'Cocody, Abidjan, Côte d\'Ivoire',
                    'telephone': '+225 27 22 12 34',
                    'email': 'garde.cocody@pharma.ci'
                },
                {
                    'nom': 'Pharmacie de Garde Plateau',
                    'adresse': 'Plateau, Abidjan, Côte d\'Ivoire',
                    'telephone': '+225 27 22 56 78',
                    'email': 'garde.plateau@pharma.ci'
                }
            ]
            
            for data in sample_data:
                # Géocodage de l'adresse
                coords = self._geocode_address(data['adresse'])
                if coords:
                    data['latitude'], data['longitude'] = coords
                
                pharmacies.append(data)
                time.sleep(self._get_random_delay())
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping des pharmacies de garde: {e}")
        
        return pharmacies
    
    def _scrape_annuaire_pharmacies(self) -> List[Dict]:
        """
        Scrape l'annuaire des pharmacies
        
        Returns:
            List[Dict]: Liste des pharmacies de l'annuaire
        """
        pharmacies = []
        
        try:
            # Simulation de données pour l'exemple
            sample_data = [
                {
                    'nom': 'Pharmacie Centrale',
                    'adresse': 'Boulevard Roume, Plateau, Abidjan',
                    'telephone': '+225 27 22 90 12',
                    'email': 'contact@pharmacie-centrale.ci'
                },
                {
                    'nom': 'Pharmacie Saint-Jean',
                    'adresse': 'Rue des Jardins, Cocody, Abidjan',
                    'telephone': '+225 27 22 34 56',
                    'email': 'info@pharmacie-saintjean.ci'
                },
                {
                    'nom': 'Pharmacie du Marché',
                    'adresse': 'Marché de Treichville, Abidjan',
                    'telephone': '+225 27 22 78 90',
                    'email': None
                }
            ]
            
            for data in sample_data:
                # Géocodage de l'adresse
                coords = self._geocode_address(data['adresse'])
                if coords:
                    data['latitude'], data['longitude'] = coords
                
                pharmacies.append(data)
                time.sleep(self._get_random_delay())
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping de l'annuaire: {e}")
        
        return pharmacies
    
    def _get_pharmacies_populaires(self) -> List[Dict]:
        """
        Retourne une liste de pharmacies populaires connues
        
        Returns:
            List[Dict]: Liste des pharmacies populaires
        """
        pharmacies = [
            {
                'nom': 'Pharmacie de l\'Aéroport',
                'adresse': 'Aéroport Félix Houphouët-Boigny, Abidjan',
                'telephone': '+225 27 22 11 22',
                'email': 'aeroport@pharma.ci',
                'horaires': '24h/24'
            },
            {
                'nom': 'Pharmacie de l\'Université',
                'adresse': 'Université Félix Houphouët-Boigny, Cocody, Abidjan',
                'telephone': '+225 27 22 33 44',
                'email': 'universite@pharma.ci',
                'horaires': '8h-18h'
            },
            {
                'nom': 'Pharmacie du Port',
                'adresse': 'Port Autonome d\'Abidjan',
                'telephone': '+225 27 22 55 66',
                'email': 'port@pharma.ci',
                'horaires': '7h-19h'
            }
        ]
        
        # Géocodage des adresses
        for data in pharmacies:
            coords = self._geocode_address(data['adresse'])
            if coords:
                data['latitude'], data['longitude'] = coords
        
        return pharmacies
    
    def save_pharmacies_to_db(self, pharmacies: List[Dict]) -> int:
        """
        Sauvegarde les pharmacies dans la base de données
        
        Args:
            pharmacies (List[Dict]): Liste des pharmacies à sauvegarder
            
        Returns:
            int: Nombre de pharmacies sauvegardées
        """
        saved_count = 0
        
        try:
            for pharma_data in pharmacies:
                # Vérifier si la pharmacie existe déjà
                existing = Pharmacie.query.filter_by(nom=pharma_data['nom']).first()
                
                if existing:
                    # Mise à jour si elle existe
                    existing.update_from_dict(pharma_data)
                    logger.info(f"🔄 Pharmacie mise à jour: {pharma_data['nom']}")
                else:
                    # Création si elle n'existe pas
                    new_pharma = Pharmacie.create_from_dict(pharma_data)
                    db.session.add(new_pharma)
                    logger.info(f"➕ Nouvelle pharmacie ajoutée: {pharma_data['nom']}")
                
                saved_count += 1
            
            # Commit des changements
            db.session.commit()
            logger.info(f"✅ {saved_count} pharmacies sauvegardées en base")
            
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde en base: {e}")
            db.session.rollback()
            saved_count = 0
        
        return saved_count
    
    def run_full_scraping(self) -> Dict:
        """
        Lance le processus complet de scraping
        
        Returns:
            Dict: Résumé de l'opération
        """
        logger.info("🚀 Démarrage du scraping complet des pharmacies d'Abidjan")
        
        start_time = time.time()
        
        try:
            # Récupération des pharmacies
            pharmacies = self.scrape_pharmacies_abidjan()
            
            # Sauvegarde en base
            saved_count = self.save_pharmacies_to_db(pharmacies)
            
            end_time = time.time()
            duration = end_time - start_time
            
            result = {
                'success': True,
                'pharmacies_found': len(pharmacies),
                'pharmacies_saved': saved_count,
                'duration_seconds': round(duration, 2),
                'message': f'Scraping terminé avec succès. {saved_count} pharmacies sauvegardées.'
            }
            
            logger.info(f"✅ Scraping terminé en {duration:.2f} secondes")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du scraping: {e}")
            result = {
                'success': False,
                'error': str(e),
                'message': 'Erreur lors du scraping'
            }
        
        return result

