/**
 * Service API pour communiquer avec le backend Flask
 * Gère toutes les requêtes HTTP vers l'API des pharmacies
 */

import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter des informations de debug
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour traiter les réponses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Classe principale pour l'API des pharmacies
 */
class PharmaciesAPI {
  
  /**
   * Récupère la page d'accueil de l'API
   * @returns {Promise<Object>} Informations sur l'API
   */
  async getHome() {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Impossible de récupérer les informations de l\'API');
    }
  }

  /**
   * Récupère la liste des pharmacies avec pagination
   * @param {Object} params - Paramètres de pagination et tri
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.per_page - Éléments par page (défaut: 50)
   * @param {string} params.sort_by - Champ de tri (défaut: 'nom')
   * @param {string} params.order - Ordre de tri 'asc' ou 'desc' (défaut: 'asc')
   * @returns {Promise<Object>} Liste des pharmacies avec pagination
   */
  async getPharmacies(params = {}) {
    try {
      const response = await apiClient.get('/api/pharmacies', { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Aucune pharmacie trouvée');
      }
      throw new Error('Impossible de récupérer la liste des pharmacies');
    }
  }

  /**
   * Récupère une pharmacie spécifique par son ID
   * @param {number} id - ID de la pharmacie
   * @returns {Promise<Object>} Données de la pharmacie
   */
  async getPharmacie(id) {
    try {
      const response = await apiClient.get(`/api/pharmacies/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Pharmacie non trouvée');
      }
      throw new Error('Impossible de récupérer les données de la pharmacie');
    }
  }

  /**
   * Recherche des pharmacies par nom ou adresse
   * @param {string} query - Terme de recherche
   * @param {Object} params - Paramètres de pagination
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.per_page - Éléments par page (défaut: 20)
   * @returns {Promise<Object>} Résultats de la recherche avec pagination
   */
  async searchPharmacies(query, params = {}) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Le terme de recherche est requis');
      }

      const searchParams = { q: query.trim(), ...params };
      const response = await apiClient.get('/api/pharmacies/search', { 
        params: searchParams 
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Paramètre de recherche invalide');
      }
      throw new Error('Impossible d\'effectuer la recherche');
    }
  }

  /**
   * Déclenche le processus de scraping des pharmacies
   * @param {boolean} force - Forcer le scraping même si des données existent
   * @returns {Promise<Object>} Résultat du scraping
   */
  async triggerScraping(force = false) {
    try {
      const response = await apiClient.post('/api/scrape', { force });
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('Un processus de scraping est déjà en cours');
      }
      throw new Error('Impossible de lancer le scraping');
    }
  }

  /**
   * Récupère les statistiques de la base de données
   * @returns {Promise<Object>} Statistiques des pharmacies
   */
  async getStats() {
    try {
      const response = await apiClient.get('/api/stats');
      return response.data;
    } catch (error) {
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  /**
   * Met à jour une pharmacie existante
   * @param {number} id - ID de la pharmacie
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Pharmacie mise à jour
   */
  async updatePharmacie(id, data) {
    try {
      const response = await apiClient.put(`/api/pharmacies/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Pharmacie non trouvée');
      }
      if (error.response?.status === 400) {
        throw new Error('Données de mise à jour invalides');
      }
      throw new Error('Impossible de mettre à jour la pharmacie');
    }
  }

  /**
   * Supprime une pharmacie
   * @param {number} id - ID de la pharmacie
   * @returns {Promise<Object>} Confirmation de suppression
   */
  async deletePharmacie(id) {
    try {
      const response = await apiClient.delete(`/api/pharmacies/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Pharmacie non trouvée');
      }
      throw new Error('Impossible de supprimer la pharmacie');
    }
  }

  /**
   * Vérifie la connectivité de l'API
   * @returns {Promise<boolean>} True si l'API est accessible
   */
  async checkConnectivity() {
    try {
      await apiClient.get('/');
      return true;
    } catch (error) {
      console.warn('API non accessible:', error.message);
      return false;
    }
  }

  /**
   * Récupère le statut de l'API
   * @returns {Promise<Object>} Statut de l'API
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/');
      return {
        online: true,
        version: response.data.version,
        timestamp: response.data.timestamp,
        endpoints: response.data.endpoints
      };
    } catch (error) {
      return {
        online: false,
        error: error.message
      };
    }
  }
}

// Instance unique de l'API
const pharmaciesAPI = new PharmaciesAPI();

// Fonctions d'export pour une utilisation simplifiée
export const getPharmacies = (params) => pharmaciesAPI.getPharmacies(params);
export const getPharmacie = (id) => pharmaciesAPI.getPharmacie(id);
export const searchPharmacies = (query, params) => pharmaciesAPI.searchPharmacies(query, params);
export const triggerScraping = (force) => pharmaciesAPI.triggerScraping(force);
export const getStats = () => pharmaciesAPI.getStats();
export const updatePharmacie = (id, data) => pharmaciesAPI.updatePharmacie(id, data);
export const deletePharmacie = (id) => pharmaciesAPI.deletePharmacie(id);
export const checkConnectivity = () => pharmaciesAPI.checkConnectivity();
export const getStatus = () => pharmaciesAPI.getStatus();

// Export de la classe complète pour une utilisation avancée
export default pharmaciesAPI;

