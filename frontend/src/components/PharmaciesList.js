/**
 * Composant PharmaciesList - Liste des pharmacies avec pagination
 * Affiche toutes les pharmacies de la base de données avec navigation
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPharmacies } from '../services/api';

const PharmaciesList = () => {
  // États du composant
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');

  // Charger les pharmacies au montage du composant
  useEffect(() => {
    loadPharmacies();
  }, [pagination.page, pagination.per_page, sortBy, sortOrder]);

  /**
   * Charge la liste des pharmacies depuis l'API
   */
  const loadPharmacies = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        sort_by: sortBy,
        order: sortOrder
      };

      const response = await getPharmacies(params);
      
      if (response.success) {
        setPharmacies(response.data.pharmacies);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des pharmacies');
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les pharmacies');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change de page
   * @param {number} newPage - Nouvelle page
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  /**
   * Change le nombre d'éléments par page
   * @param {number} newPerPage - Nouveau nombre d'éléments par page
   */
  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ ...prev, page: 1, per_page: newPerPage }));
  };

  /**
   * Change le tri
   * @param {string} newSortBy - Nouveau champ de tri
   */
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Inverser l'ordre si c'est le même champ
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, ordre ascendant par défaut
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  /**
   * Formate un numéro de téléphone pour l'affichage
   * @param {string} phone - Numéro de téléphone
   * @returns {string} Numéro formaté
   */
  const formatPhone = (phone) => {
    if (!phone) return 'Non disponible';
    
    // Supprimer les espaces et caractères spéciaux
    const cleaned = phone.replace(/\s+/g, '');
    
    // Format pour les numéros ivoiriens
    if (cleaned.startsWith('+225')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    } else if (cleaned.startsWith('225')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    return phone;
  };

  /**
   * Formate une adresse pour l'affichage
   * @param {string} address - Adresse complète
   * @returns {string} Adresse formatée
   */
  const formatAddress = (address) => {
    if (!address) return 'Adresse non disponible';
    
    // Limiter la longueur pour l'affichage
    if (address.length > 60) {
      return address.substring(0, 60) + '...';
    }
    
    return address;
  };

  // Affichage du chargement
  if (loading && pharmacies.length === 0) {
    return (
      <div className="loading">
        <Loader2 className="spinner" />
        <span>Chargement des pharmacies...</span>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error && pharmacies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="alert alert-error max-w-md mx-auto">
          <h3 className="font-semibold">❌ Erreur de chargement</h3>
          <p>{error}</p>
          <button 
            onClick={loadPharmacies}
            className="btn btn-primary mt-4"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Liste des Pharmacies d'Abidjan
        </h1>
        <p className="text-gray-600">
          {pagination.total} pharmacies trouvées
        </p>
      </div>

      {/* Contrôles de tri et pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Contrôles de tri */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="form-input w-auto text-sm"
            >
              <option value="nom">Nom</option>
              <option value="adresse">Adresse</option>
              <option value="date_creation">Date de création</option>
              <option value="date_maj">Dernière mise à jour</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary text-sm px-3 py-2"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Contrôles de pagination */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Par page :</label>
            <select
              value={pagination.per_page}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="form-input w-auto text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des pharmacies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacie) => (
          <div key={pharmacie.id} className="card hover:shadow-lg transition-shadow">
            
            {/* En-tête de la carte */}
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {pharmacie.nom}
              </h3>
              {pharmacie.horaires && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {pharmacie.horaires}
                </div>
              )}
            </div>

            {/* Corps de la carte */}
            <div className="card-body">
              
              {/* Adresse */}
              <div className="mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {formatAddress(pharmacie.adresse)}
                    </p>
                    {pharmacie.latitude && pharmacie.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        GPS: {pharmacie.latitude.toFixed(6)}, {pharmacie.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                {pharmacie.telephone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      {formatPhone(pharmacie.telephone)}
                    </span>
                  </div>
                )}
                
                {pharmacie.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700 break-all">
                      {pharmacie.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>ID: {pharmacie.id}</span>
                  <span>
                    Mise à jour: {new Date(pharmacie.date_maj).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pied de la carte */}
            <div className="card-footer">
              <Link
                to={`/pharmacie/${pharmacie.id}`}
                className="btn btn-primary w-full text-center"
              >
                Voir les détails
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            
            {/* Informations de pagination */}
            <div className="text-sm text-gray-700">
              Affichage de {((pagination.page - 1) * pagination.per_page) + 1} à{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} sur{' '}
              {pagination.total} pharmacies
            </div>

            {/* Navigation des pages */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="btn btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              {/* Numéros de page */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  if (pagination.pages <= 5) {
                    return pageNum;
                  }
                  
                  // Logique pour afficher les pages autour de la page courante
                  if (pagination.page <= 3) {
                    return pageNum <= 5 ? pageNum : null;
                  } else if (pagination.page >= pagination.pages - 2) {
                    return pageNum >= pagination.pages - 4 ? pageNum : null;
                  } else {
                    return Math.abs(pageNum - pagination.page) <= 2 ? pageNum : null;
                  }
                }).filter(Boolean).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="btn btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune pharmacie */}
      {pharmacies.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune pharmacie trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Il semble qu'il n'y ait pas encore de pharmacies dans la base de données.
            </p>
            <p className="text-sm text-gray-500">
              Utilisez la fonction de scraping depuis la page d'accueil pour récupérer les données.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaciesList;

