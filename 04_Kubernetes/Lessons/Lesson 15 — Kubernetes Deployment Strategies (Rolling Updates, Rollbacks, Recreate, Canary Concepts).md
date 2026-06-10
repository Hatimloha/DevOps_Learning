Lesson 15 — Kubernetes Deployment Strategies (Rolling Updates, Rollbacks, Recreate, Canary Concepts)

One of Kubernetes' biggest advantages is:

Deploying new versions without downtime.

1. The Problem

Suppose your app is running:

v1
├── Pod 1
├── Pod 2
└── Pod 3

You need to deploy:

v2

How do you update users without taking the application offline?

2. Deployment Strategies

Common strategies:

Strategy	Downtime
Recreate	Yes
Rolling Update	No
Blue-Green	Minimal
Canary	Minimal

Kubernetes natively supports:

RollingUpdate
Recreate
3. Rolling Update (Default)

Current state:

v1
P1
P2
P3

Deploy v2:

P1(v1) → P1(v2)
P2(v1) → P2(v2)
P3(v1) → P3(v2)

One by one.

Users never lose service.

Example
strategy:
  type: RollingUpdate

Usually this is the default.

4. How Rolling Update Works

Example:

Replicas = 3

Kubernetes:

Create new Pod
Wait until Ready
Delete old Pod
Repeat
Visual
Old: 3 Pods

Step 1:
3 old + 1 new

Step 2:
2 old + 2 new

Step 3:
1 old + 3 new

Step 4:
0 old + 3 new
5. Rolling Update Parameters
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
maxUnavailable
maxUnavailable: 1

Maximum Pods allowed to be unavailable.

Example:

Replicas = 5

At least 4 stay running
maxSurge
maxSurge: 1

Extra Pods allowed during update.

Example:

Desired = 5

Can temporarily run = 6
6. Recreate Strategy

This is the old-school approach.

strategy:
  type: Recreate

Flow:

Delete all old Pods
       ↓
Create new Pods
Visual
v1 Pods
   ↓
Delete All
   ↓
Downtime
   ↓
Create v2 Pods
When Used?

Rare.

Mostly:

Database migrations
Legacy apps
7. Updating an Image

Current:

image: nginx:1.25

Update:

image: nginx:1.26

Apply:

kubectl apply -f deployment.yaml

Kubernetes automatically starts Rolling Update.

8. Check Rollout Status
kubectl rollout status deployment nginx

Example:

deployment "nginx" successfully rolled out
9. Rollout History
kubectl rollout history deployment nginx

Output:

REVISION  CHANGE-CAUSE
1         nginx:1.25
2         nginx:1.26
10. Rollback

Suppose:

v2 deployed
Application broken ❌

Rollback:

kubectl rollout undo deployment nginx

Result:

v2 → v1
Rollback to Specific Revision
kubectl rollout undo deployment nginx --to-revision=1
11. Deployment Revision History

Every update creates a new ReplicaSet.

Deployment
   │
   ├── ReplicaSet v1
   ├── ReplicaSet v2
   └── ReplicaSet v3

Rollback uses older ReplicaSets.

12. Canary Deployment (Concept)

Kubernetes doesn't provide this directly.

But conceptually:

90% → v1
10% → v2

Monitor:

Errors?
Performance?
Logs?

If good:

100% → v2
Example
Users
 │
 ├── 90% → Old Version
 └── 10% → New Version

Often implemented using:

Ingress
Service Mesh
13. Blue-Green Deployment (Concept)

Maintain two environments.

Blue  = Current
Green = New

Example:

Blue → v1
Green → v2

Switch traffic instantly.

Users
   ↓
Green

Rollback is easy.

14. Useful Commands
View Rollout Status
kubectl rollout status deployment nginx
View History
kubectl rollout history deployment nginx
Rollback
kubectl rollout undo deployment nginx
Restart Deployment
kubectl rollout restart deployment nginx
Watch Deployment
kubectl get deployment -w
15. Common Problems
New Pods Never Become Ready
Readiness Probe Failing

Rolling update gets stuck.

CrashLoopBackOff
Bad image
Bad config

Deployment cannot complete.

Image Pull Error
ImagePullBackOff

Wrong image name or registry issue.

16. Interview Questions
What is Rolling Update?

Gradually replaces old Pods with new Pods without downtime.

What is Recreate?

Deletes all old Pods before creating new Pods.

How do you rollback?
kubectl rollout undo deployment <name>
What is maxSurge?

Maximum extra Pods created during update.

What is maxUnavailable?

Maximum Pods allowed to be unavailable during update.

What creates deployment revisions?

ReplicaSets.