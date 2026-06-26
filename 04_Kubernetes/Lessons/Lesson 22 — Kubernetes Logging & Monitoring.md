Lesson 22 — Kubernetes Logging & Monitoring (Observability Basics)

When your cluster breaks, the first question is:

What happened?

Kubernetes gives 3 key signals:

Logs
Metrics
Events

This is called Observability.

1. What is Observability?

It means:

Understand system behavior from outside

In Kubernetes:

Signal	Meaning
Logs	What happened inside app
Metrics	Resource usage
Events	What Kubernetes did
2. Pod Logs

Logs = application output.

Example:

User login successful
DB connected
Error connecting Redis
Command
kubectl logs <pod-name>
Follow logs (real-time)
kubectl logs -f <pod-name>
Logs from multiple containers
kubectl logs <pod-name> -c <container-name>
3. Why Logs Matter

Example failure:

Pod Running ✅
App Broken ❌

Logs reveal:

DB connection failed
4. Events

Events = what Kubernetes did.

Example:

Scheduled pod
Pulled image
Started container
Killed container
Command
kubectl get events
Describe (best method)
kubectl describe pod <pod-name>

Shows:

Scheduling issues
Image pull errors
Crash reasons
5. Metrics (CPU, Memory)

Metrics tell:

How much resources are used
Install Metrics Server (important)

Without it:

kubectl top → will NOT work
View Pod usage
kubectl top pods

Example:

NAME        CPU   MEMORY
nginx-1     10m   40Mi
nginx-2     15m   55Mi
View Node usage
kubectl top nodes
6. Why Monitoring is Important

Without monitoring:

CPU spikes
Memory leaks
Pods crash
No idea why

With monitoring:

You see problem before crash
7. Metrics Flow
Node
 ↓
Metrics Server
 ↓
kubectl top
8. Logs vs Metrics vs Events
Type	Answer
Logs	What app did
Metrics	How much resources used
Events	What Kubernetes did
9. Real Production Flow
User issue
   ↓
Check metrics (CPU/MEM)
   ↓
Check logs (app error)
   ↓
Check events (K8s failure)
10. Common Logging Problems
Pod crashes instantly
kubectl logs shows nothing

Use:

kubectl logs --previous <pod>
Container restart loop
CrashLoopBackOff

Check:

kubectl logs <pod>
kubectl describe pod <pod>
No logs showing

Possible reasons:

App not writing stdout/stderr
Wrong container
Pod not running
11. Advanced Logging Systems

Kubernetes itself doesn't store logs long-term.

Production uses:

Logging stack:
Fluent Bit
Elasticsearch
Kibana

Flow:

Pods → Fluent Bit → Elasticsearch → Kibana
12. Monitoring Systems

Common tools:

Prometheus
Grafana

Flow:

Pods → Prometheus → Grafana
13. Health Monitoring vs Observability
Type	Meaning
Health Check	Is app alive?
Monitoring	Is system healthy?
Observability	Why is it failing?
14. Debugging Workflow
Step 1: Check Pods
kubectl get pods
Step 2: Check Events
kubectl describe pod <pod>
Step 3: Check Logs
kubectl logs <pod>
Step 4: Check Metrics
kubectl top pods
kubectl top nodes
15. Common Mistakes
No Metrics Server
kubectl top fails
Only checking logs

You miss:

CPU spikes
Memory leaks
Node pressure
Ignoring events

Events often show root cause first.

16. Interview Questions
What are Kubernetes logs?

Application output stored per container.

What are Kubernetes events?

System-level actions performed by Kubernetes.

What are metrics?

CPU and memory usage data.

What is Metrics Server?

Component that collects resource usage data.

Difference between logs and metrics?
Logs	Metrics
Text output	Numeric data
App behavior	Resource usage