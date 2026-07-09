# Lesson 20 — Network Policies (Pod-to-Pod Security, Traffic Control, Zero Trust Networking)

Until now, all Pods in your Kubernetes cluster could usually communicate with each other.

Example:

```text
Frontend Pod  ─────────► Backend Pod ✅
Frontend Pod  ─────────► Database Pod ✅
Monitoring Pod ────────► Database Pod ✅
Random Pod ────────────► Backend Pod ✅
```

This is the default Kubernetes networking model (assuming your CNI plugin supports it).

In production environments, this is usually **not secure**.

A better approach is:

> Allow only required communication and block everything else.

This is called **Zero Trust Networking**.

---

# 1. What is a NetworkPolicy?

A **NetworkPolicy** is a Kubernetes resource that works like a firewall for Pods.

It controls:

- Which Pods can send traffic
- Which Pods can receive traffic
- Which ports are allowed
- Which namespaces can communicate
- Which external IP ranges can access Pods

Think of it like:

```text
Internet Firewall
        ↓
Protects Servers
```

Kubernetes NetworkPolicy:

```text
NetworkPolicy
        ↓
Protects Pods
```

---

# 2. Why Do We Need NetworkPolicies?

Imagine a three-tier application:

```text
Frontend
Backend
Database
```

Without NetworkPolicy:

```text
Frontend ─────► Backend ✅
Frontend ─────► Database ✅
Backend  ─────► Database ✅
Random Pod ───► Database ✅
```

Every Pod can access the database.

This creates a security risk.

---

With NetworkPolicy:

```text
Frontend ─────► Backend ✅

Backend  ─────► Database ✅

Frontend ─────► Database ❌

Random Pod ───► Database ❌
```

Only required communication is allowed.

---

# 3. NetworkPolicy Components

A NetworkPolicy contains:

```text
NetworkPolicy

├── podSelector
├── policyTypes
├── ingress
└── egress
```

---

# 4. podSelector

`podSelector` defines which Pods the policy applies to.

Example:

```yaml
podSelector:
  matchLabels:
    app: database
```

Meaning:

Apply this policy only to:

```text
app=database
```

Pods.

---

# 5. policyTypes

Defines which traffic direction is controlled.

## Ingress

Controls incoming traffic.

```yaml
policyTypes:
- Ingress
```

Question answered:

> Who can access this Pod?

---

## Egress

Controls outgoing traffic.

```yaml
policyTypes:
- Egress
```

Question answered:

> Where can this Pod connect?

---

## Both

```yaml
policyTypes:
- Ingress
- Egress
```

Controls both directions.

---

# 6. Ingress Policy

Ingress controls:

```text
Who can reach this Pod?
```

Example:

```yaml
ingress:
```

It defines allowed incoming connections.

---

# 7. Egress Policy

Egress controls:

```text
Where can this Pod connect?
```

Example:

```yaml
egress:
```

It defines allowed outgoing connections.

---

# 8. Allow Backend to Access Database

Application Pods:

```text
Frontend

Backend

Database
```

Labels:

Frontend:

```yaml
app: frontend
```

Backend:

```yaml
app: backend
```

Database:

```yaml
app: database
```

---

NetworkPolicy:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: db-policy

spec:
  podSelector:
    matchLabels:
      app: database

  policyTypes:
  - Ingress

  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend
```

Meaning:

The database accepts traffic only from:

```text
app=backend
```

---

Result:

```text
Backend → Database ✅

Frontend → Database ❌

Random Pod → Database ❌
```

---

# 9. Allow Specific Port Only

Example:

```yaml
ports:
- protocol: TCP
  port: 3306
```

Meaning:

Only MySQL traffic is allowed.

Allowed:

```text
TCP 3306 ✅
```

Blocked:

```text
Other ports ❌
```

---

# 10. Default Deny Policy

A common production security pattern is:

1. Block everything.
2. Allow only required traffic.

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: default-deny

spec:
  podSelector: {}

  policyTypes:
  - Ingress
```

Important:

```yaml
podSelector: {}
```

means:

```text
Every Pod
```

Because there are no ingress rules:

```text
All incoming traffic is blocked.
```

---

Before:

```text
Everyone
    ↓
Every Pod
```

---

After:

```text
Nobody
    ↓
Every Pod
```

Then you create specific allow rules.

This approach is called:

```text
Default Deny
```

---

# 11. Namespace Selector

Allow traffic from another namespace.

Example:

```yaml
from:
- namespaceSelector:
    matchLabels:
      env: production
```

Only namespaces with:

```text
env=production
```

can communicate.

---

# 12. IP Block

Allow external IP ranges.

Example:

```yaml
from:
- ipBlock:
    cidr: 10.0.0.0/24
```

Allows:

```text
10.0.0.1
10.0.0.2
10.0.0.3
...
```

---

# 13. Full Production Example

Architecture:

```text
Internet
    ↓
Ingress
    ↓
Frontend
    ↓
Backend
    ↓
Database
```

Network rules:

```text
Internet → Frontend ✅

Frontend → Backend ✅

Backend → Database ✅

Frontend → Database ❌

Database → Internet ❌
```

Only required paths are open.

---

# 14. Useful Commands

## View NetworkPolicies

```bash
kubectl get networkpolicy
```

Short form:

```bash
kubectl get netpol
```

---

## Describe NetworkPolicy

```bash
kubectl describe networkpolicy db-policy
```

---

## View Pod Labels

```bash
kubectl get pods --show-labels
```

Labels are critical because NetworkPolicies use labels for selecting Pods.

---

# 15. Important Note: CNI Support

NetworkPolicies work only if your CNI plugin supports them.

Examples:

| CNI | NetworkPolicy Support |
|----|----|
| Calico | ✅ |
| Cilium | ✅ |
| Weave Net | ✅ |

Some basic networking plugins ignore NetworkPolicies.

---

# 16. Common Mistakes

## Labels Don't Match

Policy:

```yaml
matchLabels:
  app: backend
```

Pod:

```yaml
labels:
  app: api
```

Result:

```text
Policy does not apply
```

Always verify labels.

---

## Forgetting Default Deny

You create allow rules but forget to block other traffic.

Result:

Unexpected communication may still be possible.

---

## No NetworkPolicy Support

The YAML exists:

```text
NetworkPolicy created ✅
```

But traffic still works:

```text
Traffic flows ❌
```

Reason:

CNI does not support NetworkPolicies.

---

# 17. Interview Questions

## What is a NetworkPolicy?

A Kubernetes resource that controls network traffic to and from Pods.

---

## What are the two policy types?

```text
Ingress
Egress
```

---

## What does podSelector do?

It selects which Pods the NetworkPolicy applies to.

---

## What is a Default Deny policy?

A policy that blocks all traffic until explicit allow rules are created.

---

## Do NetworkPolicies affect Services?

No.

Services still route traffic, but Pods accept or reject traffic based on NetworkPolicy rules.

---

## Do all Kubernetes clusters support NetworkPolicies?

No.

The CNI plugin must support NetworkPolicy implementation.

---

# LAB: NetworkPolicy Practice

## Task 1: Create Three Deployments

Create:

```text
frontend
backend
database
```

Labels:

```text
app=frontend
app=backend
app=database
```

---

## Task 2: Create Services

Create a Service for each Deployment.

---

## Task 3: Create Database NetworkPolicy

Requirements:

- Apply policy to:

```text
app=database
```

- Allow ingress only from:

```text
app=backend
```

---

## Task 4: Verify Policy

Check policies:

```bash
kubectl get netpol
```

Describe:

```bash
kubectl describe netpol db-policy
```

---

## Task 5: Test Connectivity

From Backend Pod:

```bash
kubectl exec -it <backend-pod> -- sh
```

Test connection to the database service.

Then test from Frontend Pod.

Expected:

```text
Backend → Database ✅

Frontend → Database ❌
```

---

# Kubernetes Architecture Learned So Far

```text
Cluster
    ↓
Namespaces
    ↓
RBAC
    ↓
NetworkPolicies
    ↓
Deployments
    ↓
ReplicaSets
    ↓
Pods
    ↓
Services
    ↓
Ingress
```

At this stage, you have covered almost all core Kubernetes objects and security concepts used in day-to-day production clusters.

---

# Summary

- NetworkPolicies provide Pod-level network security.
- They work like firewalls for Kubernetes workloads.
- Use `podSelector` to target specific Pods.
- Use Ingress rules to control incoming traffic.
- Use Egress rules to control outgoing traffic.
- Default Deny is a common production security pattern.
- NetworkPolicies require CNI support.
- Zero Trust networking means allowing only required communication.