Lesson 20 — Network Policies (Pod-to-Pod Security, Traffic Control, Zero Trust Networking)

Until now, every Pod in your cluster can usually communicate with every other Pod.

Example:

Frontend Pod  ─────────► Backend Pod ✅
Frontend Pod  ─────────► Database Pod ✅
Monitoring Pod ────────► Database Pod ✅
Random Pod ────────────► Backend Pod ✅

This is Kubernetes' default networking model (assuming your CNI supports it).

In production, this is not secure.

1. What is a NetworkPolicy?

A NetworkPolicy is like a firewall for Pods.

It controls:

Which Pods can send traffic
Which Pods can receive traffic
Which ports are allowed
(Optionally) which external IPs are allowed
Think of it like this
Internet Firewall
        ↓
Protects Servers

Kubernetes NetworkPolicy
        ↓
Protects Pods
2. Why Do We Need It?

Suppose you have:

Frontend
Backend
Database

Without NetworkPolicy:

Frontend ─────► Backend ✅
Frontend ─────► Database ✅
Backend  ─────► Database ✅
Random Pod ───► Database ✅

The database is exposed to every Pod.

With NetworkPolicy:

Frontend ─────► Backend ✅
Backend  ─────► Database ✅

Frontend ─────► Database ❌
Random Pod ───► Database ❌

Much safer.

3. NetworkPolicy Components
NetworkPolicy

├── podSelector
├── policyTypes
├── ingress
└── egress
4. podSelector

Selects which Pods the policy protects.

Example:

podSelector:
  matchLabels:
    app: database

Meaning:

Apply this policy only to:

app=database
5. policyTypes

Defines what traffic is controlled.

Example:

policyTypes:
- Ingress

Controls incoming traffic.

Or:

policyTypes:
- Egress

Controls outgoing traffic.

Or both:

policyTypes:
- Ingress
- Egress
6. Ingress Policy

Controls:

Who can reach this Pod?

Example:

ingress:

Think:

Incoming traffic
7. Egress Policy

Controls:

Where can this Pod connect?

Example:

egress:

Think:

Outgoing traffic
8. Allow Backend to Access Database

Pods:

Frontend

Backend

Database

Labels:

Frontend
app=frontend

Backend
app=backend

Database
app=database

Policy:

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

Meaning:

Database accepts traffic only from:

app=backend

Result

Backend → Database ✅

Frontend → Database ❌

Random Pod → Database ❌
9. Allow Specific Port Only

Example:

ports:
- protocol: TCP
  port: 3306

Meaning:

Only MySQL traffic.

TCP 3306 ✅

Everything else ❌
10. Default Deny Policy

One of the most common production policies.

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: default-deny

spec:
  podSelector: {}

  policyTypes:
  - Ingress

Notice:

podSelector: {}

This means:

Every Pod

Since no ingress rules exist:

Everything blocked
Visual

Before:

Everyone
      ↓
Every Pod

After:

Nobody
      ↓
Every Pod

Then you explicitly allow only required traffic.

This is called:

Default Deny
11. Namespace Selector

Allow traffic from another namespace.

Example:

from:
- namespaceSelector:
    matchLabels:
      env: production

Only namespaces labeled:

env=production

can connect.

12. IP Block

Allow external IPs.

from:
- ipBlock:
    cidr: 10.0.0.0/24

Meaning:

10.0.0.1
10.0.0.2
10.0.0.3
...

Allowed.

13. Full Production Example
Internet
     ↓
Ingress
     ↓
Frontend
     ↓
Backend
     ↓
Database

Policies:

Internet → Frontend ✅

Frontend → Backend ✅

Backend → Database ✅

Frontend → Database ❌

Database → Internet ❌
14. Useful Commands
View Policies
kubectl get networkpolicy

Short form:

kubectl get netpol

Describe:

kubectl describe networkpolicy db-policy

View labels:

kubectl get pods --show-labels
15. Important Note

NetworkPolicies only work if your CNI plugin supports them.

Examples of CNIs that support NetworkPolicies:

Calico ✅
Cilium ✅
Weave Net ✅

Some basic CNIs ignore NetworkPolicies completely.

16. Common Mistakes
Labels Don't Match

Policy:

matchLabels:
  app: backend

Pod:

labels:
  app: api

Result:

Policy never applies
Forgetting Default Deny

You create one allow rule but forget to block everything else.

Traffic may still be allowed unexpectedly.

No NetworkPolicy Support

If your CNI doesn't support NetworkPolicies:

Policy exists

But:

Traffic still flows
17. Interview Questions
What is a NetworkPolicy?

A Kubernetes resource that controls network traffic to and from Pods.

What are the two policy types?
Ingress
Egress
What does podSelector do?

Selects the Pods the policy applies to.

What is a Default Deny policy?

A policy that blocks all traffic until explicit allow rules are added.

Do NetworkPolicies affect Services?

No. They control traffic at the Pod level. Services still route traffic, but Pods will accept or reject it based on the applicable NetworkPolicies.

Do all Kubernetes clusters support NetworkPolicies?

No. Your CNI plugin must implement NetworkPolicy support.

LAB
Task 1

Create three Deployments:

frontend
backend
database

Label them:

app=frontend
app=backend
app=database
Task 2

Create a Service for each Deployment.

Task 3

Create a NetworkPolicy that:

Applies to app=database
Allows ingress only from app=backend
Task 4

Verify:

kubectl get netpol
kubectl describe netpol db-policy
Task 5

Test connectivity:

From Backend Pod:

kubectl exec -it <backend-pod> -- sh

Try connecting to the database service.

Then test from the Frontend Pod and confirm that the connection is blocked.

Architecture Learned So Far
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

At this stage, you've covered nearly all the core Kubernetes objects and security concepts used in day-to-day production clusters.