# Lesson 16 — StatefulSets (Persistent Identity, Ordered Deployment, Databases in Kubernetes)

So far, you've primarily used **Deployments**, which are ideal for **stateless applications** such as:

- Nginx
- React
- Node.js
- Python APIs
- Java APIs

However, not every application is stateless. Databases and distributed systems require **persistent identity**, **stable storage**, and **ordered deployment**, which is where **StatefulSets** come in.

---

# 1. What is a Stateless Application?

A **stateless application** does not store important data inside the Pod itself.

If a Pod dies, Kubernetes can recreate it anywhere without affecting the application.

Example:

```text
nginx-deployment

├── Pod-A
├── Pod-B
└── Pod-C
```

If **Pod-B** crashes:

```text
Pod-B ❌
```

Kubernetes automatically creates a replacement:

```text
Pod-B ✅
```

The application continues working normally.

---

# 2. Why Deployments Don't Work Well for Databases

Consider a MySQL Pod that stores:

- Users
- Orders
- Transactions

With a Deployment:

```text
mysql-abc123
      │
      ▼
mysql-xyz789
```

When the Pod is recreated:

- Pod name changes
- Pod IP changes
- Database clustering breaks
- Replication becomes difficult
- Applications relying on stable identities may fail

Databases require consistent identities and persistent storage.

---

# 3. What are Stateful Applications?

Examples of stateful applications include:

- MySQL
- PostgreSQL
- MongoDB
- Kafka
- Redis
- Elasticsearch

These applications require:

- Stable Pod names
- Stable network identity
- Persistent storage
- Ordered startup and shutdown

---

# 4. What is a StatefulSet?

A **StatefulSet** is a Kubernetes workload resource designed specifically for stateful applications.

It provides:

- ✅ Stable Pod names
- ✅ Stable network identity
- ✅ Persistent storage
- ✅ Ordered deployment
- ✅ Ordered scaling
- ✅ Ordered termination

---

# Deployment vs StatefulSet

| Feature | Deployment | StatefulSet |
|----------|------------|-------------|
| Stable Pod Names | ❌ | ✅ |
| Ordered Startup | ❌ | ✅ |
| Ordered Shutdown | ❌ | ✅ |
| Stable Storage | ❌ | ✅ |
| Suitable for Databases | ❌ | ✅ |
| Suitable for Stateless Apps | ✅ | ⚠️ Possible but unnecessary |

---

# 5. StatefulSet Pod Naming

### Deployment

Pod names are random:

```text
nginx-74bc5d8
nginx-3f9a7c2
nginx-a8d4e9f
```

---

### StatefulSet

Pod names are predictable:

```text
mysql-0
mysql-1
mysql-2
```

If **mysql-1** restarts:

```text
mysql-1
```

It remains:

```text
mysql-1
```

The Pod identity never changes.

---

# 6. Headless Service

Every StatefulSet requires a **Headless Service**.

Example:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: mysql

spec:
  clusterIP: None

  selector:
    app: mysql

  ports:
    - port: 3306
```

The key configuration is:

```yaml
clusterIP: None
```

This disables load balancing and allows each Pod to receive its own DNS record.

Example DNS entries:

```text
mysql-0.mysql.default.svc.cluster.local
mysql-1.mysql.default.svc.cluster.local
mysql-2.mysql.default.svc.cluster.local
```

This is essential for clustered databases.

---

# 7. Basic StatefulSet Example

```yaml
apiVersion: apps/v1
kind: StatefulSet

metadata:
  name: mysql

spec:
  serviceName: mysql

  replicas: 3

  selector:
    matchLabels:
      app: mysql

  template:
    metadata:
      labels:
        app: mysql

    spec:
      containers:
        - name: mysql
          image: mysql:8
```

This creates:

```text
mysql-0
mysql-1
mysql-2
```

Each Pod has its own stable identity.

---

# 8. Ordered Startup and Shutdown

## Deployment

Pods start simultaneously.

```text
Pod-1
Pod-2
Pod-3
```

---

## StatefulSet

Pods start one after another.

```text
mysql-0
   │
   ▼
mysql-1
   │
   ▼
mysql-2
```

Shutdown also happens in reverse order.

```text
mysql-2
   │
   ▼
mysql-1
   │
   ▼
mysql-0
```

This ordering is important for clustered applications.

---

# 9. Persistent Storage

Each StatefulSet Pod receives its own **PersistentVolumeClaim (PVC)**.

Example:

```text
mysql-0 → pvc-mysql-0
mysql-1 → pvc-mysql-1
mysql-2 → pvc-mysql-2
```

Even if a Pod restarts, it reconnects to the same storage.

---

## `volumeClaimTemplates`

```yaml
volumeClaimTemplates:

- metadata:
    name: mysql-storage

  spec:
    accessModes:
      - ReadWriteOnce

    resources:
      requests:
        storage: 5Gi
```

Kubernetes automatically creates one PVC per Pod.

---

# 10. StatefulSet Architecture

```text
           Headless Service
                  │
                  ▼
             StatefulSet
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     mysql-0   mysql-1   mysql-2
        │         │         │
       PVC       PVC       PVC
```

Each Pod has:

- Stable identity
- Stable DNS
- Dedicated persistent storage

---

# 11. Scaling StatefulSets

Current Pods:

```text
mysql-0
mysql-1
mysql-2
```

Scale to five replicas:

```bash
kubectl scale statefulset mysql --replicas=5
```

New Pods are created sequentially:

```text
mysql-3
mysql-4
```

Scaling down also happens in reverse order.

---

# 12. Updating StatefulSets

Restart the StatefulSet:

```bash
kubectl rollout restart statefulset mysql
```

Pods are updated sequentially:

```text
mysql-0
   ▼
mysql-1
   ▼
mysql-2
```

This ensures controlled updates with minimal disruption.

---

# 13. Useful Commands

## View StatefulSets

```bash
kubectl get statefulsets
```

or

```bash
kubectl get sts
```

---

## Describe a StatefulSet

```bash
kubectl describe statefulset mysql
```

---

## Scale a StatefulSet

```bash
kubectl scale sts mysql --replicas=5
```

---

## View PersistentVolumeClaims

```bash
kubectl get pvc
```

---

# 14. Common Mistakes

## No Headless Service

Without a Headless Service:

- Stable DNS names are not created.
- Pod discovery fails.
- Database clustering may not work.

---

## No Persistent Storage

Without Persistent Volumes:

- Data is lost when Pods restart.
- Databases become unreliable.

---

## Using a Deployment for a Database

A Deployment may appear to work initially but causes issues later because:

- Pod names change
- Storage is not guaranteed
- Clustering becomes unreliable
- Scaling databases is difficult

Databases should use **StatefulSets**, not Deployments.

---

# 15. Interview Questions

### What is a StatefulSet?

A Kubernetes workload resource designed for stateful applications that require stable identities, persistent storage, and ordered deployment.

---

### Why shouldn't Deployments be used for databases?

Deployments create ephemeral Pods whose names and identities can change.

Databases require:

- Stable identities
- Persistent storage
- Ordered startup and shutdown

---

### What is a Headless Service?

A Service configured with:

```yaml
clusterIP: None
```

It provides direct DNS records for each StatefulSet Pod instead of a single virtual IP.

---

### How are StatefulSet Pods named?

Pods receive predictable names:

```text
app-0
app-1
app-2
```

The names remain stable across restarts.

---

### Does each StatefulSet Pod get its own storage?

Yes.

Each Pod automatically receives its own PersistentVolumeClaim through:

```yaml
volumeClaimTemplates
```

---

# Summary

- StatefulSets are designed for **stateful applications** such as databases and distributed systems.
- Each Pod receives a **stable name**, **stable DNS**, and **dedicated persistent storage**.
- StatefulSets require a **Headless Service** (`clusterIP: None`) for direct Pod DNS resolution.
- Pods start, stop, scale, and update in a predictable order.
- Each Pod gets its own PersistentVolumeClaim using `volumeClaimTemplates`.
- Use **Deployments** for stateless applications and **StatefulSets** for applications that require persistent identity and storage.