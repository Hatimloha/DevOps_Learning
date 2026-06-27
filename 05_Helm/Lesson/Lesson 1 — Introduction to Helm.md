# Lesson 1 — Introduction to Helm

## What is Helm?
Helm is the Package Manager for Kubernetes.

| Technology | Package Manager |
| ---------- | --------------- |
| Ubuntu     | apt             |
| RHEL       | yum             |
| Node.js    | npm             |
| Python     | pip             |
| Kubernetes | Helm            |

## Without Helm:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
```

## For large applications:
```bash
50+
100+
200+ YAML files
```
Managing them becomes painful.

#### Helm packages everything into a single unit called a: 
```bash
Chart
```

## Why Helm Exists
Imagine deploying:
- Nginx
- Jenkins
- Prometheus
- Grafana
- Elasticsearch

Without Helm:
```bash
Download YAMLs
Edit YAMLs
Apply YAMLs
Upgrade YAMLs
Rollback manually
```
With Helm:
```
helm install nginx oci://registry-1.docker.io/bitnamicharts/nginx
```

## Core Helm Concepts
### 1. Chart

A Helm package.
```bash
# Example:
nginx-chart/
```
Contains:
```
Deployment
Service
Ingress
ConfigMap
Secrets
```
All packaged together.

### 2. Release
Installed chart instance.
```bash
# Example:
helm install my-nginx nginx-chart
```
Here:
```
Release Name = my-nginx
Chart = nginx-chart
```

#### You can install same chart multiple times:
```bash
helm install dev-nginx nginx-chart

helm install prod-nginx nginx-chart
```

### 3. Repository
Collection of charts.

Like:
```bash
Docker Hub -> Images

Helm Repo -> Charts
```
Examples:
- Bitnami
- CNCF
- Grafana Labs

#### Helm Architecture
```bash
Developer
    |
    v
 Helm CLI
    |
    v
 Kubernetes API
    |
    v
 Kubernetes Cluster
```
>>> Helm doesn't replace Kubernetes.

It talks to Kubernetes through:
```bash
kubectl

# mechanisms and Kubernetes APIs.
```

## Install Helm
Linux: 
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verify:
```bash
helm version
```

Output:
```bash
version.BuildInfo{Version:"v3.21.1", GitCommit:"c56dd0095fd76da5d7b30ecdf506103e7f26745e", GitTreeState:"clean", GoVersion:"go1.26.4"}
```

## Important Helm Commands
Check version: 
```bash
helm version
```

Search chart:
```
helm search hub nginx
```

Add repository:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Update repositories:
```
helm repo update
```

Install chart:
```
helm install my-nginx bitnami/nginx
```

List releases:
```
helm list
```

Uninstall:
```
helm uninstall my-nginx
```


## Interview Questions
What is Helm?
```
Package manager for Kubernetes.
```

What is a Chart?
```
A packaged Kubernetes application.
```

What is a Release?
```
Running instance of a chart.
```

What is a Repository?
```
Storage location for charts.
```

Why Helm?
- Reusability
- Versioning
- Easy upgrades
- Rollbacks
- Templating
- Faster deployments 


## Real World Usage
Almost every production Kubernetes cluster uses Helm for:
- Jenkins
- Prometheus
- Grafana
- ArgoCD
- NGINX Ingress Controller
- Elasticsearch
- Kafka
- Redis
- PostgreSQL

because maintaining hundreds of raw YAML files is not practical.
