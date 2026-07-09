# Lesson 18 — Jobs & CronJobs (Batch Processing & Scheduled Tasks)

So far, you have learned Kubernetes workloads that run continuously:

- Deployment
- StatefulSet
- DaemonSet

These workloads are expected to stay alive permanently.

However, some tasks should follow this lifecycle:

```text
Start
  ↓
Perform Work
  ↓
Finish
  ↓
Exit
```

Examples:

- Database backups
- Data imports
- Report generation
- Cleanup scripts
- Database migrations

For these use cases, Kubernetes provides:

- **Jobs**
- **CronJobs**

---

# 1. What is a Job?

A **Job** creates one or more Pods and ensures that a task runs successfully until completion.

Lifecycle:

```text
Job
 ↓
Pod
 ↓
Task Executes
 ↓
Exit Code 0
 ↓
Completed ✅
```

Unlike Deployments:

```text
Deployment
 ↓
Pod exits
 ↓
Restart automatically
```

A Job considers the task successful when the process finishes.

---

# 2. Simple Job Example

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: hello-job

spec:
  template:
    spec:
      containers:
        - name: hello
          image: busybox
          command: ["echo", "Hello Kubernetes"]

      restartPolicy: Never
```

Apply:

```bash
kubectl apply -f job.yaml
```

---

# 3. Job Lifecycle

```text
Job Created
      ↓
Pod Starts
      ↓
Task Executes
      ↓
Pod Exits Successfully
      ↓
Job Completed
```

The Pod does not need to run forever.

---

# 4. Check Job Status

## View Jobs

```bash
kubectl get jobs
```

Example:

```text
NAME        COMPLETIONS   DURATION
hello-job   1/1           5s
```

---

## Describe Job

```bash
kubectl describe job hello-job
```

---

## View Logs

First find the Pod:

```bash
kubectl get pods
```

Then:

```bash
kubectl logs <pod-name>
```

---

# 5. Failed Jobs

Example command:

```yaml
command: ["false"]
```

Result:

```text
Exit Code = 1
```

The Job fails.

Kubernetes automatically retries failed Jobs.

---

# 6. backoffLimit

`backoffLimit` controls how many times Kubernetes retries a failed Job.

Example:

```yaml
spec:
  backoffLimit: 4
```

Flow:

```text
Try
 ↓
Fail
 ↓
Retry
 ↓
Retry
 ↓
Retry
 ↓
Retry
 ↓
Mark Failed
```

After reaching the limit, Kubernetes marks the Job as failed.

---

# 7. Parallel Jobs

Jobs can run multiple Pods simultaneously.

Example:

```yaml
spec:
  completions: 5
  parallelism: 2
```

Meaning:

- Need 5 successful completions.
- Run 2 Pods at the same time.

Execution:

```text
Pod1 ✅
Pod2 ✅
Pod3 ✅
Pod4 ✅
Pod5 ✅
```

Job completes after all required tasks finish.

---

# 8. Job Example with Parallelism

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: batch-job

spec:
  completions: 5
  parallelism: 2

  template:
    spec:
      containers:
        - name: worker
          image: busybox
          command: ["sleep", "10"]

      restartPolicy: Never
```

---

# 9. What is a CronJob?

A **CronJob** is a scheduled Job.

It works similar to Linux cron.

Example Linux cron:

```text
0 2 * * *
```

Runs every day at 2 AM.

Kubernetes CronJob flow:

```text
Schedule
   ↓
Creates Job
   ↓
Job Creates Pod
   ↓
Task Executes
```

---

# 10. CronJob Example

```yaml
apiVersion: batch/v1
kind: CronJob

metadata:
  name: backup-job

spec:
  schedule: "0 2 * * *"

  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: busybox
              command:
                - echo
                - "Running backup"

          restartPolicy: Never
```

---

# 11. Cron Schedule Format

Format:

```text
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of Week
│ │ │ └──── Month
│ │ └────── Day of Month
│ └──────── Hour
└────────── Minute
```

---

## Examples

### Every Minute

```text
* * * * *
```

---

### Every Hour

```text
0 * * * *
```

---

### Every Day at 2 AM

```text
0 2 * * *
```

---

### Every Sunday

```text
0 0 * * 0
```

---

# 12. Real Production Examples

## Database Backup

```text
Every Day 2 AM
       ↓
CronJob
       ↓
Backup Database
       ↓
Upload to Storage
```

---

## Log Cleanup

```text
Every Night
      ↓
Delete Old Logs
```

---

## Report Generation

```text
Every Morning
       ↓
Generate PDF Reports
```

---

# 13. Useful Commands

## View Jobs

```bash
kubectl get jobs
```

---

## View CronJobs

```bash
kubectl get cronjobs
```

Short form:

```bash
kubectl get cj
```

---

## Describe CronJob

```bash
kubectl describe cronjob backup-job
```

---

## View Pods

```bash
kubectl get pods
```

---

## View Logs

```bash
kubectl logs <pod-name>
```

---

# 14. Suspend a CronJob

Stop future scheduling:

```yaml
spec:
  suspend: true
```

Useful during:

- Maintenance
- Testing
- Debugging

---

# 15. Delete Old Job History

To prevent old Jobs from filling the cluster:

```yaml
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 1
```

Meaning:

- Keep last 3 successful Jobs.
- Keep last 1 failed Job.

---

# 16. Common Mistakes

## Using Deployment for Batch Work

Wrong approach:

```text
Backup Task
     ↓
Deployment
     ↓
Restarts Forever
```

A Deployment is designed for long-running applications.

Use:

```text
Job
```

instead.

---

## Wrong Cron Expression

Example:

```text
0 25 * * *
```

Invalid because:

- Hour range is 0-23.

CronJob will fail.

---

## Missing restartPolicy

Jobs require:

```yaml
restartPolicy: Never
```

or:

```yaml
restartPolicy: OnFailure
```

---

# 17. Interview Questions

### What is a Job?

A Kubernetes resource that runs a task until it successfully completes.

---

### What is a CronJob?

A Kubernetes resource that creates Jobs based on a schedule using a cron expression.

---

### Difference between Job and Deployment?

| Feature | Job | Deployment |
|----------|-----|------------|
| Runs Forever | ❌ | ✅ |
| Completes Tasks | ✅ | ❌ |
| Batch Processing | ✅ | ❌ |
| Web Applications | ❌ | ✅ |

---

### What is `backoffLimit`?

The maximum number of retries before Kubernetes marks a Job as failed.

---

### What is `parallelism`?

The number of Pods that can run simultaneously for a Job.

---

# Summary

- **Jobs** are used for tasks that run once and complete.
- **CronJobs** schedule Jobs at specific times.
- Jobs are useful for backups, migrations, reports, and cleanup tasks.
- `backoffLimit` controls retry attempts.
- `parallelism` controls concurrent Pods.
- Use Jobs for batch processing, not Deployments.
- Cron expressions define when scheduled tasks execute.