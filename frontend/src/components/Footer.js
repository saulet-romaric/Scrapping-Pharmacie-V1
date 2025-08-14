/**
 * Composant Footer - Pied de page de l'application
 * Contient les informations de contact et les liens utiles
 */

import React from 'react';
import { MapPin, Phone, Mail, Github, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Informations de l'application */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pharmacies Abidjan</h3>
                <p className="text-gray-400 text-sm">
                  Votre guide des pharmacies
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Application web pour localiser et découvrir les pharmacies d'Abidjan. 
              Trouvez facilement la pharmacie la plus proche de chez vous.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/pharmacies" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Liste des pharmacies
                </a>
              </li>
              <li>
                <a 
                  href="/search" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Recherche avancée
                </a>
              </li>
              <li>
                <a 
                  href="/stats" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Statistiques
                </a>
              </li>
            </ul>
          </div>

          {/* Contact et informations */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Informations</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+225 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>contact@pharmacies-abidjan.ci</span>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>&copy; {currentYear} Pharmacies Abidjan. Tous droits réservés.</span>
            </div>

            {/* Liens sociaux et développement */}
            <div className="flex items-center space-x-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <div className="flex items-center space-x-1 text-gray-400 text-sm">
                <span>Fait avec</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>en Côte d'Ivoire</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note de confidentialité */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Cette application respecte votre vie privée. 
            Aucune donnée personnelle n'est collectée ou stockée.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

