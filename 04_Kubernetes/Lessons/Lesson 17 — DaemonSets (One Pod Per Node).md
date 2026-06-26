Lesson 17 — DaemonSets (One Pod Per Node)

Until now:

Deployment  → Desired number of Pods
StatefulSet → Stateful Pods

But sometimes you want:

"Run exactly one Pod on every node."

That's what DaemonSet does.

1. What is a DaemonSet?

A DaemonSet ensures:

1 Node  → 1 Pod

Example:

Cluster

Node-1 → Monitoring Pod
Node-2 → Monitoring Pod
Node-3 → Monitoring Pod

If a new node joins:

Node-4 joins
      ↓
DaemonSet automatically creates Pod
2. Why Do We Need DaemonSets?

Some applications must run on every node:

Monitoring
Node Exporter
Datadog Agent
Logging
Fluent Bit
Fluentd
Networking
Calico
Cilium
Security
Antivirus agents
Security scanners
Compliance agents
3. Deployment vs DaemonSet

Suppose:

3 Nodes

Deployment:

replicas: 3

Could result in:

Node-1 → 2 Pods
Node-2 → 1 Pod
Node-3 → 0 Pods

DaemonSet:

Node-1 → 1 Pod
Node-2 → 1 Pod
Node-3 → 1 Pod

Guaranteed.

4. Basic DaemonSet Example
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

Apply:

kubectl apply -f daemonset.yaml
5. How Scheduling Works

Cluster:

Node-1
Node-2
Node-3

DaemonSet creates:

fluent-bit-abc
fluent-bit-def
fluent-bit-ghi

One per node.

6. New Node Added

Before:

Node-1
Node-2
Node-3

After:

Node-4

DaemonSet automatically:

Creates Pod on Node-4

No manual action required.

7. Node Removed

If:

Node-3 removed

Then:

DaemonSet Pod on Node-3 removed

Automatically.

8. DaemonSet Architecture
DaemonSet
     ↓
 ┌───┼───┐
 ↓   ↓   ↓
N1  N2  N3
 ↓   ↓   ↓
P1  P2  P3
9. Viewing DaemonSets
kubectl get daemonsets

Short form:

kubectl get ds

Describe:

kubectl describe ds fluent-bit
10. Update a DaemonSet

Example:

image: fluent/fluent-bit:2.0

Apply:

kubectl apply -f daemonset.yaml

Kubernetes performs a rolling update.

Check:

kubectl rollout status ds/fluent-bit
11. Node Selector

Run only on specific nodes.

Example:

spec:
  template:
    spec:
      nodeSelector:
        role: worker

Only nodes with:

role=worker

will get Pods.

Label node:

kubectl label node worker-1 role=worker
12. Taints and Tolerations

Many system DaemonSets run even on control-plane nodes.

Example:

tolerations:
- operator: Exists

Allows scheduling onto tainted nodes.

You'll learn taints/tolerations in a later lesson.

13. Real Production Examples
Logging
Every Node
     ↓
Fluent Bit
     ↓
Collect Container Logs
     ↓
Send to Elasticsearch
Monitoring
Every Node
     ↓
Node Exporter
     ↓
Prometheus
Networking
Every Node
     ↓
Calico Agent

Required for cluster networking.

14. Useful Commands
List DaemonSets
kubectl get ds
Describe
kubectl describe ds <name>
Delete
kubectl delete ds <name>
Check Pods
kubectl get pods -o wide

Shows which node each Pod runs on.

15. Common Mistakes
Expecting Replicas

DaemonSets don't use:

replicas: 3

❌ Invalid concept.

Pods depend on node count.

No Matching Nodes

Bad selector:

nodeSelector:
  role: logging

But no node has:

role=logging

Result:

0 Pods created
Forgetting Tolerations

System nodes may reject Pods.

16. Interview Questions
What is a DaemonSet?

A workload that ensures one Pod runs on every eligible node.

Common DaemonSet use cases?
Monitoring
Logging
Networking
Security agents
Does DaemonSet use replicas?

No.

Number of Pods equals number of matching nodes.

What happens when a new node joins?

A new DaemonSet Pod is automatically created.

Difference between Deployment and DaemonSet?
Feature	Deployment	DaemonSet
Replica count	Fixed	Per node
Web apps	✅	❌
Monitoring agents	❌	✅
Logging agents	❌	✅