/**
 * Composant principal de l'application Pharmacies Abidjan
 * Gère le routage et la structure générale de l'interface
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import des composants
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PharmaciesList from './components/PharmaciesList';
import PharmacieDetail from './components/PharmacieDetail';
import SearchPage from './components/SearchPage';
import StatsPage from './components/StatsPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* En-tête de l'application */}
        <Header />
        
        {/* Contenu principal avec routage */}
        <main className="main-content">
          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<HomePage />} />
            
            {/* Liste des pharmacies */}
            <Route path="/pharmacies" element={<PharmaciesList />} />
            
            {/* Détail d'une pharmacie */}
            <Route path="/pharmacie/:id" element={<PharmacieDetail />} />
            
            {/* Page de recherche */}
            <Route path="/search" element={<SearchPage />} />
            
            {/* Page des statistiques */}
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
        
        {/* Pied de page */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

