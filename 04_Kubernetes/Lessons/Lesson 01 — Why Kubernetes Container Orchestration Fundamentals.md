# Lesson 1 — Why Kubernetes? Container Orchestration Fundamentals
Problem Before Kubernetes

Imagine you have:
```bash
Docker Container 1 → Frontend
Docker Container 2 → Backend
Docker Container 3 → Database
```
Everything works.

But what happens when:
- Container crashes ❌
- Server crashes ❌
- Traffic increases ❌
- Need 10 backend containers ❌
- Need zero downtime deployment ❌

> Managing containers manually becomes impossible.

## What is Kubernetes?
> Kubernetes (K8s) is an open-source container orchestration platform.

Its job is to:
- Deploy containers
- Scale containers
- Heal failed containers
- Manage networking
- Manage storage
- Automate deployments

Think of it as:
```bash
Docker = Creates Containers

Kubernetes = Manages Containers
```

## Real World Example
Without Kubernetes:
```bash
Docker Run
Docker Run
Docker Run
Docker Run
...
# You manage everything manually.
```

With Kubernetes:
```bash
Desired State:

Backend = 3 Pods

Actual State:

Backend = 2 Pods
```

Kubernetes detects:
```bash
Expected = 3
Current = 2

# and automatically creates a new Pod.
```

This is called:
```bash
Self Healing
```

## Key Features
Self Healing
```bash
Pod Crash
    ↓
Kubernetes detects
    ↓
New Pod Created
```

## Auto Scaling
```bash
Traffic ↑
    ↓
Pods 3 → 10
```

## Load Balancing
```bash
User Requests
      │
      ▼
Kubernetes Service
   /   |   \
Pod1 Pod2 Pod3
```

## Rolling Updates
```bash
v1 → v2
# Users never experience downtime.
```

## Most Important Kubernetes Objects
| Object      | Purpose                        |
|------------|--------------------------------|
| Pod        | Smallest deployable unit       |
| ReplicaSet | Maintain number of Pods        |
| Deployment | Manage application rollout     |
| Service    | Network access                 |
| ConfigMap  | Configuration                  |
| Secret     | Sensitive data                 |
| Namespace  | Logical separation             |
| Ingress    | HTTP Routing                   |

## Kubernetes vs Docker
| Docker             | Kubernetes            |
| ------------------ | --------------------- |
| Creates containers | Manages containers    |
| Single host focus  | Multi-node clusters   |
| Basic scaling      | Advanced scaling      |
| No self-healing    | Self-healing          |
| Manual deployments | Automated deployments |

## Interview Questions
1. What problem does Kubernetes solve?
    > Managing, scaling, networking, and recovering containerized applications automatically.

2. What is container orchestration?
    > Automated deployment, scaling, networking, and management of containers.

3. Is Kubernetes a replacement for Docker?
    >No.

- Docker creates containers.
- Kubernetes orchestrates containers.