# Lesson 14 — Namespaces (Logical Isolation, Multi-Tenancy, Resource Separation)
As clusters grow, you can't keep everything in one place.

## Imagine:
Imagine:
```
Cluster
├── Frontend
├── Backend
├── Database
├── Monitoring
├── Dev Apps
├── Staging Apps
└── Production Apps
```
Very quickly it becomes messy.

Kubernetes solves this with Namespaces.

1. What is a Namespace?

A Namespace is a logical partition inside a Kubernetes cluster.

Think of it like folders:

Cluster
│
├── dev
├── staging
├── production
└── monitoring

Resources inside one namespace are isolated from others.

2. Why Use Namespaces?

Without namespaces:

frontend
backend
redis
mysql
frontend
backend
redis
mysql

Name conflicts ❌

With namespaces:

dev/frontend
prod/frontend

dev/backend
prod/backend

No conflicts ✅

3. Default Namespaces

Run:

kubectl get ns

You'll see something like:

default
kube-system
kube-public
kube-node-lease
default

Where resources go if no namespace is specified.

kube-system

Contains cluster components:

CoreDNS
Scheduler
Controller Manager
kube-public

Publicly readable resources.

kube-node-lease

Used for node heartbeat tracking.

4. Create a Namespace
apiVersion: v1
kind: Namespace

metadata:
  name: dev

Apply:

kubectl apply -f namespace.yaml

Or:

kubectl create namespace dev
5. Deploy Into a Namespace
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx
  namespace: dev

Now the deployment exists inside:

dev namespace
6. View Namespace Resources

Get all Pods:

kubectl get pods -n dev

or

kubectl get pods --namespace=dev
7. Same Name in Different Namespaces

This is allowed:

dev/nginx
prod/nginx

No conflict.

Example
namespace: dev
name: nginx

and

namespace: prod
name: nginx

Both can exist.

8. Namespace Architecture
Cluster
│
├── dev
│   ├── frontend
│   └── backend
│
├── staging
│   ├── frontend
│   └── backend
│
└── production
    ├── frontend
    └── backend
9. Service Communication Across Namespaces

Inside same namespace:

backend-service

Works.

Across namespaces:

Use FQDN:

backend.dev.svc.cluster.local

Format:

<service>.<namespace>.svc.cluster.local
10. Set Default Namespace

Instead of:

kubectl get pods -n dev

Set context:

kubectl config set-context --current --namespace=dev

Now:

kubectl get pods

Automatically uses dev.

11. Resource Quotas Per Namespace

Example:

apiVersion: v1
kind: ResourceQuota

metadata:
  name: dev-quota
  namespace: dev

spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi

Meaning:

dev namespace
Max CPU = 2
Max RAM = 4Gi
12. LimitRange Per Namespace

Default resource settings:

apiVersion: v1
kind: LimitRange

Used to enforce:

Every Pod must have:
CPU Requests
Memory Requests
13. Real Production Namespace Design
kube-system
monitoring
logging
ingress-nginx

dev
staging
production

Very common structure.

14. Useful Commands
List Namespaces
kubectl get ns
Create Namespace
kubectl create namespace dev
Delete Namespace
kubectl delete namespace dev

⚠️ Deletes everything inside it.

View Resources
kubectl get all -n dev
Describe Namespace
kubectl describe namespace dev
15. Common Mistakes
Deployment Not Found
kubectl get deployment nginx

Returns:

NotFound

Reason:

Deployment exists in dev namespace

Use:

kubectl get deployment nginx -n dev
Service Can't Reach App

Often caused by:

Service in namespace A
Pod in namespace B

Check namespaces carefully.

16. Interview Questions
What is a Namespace?

A logical isolation mechanism inside a Kubernetes cluster.

Why use Namespaces?
Resource organization
Multi-tenancy
Environment separation
Resource quotas
Can two Deployments have the same name?

Yes, if they are in different namespaces.

What is the default namespace?

default

How do Services communicate across namespaces?

Using:

service.namespace.svc.cluster.local