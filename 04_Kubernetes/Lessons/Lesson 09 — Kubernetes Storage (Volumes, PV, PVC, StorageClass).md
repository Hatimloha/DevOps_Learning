# Lesson 9 — Kubernetes Storage (Volumes, PV, PVC, StorageClass)
Till now your apps:
- run in Pods
- use ConfigMaps + Secrets
- exposed via Services

But there’s a big issue:
- 👉 Pods are temporary
- 👉 Any data inside a Pod is lost when Pod dies

## 1. Problem Without Storage
Example:
```
Pod → writes file inside container
Pod crashes ❌
New Pod starts → data is gone ❌
```
> Because containers are ephemeral

## 2. Kubernetes Storage Solution
Kubernetes gives 3 main concepts:
```
Volume (Pod-level storage)
PersistentVolume (cluster storage)
PersistentVolumeClaim (request storage)
```

## 3. Volumes (Basic Level)
A Volume lives as long as the Pod lives.

Example:
```yml
apiVersion: v1
kind: Pod
metadata:
  name: volume-pod

spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - mountPath: /data
          name: my-volume

  volumes:
    - name: my-volume
      emptyDir: {}
```
What happens:
- Pod starts → volume created
- Pod deleted → volume deleted ❌

> 👉 Good for temporary data only

## 4. Types of Volumes
| Type      | Use                |
| --------- | ------------------ |
| emptyDir  | Temporary storage  |
| hostPath  | Node local storage |
| configMap | Config files       |
| secret    | Sensitive files    |


## 5. Persistent Volume (PV)
Now we go real production level.

👉 PV = actual storage in cluster

Examples:
```yml
AWS EBS
Azure Disk
NFS
Local disk
```

PV Example
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv

spec:
  capacity:
    storage: 1Gi

  accessModes:
    - ReadWriteOnce

  hostPath:
    path: /mnt/data
```

## 6. PersistentVolumeClaim (PVC)
👉 PVC = request for storage
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc

spec:
  accessModes:
    - ReadWriteOnce

  resources:
    requests:
      storage: 500Mi
```

## 7. PV + PVC Binding
```
PVC → requests storage
PV  → provides storage
Kubernetes → binds them
```

Example:
```
PVC: 500Mi
PV : 1Gi
→ Bound ✔
```

## 8. Using PVC in Pod
```
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod

spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - mountPath: /data
          name: storage

  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: my-pvc
```

## 9. Storage Flow (VERY IMPORTANT)
```
App Pod
   ↓
PVC (request)
   ↓
PV (actual storage)
   ↓
Disk (AWS / local / cloud)
```

## 10. StorageClass (Dynamic Storage)
Instead of manually creating PV:

👉 StorageClass creates PV automatically

Example:
```yml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage

provisioner: kubernetes.io/aws-ebs
```

PVC using StorageClass:
```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc

spec:
  storageClassName: fast-storage

  accessModes:
    - ReadWriteOnce

  resources:
    requests:
      storage: 1Gi
```
> 👉 Kubernetes automatically creates PV

## 11. Types of Access Modes
| Mode          | Meaning                |
| ------------- | ---------------------- |
| ReadWriteOnce | Single node read/write |
| ReadOnlyMany  | Many nodes read only   |
| ReadWriteMany | Many nodes read/write  |


## 12. Volume vs PVC vs PV
| Concept | Level        | Purpose           |
| ------- | ------------ | ----------------- |
| Volume  | Pod          | Temporary storage |
| PV      | Cluster      | Actual storage    |
| PVC     | User request | Request storage   |

## 13. Real Production Example
```
Frontend Pod → stateless
Backend Pod → stateless
Database Pod → uses PVC ✔
```

## 14. kubectl Commands
PV
```bash
kubectl get pv
kubectl describe pv my-pv
```

PVC
```bash
kubectl get pvc
kubectl describe pvc my-pvc
```

Pod
```bash
kubectl describe pod pvc-pod
```

## 15. Common Mistakes
❌ Using emptyDir for database
```bash
data lost after pod restart ❌
```

❌ PVC not bound
```bash
No matching PV → Pending state
```

##  16. Interview Questions

1. What is a Volume?
    > Temporary storage attached to a Pod.

2. What is PV?
    > Cluster-level storage resource.

3. What is PVC?
    > Request for storage by user.

4. Why do we need PVC?
    > To decouple storage from infrastructure.

5. What happens if PV is deleted?
    > PVC becomes unbound.