# Lesson 26 — Custom Resource Definitions (CRDs), Operators & Kubernetes API Extension

## 📖 Overview

Kubernetes provides many built-in resources such as:

- Pod
- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- Job
- StatefulSet

But what if your application needs a resource Kubernetes doesn't provide?

Examples:

- MySQL Cluster
- Redis Cluster
- Kafka Cluster
- MongoDB Replica Set

These are **not native Kubernetes resources**.

To support them, Kubernetes allows you to extend its API using:

- **Custom Resource Definitions (CRDs)**
- **Operators**

---

# 1. What is a CRD?

A **Custom Resource Definition (CRD)** extends the Kubernetes API by adding a new resource type.

Think of it as teaching Kubernetes a new object.

### Before Creating a CRD

```bash
kubectl get pods
kubectl get deployments
```

### After Creating a CRD

```bash
kubectl get mysqls
kubectl get redisclusters
kubectl get backups
```

These custom resources behave like native Kubernetes objects.

---

# 2. Kubernetes API

Everything in Kubernetes is managed through the **API Server**.

```text
kubectl
    │
    ▼
API Server
    │
    ▼
etcd
```

### Built-in Resources

- Pods
- Services
- Deployments
- Secrets
- ConfigMaps

### Custom Resources

- MySQL
- Kafka
- Redis
- Backup
- Certificate

Both built-in and custom resources are stored in **etcd**.

---

# 3. What is a Custom Resource (CR)?

A **CRD** defines a new resource type.

A **Custom Resource (CR)** is an instance of that type.

### Example

```yaml
apiVersion: company.io/v1
kind: Database

metadata:
  name: production-db

spec:
  replicas: 3
  storage: 100Gi
```

Relationship:

```text
Deployment
      │
      ▼
nginx-deployment
```

Similarly:

```text
Database (CRD)
       │
       ▼
production-db (CR)
```

---

# 4. CRD Example

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition

metadata:
  name: databases.company.io

spec:
  group: company.io

  names:
    plural: databases
    singular: database
    kind: Database

  scope: Namespaced

  versions:
    - name: v1
      served: true
      storage: true
```

After applying the CRD:

```bash
kubectl get databases
```

works just like any built-in Kubernetes resource.

---

# 5. Problem with Only a CRD

Suppose you create a resource like:

```yaml
kind: Database
```

Will Kubernetes automatically install MySQL?

❌ **No.**

A CRD only defines a new resource type.

It **does not contain the logic** to create or manage the underlying application.

---

# 6. What is an Operator?

An **Operator** is a Kubernetes controller that watches Custom Resources and performs the required actions automatically.

### Workflow

```text
Database CR
      │
      ▼
Operator
      │
      ▼
Creates:
- StatefulSet
- Service
- PVC
- Secret
```

The Operator converts your custom resource into actual Kubernetes objects.

---

# 7. Operator = Human Administrator

Without an Operator:

```text
Administrator

│
├── Create StatefulSet
├── Create Service
├── Create PVC
├── Configure Replication
├── Configure Backup
└── Monitor Health
```

Everything is manual.

With an Operator:

```text
Create Database CR
        │
        ▼
Operator performs everything automatically
```

---

# 8. Real Example

Create a custom resource:

```yaml
kind: MySQL
```

The Operator automatically creates:

- StatefulSet
- Service
- PersistentVolumeClaim (PVC)
- Secret
- ConfigMap
- Backup Job
- Monitoring resources

One YAML replaces many manual Kubernetes objects.

---

# 9. Popular Operators

Many production-grade applications are managed using Operators.

| Application | Operator |
|-------------|----------|
| Prometheus | Prometheus Operator |
| Kafka | Strimzi |
| MySQL | Percona Operator |
| Redis | Redis Operator |
| Elasticsearch | Elastic Cloud on Kubernetes (ECK) |

---

# 10. Operator Workflow

```text
Create Database YAML
        │
        ▼
API Server
        │
        ▼
Operator detects new resource
        │
        ▼
Creates Kubernetes resources
        │
        ▼
Database becomes Ready
```

The Operator continuously manages the application's lifecycle.

---

# 11. Reconciliation Loop

Operators constantly compare the desired state with the actual state.

Example:

Desired state:

```text
3 MySQL Pods
```

Current state:

```text
2 MySQL Pods
```

Operator detects the difference.

```text
Desired: 3 Pods
Current: 2 Pods
        │
        ▼
Create 1 additional Pod
```

This continuous monitoring process is called the **Reconciliation Loop**.

---

# 12. Self-Healing

Suppose a database Pod is accidentally deleted.

```text
Delete MySQL Pod
```

The Operator notices that the application is unhealthy.

It automatically:

- Creates a replacement Pod
- Restores replication
- Brings the database back to the desired state

This is Kubernetes' **self-healing** capability, enhanced by the Operator.

---

# 13. Operator vs Deployment

| Deployment | Operator |
|------------|----------|
| Deploys applications | Manages complete application lifecycle |
| Handles basic lifecycle | Automates installation, upgrades, backups, recovery |
| No application-specific knowledge | Application-aware |
| Best for stateless workloads | Excellent for stateful workloads |

---

# 14. Real Production Example

### Without an Operator

```text
Install PostgreSQL
        │
        ▼
Create StatefulSet
        │
        ▼
Create Service
        │
        ▼
Create Secret
        │
        ▼
Configure Replication
        │
        ▼
Configure Backups
        │
        ▼
Monitor Database
```

Many manual steps are required.

### With an Operator

```yaml
kind: PostgreSQL
```

The Operator automatically performs all of the above tasks.

---

# 15. Useful Commands

## View Installed CRDs

```bash
kubectl get crds
```

---

## Describe a CRD

```bash
kubectl describe crd <crd-name>
```

---

## View Custom Resources

```bash
kubectl get <resource-name>
```

Example:

```bash
kubectl get databases
```

---

## Explain a Resource

```bash
kubectl explain deployment
```

Many CRDs also support `kubectl explain` if they publish an OpenAPI schema.

---

# 16. Common Mistakes

## Installing Only the CRD

```text
CRD Installed
      │
      ▼
Operator Missing
```

Result:

Nothing happens because no controller is managing the custom resource.

---

## Deleting the Operator

The CRDs remain installed, but:

- Automation stops
- No reconciliation occurs
- Self-healing no longer works

---

## Using the Wrong API Version

Example:

```yaml
apiVersion: company.io/v1beta1
```

But the CRD supports:

```yaml
apiVersion: company.io/v1
```

The resource will be rejected by the API Server.

---

# 17. Interview Questions

### What is a CRD?

A **Custom Resource Definition** extends the Kubernetes API by allowing users to define new resource types.

---

### What is a Custom Resource (CR)?

A **Custom Resource** is an instance of a Custom Resource Definition.

---

### What is an Operator?

An Operator is a Kubernetes controller that automates the lifecycle management of complex applications using Custom Resources.

---

### What is reconciliation?

Reconciliation is the continuous process of comparing the current state of a resource with the desired state and making changes to keep them consistent.

---

### Why are Operators useful?

Operators automate complex operational tasks such as:

- Installation
- Configuration
- Scaling
- Upgrades
- Backups
- Recovery
- Monitoring
- Self-healing

This significantly reduces manual operational effort.

---

# 📌 Key Takeaways

- **CRDs** extend the Kubernetes API with custom resource types.
- **Custom Resources (CRs)** are instances created from those CRDs.
- CRDs define **what** a resource is, but **do not implement behavior**.
- **Operators** watch Custom Resources and automate application lifecycle management.
- Operators continuously reconcile the desired state with the actual state.
- They enable advanced features such as self-healing, automated scaling, upgrades, backups, and recovery.
- Operators are widely used to manage production-grade stateful applications like MySQL, PostgreSQL, Kafka, Redis, and Elasticsearch.