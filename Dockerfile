# Frontend Dockerfile (monorepo - raiz)
FROM node:20-alpine AS builder

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
COPY .env.production ./

# Build com production mode
ENV NODE_ENV=production
RUN npm run build

# Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
