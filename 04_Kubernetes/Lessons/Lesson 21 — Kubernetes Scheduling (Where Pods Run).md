# Lesson 21 — Kubernetes Scheduling (Where Pods Run)

Until now, Kubernetes has handled:

- Which Pods should run
- How many Pods should run
- When Pods should restart

Now we learn an important question:

> **Which Node should a Pod run on?**

This process is called **Scheduling**.

---

# 1. What is Scheduling?

Kubernetes Scheduling is the process of deciding:

```text
Pod → Node placement
```

Example:

```text
Pod A → Node 1

Pod B → Node 2

Pod C → Node 3
```

The component responsible for this decision is:

```text
kube-scheduler
```

---

# 2. Default Scheduling

Without any scheduling rules, Kubernetes Scheduler automatically selects a suitable node.

It considers:

- Available CPU
- Available Memory
- Node health
- Current workload
- Resource requests

Example:

```text
Pod Created

      ↓

Scheduler checks nodes

      ↓

Select best node

      ↓

Pod starts
```

---

# 3. Node Selector (Basic Scheduling)

`nodeSelector` is the simplest way to control where Pods run.

It uses node labels.

---

## Step 1: Label a Node

Example:

```bash
kubectl label node node-1 env=prod
```

Now the node has:

```text
env=prod
```

---

## Step 2: Use nodeSelector in Pod

```yaml
spec:
  nodeSelector:
    env: prod
```

Meaning:

The Pod will run only on nodes with:

```text
env=prod
```

---

# 4. Node Affinity (Advanced Scheduling)

`nodeSelector` only supports simple exact matching.

Example:

```text
env=prod
```

Node Affinity provides more advanced rules.

Example:

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:

        - key: env
          operator: In

          values:
          - prod
          - staging
```

Meaning:

The Pod can run on:

```text
prod nodes

OR

staging nodes
```

---

# 5. Node Affinity Types

## requiredDuringSchedulingIgnoredDuringExecution

Hard requirement.

The rule must match.

Example:

```text
No matching node

↓

Pod remains Pending
```

---

## preferredDuringSchedulingIgnoredDuringExecution

Soft preference.

Kubernetes tries to satisfy the rule.

Example:

```text
Prefer GPU node

If unavailable:

Use another node
```

---

# 6. Real Example: Prefer GPU Nodes

```yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:

    - weight: 1

      preference:
        matchExpressions:

        - key: gpu
          operator: In

          values:
          - true
```

Meaning:

```text
Prefer GPU nodes

But not required
```

---

# 7. Pod Affinity (Run Together)

Pod Affinity places Pods close to each other.

Example:

```text
Frontend
+
Cache
```

running on the same node can reduce latency.

Example:

```yaml
affinity:
  podAffinity:

    requiredDuringSchedulingIgnoredDuringExecution:

    - labelSelector:
        matchLabels:
          app: cache

      topologyKey: "kubernetes.io/hostname"
```

Meaning:

Place this Pod where a cache Pod already exists.

---

# 8. Pod Anti-Affinity (Avoid Together)

Pod Anti-Affinity prevents Pods from running together.

Example:

```text
Database Replica 1 → Node 1

Database Replica 2 → Node 2
```

instead of:

```text
Node 1

Database Replica 1
Database Replica 2
```

Example:

```yaml
affinity:
  podAntiAffinity:

    requiredDuringSchedulingIgnoredDuringExecution:

    - labelSelector:
        matchLabels:
          app: db

      topologyKey: "kubernetes.io/hostname"
```

Meaning:

Database Pods must run on different nodes.

---

# 9. Taints & Tolerations (Node Protection)

Sometimes nodes should reject normal workloads.

A node can be protected using a **Taint**.

---

## Add Taint to Node

```bash
kubectl taint nodes node-1 key=value:NoSchedule
```

Meaning:

```text
No Pods can run here
```

unless they have permission.

---

## Toleration (Pod Permission)

Example:

```yaml
tolerations:

- key: "key"

  operator: "Equal"

  value: "value"

  effect: "NoSchedule"
```

Meaning:

This Pod is allowed to run on the tainted node.

---

# 10. Taint Effects

| Effect | Meaning |
|---|---|
| NoSchedule | New Pods are blocked |
| PreferNoSchedule | Try to avoid placing Pods |
| NoExecute | Existing Pods may be evicted |

---

# 11. Real Production Usage

Common examples:

## Master Nodes

Usually tainted:

```text
No normal workloads
```

---

## GPU Nodes

Only allow:

```text
Machine Learning workloads
```

---

## Database Nodes

Only allow:

```text
Database Pods
```

---

# 12. Complete Scheduling Flow

When a Pod is created:

```text
Pod Created
     ↓
Check Node Selector
     ↓
Check Node Affinity
     ↓
Check Pod Affinity / Anti-Affinity
     ↓
Check Taints & Tolerations
     ↓
Check Resources
     ↓
Select Node
```

---

# 13. Scheduling Cheat Sheet

| Feature | Use Case |
|---|---|
| nodeSelector | Simple node placement |
| nodeAffinity | Advanced node rules |
| podAffinity | Place Pods together |
| podAntiAffinity | Spread Pods apart |
| taints | Protect nodes |
| tolerations | Allow Pods on protected nodes |

---

# 14. Commands You Must Know

## View Nodes

```bash
kubectl get nodes
```

---

## Label Node

```bash
kubectl label node node-1 env=prod
```

---

## Check Node Labels

```bash
kubectl get nodes --show-labels
```

---

## Taint Node

```bash
kubectl taint nodes node-1 key=value:NoSchedule
```

---

## Remove Taint

```bash
kubectl taint nodes node-1 key=value:NoSchedule-
```

---

# 15. Common Mistakes

## No Matching Node

Pod status:

```text
Pending
```

Reason:

No node satisfies:

```yaml
nodeSelector
```

or:

```yaml
nodeAffinity
```

---

## Forgetting Toleration

Node has:

```text
Taint
```

Pod has:

```text
No toleration
```

Result:

Pod cannot schedule.

---

## Wrong Labels

Node:

```text
env=prod
```

Pod expects:

```text
env=production
```

Mismatch:

```text
Scheduling fails
```

---

# 16. Interview Questions

## What is Kubernetes Scheduling?

The process of assigning Pods to appropriate Nodes.

---

## Difference between nodeSelector and nodeAffinity?

### nodeSelector

- Simple matching
- Equality based

Example:

```yaml
env: prod
```

---

### nodeAffinity

- Advanced rules
- Supports operators
- Supports preferences

---

## What is a Taint?

A restriction applied to Nodes to prevent unwanted Pods from running.

---

## What is a Toleration?

A permission that allows a Pod to run on a tainted Node.

---

## What is Pod Anti-Affinity?

A rule that prevents specific Pods from running together.

---

# 17. LAB Practice

## Task 1

Label a node:

```text
env=dev
```

---

## Task 2

Deploy a Pod using:

```yaml
nodeSelector
```

Verify it runs on the correct node.

---

## Task 3

Create two replicas and apply:

```text
podAntiAffinity
```

Verify Pods run on different nodes.

---

## Task 4

Taint a node:

```bash
kubectl taint nodes node-1 key=value:NoSchedule
```

Test Pod scheduling failure.

---

## Task 5

Add a toleration and fix scheduling.

---

# 18. Mental Model

Scheduler decision flow:

```text
Node Selector
      ↓
Node Affinity
      ↓
Pod Affinity / Anti-Affinity
      ↓
Taints & Tolerations
      ↓
Resource Check
      ↓
Final Node Selection
```

---

# Summary

- Kubernetes Scheduler decides where Pods run.
- `nodeSelector` provides simple node placement.
- `nodeAffinity` provides advanced scheduling rules.
- `podAffinity` places related Pods together.
- `podAntiAffinity` spreads Pods across nodes.
- Taints protect nodes from unwanted workloads.
- Tolerations allow specific Pods onto protected nodes.
- Scheduling rules are essential for production clusters with specialized nodes.