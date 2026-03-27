#!/bin/sh

envsubst < /app/custom-config.json.template > /app/custom-config.json

nginx -g 'daemon off;'