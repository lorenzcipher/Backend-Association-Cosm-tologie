# Collection CURL - API Association Cosmétologie

## Variables d'environnement
```bash
export BASE_URL="http://localhost:3000/api"
export TOKEN=""  # Sera rempli après connexion
```

## 🔐 Authentification

### Inscription d'un nouveau membre
```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "membre@example.com",
    "password": "motdepasse123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+33123456789",
    "professionalStatus": "professional",
    "domainOfInterest": ["skincare", "research"]
  }'
```

### Connexion (récupérer le token)
```bash
# Connexion membre
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "membre@example.com",
    "password": "motdepasse123"
  }'

# Connexion admin
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Sauvegarder le token retourné
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 👤 Gestion du Profil

### Obtenir mon profil
```bash
curl -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier mon profil
```bash
curl -X PUT "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33987654321",
    "biography": "Expert en cosmétologie avec 10 ans d'\''expérience",
    "city": "Paris",
    "country": "France",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/jeandupont",
      "website": "https://jeandupont-cosmetologie.fr"
    }
  }'
```

## 📚 Articles et Actualités

### Liste des articles publics
```bash
curl -X GET "$BASE_URL/articles?page=1&limit=10"
```

### Articles réservés aux membres
```bash
curl -X GET "$BASE_URL/articles?memberOnly=true&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Obtenir un article spécifique
```bash
curl -X GET "$BASE_URL/articles/ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un article (Admin uniquement)
```bash
curl -X POST "$BASE_URL/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nouvelles tendances en cosmétologie 2024",
    "content": "Contenu complet de l'\''article avec toutes les informations détaillées sur les dernières innovations en cosmétologie...",
    "excerpt": "Découvrez les dernières innovations en cosmétologie pour l'\''année 2024",
    "featuredImage": "https://example.com/image.jpg",
    "tags": ["tendances", "innovation", "2024"],
    "isMemberOnly": false,
    "isPublished": true
  }'
```

### Modifier un article (Admin uniquement)
```bash
curl -X PUT "$BASE_URL/articles/ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Titre modifié",
    "isPublished": true
  }'
```

### Supprimer un article (Admin uniquement)
```bash
curl -X DELETE "$BASE_URL/articles/ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎉 Événements

### Liste des événements publics
```bash
curl -X GET "$BASE_URL/events?page=1&limit=10"
```

### Événements à venir uniquement
```bash
curl -X GET "$BASE_URL/events?upcoming=true"
```

### Créer un événement (Admin uniquement)
```bash
curl -X POST "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Congrès International de Cosmétologie 2024",
    "description": "Le plus grand rassemblement de professionnels de la cosmétologie en Europe",
    "startDate": "2024-06-15T09:00:00Z",
    "endDate": "2024-06-17T18:00:00Z",
    "location": "Centre de Congrès de Paris",
    "isOnline": false,
    "isMemberOnly": true,
    "maxParticipants": 500,
    "registrationRequired": true,
    "registrationDeadline": "2024-06-01T23:59:59Z"
  }'
```

### S'inscrire à un événement
```bash
curl -X POST "$BASE_URL/events/EVENT_ID/register" \
  -H "Authorization: Bearer $TOKEN"
```

### Se désinscrire d'un événement
```bash
curl -X DELETE "$BASE_URL/events/EVENT_ID/register" \
  -H "Authorization: Bearer $TOKEN"
```

## 📞 Contact

### Envoyer un message de contact
```bash
curl -X POST "$BASE_URL/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marie Dubois",
    "email": "marie.dubois@example.com",
    "subject": "Demande d'\''informations sur l'\''adhésion",
    "message": "Bonjour, je souhaiterais obtenir plus d'\''informations sur les modalités d'\''adhésion à votre association."
  }'
```

## 💬 Messagerie Interne

### Mes messages reçus
```bash
curl -X GET "$BASE_URL/messages?type=received&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Mes messages envoyés
```bash
curl -X GET "$BASE_URL/messages?type=sent&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Envoyer un message à un membre
```bash
curl -X POST "$BASE_URL/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "USER_ID_DESTINATAIRE",
    "subject": "Collaboration possible",
    "content": "Bonjour, je serais intéressé(e) par une collaboration sur votre projet de recherche."
  }'
```

## 👥 Annuaire des Membres

### Liste des membres actifs
```bash
curl -X GET "$BASE_URL/members?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Rechercher des membres
```bash
curl -X GET "$BASE_URL/members?search=Jean&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

## ⚙️ Administration

### Liste de tous les utilisateurs (Admin)
```bash
curl -X GET "$BASE_URL/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Filtrer les utilisateurs par statut (Admin)
```bash
curl -X GET "$BASE_URL/admin/users?status=active&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier un utilisateur (Admin)
```bash
curl -X PUT "$BASE_URL/admin/users/USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "isActive": true,
    "isVerified": true
  }'
```

### Supprimer un utilisateur (Admin)
```bash
curl -X DELETE "$BASE_URL/admin/users/USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Statistiques globales (Admin)
```bash
curl -X GET "$BASE_URL/admin/stats" \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Tests Complets

### Script de test automatisé
```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api"
TOKEN=""

echo "🚀 Test de l'API Association Cosmétologie"

# Test 1: Inscription
echo "📝 Test inscription..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User",
    "professionalStatus": "student",
    "domainOfInterest": ["skincare"]
  }')

echo "Réponse inscription: $REGISTER_RESPONSE"

# Test 2: Connexion
echo "🔐 Test connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token récupéré: ${TOKEN:0:20}..."

# Test 3: Profil
echo "👤 Test profil..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Profil: $PROFILE_RESPONSE"

# Test 4: Articles publics
echo "📚 Test articles publics..."
ARTICLES_RESPONSE=$(curl -s -X GET "$BASE_URL/articles")
echo "Articles: $ARTICLES_RESPONSE"

# Test 5: Contact
echo "📞 Test contact..."
CONTACT_RESPONSE=$(curl -s -X POST "$BASE_URL/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contact",
    "email": "contact@test.com",
    "subject": "Test",
    "message": "Message de test"
  }')

echo "Contact: $CONTACT_RESPONSE"

echo "✅ Tests terminés!"
```

## 📋 Collection Postman Importable

### Créer un fichier `cosmeto-api.postman_collection.json`
```json
{
  "info": {
    "name": "Cosmeto Association API - CURL Collection",
    "description": "Collection complète pour tester l'API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth - Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\",\n  \"professionalStatus\": \"student\",\n  \"domainOfInterest\": [\"skincare\"]\n}"
        },
        "url": "{{baseUrl}}/auth/register"
      }
    },
    {
      "name": "Auth - Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    var jsonData = pm.response.json();",
              "    if (jsonData.data && jsonData.data.token) {",
              "        pm.collectionVariables.set('token', jsonData.data.token);",
              "    }",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\"\n}"
        },
        "url": "{{baseUrl}}/auth/login"
      }
    }
  ]
}
```

## 🔄 Workflow de Test Recommandé

1. **Démarrer le serveur :** `npm run dev`
2. **Tester la connexion :** `curl http://localhost:3000/api/articles`
3. **Créer un compte :** Utiliser le CURL d'inscription
4. **Se connecter :** Récupérer le token JWT
5. **Tester les endpoints protégés :** Avec le token
6. **Tester les fonctions admin :** Créer un admin d'abord

Cette collection CURL vous permet de tester complètement l'API sans interface graphique.