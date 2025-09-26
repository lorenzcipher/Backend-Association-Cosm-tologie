# API Backend - Association de Cosmétologie

## Description

Backend complet pour une plateforme d'association de cosmétologie avec Next.js et MongoDB Atlas.

## Fonctionnalités

### 🔐 Authentification & Autorisation
- Inscription et connexion des membres
- Système de rôles (membre, admin)
- JWT tokens pour l'authentification
- Middleware de protection des routes

### 👤 Gestion des Profils
- Profils détaillés des membres
- Modification des informations personnelles
- Statuts d'adhésion

### 📚 Gestion de Contenu
- Articles publics et réservés aux membres
- Événements et inscriptions
- Galerie multimédia
- Documents téléchargeables

### 💬 Communication
- Messagerie interne entre membres
- Formulaire de contact public
- Annuaire des membres

### ⚙️ Administration
- Gestion des utilisateurs
- Modération du contenu
- Statistiques détaillées
- Gestion des paiements

## Installation et Configuration

### Prérequis
- Node.js 18+
- Compte MongoDB Atlas
- Variables d'environnement configurées

### Installation
```bash
cd cosmeto-association
npm install
```

### Configuration
Créer un fichier `.env.local` avec vos variables d'environnement.

### Démarrage
```bash
npm run dev
```

## Structure de l'API

### Endpoints Publics
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/articles` - Articles publics
- `GET /api/events` - Événements publics
- `POST /api/contact` - Formulaire de contact

### Endpoints Membres
- `GET /api/profile` - Mon profil
- `PUT /api/profile` - Modifier mon profil
- `GET /api/articles?memberOnly=true` - Articles membres
- `GET /api/members` - Annuaire des membres
- `GET /api/messages` - Mes messages
- `POST /api/messages` - Envoyer un message
- `POST /api/events/{id}/register` - S'inscrire à un événement

### Endpoints Administrateur
- `GET /api/admin/users` - Gestion des utilisateurs
- `PUT /api/admin/users/{id}` - Modifier un utilisateur
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `POST /api/articles` - Créer un article
- `PUT /api/articles/{id}` - Modifier un article
- `DELETE /api/articles/{id}` - Supprimer un article
- `GET /api/admin/stats` - Statistiques

## Tests avec Postman

1. Importer la collection `postman_collection.json`
2. Configurer les variables :
   - `baseUrl`: http://localhost:3000/api
   - `token`: sera rempli automatiquement après connexion

3. Tester les endpoints dans cet ordre :
   - Inscription d'un nouveau membre
   - Connexion (le token sera sauvegardé automatiquement)
   - Accès aux endpoints protégés

## Modèles de Données

### User
- email, password, role, isActive, isVerified

### Profile
- userId, firstName, lastName, phone, professionalStatus
- domainOfInterest, address, membershipStatus

### Article
- title, content, excerpt, authorId, tags
- isMemberOnly, isPublished, views

### Event
- title, description, startDate, location
- isMemberOnly, registrationRequired, participants

### Message
- senderId, receiverId, subject, content, isRead

## Sécurité

- Mots de passe hachés avec bcrypt
- Authentification JWT
- Validation des données d'entrée
- Protection CORS configurée
- Rate limiting (à implémenter)

## Performance

- Pagination sur tous les endpoints de liste
- Index MongoDB optimisés
- Cache des requêtes fréquentes (à implémenter)

## Support

Pour toute question technique, consulter la documentation des modèles ou tester avec la collection Postman fournie.