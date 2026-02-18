# Frontend Dockerfile (monorepo - raiz)
FROM node:20-alpine AS builder

ARG VITE_API_URL=https://api.arenad65.cloud

WORKDIR /app

# Copiar apenas arquivos necessários para build
COPY package*.json ./
COPY package-lock.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./
COPY App.tsx ./
COPY constants.tsx ./
COPY types.ts ./
COPY index.tsx ./
COPY metadata.json ./
COPY components/ ./components/
COPY hooks/ ./hooks/
COPY services/ ./services/
COPY views/ ./views/
COPY public/ ./public/
COPY vite-env.d.ts ./

# Definir variável de ambiente para o build
ENV VITE_API_URL=$VITE_API_URL

# Instalar dependências
RUN npm ci

# Build com production mode
ENV NODE_ENV=production
RUN npm run build

# Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
