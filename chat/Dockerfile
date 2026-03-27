## Build stage
FROM node:20 AS build-stage

RUN npm install  -g typescript pnpm@latest

WORKDIR /workspace
COPY chat/ ./chat/
COPY shared/ ./shared/

WORKDIR /workspace/chat

ENV NODE_OPTIONS="--max-old-space-size=32768"
RUN pnpm install
RUN ln -s /workspace/chat/node_modules /workspace/node_modules

ARG FE_BUILD_ENVIRONMENT=""
ENV FE_BUILD_ENVIRONMENT=${FE_BUILD_ENVIRONMENT}

RUN pnpm build$FE_BUILD_ENVIRONMENT

## Production
FROM nginx:1.24.0-alpine

ARG HEADERS_MORE_VERSION=v0.34
RUN sed -i 's/https/http/' /etc/apk/repositories
RUN apk --update --no-cache add \
        gcc \
        make \
        libc-dev \
        g++ \
        openssl-dev \
        linux-headers \
        pcre-dev \
        zlib-dev \
        libtool \
        automake \
        autoconf \
        git

RUN cd /opt \
        && git clone --depth 1 -b $HEADERS_MORE_VERSION --single-branch https://github.com/openresty/headers-more-nginx-module.git \
        && cd /opt/headers-more-nginx-module \
        && git submodule update --init \
        && cd /opt \
        && wget -O - http://nginx.org/download/nginx-1.24.0.tar.gz | tar zxfv - \
        && mv /opt/nginx-$NGINX_VERSION /opt/nginx \
        && cd /opt/nginx \
        && ./configure --with-compat --add-dynamic-module=/opt/headers-more-nginx-module \
        && make modules 

FROM nginx:1.24.0-alpine

COPY --from=1 /opt/nginx/objs/ngx_http_headers_more_filter_module.so /usr/lib/nginx/modules

RUN chmod -R 755 \
        /usr/lib/nginx/modules/ngx_http_headers_more_filter_module.so

### nginx setting
RUN rm -rf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /workspace/chat/deploy-config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /workspace/chat/deploy-config/node-server /etc/nginx/sites-available/node-server
RUN ln -s /etc/nginx/sites-available /etc/nginx/sites-enabled


COPY --from=build-stage /workspace/chat/dist /usr/share/nginx/html
COPY --from=build-stage /workspace/chat/deploy-config/. /app/.
RUN ln -sf /app/custom-config.json /usr/share/nginx/html/custom-config.json

## log
RUN mkdir /logs
RUN chmod 777 /logs

### ssl setting. ALB에서 ssl 인증 한 이후 코드 주석처리
#COPY prod-for-docker/ssl /etc/nginx/ssl

EXPOSE 80 8000
CMD ["/bin/sh", "/app/entrypoint.sh"]
