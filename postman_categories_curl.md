# Collection CURL - API Categories

## Variables d'environnement
```bash
export BASE_URL="http://localhost:3000/api"
export ADMIN_TOKEN=""  # Token admin obtenu après connexion
export CATEGORY_ID=""  # ID de la catégorie (sera rempli après création)
```

## 📁 Catégories

### 1. Obtenir toutes les catégories (GET)
```bash
# Sans pagination
curl -X GET "$BASE_URL/categories"

# Avec pagination
curl -X GET "$BASE_URL/categories?page=1&limit=10"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Cosmétologie Avancée",
        "description": "Description de la catégorie",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Obtenir une catégorie par ID (GET)
```bash
curl -X GET "$BASE_URL/categories/$CATEGORY_ID"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Cosmétologie Avancée",
    "description": "Description de la catégorie",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Créer une catégorie (POST) - Admin requis
```bash
curl -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Cosmétologie Avancée",
    "description": "Catégorie pour les articles et événements liés à la cosmétologie avancée"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Cosmétologie Avancée",
    "description": "Catégorie pour les articles et événements liés à la cosmétologie avancée",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Sauvegarder l'ID retourné:
```bash
export CATEGORY_ID="507f1f77bcf86cd799439011"
```

### 4. Mettre à jour une catégorie (PUT) - Admin requis
```bash
curl -X PUT "$BASE_URL/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Cosmétologie Avancée - Mise à jour",
    "description": "Description mise à jour de la catégorie"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Cosmétologie Avancée - Mise à jour",
    "description": "Description mise à jour de la catégorie",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Supprimer une catégorie (DELETE) - Admin requis
```bash
curl -X DELETE "$BASE_URL/categories/$CATEGORY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

## 🔐 Obtenir un token admin

Avant de tester les endpoints POST, PUT et DELETE, vous devez vous connecter en tant qu'admin:

```bash
# Connexion admin
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "votre_mot_de_passe"
  }'

# Sauvegarder le token retourné
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📝 Exemples de données de test

### Catégorie 1
```json
{
  "name": "Soins du Visage",
  "description": "Catégorie dédiée aux soins et traitements du visage"
}
```

### Catégorie 2
```json
{
  "name": "Produits Naturels",
  "description": "Catégorie pour les produits cosmétiques naturels et biologiques"
}
```

### Catégorie 3
```json
{
  "name": "Recherche et Développement",
  "description": "Catégorie pour les articles scientifiques et la recherche en cosmétologie"
}
```

## ⚠️ Notes importantes

1. **Authentification:** Les endpoints GET ne nécessitent pas d'authentification. Les endpoints POST, PUT et DELETE nécessitent un token admin.

2. **Validation:** 
   - Le champ `name` est obligatoire et doit être unique
   - Le champ `description` est obligatoire
   - Les deux champs ne peuvent pas être vides

3. **Erreurs courantes:**
   - `403 Forbidden`: Token manquant ou utilisateur non admin
   - `400 Bad Request`: Données invalides (champs manquants ou vides)
   - `404 Not Found`: Catégorie introuvable
   - `409 Conflict`: Nom de catégorie déjà existant

