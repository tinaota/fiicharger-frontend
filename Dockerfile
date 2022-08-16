ARG BUILD_MODE=prod
FROM node:16.13.2 AS build
ARG BUILD_MODE
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build-$BUILD_MODE

FROM httpd:2.4.53-alpine AS deploy
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/FiiCharger/ /var/www/app/FiiCharger/
