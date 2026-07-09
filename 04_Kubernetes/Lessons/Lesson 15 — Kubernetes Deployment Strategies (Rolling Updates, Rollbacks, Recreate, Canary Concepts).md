# Lesson 15 — Kubernetes Deployment Strategies (Rolling Updates, Rollbacks, Recreate, Canary Concepts)

One of Kubernetes' biggest advantages is the ability to **deploy new application versions without downtime**.

---

# 1. The Problem

Suppose your application is currently running:

```text
v1
├── Pod 1
├── Pod 2
└── Pod 3
```

Now you want to deploy:

```text
v2
```

How can you update all Pods **without taking the application offline**?

Kubernetes solves this using **Deployment Strategies**.

---

# 2. Deployment Strategies

Common deployment strategies:

| Strategy | Downtime |
|----------|----------|
| Recreate | ✅ Yes |
| Rolling Update | ❌ No |
| Blue-Green | Minimal |
| Canary | Minimal |

Kubernetes natively supports:

- RollingUpdate (Default)
- Recreate

Blue-Green and Canary require additional tools or manual configuration.

---

# 3. Rolling Update (Default Strategy)

Current state:

```text
v1

P1
P2
P3
```

Deploying **v2**:

```text
P1(v1) → P1(v2)
P2(v1) → P2(v2)
P3(v1) → P3(v2)
```

Pods are replaced **one at a time**, ensuring users never experience downtime.

Example:

```yaml
strategy:
  type: RollingUpdate
```

> **Note:** RollingUpdate is the default deployment strategy in Kubernetes.

---

# 4. How Rolling Update Works

Suppose:

```text
Replicas = 3
```

Kubernetes performs the following steps:

1. Create one new Pod.
2. Wait until the new Pod becomes **Ready**.
3. Delete one old Pod.
4. Repeat until all Pods are updated.

### Visual Representation

```text
Initial
-------
Old: 3 Pods

Step 1
-------
3 Old + 1 New

Step 2
-------
2 Old + 2 New

Step 3
-------
1 Old + 3 New

Step 4
-------
0 Old + 3 New
```

Users continue accessing the application throughout the update.

---

# 5. Rolling Update Parameters

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

## `maxUnavailable`

Defines the **maximum number of Pods that can be unavailable** during an update.

Example:

```yaml
maxUnavailable: 1
```

If replicas are **5**, Kubernetes ensures **at least 4 Pods remain available**.

---

## `maxSurge`

Defines the **maximum number of extra Pods** Kubernetes can temporarily create during an update.

Example:

```yaml
maxSurge: 1
```

If the desired replicas are **5**, Kubernetes may temporarily run **6 Pods**.

---

# 6. Recreate Strategy

The Recreate strategy deletes all existing Pods before creating new ones.

Example:

```yaml
strategy:
  type: Recreate
```

### Flow

```text
Delete All Old Pods
        │
        ▼
   Application Down
        │
        ▼
Create New Pods
```

### Visual Representation

```text
v1 Pods
   │
Delete All
   │
Downtime
   │
Create v2 Pods
```

### When to Use

Recreate is rarely used, but it can be useful for:

- Database schema migrations
- Legacy applications
- Applications that cannot run multiple versions simultaneously

---

# 7. Updating an Image

Current Deployment:

```yaml
image: nginx:1.25
```

Update it to:

```yaml
image: nginx:1.26
```

Apply the updated manifest:

```bash
kubectl apply -f deployment.yaml
```

Kubernetes automatically starts a **Rolling Update**.

---

# 8. Check Rollout Status

Monitor the deployment progress:

```bash
kubectl rollout status deployment nginx
```

Example output:

```text
deployment "nginx" successfully rolled out
```

---

# 9. View Rollout History

View all deployment revisions:

```bash
kubectl rollout history deployment nginx
```

Example output:

```text
REVISION   CHANGE-CAUSE
1          nginx:1.25
2          nginx:1.26
```

---

# 10. Rollback a Deployment

Suppose:

- Version **v2** is deployed.
- The application starts failing.

Rollback to the previous version:

```bash
kubectl rollout undo deployment nginx
```

Result:

```text
v2 → v1
```

### Rollback to a Specific Revision

```bash
kubectl rollout undo deployment nginx --to-revision=1
```

---

# 11. Deployment Revision History

Every Deployment update creates a **new ReplicaSet**.

```text
Deployment
   │
   ├── ReplicaSet v1
   ├── ReplicaSet v2
   └── ReplicaSet v3
```

During a rollback, Kubernetes switches back to an older ReplicaSet.

---

# 12. Canary Deployment (Concept)

Kubernetes does **not** provide Canary deployments natively.

The basic idea:

```text
Users
 │
 ├── 90% → v1
 └── 10% → v2
```

Monitor:

- Errors
- Performance
- Logs
- User feedback

If everything looks good:

```text
100% → v2
```

Canary deployments are commonly implemented using:

- Ingress Controllers
- Service Meshes (e.g., Istio, Linkerd)

---

# 13. Blue-Green Deployment (Concept)

Maintain **two identical environments**.

```text
Blue  = Current Version
Green = New Version
```

Example:

```text
Blue  → v1
Green → v2
```

When ready:

```text
Users
   │
   ▼
Green
```

Advantages:

- Instant traffic switching
- Easy rollback
- Minimal downtime

---

# 14. Useful Commands

## View Rollout Status

```bash
kubectl rollout status deployment nginx
```

## View Rollout History

```bash
kubectl rollout history deployment nginx
```

## Rollback

```bash
kubectl rollout undo deployment nginx
```

## Restart Deployment

```bash
kubectl rollout restart deployment nginx
```

## Watch Deployment

```bash
kubectl get deployment -w
```

---

# 15. Common Problems

## New Pods Never Become Ready

Cause:

- Readiness Probe failing

Result:

Rolling Update gets stuck because Kubernetes waits for Pods to become Ready.

---

## CrashLoopBackOff

Possible causes:

- Bad application code
- Invalid configuration
- Startup failures

Result:

Deployment cannot complete successfully.

---

## ImagePullBackOff

Cause:

- Incorrect image name
- Missing image
- Registry authentication issues

Result:

Pods cannot download the container image.

---

# 16. Interview Questions

### What is a Rolling Update?

A deployment strategy that gradually replaces old Pods with new Pods **without downtime**.

---

### What is the Recreate strategy?

A deployment strategy that deletes all existing Pods before creating new ones, causing temporary downtime.

---

### How do you rollback a Deployment?

```bash
kubectl rollout undo deployment <deployment-name>
```

---

### What is `maxSurge`?

The maximum number of **extra Pods** Kubernetes can temporarily create during a Rolling Update.

---

### What is `maxUnavailable`?

The maximum number of Pods that are allowed to be unavailable during an update.

---

### What creates Deployment revisions?

Each Deployment revision is represented by a **ReplicaSet**, which Kubernetes uses for rollbacks.

---

# Summary

- Kubernetes supports **RollingUpdate** and **Recreate** deployment strategies.
- **RollingUpdate** is the default strategy and provides zero-downtime deployments.
- `maxSurge` controls extra Pods during updates.
- `maxUnavailable` controls how many Pods can be unavailable.
- Every Deployment update creates a new ReplicaSet.
- Rollbacks use previous ReplicaSets to restore earlier application versions.
- Blue-Green and Canary deployments are advanced deployment patterns commonly implemented with Ingress Controllers or Service Meshes.