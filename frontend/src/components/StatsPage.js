/**
 * Composant StatsPage - Page des statistiques
 * Affiche les statistiques de la base de données des pharmacies
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, Phone, Mail, Database, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { getStats } from '../services/api';

const StatsPage = () => {
  // États du composant
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Charger les statistiques au montage du composant
  useEffect(() => {
    loadStats();
    
    // Mettre à jour les stats toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Charge les statistiques depuis l'API
   */
  const loadStats = async () => {
    try {
      const response = await getStats();
      
      if (response.success) {
        setStats(response.data);
        setLastUpdate(new Date());
      } else {
        setError(response.message || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formate la taille de la base de données
   * @param {number} sizeMB - Taille en MB
   * @returns {string} Taille formatée
   */
  const formatDatabaseSize = (sizeMB) => {
    if (sizeMB < 1) {
      return `${(sizeMB * 1024).toFixed(2)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  /**
   * Formate une date pour l'affichage
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  /**
   * Calcule le pourcentage d'une valeur par rapport au total
   * @param {number} value - Valeur
   * @param {number} total - Total
   * @returns {number} Pourcentage
   */
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Affichage du chargement
  if (loading && !stats) {
    return (
      <div className="loading">
        <Loader2 className="spinner" />
        <span>Chargement des statistiques...</span>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="alert alert-error max-w-md mx-auto">
          <h3 className="font-semibold">❌ Erreur de chargement</h3>
          <p>{error}</p>
          <button 
            onClick={loadStats}
            className="btn btn-primary mt-4"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* En-tête de la page */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Statistiques de la Base de Données
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble des pharmacies d'Abidjan enregistrées
        </p>
        {lastUpdate && (
          <p className="text-sm text-gray-500 mt-2">
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </div>

      {/* Statistiques principales */}
      {stats && (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total des pharmacies */}
            <div className="card text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.total_pharmacies}
              </h3>
              <p className="text-gray-600">Pharmacies totales</p>
            </div>

            {/* Pharmacies avec coordonnées GPS */}
            <div className="card text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.with_coordinates}
              </h3>
              <p className="text-gray-600">Avec coordonnées GPS</p>
              <p className="text-sm text-green-600 mt-1">
                {calculatePercentage(stats.with_coordinates, stats.total_pharmacies)}%
              </p>
            </div>

            {/* Pharmacies avec téléphone */}
            <div className="card text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.with_phone}
              </h3>
              <p className="text-gray-600">Avec téléphone</p>
              <p className="text-sm text-purple-600 mt-1">
                {calculatePercentage(stats.with_phone, stats.total_pharmacies)}%
              </p>
            </div>

            {/* Pharmacies avec email */}
            <div className="card text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.with_email}
              </h3>
              <p className="text-gray-600">Avec email</p>
              <p className="text-sm text-orange-600 mt-1">
                {calculatePercentage(stats.with_email, stats.total_pharmacies)}%
              </p>
            </div>
          </div>

          {/* Graphiques et visualisations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Répartition des données */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Répartition des Données
              </h3>
              
              <div className="space-y-4">
                {/* Barre de progression pour les coordonnées GPS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Coordonnées GPS</span>
                    <span className="text-sm text-gray-500">
                      {stats.with_coordinates} / {stats.total_pharmacies}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculatePercentage(stats.with_coordinates, stats.total_pharmacies)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Barre de progression pour les téléphones */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Numéros de téléphone</span>
                    <span className="text-sm text-gray-500">
                      {stats.with_phone} / {stats.total_pharmacies}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculatePercentage(stats.with_phone, stats.total_pharmacies)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Barre de progression pour les emails */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Adresses email</span>
                    <span className="text-sm text-gray-500">
                      {stats.with_email} / {stats.total_pharmacies}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculatePercentage(stats.with_email, stats.total_pharmacies)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Informations Système
              </h3>
              
              <div className="space-y-4">
                {/* Taille de la base de données */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Taille de la base</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDatabaseSize(stats.database_size_mb)}
                  </span>
                </div>

                {/* Dernière mise à jour */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Dernière mise à jour</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDate(stats.last_update)}
                  </span>
                </div>

                {/* Qualité des données */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">Qualité des données</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(() => {
                      const totalFields = stats.total_pharmacies * 3; // 3 champs optionnels
                      const filledFields = stats.with_coordinates + stats.with_phone + stats.with_email;
                      const quality = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
                      return `${quality}%`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions et recommandations */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Actions Recommandées
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amélioration des données */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Amélioration des données</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {stats.with_coordinates < stats.total_pharmacies && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Ajouter les coordonnées GPS manquantes
                    </li>
                  )}
                  {stats.with_phone < stats.total_pharmacies && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Compléter les numéros de téléphone
                    </li>
                  )}
                  {stats.with_email < stats.total_pharmacies && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Ajouter les adresses email
                    </li>
                  )}
                  {stats.total_pharmacies === 0 && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Aucune pharmacie en base - Lancer le scraping
                    </li>
                  )}
                </ul>
              </div>

              {/* Statut de la base */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Statut de la base</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complétude GPS</span>
                    <span className={`text-sm font-medium ${
                      calculatePercentage(stats.with_coordinates, stats.total_pharmacies) >= 80 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {calculatePercentage(stats.with_coordinates, stats.total_pharmacies)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complétude téléphone</span>
                    <span className={`text-sm font-medium ${
                      calculatePercentage(stats.with_phone, stats.total_pharmacies) >= 80 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {calculatePercentage(stats.with_phone, stats.total_pharmacies)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complétude email</span>
                    <span className={`text-sm font-medium ${
                      calculatePercentage(stats.with_email, stats.total_pharmacies) >= 80 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {calculatePercentage(stats.with_email, stats.total_pharmacies)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bouton de rafraîchissement */}
      <div className="text-center">
        <button 
          onClick={loadStats}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="spinner" />
              Actualisation...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Actualiser les statistiques
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StatsPage;

