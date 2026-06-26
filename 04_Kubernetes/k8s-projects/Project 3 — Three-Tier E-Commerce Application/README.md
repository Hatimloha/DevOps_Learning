# Features
```
✅ React frontend
✅ Express backend
✅ PostgreSQL database
✅ Redis cache
✅ Ingress
✅ ConfigMap
✅ Secret
✅ PVC
✅ Health probes
✅ Resource limits
✅ Horizontal scaling
✅ Rolling updates
✅ Zero-downtime deployment
```

## Folder Structure:
```
project-03-three-tier-app/
├── frontend/
│   ├── React App
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/
│   ├── Express API
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── init.sql
│
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres/
│   ├── redis/
│   ├── backend/
│   ├── frontend/
│   ├── ingress.yaml
│   └── network-policy.yaml
│
├── docker-compose.yml
├── README.md
└── screenshots/
```

## API Endpoints
```
GET    /products

GET    /products/:id

POST   /products

PUT    /products/:id

DELETE /products/:id
```

## Kubernetes Resources
```
Namespace
│
├── frontend-deployment
├── frontend-service
│
├── backend-deployment
├── backend-service
│
├── postgres-deployment
├── postgres-service
├── postgres-pvc
│
├── redis-deployment
├── redis-service
│
├── configmap
├── secret
│
├── ingress
│
└── hpa
```

## Project Flow
```
User

↓

Ingress

↓

Frontend

↓

Backend API

↓

Redis

↓

(Postgres if cache miss)

↓

Return Data
```

## Production Features
```
✅ Multi-container architecture
✅ Internal service communication
✅ Persistent database
✅ Redis cache
✅ Ingress routing
✅ Health probes
✅ Resource limits
✅ Rolling updates
✅ Autoscaling
✅ Zero-downtime deployments
✅ Production-ready folder structure
```
