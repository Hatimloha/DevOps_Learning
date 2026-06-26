# Lesson 7 — Services in Kubernetes (ClusterIP, NodePort, LoadBalancer)
Until now:
- Pods run your app
- Deployment manages Pods

## But there is a big problem:
- 👉 Pods are temporary
- 👉 Pod IP changes every time it restarts

## So how do users access your app reliably?
➡️ That’s where Services come in.

## 1. What is a Service?
A Service is a stable networking layer in Kubernetes.

It provides:
- Fixed IP (stable endpoint)
- Load balancing
- Service discovery
- Access to Pods

## 2. Problem Without Service
- Pod IP: 10.244.1.5 → dies ❌
- New Pod IP: 10.244.1.9 → changes ❌

### So:
👉 You cannot depend on Pod IPs

## 3. Service Solution
```
Service (stable IP)
      ↓
  Routes traffic
      ↓
Pods (dynamic IPs)
```

## 4. Types of Services=
| Type         | Use Case                |
| ------------ | ----------------------- |
| ClusterIP    | Internal communication  |
| NodePort     | External access (dev)   |
| LoadBalancer | Cloud production access |


### 5. ClusterIP (Default)
Used for internal communication between services.
```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-clusterip

spec:
  selector:
    app: nginx

  ports:
    - port: 80
      targetPort: 80

  type: ClusterIP
```

How it works:
```bash
Service (ClusterIP)
     ↓
Selects Pods with label app=nginx
     ↓
Routes traffic internally
```

Use case:
- Backend ↔ Database
- Microservices communication

## 6. NodePort (Most Important for Beginners)
Exposes app on worker node IP.
```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport

spec:
  type: NodePort

  selector:
    app: nginx

  ports:
    - port: 80
      targetPort: 80
      nodePort: 30007
```

```bash
# Access:
http://<NodeIP>:30007
```
```bash
Example: http://192.168.1.10:30007
```

Flow:
```bash
User → NodeIP:NodePort → Service → Pod
```

## 7. LoadBalancer (Production Cloud)
Used in AWS / Azure / GCP.
```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb

spec:
  type: LoadBalancer

  selector:
    app: nginx

  ports:
    - port: 80
      targetPort: 80
```

Flow:

```yml
Internet User
     ↓
Cloud Load Balancer
     ↓
Kubernetes Service
     ↓
Pods
```

## 8. Service + Deployment Connection
Important concept:
- Service does NOT talk to Deployment
- Service talks to Pods using labels

### Example:
Deployment:
```yml
labels:
  app: nginx
```

Service:
```yml
selector:
  app: nginx

# Match = traffic flows
```

## 9. Full Architecture
```yml
User Request
     ↓
Service
     ↓
Load Balancing
     ↓
Pods (from Deployment) 
```

## 10. kubectl Commands
Create Service
```bash
kubectl apply -f service.yaml
```
Get Services
```bash
kubectl get svc
```
Describe Service
```bash
kubectl describe svc nginx-nodeport
```

Get Node IP
```bash
kubectl get nodes -o wide
```

## 11. Real Example (Full Stack Flow)
You deploy:
```bash
Deployment → 3 Pods (nginx)
Service → NodePort 30007
```

User access:
```bash
Browser → NodeIP:30007 → Service → Pod → Response
```

## 12. Common Mistakes

❌ Wrong selector
```yml
selector:
  app: nginx-app
```

but Pod label is:
```yml
app: nginx
```
> ➡️ Service will NOT find Pods

❌ Wrong port mapping
```yml
port: 80
targetPort: 8080
```
> If container runs on 80 → mismatch

## 13. Interview Questions

1. What is a Service?
    > A stable networking abstraction to expose Pods.

2. Why do we need Services?
    > Because Pod IPs change frequently.

3. Difference between ClusterIP, NodePort, LoadBalancer?

    | Type         | Access            |
    | ------------ | ----------------- |
    | ClusterIP    | Internal          |
    | NodePort     | External (manual) |
    | LoadBalancer | Cloud external    |

4. How does Service find Pods?
    > Using labels and selectors.