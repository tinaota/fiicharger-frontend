ARG BUILD_MODE=prod
FROM node:18.13.0 AS build
ARG BUILD_MODE
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build-$BUILD_MODE

FROM httpd:2.4.53-alpine AS deploy
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/dist/ /var/www/app/
