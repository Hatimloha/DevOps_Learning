# Lesson 2 — Kubernetes Architecture
Before deploying applications, you must understand how a Kubernetes cluster is built.

Think of Kubernetes like a company:
```bash
CEO Office (Control Plane)
        │
        ▼
Employees (Worker Nodes)
        │
        ▼
Applications (Pods)
```

## High-Level Architecture
```bash
+----------------------+
|    Control Plane     |
+----------------------+
     /           \
    /             \
+---------+   +---------+
| Worker1 |   | Worker2 |
+---------+   +---------+
     │             │
   Pods          Pods
```

## A Kubernetes cluster has two major parts:
- Control Plane
- Worker Nodes

## 1. Control Plane
The Control Plane is the brain of Kubernetes.

It makes decisions like:
- Where Pods should run
- When Pods should be created
- Monitoring cluster health
- Scaling applications
- Recovering failed Pods

Core components:
```bash
Control Plane
│
├── API Server
├── etcd
├── Scheduler
└── Controller Manager
```

## 2. API Server
The API Server is the front door of Kubernetes.

Every command goes through it.

Example:
```bash
kubectl get pods
```

Flow:
```bash
kubectl
   │
   ▼
API Server
   │
   ▼
Returns Pod Information
```

Examples:
```bash
kubectl create deployment nginx
kubectl get pods
kubectl delete pod xyz
```
> All communicate with the API Server.

## 3. etcd
etcd is Kubernetes' database.

Stores:
- Pods
- Deployments
- Services
- Secrets
- ConfigMaps
- Cluster State

Example:
```bash
Desired Pods = 3
Current Pods = 3
```
Stored inside etcd.

If etcd is lost:
```
Cluster State Lost
```
This is why etcd backups are critical.

## 4. Scheduler
The Scheduler decides:
```bash
Which Worker Node
Should Run The Pod?
```
Example:
```
Worker1 -> 90% CPU
Worker2 -> 20% CPU
```
New Pod?
```
Scheduler chooses Worker2
```
because it has more available resources.


## 5. Controller Manager
Controllers continuously compare:
```bash
Desired State
     vs
Actual State
```
Example:

Desired:
```bash
3 Pods
```
Actual:
```bash
2 Pods
```
Controller detects mismatch:
```bash
Missing Pod
# and creates a new Pod.
```
> This is the foundation of Kubernetes Self-Healing.

## Worker Nodes
Worker Nodes run applications.
```bash
Worker Node
│
├── Kubelet
├── Container Runtime
└── Pods
```

## 6. Kubelet
Kubelet is the agent running on every Worker Node.

Responsibilities:
- Talks to API Server
- Creates Pods
- Monitors Pods
- Reports Node Status

Example:
```bash
API Server
      │
      ▼
Kubelet
      │
      ▼
Create Pod      
```

## 7. Container Runtime
Actually runs containers.
```bash
# Examples:
containerd ✅
CRI-O
Docker Engine (older setups)
```
Flow:

```bash
Kubelet
   │
   ▼
Container Runtime
   │
   ▼
Container Running
```

## 8. Pods
Smallest deployable unit in Kubernetes.
```bash
Pod
 └── Container
```
or
```bash
Pod
 ├── Container A
 └── Container B
 ```
> Applications run inside Pods.

## Complete Request Flow
User deploys nginx:
```bash
kubectl apply -f nginx.yaml
```

### Step-by-step:
```bash
1. kubectl
      │
      ▼
2. API Server
      │
      ▼
3. Store in etcd
      │
      ▼
4. Scheduler picks node
      │
      ▼
5. Kubelet receives instruction
      │
      ▼
6. Container Runtime creates container
      │
      ▼
7. Pod Running
```

## Architecture Diagram
```bash
                   Control Plane
+------------------------------------------------+
| API Server | Scheduler | Controller | etcd     |
+------------------------------------------------+
              │
              │
      +-------+-------+
      │               │
      ▼               ▼

+-------------+   +-------------+
| Worker Node |   | Worker Node |
+-------------+   +-------------+
| Kubelet     |   | Kubelet     |
| containerd  |   | containerd  |
| Pods        |   | Pods        |
+-------------+   +-------------+
```

## Important Terms
| Component          | Responsibility           |
| ------------------ | ------------------------ |
| API Server         | Entry point              |
| etcd               | Cluster database         |
| Scheduler          | Select node              |
| Controller Manager | Maintain desired state   |
| Kubelet            | Node agent               |
| Container Runtime  | Run containers           |
| Pod                | Smallest deployable unit |

## Interview Questions
1. What is the Control Plane?
   > The brain of Kubernetes that manages the cluster.

2. What is etcd?
   > A distributed key-value database storing cluster state.

3. What does Scheduler do?
   > Selects the best Worker Node for Pods.

4. What does Kubelet do?
   > Runs on Worker Nodes and manages Pods.

5. What is the smallest deployable unit in Kubernetes?
   > Pod.