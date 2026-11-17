FROM php:8.5-fpm-bookworm

ARG SQLSRV_VERSION=5.13.3
ARG XDEBUG_VERSION=3.5.3

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git gnupg unzip \
       libicu-dev libldap2-dev libsqlite3-dev libzip-dev unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/microsoft-prod.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && docker-php-ext-configure ldap --with-libdir=lib/$(dpkg-architecture --query DEB_HOST_MULTIARCH) \
    && docker-php-ext-install -j$(nproc) bcmath intl ldap pcntl pdo_mysql pdo_sqlite zip \
    && pecl install pdo_sqlsrv-${SQLSRV_VERSION} sqlsrv-${SQLSRV_VERSION} redis xdebug-${XDEBUG_VERSION} \
    && docker-php-ext-enable pdo_sqlsrv sqlsrv redis xdebug \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/php/development.ini /usr/local/etc/php/conf.d/99-nexo-development.ini
WORKDIR /var/www/html
CMD ["php-fpm"]
