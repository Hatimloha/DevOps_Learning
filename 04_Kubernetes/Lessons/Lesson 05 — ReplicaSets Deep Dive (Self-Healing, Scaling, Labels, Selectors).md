# Lesson 5 — ReplicaSets Deep Dive (Self-Healing, Scaling, Labels, Selectors)

In the previous lesson, you created Pods manually.

Problem:
```bash
Pod Crashed
    ↓
Pod Deleted
    ↓
Application Down ❌
```
A Pod by itself is not reliable.

This is where ReplicaSets come in.

## 1. What is a ReplicaSet?
A ReplicaSet ensures a specific number of Pod replicas are always running.

Example:
```bash
Desired Pods = 3
```
If one Pod dies:
```
Current Pods = 2
```
ReplicaSet automatically creates a new Pod.
```bash
Current Pods = 3
```
> This is Kubernetes Self-Healing.

## 2. ReplicaSet Architecture
```bash
ReplicaSet
      │
      ├── Pod 1
      ├── Pod 2
      └── Pod 3
```
ReplicaSet continuously watches Pods.

## 3. First ReplicaSet YAML
```bash
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
      - name: nginx
        image: nginx
```

## Create ReplicaSet
```bash
kubectl apply -f replicaset.yaml
```
Verify
```bash
kubectl get rs
```
Output:
```bash
NAME       DESIRED   CURRENT   READY
nginx-rs   3         3         3

Check Pods

kubectl get pods
```
You should see:
```bash
nginx-rs-xxxxx
nginx-rs-yyyyy
nginx-rs-zzzzz
```

## 4. Self-Healing Demo
Delete a Pod manually:
```bash
kubectl delete pod <pod-name>
```
Immediately check:
```bash
kubectl get pods
```
You'll notice:
```bash
Old Pod Deleted
New Pod Created
```
ReplicaSet restored the desired state.

## 5. Scaling ReplicaSets
Current:
```bash
Replicas = 3
```
Scale to 5:
```bash
kubectl scale rs nginx-rs --replicas=5
```
Check:
```bash
kubectl get pods
```
Result:
```bash
5 Pods Running
```
Scale down:
```bash
kubectl scale rs nginx-rs --replicas=2
```
> Kubernetes removes extra Pods.

## 6. Labels (VERY IMPORTANT)
Labels are key-value pairs attached to Kubernetes objects.

Example:
```bash
labels:
  app: nginx
  env: dev
  team: backend
```
> Think of labels as tags.

Example Pod:
```bash
metadata:
  labels:
    app: nginx
```

## View labels:
```bash
kubectl get pods --show-labels
```
Output:
```bash
NAME              LABELS
nginx-rs-abcde    app=nginx
```

## 7. Selectors (VERY IMPORTANT)
Selectors find objects using labels.

Example:
```bash
selector:
  matchLabels:
    app: nginx
```
Meaning:
```bash
Manage every Pod
having label app=nginx
```

## Relationship:
```bash
Labels → Identify Objects

Selectors → Find Objects
```

## 8. How ReplicaSet Finds Pods
ReplicaSet:
```bash
selector:
  matchLabels:
    app: nginx
```
Pod:
```bash
labels:
  app: nginx
```
Match found:
```bash
ReplicaSet controls Pod
```

## 9. What Happens If Labels Don't Match?
ReplicaSet:
```bash
selector:
  matchLabels:
    app: nginx
```
Pod:
```bash
labels:
  app: apache
```
Result:
```bash
ReplicaSet ignores Pod
```
Labels and selectors must match.

## 10. ReplicaSet Commands
List ReplicaSets
```bash
kubectl get rss
```
Details
```bash
kubectl describe rs nginx-rs
```
Delete ReplicaSet
```bash
kubectl delete rs nginx-rs
```
Scale ReplicaSet
```bash
kubectl scale rs nginx-rs 
--replicas=5
```

## 11. ReplicaSet Limitations
ReplicaSet can:
```bash
✅ Maintain Pod count

✅ Self-heal

✅ Scale Pods
```

ReplicaSet cannot:
```bash
❌ Rolling updates

❌ Rollbacks

❌ Deployment history

❌ Version management
```

## That's why in production we usually use:
```bash
Deployment
     ↓
ReplicaSet
     ↓
Pods
```
> Deployments manage ReplicaSets.

## 12. Real Production Flow
```bash
Deployment
     │
     ▼
ReplicaSet
     │
     ▼
Pods
```
You rarely create ReplicaSets directly.

But understanding them is essential because Deployments use ReplicaSets internally.

## 13. Interview Questions

What is a ReplicaSet?
> A Kubernetes object that maintains a specified number of Pod replicas.


What is self-healing?
```
Automatically recreating Pods when they fail or are deleted.
```

What is the difference between Labels and Selectors?
- Labels identify resources.
- Selectors find resources using labels.


Can a ReplicaSet perform rolling updates?
```bash
No.
# Deployments provide rolling updates.
```

Why do Deployments use ReplicaSets?
```bash
ReplicaSets handle Pod availability while Deployments handle application lifecycle management.
```
