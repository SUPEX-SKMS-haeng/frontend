#!/bin/bash
VERSION=latest
docker build -t skccaichatbot.azurecr.io/frontend:$VERSION .
docker push skccaichatbot.azurecr.io/frontend:$VERSION
