# Configuration des Variables d'Environnement

Pour que l'application fonctionne correctement, vous devez créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```bash
# URI de connexion MongoDB
MONGODB_URI=mongodb://localhost:27017/cosmeto-association

# Secret JWT pour l'authentification
JWT_SECRET=your-super-secret-jwt-key-here

# Environnement d'exécution
NODE_ENV=development
```

## Instructions

1. Créez un fichier `.env.local` à la racine du projet
2. Copiez les variables ci-dessus dans ce fichier
3. Remplacez les valeurs par vos propres configurations :
   - `MONGODB_URI` : URL de votre base de données MongoDB
   - `JWT_SECRET` : Une clé secrète forte pour signer les tokens JWT

## Pour la production

En production, définissez ces variables dans votre plateforme de déploiement (Vercel, Netlify, etc.) plutôt que dans un fichier local.
