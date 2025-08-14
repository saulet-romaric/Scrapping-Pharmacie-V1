/**
 * Composant SearchPage - Page de recherche de pharmacies
 * Permet de rechercher des pharmacies par nom ou adresse
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import { searchPharmacies } from '../services/api';

const SearchPage = () => {
  // États du composant
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });

  /**
   * Effectue la recherche
   * @param {Event} e - Événement du formulaire
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Veuillez saisir un terme de recherche');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = {
        page: 1, // Retour à la première page pour une nouvelle recherche
        per_page: pagination.per_page
      };

      const response = await searchPharmacies(searchQuery, params);
      
      if (response.success) {
        setSearchResults(response.data.pharmacies);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Erreur lors de la recherche');
        setSearchResults([]);
      }
    } catch (err) {
      setError(err.message || 'Impossible d\'effectuer la recherche');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change de page pour les résultats de recherche
   * @param {number} newPage - Nouvelle page
   */
  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: newPage,
          per_page: pagination.per_page
        };

        const response = await searchPharmacies(searchQuery, params);
        
        if (response.success) {
          setSearchResults(response.data.pharmacies);
          setPagination(response.data.pagination);
        } else {
          setError(response.message || 'Erreur lors du changement de page');
        }
      } catch (err) {
        setError(err.message || 'Impossible de charger la page');
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Formate un numéro de téléphone pour l'affichage
   * @param {string} phone - Numéro de téléphone
   * @returns {string} Numéro formaté
   */
  const formatPhone = (phone) => {
    if (!phone) return 'Non disponible';
    
    const cleaned = phone.replace(/\s+/g, '');
    
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
    
    if (address.length > 60) {
      return address.substring(0, 60) + '...';
    }
    
    return address;
  };

  /**
   * Met en surbrillance les termes de recherche dans le texte
   * @param {string} text - Texte à traiter
   * @param {string} query - Terme de recherche
   * @returns {JSX.Element} Texte avec mise en surbrillance
   */
  const highlightText = (text, query) => {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Recherche de Pharmacies
        </h1>
        <p className="text-gray-600">
          Trouvez rapidement les pharmacies d'Abidjan par nom ou adresse
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="form-group">
            <label htmlFor="search" className="form-label">
              Terme de recherche
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Pharmacie Cocody, Plateau, ou nom de rue..."
                className="form-input pl-10 pr-4"
                disabled={loading}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Recherchez par nom de pharmacie, quartier, rue ou adresse
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="btn btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Rechercher
              </>
            )}
          </button>
        </form>
      </div>

      {/* Résultats de la recherche */}
      {hasSearched && (
        <div className="space-y-4">
          
          {/* Résumé de la recherche */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Résultats de la recherche
                </h3>
                <p className="text-blue-700">
                  Terme recherché : <strong>"{searchQuery}"</strong>
                </p>
                {!loading && (
                  <p className="text-blue-600 text-sm">
                    {pagination.total} pharmacie{pagination.total !== 1 ? 's' : ''} trouvée{pagination.total !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {pagination.total > 0 && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    Page {pagination.page} sur {pagination.pages}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="alert alert-error">
              <h4 className="font-semibold">❌ Erreur de recherche</h4>
              <p>{error}</p>
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div className="loading">
              <Loader2 className="spinner" />
              <span>Recherche en cours...</span>
            </div>
          )}

          {/* Résultats */}
          {!loading && searchResults.length > 0 && (
            <>
              {/* Liste des résultats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((pharmacie) => (
                  <div key={pharmacie.id} className="card hover:shadow-lg transition-shadow">
                    
                    {/* En-tête de la carte */}
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {highlightText(pharmacie.nom, searchQuery)}
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
                              {highlightText(formatAddress(pharmacie.adresse), searchQuery)}
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

              {/* Pagination des résultats */}
              {pagination.pages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    
                    {/* Informations de pagination */}
                    <div className="text-sm text-gray-700">
                      Affichage de {((pagination.page - 1) * pagination.per_page) + 1} à{' '}
                      {Math.min(pagination.page * pagination.per_page, pagination.total)} sur{' '}
                      {pagination.total} résultats
                    </div>

                    {/* Navigation des pages */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.has_prev}
                        className="btn btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Précédent
                      </button>

                      {/* Numéros de page */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const pageNum = i + 1;
                          if (pagination.pages <= 5) {
                            return pageNum;
                          }
                          
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
                        Suivant →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Aucun résultat */}
          {!loading && hasSearched && searchResults.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Aucune pharmacie ne correspond à votre recherche "{searchQuery}".
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Suggestions :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vérifiez l'orthographe des mots-clés</li>
                    <li>Essayez des termes plus généraux</li>
                    <li>Utilisez des synonymes</li>
                    <li>Vérifiez que la base de données contient des données</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conseils de recherche */}
      {!hasSearched && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conseils de recherche
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Recherche par nom :</h4>
              <ul className="space-y-1">
                <li>• Nom complet de la pharmacie</li>
                <li>• Partie du nom (ex: "Cocody" pour "Pharmacie Cocody")</li>
                <li>• Nom du pharmacien</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Recherche par localisation :</h4>
              <ul className="space-y-1">
                <li>• Nom du quartier (ex: "Plateau", "Cocody")</li>
                <li>• Nom de la rue ou avenue</li>
                <li>• Point de repère (ex: "Marché", "Aéroport")</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

