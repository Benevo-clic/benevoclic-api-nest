# Étape 1 : Construire l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package*.json ./
RUN npm install --ignore-scripts

# Copier tout le projet et construire
COPY . .
RUN npm run build

# Étape 2 : Image finale
FROM node:20-alpine

WORKDIR /app

# Copier package.json et tsconfig.json
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig*.json ./

# Copier uniquement les fichiers nécessaires depuis l'étape précédente
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env.production ./.env

EXPOSE 3000

# Utiliser node directement pour lancer l'application compilée
CMD ["node", "dist/main"]
