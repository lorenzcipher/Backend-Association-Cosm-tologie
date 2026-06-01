# Guide de Déploiement - Backend Association Cosmétologie

## 🚀 Configuration et Lancement Local

### 1. Prérequis
- Node.js 18+ installé
- Compte MongoDB Atlas
- Git installé

### 2. Configuration MongoDB Atlas

#### Créer un cluster MongoDB Atlas :
1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créez un compte gratuit
3. Créez un nouveau cluster (M0 gratuit)
4. Configurez l'accès réseau (0.0.0.0/0 pour les tests)
5. Créez un utilisateur de base de données

#### Obtenir la chaîne de connexion :
1. Cliquez sur "Connect" sur votre cluster
2. Choisissez "Connect your application"
3. Copiez la chaîne de connexion MongoDB URI

### 3. Configuration des Variables d'Environnement

Modifiez le fichier `.env.local` avec vos vraies valeurs :

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://votre-username:votre-password@cluster0.xxxxx.mongodb.net/cosmeto_association?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=votre-secret-jwt-super-securise-ici-minimum-32-caracteres
JWT_EXPIRE=30d

# Email — relais SMTP cloud (recommandé sur Vercel)
EMAIL_USE_RELAY=true
SMTP_RELAY_PROVIDER=brevo
SMTP_RELAY_USER=votre-login-brevo@smtp-brevo.com
SMTP_RELAY_PASS=xsmtpsib-votre-cle-smtp-brevo
SMTP_RELAY_FROM=notification@fapharmacie.dz

# Email — serveur direct (si non bloqué par l'hébergeur)
# EMAIL_HOST=mail.fapharmacie.dz
# EMAIL_PORT=587
# EMAIL_USER=notification@fapharmacie.dz
# EMAIL_PASS=votre-mot-de-passe
# EMAIL_FROM=notification@fapharmacie.dz

# Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Payment Configuration (Stripe - optionnel)
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# App Configuration
API_BASE_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:3000
```

### 4. Installation et Lancement

```bash
# Aller dans le dossier du projet
cd cosmeto-association

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le serveur sera accessible sur : http://localhost:3000

### 5. Test de l'API

L'API sera disponible sur : http://localhost:3000/api

Endpoints de test rapide :
- GET http://localhost:3000/api/articles (articles publics)
- POST http://localhost:3000/api/contact (formulaire de contact)

## 🌐 Déploiement en Production

### Option 1: Vercel (Recommandé)

1. **Préparer le projet :**
```bash
npm run build
```

2. **Déployer sur Vercel :**
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

3. **Configurer les variables d'environnement sur Vercel :**
   - Allez dans votre dashboard Vercel
   - Sélectionnez votre projet
   - Allez dans Settings > Environment Variables
   - Ajoutez toutes les variables de votre `.env.local`

### Option 2: Railway

1. **Connecter à Railway :**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

2. **Configurer les variables d'environnement :**
```bash
railway variables set MONGODB_URI="votre-uri-mongodb"
railway variables set JWT_SECRET="votre-secret-jwt"
# ... autres variables
```

### Option 3: Heroku

1. **Préparer Heroku :**
```bash
# Installer Heroku CLI
# Créer une app Heroku
heroku create votre-app-name

# Configurer les variables
heroku config:set MONGODB_URI="votre-uri-mongodb"
heroku config:set JWT_SECRET="votre-secret-jwt"
# ... autres variables

# Déployer
git push heroku main
```

## 📊 Monitoring et Logs

### Logs en développement :
```bash
# Voir les logs en temps réel
npm run dev
```

### Logs en production (Vercel) :
```bash
vercel logs
```

## 🔧 Maintenance

### Mise à jour des dépendances :
```bash
npm update
```

### Sauvegarde MongoDB :
```bash
# Utiliser MongoDB Compass ou mongodump
mongodump --uri="votre-mongodb-uri"
```

## 🚨 Dépannage

### Problèmes courants :

1. **Erreur de connexion MongoDB :**
   - Vérifiez votre URI MongoDB
   - Vérifiez les règles de pare-feu (IP whitelist)
   - Vérifiez les credentials

2. **Erreur JWT :**
   - Vérifiez que JWT_SECRET est défini
   - Vérifiez que le token est envoyé dans l'header Authorization

3. **Erreur CORS :**
   - Vérifiez la configuration CORS dans next.config.js

### Commandes de debug :
```bash
# Vérifier les variables d'environnement
node -e "console.log(process.env.MONGODB_URI)"

# Tester la connexion MongoDB
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));
"
```

## 📈 Performance

### Optimisations recommandées :
- Utiliser des index MongoDB appropriés
- Implémenter la mise en cache Redis
- Optimiser les requêtes avec pagination
- Utiliser un CDN pour les fichiers statiques

### Monitoring :
- Utiliser MongoDB Atlas monitoring
- Configurer des alertes sur Vercel/Railway
- Implémenter des logs structurés