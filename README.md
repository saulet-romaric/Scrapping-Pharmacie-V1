# Projet Pharmacies Abidjan

Ce projet permet de récupérer les données des pharmacies d'Abidjan via web scraping et de les afficher sur une interface web moderne.

## 🏗️ Architecture

- **Backend** : API REST Python avec Flask
- **Frontend** : Interface React moderne et responsive
- **Base de données** : SQLite pour la simplicité
- **Scraping** : Récupération automatique des données des pharmacies

## 📁 Structure du projet

```
pharmacies-abidjan/
├── backend/                 # API Python Flask
│   ├── app.py              # Application principale
│   ├── scraper.py          # Module de scraping
│   ├── models.py           # Modèles de données
│   ├── database.py         # Configuration base de données
│   └── requirements.txt    # Dépendances Python
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── services/       # Services API
│   │   └── App.js          # Composant principal
│   ├── package.json        # Dépendances Node.js
│   └── public/             # Fichiers statiques
└── README.md               # Ce fichier
```

## 🚀 Installation et lancement

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend

1. **Créer un environnement virtuel Python :**
```bash
cd backend
python -m venv venv
# Sur Windows :
venv\Scripts\activate
# Sur macOS/Linux :
source venv/bin/activate
```

2. **Installer les dépendances :**
```bash
pip install -r requirements.txt
```

3. **Lancer l'API :**
```bash
python app.py
```

L'API sera accessible sur `http://localhost:5000`

### Frontend

1. **Installer les dépendances :**
```bash
cd frontend
npm install
```

2. **Lancer l'application :**
```bash
npm start
```

L'interface sera accessible sur `http://localhost:3000`

## 🔧 Utilisation

1. **Lancer le backend** pour démarrer l'API
2. **Lancer le frontend** pour accéder à l'interface
3. **Utiliser l'endpoint `/scrape`** pour déclencher le scraping des pharmacies
4. **Consulter l'interface** pour voir la liste des pharmacies récupérées

## 📊 Endpoints API

- `GET /api/pharmacies` : Récupérer toutes les pharmacies
- `POST /api/scrape` : Déclencher le scraping
- `GET /api/pharmacies/search?q=<query>` : Rechercher des pharmacies

## ⚠️ Notes importantes

- Le scraping respecte les bonnes pratiques avec des délais entre les requêtes
- Gestion d'erreurs robuste pour éviter les blocages
- Interface responsive et moderne
- Code commenté pour faciliter la compréhension et la maintenance

## 🤝 Contribution

N'hésitez pas à contribuer au projet en proposant des améliorations ou en signalant des bugs !

