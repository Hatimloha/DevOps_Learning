# Nginx Controller Install

## 1. Add the Helm repository
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update
```
## 2. Install the NGINX Ingress Controller
```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

## Install a specific version:
```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --version 4.12.3
```