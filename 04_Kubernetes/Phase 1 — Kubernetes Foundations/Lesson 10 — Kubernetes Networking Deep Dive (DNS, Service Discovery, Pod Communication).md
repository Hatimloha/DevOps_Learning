Lesson 10 — Kubernetes Networking Deep Dive (DNS, Service Discovery, Pod Communication)

Networking is one of the most important Kubernetes topics.

A common interview question:

"How does Pod A talk to Pod B in Kubernetes?"

After this lesson, you'll understand the complete networking flow.

1. Kubernetes Networking Goals

Kubernetes networking follows these rules:

Every Pod gets its own IP
Pod A → 10.244.0.5
Pod B → 10.244.0.6
Pods communicate directly
Pod A
   ↓
Pod B

No NAT required.

Nodes communicate freely
Node 1
   ↓
Node 2
2. Pod-to-Pod Communication

Example:

Frontend Pod
    ↓
Backend Pod

Each Pod has a unique IP.

Frontend: 10.244.1.5
Backend : 10.244.2.8

Frontend can directly call:

http://10.244.2.8:8080
Problem

Pod IPs change.

Pod Restart
      ↓
New IP Assigned

Applications break.

3. Service Discovery

Solution:

Use Services.

Backend Pods
      ↓
Backend Service

Instead of calling Pod IP:

http://backend-service
4. Kubernetes DNS

Kubernetes includes DNS by default.

Usually provided by:

CoreDNS

Every Service gets a DNS name.

Example:

Service:

metadata:
  name: backend-service

DNS:

backend-service
5. Internal DNS Resolution

Flow:

Frontend Pod
      ↓
backend-service
      ↓
DNS Lookup
      ↓
Service IP
      ↓
Backend Pod
6. Fully Qualified Domain Name (FQDN)

Format:

<service>.<namespace>.svc.cluster.local

Example:

backend.default.svc.cluster.local

Most apps simply use:

backend
7. Cluster Networking

Example cluster:

Node 1
 ├── Pod A
 └── Pod B

Node 2
 ├── Pod C
 └── Pod D

Communication:

Pod A ↔ Pod C
Pod B ↔ Pod D

Works automatically.

8. CNI (Container Network Interface)

Kubernetes itself doesn't implement networking.

A CNI plugin does.

Popular CNIs:

Calico
Flannel
Cilium
Weave Net
9. Network Flow Example

User request:

Browser
   ↓
Service
   ↓
Pod

Internal request:

Frontend Pod
   ↓
backend-service
   ↓
Backend Pod
10. Service Types Review
ClusterIP

Internal only.

Pod ↔ Service ↔ Pod

Most common.

NodePort
User
 ↓
NodeIP:30007
 ↓
Service
 ↓
Pod
LoadBalancer
Internet
   ↓
Cloud Load Balancer
   ↓
Service
   ↓
Pods
11. DNS Testing

Enter a Pod:

kubectl exec -it <pod-name> -- sh

Test DNS:

nslookup backend-service

or

ping backend-service
12. Useful Commands
View Services
kubectl get svc
View Endpoints
kubectl get endpoints

Endpoints show actual Pod IPs behind a Service.

View DNS Pods
kubectl get pods -n kube-system

Look for CoreDNS Pods.

13. Endpoints (Very Important)

Service:

backend-service

may point to:

10.244.1.5
10.244.1.6
10.244.1.7

These are endpoints.

Check:

kubectl get endpoints
14. Real Production Example

Microservices:

Frontend
   ↓
user-service
   ↓
auth-service
   ↓
database-service

Nobody talks directly to Pod IPs.

Everything uses Service names.

15. Common Networking Issues
Service has no endpoints

Cause:

Wrong labels
Wrong selectors

Check:

kubectl get endpoints
DNS not resolving

Check:

kubectl get pods -n kube-system

Verify CoreDNS is running.

Pod can't connect

Check:

kubectl exec -it <pod> -- sh
curl http://service-name
16. Interview Questions
How do Pods communicate?

Using Pod IPs through the cluster network.

Why not use Pod IPs directly?

They change when Pods restart.

What provides service discovery?

Kubernetes Services + DNS.

What is CoreDNS?

DNS server used inside Kubernetes clusters.

What is a CNI?

Plugin responsible for cluster networking.