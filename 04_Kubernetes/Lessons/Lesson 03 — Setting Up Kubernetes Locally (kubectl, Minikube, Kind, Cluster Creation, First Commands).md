# Lesson 3 — Setting Up Kubernetes Locally (kubectl, Minikube, Kind)

Now you move from theory → real cluster hands-on.

This lesson is 100% practical and important because everything later depends on this setup.

## What You Will Set Up
You will install and use:
```bash
kubectl → CLI to talk to Kubernetes

Minikube → Local Kubernetes cluster (VM-based)

Kind → Kubernetes cluster inside Docker
```

## 1. kubectl (MOST IMPORTANT TOOL)
What is kubectl?
> It is the command-line tool to interact with Kubernetes.
```bash
kubectl → Kubernetes API Server → Cluster
```

## Install kubectl
Linux/macOS:
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```
Verify:
```bash
kubectl version --client
```

## Basic kubectl commands: 
```bash
kubectl get nodes
kubectl get pods
kubectl get services
kubectl get all
```

## 2. Minikube (Beginner Friendly Cluster) 
What is Minikube?
> It runs a single-node Kubernetes cluster on your machine.
```bash
Your Laptop → Minikube VM → Kubernetes Cluster
```

## Install Minikube
Linux:
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Start cluster:
```bash
minikube start
```

## Check status:
```bash
minikube status
```

## Get nodes:
```bash
kubectl get nodes

# You will see:

# NAME       STATUS   ROLES           AGE
# minikube   Ready    control-plane   1m
```

## Stop cluster:
```bash
minikube stop
```

## Delete cluster:
```bash
minikube delete
```

## 3. Kind (Kubernetes in Docker)
What is Kind?
- Kind = Kubernetes IN Docker
- Docker Containers → Kubernetes Nodes

Best for:
- CI/CD
- Testing clusters
- Multi-node clusters locally

Install Kind
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x kind
sudo mv kind /usr/local/bin/
```

## Create Cluster:
```bash
kind create cluster --name dev-cluster
```

## Check nodes:
```bash
kubectl get nodes

# You may see multiple nodes (depending config).
```

## Delete cluster:
```bash
kind delete cluster --name dev-cluster
```

## Minikube vs Kind
| Feature        | Minikube | Kind           |
| -------------- | -------- | -------------- |
| Setup          | VM       | Docker         |
| Speed          | Slower   | Faster         |
| Use case       | Learning | CI/CD, testing |
| Multi-node     | Limited  | Easy           |
| Resource usage | High     | Low            |


## 4. First Kubernetes Workflow

Once cluster is running:

### Step 1 — Check cluster
```bash
kubectl cluster-info
```
### Step 2 — Get nodes
```bash
kubectl get nodes
```
### Step 3 — Get system pods
```bash
kubectl get pods -A
```

## 5. Your First Deployment (Hello Kubernetes)
Create deployment:
```bash
kubectl create deployment nginx-app --image=nginx
```

## Check pods:
```bash
kubectl get pods
```

## Expose service:
```bash
kubectl expose deployment nginx-app --type=NodePort --port=80
```

## Get service:
```bash
kubectl get svc
```

## Access app (Minikube only):
```bash
minikube service nginx-app
```

## 6. Kubernetes Basic Flow (Very Important)
```bash
kubectl create deployment
        ↓
API Server
        ↓
etcd stores state
        ↓
Scheduler assigns node
        ↓
Kubelet runs pod
        ↓
Container runtime starts nginx
```

## 7. Important kubectl Commands
Cluster info
```bash
kubectl cluster-info
```
View nodes
```bash
kubectl get nodes
```
View pods
```bash
kubectl get pods
```
Detailed info
```bash
kubectl describe pod <pod-name>
```
Logs
```bash
kubectl logs <pod-name>
```

## 8. Troubleshooting Basics
Pod not running?
```bash
kubectl describe pod <pod>
```
Check events:
```bash
kubectl get events
```

## Interview Questions
1. What is kubectl?
    > LI tool to interact with Kubernetes API server.

2. Difference between Minikube and Kind?
    > Minikube uses VM, Kind uses Docker.

3. What happens when you run kubectl create deployment?
    > It sends request to API Server → etcd → Scheduler → Kubelet → Pod created.

4. Why do we need kubectl?
    > To manage cluster resources.
