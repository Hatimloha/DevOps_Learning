# Lesson 25 — Kubernetes Networking Deep Dive

## 📖 Overview

Networking is one of the most challenging Kubernetes topics because much of it happens automatically behind the scenes.

When you access a Service like:

```text
http://frontend-service
```

you don't see the internal networking components that Kubernetes uses to route your request.

This lesson explains how Kubernetes networking works from **Pods** to **Services**, **DNS**, **Ingress**, and **Load Balancers**.

---

# 1. Kubernetes Networking Model

Kubernetes follows a few fundamental networking rules.

## Rule 1: Every Pod Gets Its Own IP Address

Each Pod has a unique IP address.

```text
Pod A → 10.244.0.5

Pod B → 10.244.1.8
```

---

## Rule 2: Pods Can Communicate Directly

Pods can communicate with each other without Network Address Translation (NAT).

```text
Pod A
   │
   ▼
Pod B
```

---

## Rule 3: Nodes Can Reach Pods

Worker nodes can communicate directly with the Pods running on them.

```text
Node
 │
 ▼
Pod
```

---

# 2. Pod Network

Example cluster:

```text
+----------------------+
| Worker Node 1        |
|                      |
| Pod A 10.244.0.2     |
| Pod B 10.244.0.3     |
+----------------------+

+----------------------+
| Worker Node 2        |
|                      |
| Pod C 10.244.1.2     |
| Pod D 10.244.1.3     |
+----------------------+
```

Even though Pods are running on different worker nodes, they can communicate seamlessly.

```text
Pod A
   │
   ▼
Pod D
```

---

# 3. CNI (Container Network Interface)

Kubernetes does **not** create Pod networking by itself.

Instead, it delegates networking to a **CNI plugin**.

## Responsibilities

- Assign Pod IP addresses
- Route traffic between Pods
- Connect Pods across nodes
- Enforce NetworkPolicies (if supported)

## Popular CNI Plugins

- Calico
- Cilium
- Flannel

---

# 4. Service Networking

Pods are temporary.

Example:

```text
Today:
10.244.0.5

Tomorrow:
10.244.2.8
```

Since Pod IPs change, applications should never communicate using Pod IP addresses.

Instead:

```text
Client
   │
   ▼
Service
   │
   ▼
Pods
```

A Service provides a stable virtual IP for clients.

---

# 5. ClusterIP

`ClusterIP` is the default Kubernetes Service type.

```text
Frontend Pod
      │
      ▼
Backend Service
      │
      ▼
Backend Pods
```

Example:

```text
Backend Service

10.96.25.10
```

The Service IP remains stable even if backend Pods are recreated.

---

# 6. kube-proxy

Every worker node runs:

```text
kube-proxy
```

## Responsibilities

- Watches Services
- Watches Endpoints
- Configures routing rules
- Load balances traffic

### Request Flow

```text
Request
   │
   ▼
ClusterIP
   │
   ▼
kube-proxy
   │
   ▼
One Backend Pod
```

---

# 7. Endpoints

A Service does not communicate with Pods directly.

Instead, it uses **Endpoints**.

Example:

```text
Service

frontend-service
```

Endpoints:

```text
10.244.0.2

10.244.0.8

10.244.1.3
```

The Service forwards requests to these backend Pod IPs.

### View Endpoints

```bash
kubectl get endpoints
```

---

# 8. EndpointSlices

In large clusters, a Service may have thousands of backend Pods.

Instead of maintaining one large Endpoints object, Kubernetes creates **EndpointSlices**.

## Benefits

- Better scalability
- Less API server traffic
- Faster updates

### View EndpointSlices

```bash
kubectl get endpointslices
```

---

# 9. CoreDNS

Applications communicate using Service names instead of IP addresses.

Instead of:

```text
10.96.25.10
```

Applications use:

```text
backend-service
```

CoreDNS resolves:

```text
backend-service.default.svc.cluster.local
```

to:

```text
10.96.25.10
```

---

# 10. DNS Resolution Flow

```text
Application
      │
      ▼
backend-service
      │
      ▼
CoreDNS
      │
      ▼
ClusterIP
      │
      ▼
kube-proxy
      │
      ▼
Backend Pod
```

---

# 11. Service Types Review

| Service Type | Accessible From |
|--------------|-----------------|
| **ClusterIP** | Inside the cluster |
| **NodePort** | Node IP + Port |
| **LoadBalancer** | External Load Balancer |
| **ExternalName** | External DNS Name |

---

# 12. NodePort Flow

```text
Internet
     │
     ▼
Node IP:30080
     │
     ▼
kube-proxy
     │
     ▼
Service
     │
     ▼
Pods
```

---

# 13. LoadBalancer Flow

```text
Internet
      │
      ▼
Cloud Load Balancer
      │
      ▼
Node
      │
      ▼
Service
      │
      ▼
Pods
```

> **Note:** `LoadBalancer` Services are primarily used in cloud environments.

---

# 14. Ingress Flow

Instead of exposing every application separately:

```text
Internet
      │
      ▼
Ingress Controller
      │
 ┌────┴────┐
 ▼         ▼
App A    App B
```

One Ingress Controller provides a single entry point for multiple applications.

---

# 15. Complete Networking Flow

```text
Browser
    │
    ▼
Load Balancer
    │
    ▼
Ingress Controller
    │
    ▼
Service
    │
    ▼
kube-proxy
    │
    ▼
EndpointSlice
    │
    ▼
Pod
```

---

# 16. Important Components

| Component | Purpose |
|-----------|---------|
| **CNI** | Connects Pods across the cluster |
| **CoreDNS** | Resolves Service names to IP addresses |
| **kube-proxy** | Implements Service routing and load balancing |
| **Service** | Provides a stable virtual IP |
| **Endpoints** | Stores backend Pod IP addresses |
| **EndpointSlice** | Scalable replacement for Endpoints |

---

# 17. Useful Commands

## View Services

```bash
kubectl get svc
```

---

## View Endpoints

```bash
kubectl get endpoints
```

---

## View EndpointSlices

```bash
kubectl get endpointslices
```

---

## View Pods with IP Addresses

```bash
kubectl get pods -o wide
```

---

## View Nodes

```bash
kubectl get nodes -o wide
```

---

## Test DNS Resolution from a Pod

```bash
kubectl exec -it <pod-name> -- nslookup backend-service
```

> **Note:** If `nslookup` is unavailable in the container image, use alternatives such as:
>
> - `getent hosts`
> - `dig`
> - A temporary debugging Pod with DNS utilities installed

---

# 18. Common Networking Problems

## Service Has No Endpoints

### Cause

The Service selector does not match the Pod labels.

---

## DNS Resolution Fails

Possible causes:

- CoreDNS Pods are unhealthy
- Incorrect Service name
- Wrong namespace

---

## Pod Cannot Reach Another Pod

Possible causes:

- NetworkPolicy blocks traffic
- CNI plugin issue
- Destination Pod is unavailable

---

## External Access Fails

Possible causes:

- Incorrect Service type
- Ingress configuration issues
- Firewall or cloud security rules

---

# 19. Interview Questions

### Why does every Pod need its own IP address?

Every Pod has its own IP so that Pods can communicate directly without sharing ports or requiring NAT between Pods.

---

### What is CNI?

Container Network Interface (CNI) is a networking plugin that provides Pod networking, IP address assignment, and connectivity across nodes.

---

### What does kube-proxy do?

kube-proxy implements Kubernetes Service networking by routing and load balancing traffic to backend Pods.

---

### What is CoreDNS?

CoreDNS is the Kubernetes DNS server that resolves Service names into ClusterIP addresses.

---

### What is the difference between Endpoints and EndpointSlices?

- **Endpoints** store backend Pod IP addresses in a single object.
- **EndpointSlices** divide that information into smaller objects, improving scalability and reducing API load.

---

### Does a Service forward traffic directly to Pods?

No.

A Service selects Pods using labels, creates **Endpoints/EndpointSlices**, and **kube-proxy** uses those objects to route traffic to the appropriate backend Pods.

---

# 📌 Key Takeaways

- Every Pod receives a unique IP address.
- Pods communicate directly without NAT.
- CNI plugins provide Pod networking and cross-node connectivity.
- Services provide stable virtual IPs for dynamic Pods.
- kube-proxy routes traffic from Services to backend Pods.
- CoreDNS resolves Service names into ClusterIP addresses.
- EndpointSlices improve scalability over traditional Endpoints.
- Ingress provides a single entry point for multiple applications.
- Understanding the networking request flow is essential for troubleshooting Kubernetes networking issues.