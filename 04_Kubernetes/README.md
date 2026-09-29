# Kubernetes

### Prerequisites
- Linux Fundamentals ✅
- Shell Scripting ✅
- Docker Deep Dive ✅
- Git & GitHub Workflow ✅

> Kubernetes builds heavily on Linux, Containers, Docker, Networking, and Git workflows — all covered in earlier sections.

---

## Repository Structure

```
04_Kubernetes/
├── Lessons/           # 27 structured lessons
├── k8s-manifest/      # Practice YAML manifests
└── k8s-projects/      # 3 hands-on projects
```

---

## Lessons (27)

### Phase 1 — Foundations
| # | Lesson |
|---|--------|
| 01 | Why Kubernetes? Container Orchestration Fundamentals |
| 02 | Kubernetes Architecture (Control Plane, Worker Nodes, API Server, Scheduler, etcd, Controller Manager) |
| 03 | Setting Up Kubernetes Locally (kubectl, Minikube, Kind, Cluster Creation, First Commands) |
| 04 | Pods Deep Dive (Core Kubernetes Unit) |

### Phase 2 — Workloads & Scaling
| # | Lesson |
|---|--------|
| 05 | ReplicaSets Deep Dive (Self-Healing, Scaling, Labels, Selectors) |
| 06 | Deployments Deep Dive (Rolling Updates, Rollbacks, Revision History, Zero-Downtime Deployments) |
| 07 | Services in Kubernetes (ClusterIP, NodePort, LoadBalancer) |
| 15 | Kubernetes Deployment Strategies (Rolling Updates, Rollbacks, Recreate, Canary Concepts) |
| 16 | StatefulSets (Persistent Identity, Ordered Deployment, Databases in Kubernetes) |
| 17 | DaemonSets (One Pod Per Node) |
| 18 | Jobs & CronJobs (Batch Processing & Scheduled Tasks) |

### Phase 3 — Configuration & Storage
| # | Lesson |
|---|--------|
| 08 | ConfigMaps & Secrets (Configuration Management in Kubernetes) |
| 09 | Kubernetes Storage (Volumes, PV, PVC, StorageClass) |
| 23 | ConfigMaps & Secrets (External Configuration & Secure Data) |

### Phase 4 — Networking
| # | Lesson |
|---|--------|
| 10 | Kubernetes Networking Deep Dive (DNS, Service Discovery, Pod Communication) |
| 11 | Ingress Deep Dive (Ingress Controller, Routing, Domains, HTTPS) |
| 25 | Kubernetes Networking Deep Dive |

### Phase 5 — Security
| # | Lesson |
|---|--------|
| 19 | RBAC (Role-Based Access Control), Service Accounts & Security Fundamentals |
| 20 | Network Policies (Pod-to-Pod Security, Traffic Control, Zero Trust Networking) |
| 24 | Kubernetes Security Deep Dive (Production Security) |

### Phase 6 — Operations & Observability
| # | Lesson |
|---|--------|
| 12 | Health Checks & Probes (Liveness, Readiness, Startup Probes) |
| 13 | Resource Requests & Limits (CPU, Memory, OOMKilled) |
| 14 | Namespaces (Logical Isolation, Multi-Tenancy, Resource Separation) |
| 21 | Kubernetes Scheduling (Where Pods Run) |
| 22 | Kubernetes Logging & Monitoring |

### Phase 7 — Advanced Topics
| # | Lesson |
|---|--------|
| 26 | Custom Resource Definitions (CRDs), Operators & Kubernetes API Extension |
| 27 | Kubernetes Backup, Restore & Disaster Recovery |

---

## Projects (3)

| # | Project | Focus |
|---|---------|-------|
| 1 | Static Website Deployment | Deploy a static site with Deployments, Services, Ingress |
| 2 | Node.js + MongoDB (Real Application) | Multi-container app with ConfigMaps, Secrets, Persistent Storage |
| 3 | Three-Tier E-Commerce Application | Autoscaling, Ingress, Jobs, Resource Quotas, RBAC, LimitRanges |
