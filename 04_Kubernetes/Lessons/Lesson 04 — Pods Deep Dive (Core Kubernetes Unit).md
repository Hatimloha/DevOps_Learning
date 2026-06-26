# Lesson 4 — Pods Deep Dive (Core Kubernetes Unit)
Now you’re moving into the most important building block in Kubernetes: Pods.

Everything in Kubernetes runs inside Pods.

##  1. What is a Pod?
A Pod is the smallest deployable unit in Kubernetes.

It is a wrapper around one or more containers.
```bash
Pod
 └── Container (nginx / node / python)
 
#  or

Pod
 ├── Container A
 └── Container B (sidecar)
```

## 2. Why Pods exist (NOT just containers)
Kubernetes does NOT run containers directly.

Because it needs:
- Networking shared between containers
- Storage sharing
- Lifecycle management
- Scaling unit

So it wraps containers inside a Pod.

## 3. Pod Networking (VERY IMPORTANT)
All containers inside a Pod share:
- Same IP address
- Same port space
- Localhost communication
```bash
Pod IP: 10.1.1.5
Container A → localhost:3000
Container B → localhost:3001
```

## 4. Your First Pod (YAML)
Create a file:
```bash
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx
      ports:
        - containerPort: 80
```

## Run it:
```bash
kubectl apply -f pod.yaml
```

## Check Pod:
```bash
kubectl get pods
```

## Details:
```bash
kubectl describe pod nginx-pod
```

## 5. Pod Lifecycle
```bash
Pending → Running → Succeeded / Failed → CrashLoopBackOff
```
Meaning:
- Pending → waiting for node
- Running → container started
- Succeeded → completed - successfully
- Failed → error occurred
- CrashLoopBackOff → keeps crashing repeatedly

## 6. Multi-Container Pod (Sidecar Pattern)
Example: App + Logger
```bash
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
    - name: app
      image: nginx

    - name: log-agent
      image: busybox
      command: ["sh", "-c", "while true; do echo logging; sleep 5; done"]
```

## Why use multi-container pods?
- Logging agent
- Monitoring agent
- Proxy container
- Data sync sidecar

## 7. Init Containers (VERY IMPORTANT IN INTERVIEWS)
Init containers run BEFORE main containers.
```bash
Init Container → App Container
```
Example:
```bash
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
    - name: init-check
      image: busybox
      command: ["sh", "-c", "echo initializing..."]

  containers:
    - name: app
      image: nginx
```
Use cases:
- Wait for DB
- Setup configs
- Preload data

## 8. Pod Restart Policies
```bash
restartPolicy: Always
```
Options:
| Policy    | Meaning                  |
| --------- | ------------------------ |
| Always    | Restart container always |
| OnFailure | Restart only on failure  |
| Never     | Never restart            |

> Default = Always

## 9. Pod vs Container
| Feature                | Container | Pod    |
| ---------------------- | --------- | ------ |
| Runs app               | Yes       | Yes    |
| Network                | Isolated  | Shared |
| Kubernetes unit        | No        | Yes    |
| Can hold multiple apps | No        | Yes    |

## 10. kubectl Commands for Pods
Get pods
```bash
kubectl get pods
```
Describe pod
```bash
kubectl describe pod <name>
```
Delete pod  
```bash
kubectl delete pod <name>
```
View logs
```bash
kubectl logs <pod-name>
```
Exec inside pod
```bash
kubectl exec -it <pod-name> -- sh
```

## 11. Real Flow (VERY IMPORTANT)
When you apply a Pod: 
```bash
kubectl apply
    ↓
API Server
    ↓
etcd stores state
    ↓
Scheduler assigns node
    ↓
Kubelet creates Pod
    ↓
Container Runtime runs container
```

## 12. Common Pod Issues
CrashLoopBackOff

Causes:
- App crash
- Wrong command
- Missing env variables

Fix:
```bash
kubectl logs <pod>
kubectl describe pod <pod>
```
ImagePullBackOff

Causes:
- Wrong image name
- No internet
- Private registry issue

## 13. Debugging Workflow
```bash
1. kubectl get pods
2. kubectl describe pod
3. kubectl logs
4. kubectl exec
```

## 14. Key Interview Questions
1. What is a Pod?
    > Smallest deployable unit in Kubernetes that runs one or more containers.

2. Why not run containers directly?
    > Because Kubernetes needs shared networking, storage, and lifecycle control.

3. What is a sidecar container?
    > A helper container inside the same Pod that supports main app.

4. What is Init Container?
    > A container that runs before app containers start.

5. Do containers in same Pod share IP?
    > Yes, they share same network namespace.
