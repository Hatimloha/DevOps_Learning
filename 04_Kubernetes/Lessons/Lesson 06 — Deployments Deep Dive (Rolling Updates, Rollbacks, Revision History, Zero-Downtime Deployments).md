# Lesson 6 — Deployments Deep Dive (Rolling Updates, Rollbacks, Revision History, Zero-Downtime Deployments)

This is one of the most important Kubernetes concepts.

In real production environments:
```bash
You almost never create Pods directly.
You rarely create ReplicaSets directly.
You mostly create Deployments.
```

## 1. What is a Deployment?
A Deployment is a higher-level Kubernetes object that manages ReplicaSets and Pods.

Architecture:
```bash
Deployment
     │
     ▼
ReplicaSet
     │
     ▼
Pods
```

## When you create a Deployment:
```bash
Deployment creates ReplicaSet
ReplicaSet creates Pods
```

### 2. Why Deployments?
ReplicaSets can:

✅ Self-heal

✅ Scale

But cannot:

❌ Rolling updates

❌ Rollbacks

❌ Version history

Deployments solve all of these.

## 3. First Deployment YAML
```bash
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deployment

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
        image: nginx:1.25
```

## Create Deployment
```bash
kubectl apply -f deployment.yaml
```

Verify
```bash
kubectl get deployments
```

```bash
# Output:
NAME               READY   UP-TO-DATE   AVAILABLE
nginx-deployment   3/3     3            3
```

## Check ReplicaSets:
```bash
kubectl get rs
```

## Check Pods: 
```bash
kubectl get pods
```

## 4. Deployment Hierarchy
```bash
Deployment
   │
   ▼
ReplicaSet
   │
   ▼
Pod 1
Pod 2
Pod 3
```

## 5. Scaling Deployments
Scale to 5 replicas:
```bash
kubectl scale deployment nginx-deployment --replicas=5
```

Verify:
```bash
kubectl get pods
```
Expected:
```bash
5 Pods Running
```

## Scale down:
```bash
kubectl scale deployment nginx-deployment --replicas=2
```

## 6. Rolling Updates (MOST IMPORTANT)
Current:
```bash
nginx:1.25
```
Update image:
```bash
kubectl set image deployment/nginx-deployment \
nginx=nginx:1.26
```

Kubernetes performs a rolling update.

## Traditional Update
```bash
Stop Old Version
     ↓
Start New Version
```
Downtime ❌

## Kubernetes Rolling Update
```bash
Old Pod 1
Old Pod 2
Old Pod 3

      ↓

New Pod 1
Old Pod 2
Old Pod 3

      ↓

New Pod 1
New Pod 2
Old Pod 3

      ↓

New Pod 1
New Pod 2
New Pod 3
```
No downtime ✅

## Watch Rollout
```bash
kubectl rollout status deployment/nginx-deployment
```

## 7. Revision History
Check rollout history:
```bash
kubectl rollout history deployment/nginx-deployment
```

Output:
```bash
# REVISION
1
2
3
```
Every update creates a new revision.

## 8. Rollback
Suppose version 1.26 is broken.

Rollback:
```bash
kubectl rollout undo deployment/nginx-deployment
```
Result:
```bash
1.26 → 1.25
```

## Rollback to specific revision: 
```bash
kubectl rollout undo deployment/nginx-deployment \
--to-revision=2
```

## 9. Deployment Strategy
Default strategy:
```bash
strategy:
  type: RollingUpdate
```

## Parameters:
```bash
strategy:
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 1
```

## Meaning:
```bash
maxSurge = Extra Pods allowed

maxUnavailable = Pods allowed down
```

## Example:
Replicas:
```
3
```

Settings:
```bash
maxSurge = 1
maxUnavailable = 1
```

During update:
```bash
Maximum Pods = 4
Minimum Available = 2
```

## 10. Describe Deployment
```bash
kubectl describe deployment nginx-deployment
```
Shows:
- Events
- ReplicaSets
- Strategy
- Conditions

## 11. Delete Deployment
```
kubectl delete deployment nginx-deployment
```
Deletes:
- Deployment
- ReplicaSet
- Pods

## 12. Useful Deployment Commands
Get Deployments
```bash
kubectl get deployments
```

Describe Deployment
```bash
kubectl describe deployment nginx-deployment
```

Scale
```bash
kubectl scale deployment nginx-deployment --replicas=5
```

Update Image
```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.26
```
Rollout Status
```bash
kubectl rollout status deployment/nginx-deployment
```
Rollout History
```bash
kubectl rollout history deployment/nginx-deployment
```
Rollback
```bash
kubectl rollout undo deployment/nginx-deployment
```

## 13. Real Production Flow
Developer pushes code:
```bash
Git Push
   ↓
CI/CD Pipeline
   ↓
Build Docker Image
   ↓
Push Registry
   ↓
Update Deployment
   ↓
Rolling Update
   ↓
Zero Downtime
```
This is how most companies deploy applications.

## 14. Interview Questions

1. What is a Deployment?
    > A Kubernetes object that manages ReplicaSets and Pods while providing rolling updates and rollbacks.


2. Difference between ReplicaSet and Deployment?

    | ReplicaSet         | Deployment      |
    | ------------------ | --------------- |
    | Self-healing       | Self-healing    |
    | Scaling            | Scaling         |
    | No rollbacks       | Rollbacks       |
    | No rolling updates | Rolling updates |

3. What is a Rolling Update?
    > Updating application versions gradually without downtime.

4. What is Rollback?
    > Returning to a previous stable deployment version.

5. What command checks rollout status?
    > kubectl rollout status deployment/<name>

