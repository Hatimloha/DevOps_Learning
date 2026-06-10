# Lesson 12 — Health Checks & Probes (Liveness, Readiness, Startup Probes)
In production, a container being Running does NOT mean the application is healthy.

Example:
```
Pod Status = Running ✅
```
- Application = Frozen ❌
- Database Connection = Broken ❌
- API Returning 500 ❌

## How does Kubernetes know?
👉 Using Probes

## Why Probes Matter
Without probes:
```
User
  ↓
Service
  ↓
Broken Pod ❌
```
With probes:
```
User
  ↓
Service
  ↓
Healthy Pods Only ✅
```

## Types of Probes
| Probe           | Purpose                        |
| --------------- | ------------------------------ |
| Liveness Probe  | Is the app alive?              |
| Readiness Probe | Is the app ready for traffic?  |
| Startup Probe   | Has the app finished starting? |


## 1. Liveness Probe
Checks:
```
Is the application still alive?
```
If failed:
```
Kubernetes
     ↓
Restarts Container
```
Example
```
livenessProbe:
  httpGet:
    path: /
    port: 80

  initialDelaySeconds: 10
  periodSeconds: 5
```
Flow
```
Application hangs
      ↓
Liveness fails
      ↓
Container restarted
```

## 2. Readiness Probe
Checks:
```
Can this application serve requests?
```
If failed:
```
Pod stays running
```
BUT
> Service stops sending traffic

Example
```
readinessProbe:
  httpGet:
    path: /
    port: 80

  initialDelaySeconds: 5
  periodSeconds: 3
```

Flow
```
Pod Starting
      ↓
Readiness = False
      ↓
No Traffic
```
```
    Ready
      ↓
Readiness = True
      ↓
Traffic Allowed
```

## Difference Between Liveness and Readiness
| Situation      | Liveness          | Readiness           |
| -------------- | ----------------- | ------------------- |
| App frozen     | Restart Pod       | Remove from traffic |
| DB unavailable | Usually no action | Remove from traffic |
| App starting   | No                | Wait until ready    |

## 3. Startup Probe
Introduced for slow-starting applications.

Examples:
- Java apps
- Spring Boot
- Large applications

Startup can take:
```
30s
60s
120s
```
Without startup probe:
```bash
Kubernetes thinks app is broken
     ↓
Keeps restarting it
```

Example
```
startupProbe:
  httpGet:
    path: /
    port: 80

  failureThreshold: 30
  periodSeconds: 10
```
Meaning:
```
30 × 10 seconds
= 300 seconds allowed startup time
```

## Complete Deployment Example
```
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
      - name: nginx
        image: nginx

        livenessProbe:
          httpGet:
            path: /
            port: 80

          initialDelaySeconds: 10

        readinessProbe:
          httpGet:
            path: /
            port: 80

          initialDelaySeconds: 5
```

## Probe Methods:
Kubernetes supports three probe types.

### HTTP Probe
Most common.
```yml
httpGet:
  path: /health
  port: 8080
```

TCP Probe: Checks if port is open.
```yml
tcpSocket:
  port: 3306
```

Useful for:
- MySQL
- Redis
- PostgreSQL

### Command Probe
Runs command inside container.
```
exec:
  command:
    - cat
    - /tmp/healthy
```
Success: 
```
Exit Code 0
```
Failure:
```
Non-zero Exit Code
```

## Important Parameters
initialDelaySeconds
```bash
# Wait before first check.
initialDelaySeconds: 10
```
periodSeconds
```bash
# How often to check.
periodSeconds: 5
```

timeoutSeconds
```bash
# Probe timeout.
timeoutSeconds: 2
```

failureThreshold
```bash
# Failures before action.
failureThreshold: 3
```

## Real Production Flow
```
Deployment
      ↓
Pods
      ↓
Readiness Probe
      ↓
Service
      ↓
Users
```
> Only healthy Pods receive traffic.

## How Service Uses Readiness
Suppose:
```
Pod A Ready ✅
Pod B Ready ✅
Pod C Not Ready ❌
```

Service routes:
```
Traffic
   ↓
A
B
```
> Pod C gets zero traffic.

## Commands
View Pod Details
```bash
kubectl describe pod <pod-name>
```

Check Events
```bash
kubectl get events
```

View Logs
```
kubectl logs <pod-name>
```

## Common Mistakes
Probe Path Doesn't Exist
```
path: /health
```

But app exposes:
```
/status
```

Result:
```
Probe Failure
```

## Startup Too Slow
```
App startup = 60s
Probe starts = 10s
```

Result:
```
CrashLoopBackOff
```
Use Startup Probe.

## Timeout Too Small
```yml
timeoutSeconds: 1
```
Application responds in:
```bash
2 seconds
# Probe fails.
```


## Interview Questions
1. What is a Liveness Probe?
    > Checks if application is alive and should be restarted if unhealthy.

2. What is a Readiness Probe?
    > Checks if application is ready to receive traffic.

3. What is a Startup Probe?
    > Allows slow-starting applications to initialize before health checks begin.

4. Does Readiness Restart Pods?
    > No.

    > It only removes Pods from Service endpoints.

5. Does Liveness Restart Pods?
    > Yes.

    > Failed liveness checks trigger container restart.