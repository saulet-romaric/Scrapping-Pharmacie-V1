"""
Application Flask principale pour l'API des pharmacies d'Abidjan
Fournit une API REST complète pour gérer les données des pharmacies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import os

# Import des modules locaux
from database import init_database, db
from models import Pharmacie
from scraper import PharmacieScraper

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Création de l'application Flask
app = Flask(__name__)

# Configuration CORS pour permettre les requêtes depuis le frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialisation de la base de données
init_database(app)

# Instance du scraper
scraper = PharmacieScraper()

@app.route('/')
def home():
    """
    Route d'accueil de l'API
    
    Returns:
        dict: Informations sur l'API
    """
    return jsonify({
        'message': 'API Pharmacies Abidjan',
        'version': '1.0.0',
        'endpoints': {
            'pharmacies': '/api/pharmacies',
            'scrape': '/api/scrape',
            'search': '/api/pharmacies/search',
            'stats': '/api/stats'
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/pharmacies', methods=['GET'])
def get_pharmacies():
    """
    Récupère toutes les pharmacies de la base de données
    
    Query Parameters:
        page (int): Numéro de page (défaut: 1)
        per_page (int): Nombre d'éléments par page (défaut: 50)
        sort_by (str): Champ de tri (défaut: 'nom')
        order (str): Ordre de tri 'asc' ou 'desc' (défaut: 'asc')
    
    Returns:
        dict: Liste des pharmacies avec pagination
    """
    try:
        # Paramètres de pagination et tri
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)  # Max 100 par page
        sort_by = request.args.get('sort_by', 'nom')
        order = request.args.get('order', 'asc')
        
        # Validation des paramètres de tri
        allowed_sort_fields = ['nom', 'adresse', 'date_creation', 'date_maj']
        if sort_by not in allowed_sort_fields:
            sort_by = 'nom'
        
        # Construction de la requête avec tri
        query = Pharmacie.query
        
        if order == 'desc':
            query = query.order_by(getattr(Pharmacie, sort_by).desc())
        else:
            query = query.order_by(getattr(Pharmacie, sort_by).asc())
        
        # Pagination
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Conversion en dictionnaires
        pharmacies = [pharma.to_dict() for pharma in pagination.items]
        
        return jsonify({
            'success': True,
            'data': {
                'pharmacies': pharmacies,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': pagination.total,
                    'pages': pagination.pages,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            },
            'message': f'Récupération de {len(pharmacies)} pharmacies'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des pharmacies: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des pharmacies'
        }), 500

@app.route('/api/pharmacies/<int:pharmacie_id>', methods=['GET'])
def get_pharmacie(pharmacie_id):
    """
    Récupère une pharmacie spécifique par son ID
    
    Args:
        pharmacie_id (int): ID de la pharmacie
    
    Returns:
        dict: Données de la pharmacie
    """
    try:
        pharmacie = Pharmacie.query.get_or_404(pharmacie_id)
        
        return jsonify({
            'success': True,
            'data': pharmacie.to_dict(),
            'message': 'Pharmacie récupérée avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la pharmacie {pharmacie_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération de la pharmacie'
        }), 500

@app.route('/api/pharmacies/search', methods=['GET'])
def search_pharmacies():
    """
    Recherche des pharmacies par nom ou adresse
    
    Query Parameters:
        q (str): Terme de recherche
        page (int): Numéro de page (défaut: 1)
        per_page (int): Nombre d'éléments par page (défaut: 20)
    
    Returns:
        dict: Résultats de la recherche avec pagination
    """
    try:
        query_term = request.args.get('q', '').strip()
        
        if not query_term:
            return jsonify({
                'success': False,
                'error': 'Paramètre de recherche requis',
                'message': 'Veuillez fournir un terme de recherche'
            }), 400
        
        # Paramètres de pagination
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Recherche dans le nom et l'adresse
        search_query = f"%{query_term}%"
        pharmacies = Pharmacie.query.filter(
            db.or_(
                Pharmacie.nom.ilike(search_query),
                Pharmacie.adresse.ilike(search_query)
            )
        ).order_by(Pharmacie.nom.asc())
        
        # Pagination
        pagination = pharmacies.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Conversion en dictionnaires
        results = [pharma.to_dict() for pharma in pagination.items]
        
        return jsonify({
            'success': True,
            'data': {
                'pharmacies': results,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': pagination.total,
                    'pages': pagination.pages,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                },
                'search_term': query_term
            },
            'message': f'Recherche terminée. {len(results)} résultats trouvés.'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la recherche: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la recherche'
        }), 500

@app.route('/api/scrape', methods=['POST'])
def trigger_scraping():
    """
    Déclenche le processus de scraping des pharmacies
    
    Body (optionnel):
        force (bool): Forcer le scraping même si des données existent
    
    Returns:
        dict: Résultat du scraping
    """
    try:
        # Vérification si le scraping est déjà en cours
        if hasattr(app, 'scraping_in_progress') and app.scraping_in_progress:
            return jsonify({
                'success': False,
                'error': 'Scraping déjà en cours',
                'message': 'Un processus de scraping est déjà en cours d\'exécution'
            }), 409
        
        # Récupération des paramètres
        data = request.get_json() or {}
        force = data.get('force', False)
        
        # Vérification si des données existent déjà
        existing_count = Pharmacie.query.count()
        if existing_count > 0 and not force:
            return jsonify({
                'success': False,
                'error': 'Données existantes',
                'message': f'Il existe déjà {existing_count} pharmacies en base. Utilisez force=true pour forcer le scraping.'
            }), 409
        
        # Marquer le scraping comme en cours
        app.scraping_in_progress = True
        
        try:
            # Lancement du scraping
            logger.info("🚀 Démarrage du scraping des pharmacies")
            result = scraper.run_full_scraping()
            
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Scraping terminé avec succès'
            })
            
        finally:
            # Marquer le scraping comme terminé
            app.scraping_in_progress = False
        
    except Exception as e:
        logger.error(f"Erreur lors du scraping: {e}")
        app.scraping_in_progress = False
        
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors du scraping'
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Récupère les statistiques de la base de données
    
    Returns:
        dict: Statistiques des pharmacies
    """
    try:
        # Comptage total
        total_pharmacies = Pharmacie.query.count()
        
        # Pharmacies avec coordonnées GPS
        with_coords = Pharmacie.query.filter(
            Pharmacie.latitude.isnot(None),
            Pharmacie.longitude.isnot(None)
        ).count()
        
        # Pharmacies avec téléphone
        with_phone = Pharmacie.query.filter(
            Pharmacie.telephone.isnot(None)
        ).count()
        
        # Pharmacies avec email
        with_email = Pharmacie.query.filter(
            Pharmacie.email.isnot(None)
        ).count()
        
        # Dernière mise à jour
        last_update = Pharmacie.query.order_by(
            Pharmacie.date_maj.desc()
        ).first()
        
        stats = {
            'total_pharmacies': total_pharmacies,
            'with_coordinates': with_coords,
            'with_phone': with_phone,
            'with_email': with_email,
            'last_update': last_update.date_maj.isoformat() if last_update else None,
            'database_size_mb': round(os.path.getsize('pharmacies.db') / (1024 * 1024), 2) if os.path.exists('pharmacies.db') else 0
        }
        
        return jsonify({
            'success': True,
            'data': stats,
            'message': 'Statistiques récupérées avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500

@app.route('/api/pharmacies/<int:pharmacie_id>', methods=['PUT'])
def update_pharmacie(pharmacie_id):
    """
    Met à jour une pharmacie existante
    
    Args:
        pharmacie_id (int): ID de la pharmacie
    
    Body:
        dict: Données à mettre à jour
    
    Returns:
        dict: Pharmacie mise à jour
    """
    try:
        pharmacie = Pharmacie.query.get_or_404(pharmacie_id)
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Données de mise à jour requises',
                'message': 'Veuillez fournir les données à mettre à jour'
            }), 400
        
        # Mise à jour de la pharmacie
        pharmacie.update_from_dict(data)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': pharmacie.to_dict(),
            'message': 'Pharmacie mise à jour avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de la pharmacie {pharmacie_id}: {e}")
        db.session.rollback()
        
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la mise à jour de la pharmacie'
        }), 500

@app.route('/api/pharmacies/<int:pharmacie_id>', methods=['DELETE'])
def delete_pharmacie(pharmacie_id):
    """
    Supprime une pharmacie
    
    Args:
        pharmacie_id (int): ID de la pharmacie
    
    Returns:
        dict: Confirmation de suppression
    """
    try:
        pharmacie = Pharmacie.query.get_or_404(pharmacie_id)
        
        db.session.delete(pharmacie)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Pharmacie {pharmacie.nom} supprimée avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la pharmacie {pharmacie_id}: {e}")
        db.session.rollback()
        
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la suppression de la pharmacie'
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Gestionnaire d'erreur 404"""
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'message': 'L\'endpoint demandé n\'existe pas'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Gestionnaire d'erreur 500"""
    logger.error(f"Erreur interne du serveur: {error}")
    return jsonify({
        'success': False,
        'error': 'Erreur interne du serveur',
        'message': 'Une erreur inattendue s\'est produite'
    }), 500

if __name__ == '__main__':
    # Configuration pour le développement
    app.config['DEBUG'] = True
    
    # Lancement de l'application
    logger.info("🚀 Démarrage de l'API Pharmacies Abidjan")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

