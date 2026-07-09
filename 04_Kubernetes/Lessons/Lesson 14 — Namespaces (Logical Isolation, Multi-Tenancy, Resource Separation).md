# Lesson 14 — Namespaces (Logical Isolation, Multi-Tenancy, Resource Separation)

As Kubernetes clusters grow, managing all resources in a single space becomes difficult. **Namespaces** provide logical isolation, making clusters easier to organize and manage.

---

# 1. What is a Namespace?

A **Namespace** is a **logical partition** inside a Kubernetes cluster that isolates resources from one another.

Think of namespaces like folders on your computer.

```text
Cluster
│
├── dev
├── staging
├── production
└── monitoring
```

Resources inside one namespace are isolated from resources in other namespaces.

---

# 2. Why Use Namespaces?

Without namespaces, resource names can conflict.

```text
frontend
backend
redis
mysql
frontend
backend
redis
mysql
```

❌ Name conflicts occur.

With namespaces:

```text
dev/frontend
dev/backend

prod/frontend
prod/backend
```

✅ Same resource names can exist in different namespaces without conflict.

Namespaces are commonly used to separate:

- Development
- Staging
- Production
- Monitoring
- Logging

---

# 3. Default Namespaces

List all namespaces:

```bash
kubectl get ns
```

Example output:

```text
default
kube-system
kube-public
kube-node-lease
```

### `default`

Resources are created here if no namespace is specified.

### `kube-system`

Contains Kubernetes system components such as:

- CoreDNS
- Scheduler
- Controller Manager

### `kube-public`

Contains publicly readable resources.

### `kube-node-lease`

Used for node heartbeat tracking.

---

# 4. Create a Namespace

**namespace.yaml**

```yaml
apiVersion: v1
kind: Namespace

metadata:
  name: dev
```

Apply the manifest:

```bash
kubectl apply -f namespace.yaml
```

Or create it directly:

```bash
kubectl create namespace dev
```

---

# 5. Deploy Into a Namespace

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx
  namespace: dev
```

This deployment will be created inside the **dev** namespace.

---

# 6. View Resources in a Namespace

Get Pods from the **dev** namespace:

```bash
kubectl get pods -n dev
```

or

```bash
kubectl get pods --namespace=dev
```

---

# 7. Same Resource Name in Different Namespaces

Kubernetes allows resources with the same name if they belong to different namespaces.

Example:

```text
dev/nginx
prod/nginx
```

Equivalent manifests:

```yaml
namespace: dev
name: nginx
```

```yaml
namespace: prod
name: nginx
```

Both Deployments can exist simultaneously.

---

# 8. Namespace Architecture

```text
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
```

---

# 9. Service Communication Across Namespaces

Within the same namespace:

```text
backend-service
```

works automatically.

Across namespaces, use the Fully Qualified Domain Name (FQDN):

```text
backend.dev.svc.cluster.local
```

Format:

```text
<service>.<namespace>.svc.cluster.local
```

---

# 10. Set a Default Namespace

Instead of specifying the namespace every time:

```bash
kubectl get pods -n dev
```

Set the current context:

```bash
kubectl config set-context --current --namespace=dev
```

Now simply run:

```bash
kubectl get pods
```

and Kubernetes will automatically use the **dev** namespace.

---

# 11. Resource Quotas Per Namespace

Limit the amount of resources a namespace can consume.

```yaml
apiVersion: v1
kind: ResourceQuota

metadata:
  name: dev-quota
  namespace: dev

spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
```

This limits the **dev** namespace to:

- Maximum CPU Requests: **2**
- Maximum Memory Requests: **4Gi**

---

# 12. LimitRange Per Namespace

A **LimitRange** defines default or minimum/maximum resource values for Pods and Containers.

```yaml
apiVersion: v1
kind: LimitRange
```

Commonly used to enforce:

- CPU Requests
- CPU Limits
- Memory Requests
- Memory Limits

---

# 13. Typical Production Namespace Design

```text
kube-system
monitoring
logging
ingress-nginx

dev
staging
production
```

This structure is commonly used in production Kubernetes clusters.

---

# 14. Useful Commands

### List Namespaces

```bash
kubectl get ns
```

### Create Namespace

```bash
kubectl create namespace dev
```

### Delete Namespace

```bash
kubectl delete namespace dev
```

> **Warning:** Deleting a namespace deletes **all resources** inside it.

### View All Resources

```bash
kubectl get all -n dev
```

### Describe a Namespace

```bash
kubectl describe namespace dev
```

---

# 15. Common Mistakes

## Deployment Not Found

Command:

```bash
kubectl get deployment nginx
```

Output:

```text
Error from server (NotFound)
```

Reason:

The Deployment exists in another namespace (e.g., `dev`).

Correct command:

```bash
kubectl get deployment nginx -n dev
```

---

## Service Cannot Reach the Application

Often caused by:

- Service in Namespace **A**
- Pod in Namespace **B**

Always verify that the Service and Pod are in the correct namespace, or use the Service FQDN when communicating across namespaces.

---

# 16. Interview Questions

### What is a Namespace?

A logical isolation mechanism inside a Kubernetes cluster used to organize and separate resources.

---

### Why are Namespaces used?

- Resource organization
- Multi-tenancy
- Environment separation (Dev, Staging, Production)
- Resource quotas and limits

---

### Can two Deployments have the same name?

Yes, as long as they are created in different namespaces.

Example:

```text
dev/nginx
prod/nginx
```

---

### What is the default namespace?

```text
default
```

---

### How do Services communicate across namespaces?

Using the Fully Qualified Domain Name (FQDN):

```text
service.namespace.svc.cluster.local
```

---

# Summary

- Namespaces logically isolate resources inside a Kubernetes cluster.
- Resources with the same name can exist in different namespaces.
- Kubernetes provides four default namespaces.
- Use namespaces to separate environments like Dev, Staging, and Production.
- ResourceQuota and LimitRange help control resource usage within a namespace.
- Services communicate across namespaces using their FQDN.
- Setting a default namespace simplifies daily `kubectl` commands.