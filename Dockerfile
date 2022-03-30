FROM node:16.13.2 AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM httpd:2.4.53-alpine AS deploy
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/FiiCharger/ /var/www/app/FiiCharger/
COPY ./.htaccess /var/www/app/FiiCharger/
