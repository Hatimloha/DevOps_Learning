Lesson 21 — Kubernetes Scheduling (Where Pods Run)

So far Kubernetes decides:

Which Pod runs
How many run
When they restart

Now the important part:

“Which node should a Pod run on?”

That’s Scheduling.

1. What is Scheduling?

Kubernetes Scheduler decides:

Pod → Node placement

Example:

Pod A → Node 1
Pod B → Node 2
Pod C → Node 3
2. Default Scheduling

Without any rules:

Scheduler picks any available node

Based on:

CPU available
Memory available
Node health
3. Node Selector (Basic Scheduling)

👉 Simplest way to control node placement.

Step 1: Label node

kubectl label node node-1 env=prod

Step 2: Use in Pod

spec:
  nodeSelector:
    env: prod

Meaning:

Run Pod ONLY on nodes with:
env=prod
4. Node Affinity (Advanced Scheduling)

NodeSelector is basic (exact match only).

Node Affinity is smarter.

Example
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
Meaning
Pod can run on:
- prod nodes
- staging nodes
5. Node Affinity Types
requiredDuringScheduling

👉 Hard rule (must match)

If no matching node → Pod stays Pending
preferredDuringScheduling

👉 Soft rule (best effort)

Try preferred node
Else choose others
6. Real Example
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

Meaning:

Prefer GPU nodes
But not required
7. Pod Affinity (Run Together)

👉 Place Pods close to each other.

Example:

frontend + cache on same node
affinity:
  podAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchLabels:
          app: cache
      topologyKey: "kubernetes.io/hostname"

Meaning:

Place this Pod where cache Pod already exists
8. Pod Anti-Affinity (Avoid Together)

👉 Spread Pods across nodes.

Example:

Don’t place 2 database Pods on same node
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchLabels:
          app: db
      topologyKey: "kubernetes.io/hostname"

Meaning:

Each DB Pod must be on different node
9. Taints & Tolerations (Node Protection)

👉 Nodes can “reject” Pods.

Taint Node
kubectl taint nodes node-1 key=value:NoSchedule

Meaning:

No Pod can run here unless allowed
Toleration (Pod allows it)
tolerations:
- key: "key"
  operator: "Equal"
  value: "value"
  effect: "NoSchedule"

Meaning:

This Pod is allowed on tainted node
10. Taint Effects
Effect	Meaning
NoSchedule	Pod blocked
PreferNoSchedule	Try avoid
NoExecute	Evict running Pods
11. Real Production Use
Master Nodes → tainted (no normal workloads)
GPU Nodes → only ML workloads
DB Nodes → only database Pods
12. Full Scheduling Flow
Pod Created
   ↓
Check Node Selector
   ↓
Check Node Affinity
   ↓
Check Taints & Tolerations
   ↓
Check Resources (CPU/Memory)
   ↓
Pick Node
13. Scheduling Cheat Sheet
Feature	Use Case
nodeSelector	Simple placement
nodeAffinity	Advanced rules
podAffinity	Co-locate apps
podAntiAffinity	Spread apps
taints	Protect nodes
tolerations	Allow special Pods
14. Commands You Must Know
View nodes
kubectl get nodes
Label node
kubectl label node node-1 env=prod
Check labels
kubectl get nodes --show-labels
Taint node
kubectl taint nodes node-1 key=value:NoSchedule
Remove taint
kubectl taint nodes node-1 key=value:NoSchedule-
15. Common Mistakes
No matching node
Pod stuck in Pending

Reason:

No node satisfies selector
Forgetting toleration
Pod rejected by tainted node
Wrong labels
env=prod (node)
env=production (pod)

Mismatch → scheduling fails

16. Interview Questions
What is Kubernetes scheduling?

Process of assigning Pods to nodes.

Difference between nodeSelector and nodeAffinity?
nodeSelector → simple equality
nodeAffinity → advanced rules
What is taint?

A restriction applied to nodes to repel Pods.

What is toleration?

Permission for a Pod to run on a tainted node.

What is podAntiAffinity?

Ensures Pods do NOT run together.

17. LAB
Task 1

Label node:

env=dev
Task 2

Deploy Pod using nodeSelector.

Task 3

Create 2 replicas and apply podAntiAffinity.

Task 4

Taint a node and test Pod scheduling failure.

Task 5

Add toleration and fix scheduling.

18. Mental Model
Scheduler Decision Flow:

Node Selector
   ↓
Node Affinity
   ↓
Taints & Tolerations
   ↓
Resources Check
   ↓
Final Node Selection