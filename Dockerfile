# Étape 1 : Construire l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier tout le projet et construire
COPY . .
RUN npm run build

# Étape 2 : Image finale
FROM node:20-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier les fichiers nécessaires depuis l'étape précédente
COPY --from=builder /app/dist ./dist

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
