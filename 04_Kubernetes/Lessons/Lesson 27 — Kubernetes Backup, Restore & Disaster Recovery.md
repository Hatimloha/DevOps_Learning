# Lesson 27 — Kubernetes Backup, Restore & Disaster Recovery

## 📖 Overview

One of the most important production questions is:

> **"What happens if the Kubernetes cluster fails?"**

A production Kubernetes environment must have a proper backup and disaster recovery strategy.

Without recovery planning, everything deployed in the cluster could be lost.

This lesson covers:

- Kubernetes backup strategy
- etcd backup and restore
- Application backup
- Persistent Volume backup
- Disaster recovery planning
- Recovery workflows

---

# 1. What Should You Back Up?

A Kubernetes environment has three major areas that require protection.

```text
Kubernetes Cluster

│
├── Cluster State (etcd)
│
├── Application Manifests
│     ├── YAML
│     ├── Helm
│     └── Kustomize
│
└── Persistent Data
      └── Volumes
```

Each component requires a different backup approach.

---

# 2. etcd — The Brain of Kubernetes

**etcd** is the database where Kubernetes stores its cluster state.

Everything about the cluster is stored here.

Examples:

- Pods
- Deployments
- Services
- Secrets
- ConfigMaps
- RBAC
- Nodes
- Namespaces

Architecture:

```text
kubectl
    │
    ▼
API Server
    │
    ▼
etcd
```

---

## What Happens if etcd is Lost?

The cluster loses its state.

Examples:

```text
Pods ❌

Deployments ❌

Services ❌

Secrets ❌
```

The actual applications may still exist on nodes, but Kubernetes no longer knows how to manage them.

---

# 3. What Does NOT Live in etcd?

Important distinction:

etcd does **not** store:

- Container images
- Persistent Volume data
- Node operating system
- Application binaries inside images

Therefore:

> Backing up etcd alone is not a complete Kubernetes backup.

---

# 4. etcd Backup

For kubeadm clusters, `etcdctl` is commonly used.

### Create Snapshot

```bash
ETCDCTL_API=3 etcdctl snapshot save backup.db
```

Creates:

```text
backup.db
```

---

## Verify Backup

```bash
etcdctl snapshot status backup.db
```

---

# 5. Restoring etcd

If the cluster state is lost:

```text
Old etcd ❌
```

Restore from snapshot:

```bash
etcdctl snapshot restore backup.db
```

Then:

1. Restore etcd data
2. Restart the control plane
3. Reconnect worker nodes

> The exact restore process depends on the Kubernetes installation method:
>
> - kubeadm
> - Managed Kubernetes
> - Custom clusters

---

# 6. Backing Up Kubernetes YAML Files

Infrastructure should be managed as code.

Instead of depending only on the running cluster:

```text
Git Repository

      │

      ▼

Deployment.yaml

Service.yaml

Ingress.yaml

ConfigMap.yaml
```

## Benefits

- Version control
- Easy recovery
- Audit history
- GitOps compatibility

Common tools:

- Git
- Helm
- Kustomize

---

# 7. Persistent Volume Backup

etcd stores only PVC metadata.

Actual application data lives in storage.

```text
PVC
 │
 ▼
Persistent Volume
 │
 ▼
Database Files
```

Examples:

- PostgreSQL data
- MySQL files
- Application uploads

These require separate backups.

---

## Persistent Volume Backup Methods

Examples:

- Storage snapshots
- Filesystem backups
- Cloud volume snapshots

---

# 8. Disaster Recovery Strategy

A complete recovery plan requires:

```text
Application YAML
        +
etcd Backup
        +
Persistent Volume Backup
        +
Container Images
```

Together, these allow a complete environment rebuild.

---

# 9. Recovery Scenarios

## Scenario 1: Worker Node Failure

Example:

```text
Worker Node crashes
```

Recovery:

```text
Scheduler
     │
     ▼
Create replacement Pod
```

Usually Kubernetes handles this automatically.

---

## Scenario 2: Control Plane Failure

Recovery steps:

```text
Restore etcd

      ↓

Restart Control Plane

      ↓

Reconnect Workers
```

---

## Scenario 3: Database Volume Deleted

Recovery:

```text
Restore Volume Snapshot

        ↓

Attach PVC

        ↓

Start StatefulSet
```

---

# 10. Backup Frequency

Typical production schedules:

| Resource | Frequency |
|----------|-----------|
| etcd | Daily or more frequently |
| Persistent Volume Snapshots | Depends on data changes |
| Git Repository | Every commit |
| Container Images | Stored in registry |

The correct schedule depends on:

- Business requirements
- Recovery objectives
- Data importance

---

# 11. RPO & RTO

Two important disaster recovery concepts.

---

# RPO (Recovery Point Objective)

Defines the maximum acceptable data loss.

Example:

```text
Backup every hour

       ↓

Maximum data loss = 1 hour
```

---

# RTO (Recovery Time Objective)

Defines the maximum acceptable downtime.

Example:

```text
Cluster restored

       ↓

Available within 20 minutes
```

---

# 12. Backup Tools

| Tool | Purpose |
|------|---------|
| Velero | Kubernetes resource and volume backup |
| etcdctl | etcd snapshots |
| Cloud Snapshots | Persistent Volume backups |

---

# 13. High Availability

Production Kubernetes clusters avoid single points of failure.

Example:

```text
Control Plane 1

Control Plane 2

Control Plane 3
```

Benefits:

- Higher availability
- etcd quorum support
- Reduced downtime
- Better fault tolerance

---

# 14. Restore Workflow

Complete recovery process:

```text
Failure

   │

   ▼

Identify Problem

   │

   ▼

Restore etcd

   │

   ▼

Restore Volumes

   │

   ▼

Deploy Applications

   │

   ▼

Verify Cluster
```

---

# 15. Useful Commands

## View Cluster Information

```bash
kubectl cluster-info
```

---

## Export Resource YAML

```bash
kubectl get deployment nginx -o yaml
```

---

## Export Namespace Resources

```bash
kubectl get all -n production -o yaml
```

---

## Check Persistent Volume Claims

```bash
kubectl get pvc
```

---

## Check Persistent Volumes

```bash
kubectl get pv
```

---

# 16. Common Mistakes

## Only Backing Up etcd

Problem:

Database files and application data are still missing.

---

## No Restore Testing

A backup is useless if it cannot be restored successfully.

Always perform restore tests.

---

## Storing Backups on the Same Server

Problem:

If the server fails, both:

- Cluster
- Backup

can be lost.

Keep backups in a separate location.

---

## Ignoring Secrets

Secrets are stored inside etcd.

Backup files may contain sensitive information.

Protect them properly.

---

# 17. Interview Questions

## What is stored in etcd?

etcd stores Kubernetes cluster state, including:

- Deployments
- Services
- Secrets
- ConfigMaps
- RBAC
- Namespaces
- Other Kubernetes objects

---

## Does etcd contain Persistent Volume data?

No.

etcd stores only Kubernetes metadata.

The actual application data exists inside the storage system.

---

## What is Velero?

Velero is a Kubernetes backup and disaster recovery tool that can back up:

- Kubernetes resources
- Persistent Volumes (with supported storage providers)

---

## Difference Between RPO and RTO?

| RPO | RTO |
|-----|-----|
| Maximum acceptable data loss | Maximum acceptable recovery time |

Example:

```text
RPO:
Backup every hour

RTO:
Restore cluster within 30 minutes
```

---

## Is backing up YAML files enough?

No.

A complete backup strategy also requires:

- etcd backup
- Persistent Volume backup
- Container images
- External dependencies (where required)

---

# 📌 Key Takeaways

- etcd stores Kubernetes cluster state and is critical for recovery.
- etcd backup alone is not a complete backup strategy.
- Application YAML should be stored in Git for version control.
- Persistent Volume data requires separate storage backups.
- Use tools like Velero for Kubernetes backup and recovery.
- Define RPO and RTO before designing a disaster recovery plan.
- Always test restoration procedures.
- Production clusters should use High Availability control planes.
- A complete recovery plan includes:
  - Cluster state
  - Application definitions
  - Persistent data
  - Container images