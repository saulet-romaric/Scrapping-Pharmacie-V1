#!/bin/bash

echo "========================================"
echo "   PROJET PHARMACIES ABIDJAN"
echo "========================================"
echo ""
echo "Ce script va lancer le backend et le frontend"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

echo ""
echo "[1/3] Démarrage du backend Python..."
cd backend

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel et installer les dépendances
source venv/bin/activate
pip install -r requirements.txt

# Lancer le backend en arrière-plan
echo "Lancement du backend Flask..."
python app.py &
BACKEND_PID=$!

echo ""
echo "[2/3] Attente du démarrage du backend..."
sleep 10

echo ""
echo "[3/3] Démarrage du frontend React..."
cd ../frontend

# Installer les dépendances et lancer le frontend
echo "Installation des dépendances React..."
npm install

echo "Lancement du frontend React..."
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   LANCEMENT TERMINÉ !"
echo "========================================"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les services..."

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Services arrêtés."
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
wait

