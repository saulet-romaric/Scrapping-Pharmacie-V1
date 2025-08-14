/**
 * Composant HomePage - Page d'accueil de l'application
 * Présente l'application et permet de lancer le scraping
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, BarChart3, Play, ArrowRight, Phone, Mail, Clock } from 'lucide-react';
import { triggerScraping } from '../services/api';

const HomePage = () => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState(null);
  const [error, setError] = useState(null);

  // Fonction pour lancer le scraping
  const handleScraping = async () => {
    setIsScraping(true);
    setError(null);
    setScrapingResult(null);

    try {
      const result = await triggerScraping();
      setScrapingResult(result);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du scraping');
    } finally {
      setIsScraping(false);
    }
  };

  // Fonctionnalités principales
  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: 'Localisation GPS',
      description: 'Trouvez les pharmacies avec précision grâce aux coordonnées GPS'
    },
    {
      icon: <Search className="w-8 h-8 text-green-600" />,
      title: 'Recherche avancée',
      description: 'Recherchez par nom, adresse ou quartier'
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: 'Contacts directs',
      description: 'Accédez aux numéros de téléphone et emails'
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: 'Horaires d\'ouverture',
      description: 'Consultez les horaires de vos pharmacies préférées'
    }
  ];

  // Statistiques d'exemple
  const stats = [
    { label: 'Pharmacies', value: '50+', color: 'text-blue-600' },
    { label: 'Quartiers', value: '10', color: 'text-green-600' },
    { label: 'Mise à jour', value: 'Quotidienne', color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-12">
      
      {/* Section Hero */}
      <section className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Pharmacies{' '}
            <span className="text-blue-600">Abidjan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez et localisez toutes les pharmacies d'Abidjan. 
            Une base de données complète et à jour pour vos besoins pharmaceutiques.
          </p>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/pharmacies" 
              className="btn btn-primary text-lg px-8 py-4"
            >
              Voir les pharmacies
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleScraping}
              disabled={isScraping}
              className="btn btn-secondary text-lg px-8 py-4"
            >
              {isScraping ? (
                <>
                  <div className="spinner"></div>
                  Scraping en cours...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Lancer le scraping
                </>
              )}
            </button>
          </div>

          {/* Résultat du scraping */}
          {scrapingResult && (
            <div className="mt-8">
              {scrapingResult.success ? (
                <div className="alert alert-success max-w-md mx-auto">
                  <h4 className="font-semibold">✅ Scraping terminé !</h4>
                  <p>{scrapingResult.data.pharmacies_saved} pharmacies sauvegardées</p>
                  <p className="text-sm">Durée: {scrapingResult.data.duration_seconds}s</p>
                </div>
              ) : (
                <div className="alert alert-error max-w-md mx-auto">
                  <h4 className="font-semibold">❌ Erreur lors du scraping</h4>
                  <p>{scrapingResult.message}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-8">
              <div className="alert alert-error max-w-md mx-auto">
                <h4 className="font-semibold">❌ Erreur</h4>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">
          Fonctionnalités principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center p-6">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-12">
          Statistiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Actions rapides */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Commencez dès maintenant
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explorez notre base de données complète des pharmacies d'Abidjan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/pharmacies" 
              className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              <MapPin className="w-5 h-5" />
              Voir toutes les pharmacies
            </Link>
            <Link 
              to="/search" 
              className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </Link>
          </div>
        </div>
      </section>

      {/* Section Informations */}
      <section className="bg-gray-50 rounded-2xl p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            À propos de cette application
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Cette application web a été développée pour faciliter l'accès aux informations 
            sur les pharmacies d'Abidjan. Elle utilise des techniques de web scraping 
            pour collecter et maintenir à jour les données des pharmacies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Données à jour</h3>
              <p className="text-gray-600 text-sm">
                Mise à jour régulière des informations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Recherche facile</h3>
              <p className="text-gray-600 text-sm">
                Interface intuitive et responsive
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Localisation précise</h3>
              <p className="text-gray-600 text-sm">
                Coordonnées GPS et adresses détaillées
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

