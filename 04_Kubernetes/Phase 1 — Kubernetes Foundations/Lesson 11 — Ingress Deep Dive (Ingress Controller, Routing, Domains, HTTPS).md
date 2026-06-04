# Lesson 11 — Ingress Deep Dive (Ingress Controller, Routing, Domains, HTTPS)
So far, users access apps using:
```
NodePort
```
or
```
LoadBalancer
```

Problems:
```bash
Frontend  → LoadBalancer #1
Backend   → LoadBalancer #2
API       → LoadBalancer #3
Admin     → LoadBalancer #4
```
- Expensive ❌
- Hard to manage ❌

## 1. What is Ingress?
Ingress is a Kubernetes resource that manages:
```
HTTP Routing
HTTPS/TLS
Domain-based access
Path-based routing
```

Think of it as:
```
Internet
    ↓
Ingress
    ↓
Services
    ↓
Pods
```

## 2. Before Ingress
```
User
 ↓
LoadBalancer
 ↓
Frontend

User
 ↓
LoadBalancer
 ↓
Backend

Multiple load balancers.
```

## 3. After Ingress
```bash
Internet
    ↓
Ingress
  /     \
 /       \
Frontend  Backend
```
> Single entry point.

## 4. Important: Ingress Needs an Ingress Controller
- Ingress resource itself does nothing.
- You need a controller that implements it.

Popular choice:
```
NGINX Ingress Controller
```
Other options:
```
Traefik
HAProxy Ingress
```

## 5. Simple Ingress Example
```
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: app-ingress

spec:
  rules:
  - host: myapp.local

    http:
      paths:
      - path: /
        pathType: Prefix

        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

Flow
```
myapp.local
      ↓
Ingress
      ↓
frontend-service
      ↓
Pods
```

## 6. Host-Based Routing
Different domains → different services.
```
api.myapp.com
      ↓
api-service

admin.myapp.com
      ↓
admin-service
```

Example
```
spec:
  rules:
  - host: api.myapp.com

    http:
      paths:
      - path: /
        pathType: Prefix

        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 7. Path-Based Routing
Same domain.

```bash
## Different paths.

myapp.com/
      ↓
frontend-service

myapp.com/api
      ↓
api-service

myapp.com/admin
      ↓
admin-service
```

Example
```yml
spec:
  rules:
  - host: myapp.com

    http:
      paths:

      - path: /
        pathType: Prefix

        backend:
          service:
            name: frontend-service
            port:
              number: 80

      - path: /api
        pathType: Prefix

        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 8. TLS / HTTPS
Without TLS:
```
http://myapp.com
```
Not secure ❌

With TLS:
```
https://myapp.com
```
Secure ✅

## TLS Secret
```
kubectl create secret tls my-tls-secret \
--cert=cert.crt \
--key=cert.key
```
Ingress with TLS
```yml
spec:

  tls:
  - hosts:
      - myapp.com
    secretName: my-tls-secret

  rules:
  - host: myapp.com
```

## 9. Full Production Flow
```
User
  ↓
DNS
  ↓
Ingress Controller
  ↓
Ingress Rules
  ↓
Service
  ↓
Pods
```

## 10. Ingress vs Service
| Feature         | Service | Ingress |
| --------------- | ------- | ------- |
| Internal access | Yes     | No      |
| Load balancing  | Yes     | Yes     |
| Domain routing  | No      | Yes     |
| HTTPS           | Limited | Yes     |
| Path routing    | No      | Yes     |


## 11. Commands
View Ingress
```
kubectl get ingress
```
Describe
```
kubectl describe ingress app-ingress
```
View All
```
kubectl get all
```

## 12. Common Issues
No Ingress Controller

Ingress exists:
```bash
kubectl get ingress
```
But doesn't work.

Reason:
- No Ingress Controller Installed
- Wrong Service Name
```yml
service:
  name: wrong-service
```
Ingress can't route.

- TLS Secret Missing
```
HTTPS fails
```

## 13. Real Architecture
```
Internet
    ↓
Ingress Controller
    ↓
Ingress
 ┌────┴─────┐
 ↓          ↓
Frontend    API
Service     Service
 ↓          ↓
Pods       Pods
```

## 14. Interview Questions
1. What is Ingress?
    > A Kubernetes resource that provides HTTP/HTTPS routing to Services.

2. Does Ingress work without a controller?
    > No.
- An Ingress Controller is required.

3. Difference between Service and Ingress?
- Service exposes applications.
- Ingress routes external HTTP/HTTPS traffic to Services.

4. What is host-based routing?
    > Different domains routed to different services.

5. What is path-based routing?
    > ifferent URL paths routed to different services.