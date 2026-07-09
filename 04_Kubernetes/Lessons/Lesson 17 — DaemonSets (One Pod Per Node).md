# Lesson 17 — DaemonSets (One Pod Per Node)

So far, you've learned:

- **Deployment** → Maintains a desired number of Pods.
- **StatefulSet** → Manages stateful applications with stable identities.

But sometimes you need to run **exactly one Pod on every node** in a Kubernetes cluster.

This is the purpose of a **DaemonSet**.

---

# 1. What is a DaemonSet?

A **DaemonSet** ensures that **one Pod runs on every eligible node** in the cluster.

Example:

```text
Cluster

Node-1 → Monitoring Pod
Node-2 → Monitoring Pod
Node-3 → Monitoring Pod
```

If a new node joins the cluster:

```text
Node-4
   │
   ▼
DaemonSet automatically creates a Pod
```

No manual action is required.

---

# 2. Why Do We Need DaemonSets?

Some applications must run on **every node**, not just a fixed number of replicas.

Common use cases include:

## Monitoring

- Node Exporter
- Datadog Agent

## Logging

- Fluent Bit
- Fluentd

## Networking

- Calico
- Cilium

## Security

- Antivirus agents
- Security scanners
- Compliance agents

These components collect node-specific information or provide node-level services.

---

# 3. Deployment vs DaemonSet

Suppose your cluster has **3 nodes**.

## Deployment

```yaml
replicas: 3
```

Kubernetes may schedule Pods like this:

```text
Node-1 → 2 Pods
Node-2 → 1 Pod
Node-3 → 0 Pods
```

A Deployment only guarantees the **number of Pods**, not where they run.

---

## DaemonSet

```text
Node-1 → 1 Pod
Node-2 → 1 Pod
Node-3 → 1 Pod
```

A DaemonSet guarantees one Pod on every eligible node.

---

# 4. Basic DaemonSet Example

```yaml
apiVersion: apps/v1
kind: DaemonSet

metadata:
  name: fluent-bit

spec:
  selector:
    matchLabels:
      app: fluent-bit

  template:
    metadata:
      labels:
        app: fluent-bit

    spec:
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit
```

Apply the manifest:

```bash
kubectl apply -f daemonset.yaml
```

---

# 5. How Scheduling Works

Suppose the cluster contains:

```text
Node-1
Node-2
Node-3
```

The DaemonSet automatically creates:

```text
Node-1 → fluent-bit-abc
Node-2 → fluent-bit-def
Node-3 → fluent-bit-ghi
```

Exactly one Pod runs on each node.

---

# 6. New Node Added

Before:

```text
Node-1
Node-2
Node-3
```

A new node joins:

```text
Node-4
```

DaemonSet automatically schedules:

```text
Node-4 → fluent-bit-new
```

No changes to the DaemonSet are required.

---

# 7. Node Removed

If a node is removed:

```text
Node-3 ❌
```

The corresponding DaemonSet Pod is also removed automatically.

No orphan Pods remain.

---

# 8. DaemonSet Architecture

```text
          DaemonSet
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
    Node-1  Node-2  Node-3
      │       │       │
      ▼       ▼       ▼
    Pod-1   Pod-2   Pod-3
```

Every eligible node runs one Pod.

---

# 9. Viewing DaemonSets

## List DaemonSets

```bash
kubectl get daemonsets
```

Short form:

```bash
kubectl get ds
```

---

## Describe a DaemonSet

```bash
kubectl describe ds fluent-bit
```

---

# 10. Updating a DaemonSet

Example:

```yaml
image: fluent/fluent-bit:2.0
```

Apply the updated manifest:

```bash
kubectl apply -f daemonset.yaml
```

Kubernetes performs a **Rolling Update**, updating Pods one node at a time.

Check rollout status:

```bash
kubectl rollout status ds/fluent-bit
```

---

# 11. Node Selector

Sometimes you want the DaemonSet to run **only on specific nodes**.

Example:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        role: worker
```

Only nodes labeled:

```text
role=worker
```

will receive the DaemonSet Pod.

Label a node:

```bash
kubectl label node worker-1 role=worker
```

---

# 12. Taints and Tolerations

Control-plane nodes are often **tainted**, preventing normal workloads from running on them.

Many system DaemonSets include:

```yaml
tolerations:
  - operator: Exists
```

This allows Pods to be scheduled even on tainted nodes.

> You'll learn **Taints** and **Tolerations** in a later lesson.

---

# 13. Real Production Examples

## Logging

```text
Every Node
     │
     ▼
Fluent Bit
     │
     ▼
Collect Container Logs
     │
     ▼
Elasticsearch
```

---

## Monitoring

```text
Every Node
     │
     ▼
Node Exporter
     │
     ▼
Prometheus
```

---

## Networking

```text
Every Node
     │
     ▼
Calico Agent
```

Required for Kubernetes networking.

---

# 14. Useful Commands

## List DaemonSets

```bash
kubectl get ds
```

---

## Describe a DaemonSet

```bash
kubectl describe ds <name>
```

---

## Delete a DaemonSet

```bash
kubectl delete ds <name>
```

---

## View Pods and Their Nodes

```bash
kubectl get pods -o wide
```

This shows which node each Pod is running on.

---

# 15. Common Mistakes

## Expecting Replicas

DaemonSets do **not** use:

```yaml
replicas: 3
```

This concept does not apply.

The number of Pods depends on the number of eligible nodes.

---

## No Matching Nodes

Example:

```yaml
nodeSelector:
  role: logging
```

If no node has the label:

```text
role=logging
```

Result:

```text
0 Pods created
```

Always verify node labels.

---

## Forgetting Tolerations

Some nodes (especially control-plane nodes) have taints.

Without appropriate tolerations:

- Pods cannot be scheduled.
- DaemonSet Pods remain pending.

---

# 16. Interview Questions

### What is a DaemonSet?

A Kubernetes workload that ensures **one Pod runs on every eligible node** in a cluster.

---

### What are common DaemonSet use cases?

- Monitoring
- Logging
- Networking
- Security agents

---

### Does a DaemonSet use replicas?

No.

The number of Pods automatically matches the number of eligible nodes.

---

### What happens when a new node joins the cluster?

Kubernetes automatically schedules a new DaemonSet Pod on that node.

---

### What is the difference between a Deployment and a DaemonSet?

| Feature | Deployment | DaemonSet |
|----------|------------|-----------|
| Number of Pods | Fixed (`replicas`) | One per eligible node |
| Used for Web Applications | ✅ | ❌ |
| Used for Monitoring Agents | ❌ | ✅ |
| Used for Logging Agents | ❌ | ✅ |
| Automatically Covers New Nodes | ❌ | ✅ |

---

# Summary

- A **DaemonSet** ensures that **one Pod runs on every eligible node**.
- It is commonly used for **monitoring**, **logging**, **networking**, and **security agents**.
- New nodes automatically receive a DaemonSet Pod.
- Removing a node automatically removes its DaemonSet Pod.
- DaemonSets do **not** use the `replicas` field.
- Use `nodeSelector` and `tolerations` to control where DaemonSet Pods are scheduled.