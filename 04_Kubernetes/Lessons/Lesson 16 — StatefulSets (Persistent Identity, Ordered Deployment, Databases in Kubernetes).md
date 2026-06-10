Lesson 16 — StatefulSets (Persistent Identity, Ordered Deployment, Databases in Kubernetes)

Until now, you've used Deployments.

Deployments are perfect for:

Nginx
React
Node.js
Python APIs
Java APIs

These are stateless applications.

1. What is a Stateless Application?

A Pod can die and be recreated anywhere.

Example:

nginx-deployment

Pod-A
Pod-B
Pod-C

If Pod-B dies:

Pod-B ❌

New Pod-B created ✅

No problem.

2. Why Deployments Don't Work Well for Databases

Imagine:

MySQL Pod

It stores:

Users
Orders
Transactions

If Pod restarts:

mysql-abc123
      ↓
mysql-xyz789

Problems:

Pod name changes
Pod IP changes
Database clustering breaks
Replication becomes difficult
3. Stateful Applications

Examples:

MySQL
PostgreSQL
MongoDB
Kafka
Redis
Elasticsearch

Need:

Stable Name
Stable Storage
Ordered Start/Stop
4. StatefulSet

StatefulSet provides:

✅ Stable Pod names

✅ Stable network identity

✅ Stable storage

✅ Ordered deployment

Deployment vs StatefulSet
Feature	Deployment	StatefulSet
Pod names stable	❌	✅
Ordered startup	❌	✅
Stable storage	❌	✅
Databases	❌	✅
Stateless apps	✅	⚠️
5. StatefulSet Pod Naming

Deployment:

nginx-74bc5d8
nginx-3f9a7c2
nginx-a8d4e9f

Random names.

StatefulSet:

mysql-0
mysql-1
mysql-2

Always predictable.

If Pod restarts:

mysql-1

remains:

mysql-1

Identity never changes.

6. Headless Service

StatefulSets require a special Service.

Called:

Headless Service

Example:

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

Notice:

clusterIP: None

This makes it Headless.

Why?

Each Pod gets its own DNS entry.

Example:

mysql-0.mysql.default.svc.cluster.local
mysql-1.mysql.default.svc.cluster.local
mysql-2.mysql.default.svc.cluster.local

Perfect for clustering.

7. Basic StatefulSet Example
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

Creates:

mysql-0
mysql-1
mysql-2
8. Ordered Startup

Deployment:

Pod1
Pod2
Pod3

All start simultaneously.

StatefulSet:

mysql-0
   ↓
mysql-1
   ↓
mysql-2

Sequential startup.

Ordered Shutdown

Also sequential:

mysql-2
   ↓
mysql-1
   ↓
mysql-0
9. Persistent Storage

Each Pod gets its own PVC.

Example:

mysql-0 → pvc-mysql-0
mysql-1 → pvc-mysql-1
mysql-2 → pvc-mysql-2

Storage remains after restart.

volumeClaimTemplates
volumeClaimTemplates:

- metadata:
    name: mysql-storage

  spec:
    accessModes:
      - ReadWriteOnce

    resources:
      requests:
        storage: 5Gi

Kubernetes automatically creates PVCs.

10. Full Architecture
Headless Service
         ↓
StatefulSet
         ↓
mysql-0 → PVC
mysql-1 → PVC
mysql-2 → PVC
11. Scaling StatefulSets

Current:

mysql-0
mysql-1
mysql-2

Scale:

kubectl scale statefulset mysql --replicas=5

New Pods:

mysql-3
mysql-4

Created in order.

12. Updating StatefulSets

Similar to Deployment:

kubectl rollout restart statefulset mysql

Pods updated one by one:

mysql-0
mysql-1
mysql-2
13. Useful Commands
View StatefulSets
kubectl get statefulsets

or

kubectl get sts
Describe
kubectl describe statefulset mysql
Scale
kubectl scale sts mysql --replicas=5
View PVCs
kubectl get pvc
14. Common Mistakes
No Headless Service
DNS resolution issues
No Persistent Storage
Database data lost
Using Deployment for Database

Works initially.

Fails later when scaling or clustering.

15. Interview Questions
What is a StatefulSet?

A Kubernetes workload resource designed for stateful applications requiring stable identity and storage.

Why not use Deployment for databases?

Deployments provide ephemeral Pods with changing identities.

Databases need stable identities.

What is a Headless Service?

A Service with:

clusterIP: None

that provides direct Pod DNS records.

StatefulSet Pod names?
app-0
app-1
app-2

Stable and predictable.

Does each StatefulSet Pod get its own storage?

Yes.

Usually through:

volumeClaimTemplates