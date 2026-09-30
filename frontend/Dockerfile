# Etapa 1: compilar el proyecto de React con Vite
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Etapa 2: servir los archivos ya compilados con nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
