Lesson 13 — Resource Requests & Limits (CPU, Memory, OOMKilled)

One of the biggest production problems:

Pod A uses 90% CPU
Pod B uses 8GB Memory
Pod C crashes

Without resource management:

One application
      ↓
Consumes everything
      ↓
Other applications fail

Kubernetes solves this using:

Requests
Limits
1. What are Requests?

Requests = Minimum resources guaranteed to a Pod.

Example:

resources:
  requests:
    cpu: "250m"
    memory: "256Mi"

Meaning:

CPU    = 0.25 Core
Memory = 256 MB

The Scheduler uses requests when deciding where to place Pods.

Example

Node:

CPU = 2 Core
RAM = 4 GB

Pod requests:

CPU = 500m
RAM = 512Mi

Scheduler checks:

Enough resources?
      ↓
Yes
      ↓
Schedule Pod
2. What are Limits?

Limits = Maximum resources a Pod can use.

Example:

resources:
  limits:
    cpu: "500m"
    memory: "512Mi"

Meaning:

CPU max = 0.5 Core
RAM max = 512 MB
Requests vs Limits
Type	Meaning
Request	Guaranteed minimum
Limit	Maximum allowed
Example
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"

  limits:
    cpu: "500m"
    memory: "512Mi"
Visual
Memory

512Mi ───────── Limit
  │
  │
256Mi ───────── Request
  │
  ▼
3. CPU Units

Kubernetes CPU uses millicores.

Value	Meaning
1000m	1 CPU Core
500m	0.5 Core
250m	0.25 Core
100m	0.1 Core

Example:

cpu: "500m"

Means:

Half CPU Core
4. Memory Units

Common units:

Value	Meaning
Mi	Mebibytes
Gi	Gibibytes

Examples:

memory: "256Mi"
memory: "1Gi"
memory: "2Gi"
5. Full Deployment Example
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

        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"

          limits:
            cpu: "500m"
            memory: "512Mi"
6. What Happens When CPU Limit is Reached?

Suppose:

Limit = 500m
App tries = 900m

Result:

CPU Throttling

Container continues running but slower.

7. What Happens When Memory Limit is Reached?

Suppose:

Limit = 512Mi
App tries = 800Mi

Result:

Container Killed

Status:

OOMKilled

OOM = Out Of Memory

Example

Check Pod:

kubectl describe pod <pod-name>

Output:

Reason: OOMKilled
8. Why Requests Matter for Scheduling

Node:

CPU = 2 Core
RAM = 4GB

Pod requests:

CPU = 1 Core
RAM = 2GB

Scheduler knows:

Only two Pods fit

Without requests:

Node overcommitted
9. Quality of Service (QoS)

Kubernetes assigns QoS classes.

Guaranteed

Requests = Limits

requests:
  cpu: "500m"
  memory: "512Mi"

limits:
  cpu: "500m"
  memory: "512Mi"

Highest priority.

Burstable

Requests < Limits

requests:
  cpu: "250m"

limits:
  cpu: "500m"

Most common.

BestEffort

No requests.

No limits.

resources: {}

Lowest priority.

10. View Resource Usage

Install Metrics Server first.

Then:

kubectl top pods

Node usage:

kubectl top nodes

Example:

NAME       CPU   MEMORY
nginx-1    20m   50Mi
nginx-2    18m   48Mi
11. ResourceQuota (Namespace Limits)

Control total resources in a namespace.

Example:

apiVersion: v1
kind: ResourceQuota

metadata:
  name: dev-quota

spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi

Meaning:

Namespace cannot exceed:
2 CPU
4Gi RAM
12. LimitRange

Default requests/limits.

Example:

apiVersion: v1
kind: LimitRange

Used to enforce standards.

13. Common Production Problems
No Requests
Scheduler cannot plan properly
No Limits
One Pod consumes entire node
Very Small Limits
Frequent OOMKilled
Very Large Requests
Pods stay Pending

Not enough resources.

Useful Commands
View Pod Details
kubectl describe pod <pod-name>
Resource Usage
kubectl top pods
Node Usage
kubectl top nodes
Interview Questions
What is a Request?

Minimum guaranteed resource used by scheduler.

What is a Limit?

Maximum resource allowed for a container.

What happens if Memory Limit is exceeded?

Container is terminated with OOMKilled.

What happens if CPU Limit is exceeded?

CPU is throttled.

Difference between Requests and Limits?

Requests are used for scheduling; limits restrict usage.