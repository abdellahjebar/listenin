# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
# Gabarit : l'image nginx remplace ${API_UPSTREAM} au démarrage et écrit conf.d/default.conf.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=http://api:3000
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 8080
