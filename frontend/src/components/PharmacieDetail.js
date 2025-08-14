/**
 * Composant PharmacieDetail - Détails d'une pharmacie
 * Affiche toutes les informations détaillées d'une pharmacie spécifique
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, ArrowLeft, Edit, Trash2, 
  Navigation, ExternalLink, Calendar, Database, Loader2 
} from 'lucide-react';
import { getPharmacie, updatePharmacie, deletePharmacie } from '../services/api';

const PharmacieDetail = () => {
  // États du composant
  const [pharmacie, setPharmacie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hooks React Router
  const { id } = useParams();
  const navigate = useNavigate();

  // Charger les données de la pharmacie au montage du composant
  useEffect(() => {
    loadPharmacie();
  }, [id]);

  /**
   * Charge les données de la pharmacie depuis l'API
   */
  const loadPharmacie = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPharmacie(id);
      
      if (response.success) {
        setPharmacie(response.data);
        setEditForm(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement de la pharmacie');
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les données de la pharmacie');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les changements dans le formulaire d'édition
   * @param {Event} e - Événement de changement
   */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Sauvegarde les modifications de la pharmacie
   */
  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await updatePharmacie(id, editForm);
      
      if (response.success) {
        setPharmacie(response.data);
        setEditForm(response.data);
        setIsEditing(false);
        setSaveSuccess(true);
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(response.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setSaveError(err.message || 'Impossible de sauvegarder les modifications');
    }
  };

  /**
   * Annule l'édition
   */
  const handleCancel = () => {
    setEditForm(pharmacie);
    setIsEditing(false);
    setSaveError(null);
  };

  /**
   * Supprime la pharmacie
   */
  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la pharmacie "${pharmacie.nom}" ?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deletePharmacie(id);
      
      if (response.success) {
        navigate('/pharmacies');
      } else {
        setError(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError(err.message || 'Impossible de supprimer la pharmacie');
    } finally {
      setIsDeleting(false);
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
   * Ouvre Google Maps avec les coordonnées de la pharmacie
   */
  const openInGoogleMaps = () => {
    if (pharmacie.latitude && pharmacie.longitude) {
      const url = `https://www.google.com/maps?q=${pharmacie.latitude},${pharmacie.longitude}`;
      window.open(url, '_blank');
    }
  };

  /**
   * Formate une date pour l'affichage
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="loading">
        <Loader2 className="spinner" />
        <span>Chargement de la pharmacie...</span>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="alert alert-error max-w-md mx-auto">
          <h3 className="font-semibold">❌ Erreur de chargement</h3>
          <p>{error}</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={loadPharmacie}
              className="btn btn-primary"
            >
              Réessayer
            </button>
            <Link to="/pharmacies" className="btn btn-secondary">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si aucune pharmacie trouvée
  if (!pharmacie) {
    return (
      <div className="text-center py-12">
        <div className="alert alert-error max-w-md mx-auto">
          <h3 className="font-semibold">❌ Pharmacie non trouvée</h3>
          <p>La pharmacie demandée n'existe pas ou a été supprimée.</p>
          <Link to="/pharmacies" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/pharmacies" 
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Modifier la pharmacie' : pharmacie.nom}
            </h1>
            <p className="text-gray-600">
              Détails complets de la pharmacie
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-warning"
              >
                {isDeleting ? (
                  <Loader2 className="spinner" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages de succès/erreur */}
      {saveSuccess && (
        <div className="alert alert-success">
          <h4 className="font-semibold">✅ Modifications sauvegardées</h4>
          <p>Les informations de la pharmacie ont été mises à jour avec succès.</p>
        </div>
      )}

      {saveError && (
        <div className="alert alert-error">
          <h4 className="font-semibold">❌ Erreur de sauvegarde</h4>
          <p>{saveError}</p>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Carte des informations de base */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations Générales
              </h2>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="nom" className="form-label">Nom de la pharmacie</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={editForm.nom || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="adresse" className="form-label">Adresse</label>
                    <textarea
                      id="adresse"
                      name="adresse"
                      value={editForm.adresse || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="horaires" className="form-label">Horaires d'ouverture</label>
                    <input
                      type="text"
                      id="horaires"
                      name="horaires"
                      value={editForm.horaires || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      placeholder="Ex: 8h-18h, 24h/24"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Nom</h3>
                    <p className="text-gray-700">{pharmacie.nom}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Adresse</h3>
                    <p className="text-gray-700">{pharmacie.adresse}</p>
                  </div>
                  {pharmacie.horaires && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Horaires</h3>
                      <p className="text-gray-700">{pharmacie.horaires}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Carte des coordonnées GPS */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Localisation GPS
              </h2>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="latitude" className="form-label">Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={editForm.latitude || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      step="any"
                      placeholder="Ex: 5.3600"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="longitude" className="form-label">Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={editForm.longitude || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      step="any"
                      placeholder="Ex: -4.0083"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pharmacie.latitude && pharmacie.longitude ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Latitude</h3>
                          <p className="text-gray-700 font-mono">{pharmacie.latitude}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Longitude</h3>
                          <p className="text-gray-700 font-mono">{pharmacie.longitude}</p>
                        </div>
                      </div>
                      <button
                        onClick={openInGoogleMaps}
                        className="btn btn-primary"
                      >
                        <Navigation className="w-4 h-4" />
                        Voir sur Google Maps
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">
                      Coordonnées GPS non disponibles
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Carte des contacts */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations de Contact
              </h2>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="telephone" className="form-label">Numéro de téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={editForm.telephone || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      placeholder="Ex: +225 27 22 12 34"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Adresse email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleEditChange}
                      className="form-input"
                      placeholder="Ex: contact@pharmacie.ci"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-green-600" />
                      Téléphone
                    </h3>
                    <p className="text-gray-700">{formatPhone(pharmacie.telephone)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-purple-600" />
                      Email
                    </h3>
                    <p className="text-gray-700">
                      {pharmacie.email ? (
                        <a 
                          href={`mailto:${pharmacie.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {pharmacie.email}
                        </a>
                      ) : (
                        'Non disponible'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre latérale */}
        <div className="space-y-6">
          
          {/* Carte des métadonnées */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Database className="w-5 h-5 mr-2 text-gray-600" />
                Métadonnées
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Identifiant</h3>
                  <p className="text-gray-700 font-mono">{pharmacie.id}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date de création
                  </h3>
                  <p className="text-gray-700">{formatDate(pharmacie.date_creation)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Dernière mise à jour
                  </h3>
                  <p className="text-gray-700">{formatDate(pharmacie.date_maj)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Actions Rapides</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link
                  to="/pharmacies"
                  className="btn btn-secondary w-full justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la liste
                </Link>
                <Link
                  to="/search"
                  className="btn btn-primary w-full justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Rechercher d'autres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions d'édition */}
      {isEditing && (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn btn-success"
          >
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
};

export default PharmacieDetail;

