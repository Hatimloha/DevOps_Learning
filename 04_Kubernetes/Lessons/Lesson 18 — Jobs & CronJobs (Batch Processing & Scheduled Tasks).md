Lesson 18 — Jobs & CronJobs (Batch Processing & Scheduled Tasks)

So far you've learned workloads that run continuously:

Deployment
StatefulSet
DaemonSet

These workloads are expected to stay alive forever.

But some tasks should:

Start
↓
Finish Work
↓
Exit

Examples:

Database backup
Data import
Report generation
Cleanup scripts
Database migration

This is where Jobs and CronJobs come in.

1. What is a Job?

A Job runs a task until it successfully completes.

Job
 ↓
Pod
 ↓
Work Finished
 ↓
Exit 0
 ↓
Completed ✅

Unlike Deployments:

Deployment
 ↓
Pod Exits
 ↓
Restart

A Job is considered successful when the task finishes.

2. Simple Job Example
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

Apply:

kubectl apply -f job.yaml
3. Job Lifecycle
Job Created
     ↓
Pod Starts
     ↓
Task Executes
     ↓
Pod Exits Successfully
     ↓
Job Complete
4. Check Job Status

View Jobs:

kubectl get jobs

Example:

NAME        COMPLETIONS   DURATION
hello-job   1/1           5s

Describe:

kubectl describe job hello-job

Logs:

kubectl logs <pod-name>
5. Failed Jobs

Suppose:

command: ["false"]

Result:

Exit Code = 1

Job fails.

Kubernetes retries automatically.

6. backoffLimit

Controls retry count.

spec:
  backoffLimit: 4

Meaning:

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
7. Parallel Jobs

Run multiple Pods simultaneously.

spec:
  completions: 5
  parallelism: 2

Meaning:

Need 5 successful runs

Run 2 Pods at a time

Example:

Pod1 ✅
Pod2 ✅
Pod3 ✅
Pod4 ✅
Pod5 ✅

Job completes.

8. Job Example with Parallelism
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
9. What is a CronJob?

CronJob = Scheduled Job

Think Linux cron:

0 2 * * *

Runs every day at 2 AM.

Kubernetes CronJob:

Schedule
     ↓
Creates Job
     ↓
Job Creates Pod
     ↓
Task Runs
10. CronJob Example
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
11. Cron Schedule Format
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of Week
│ │ │ └──── Month
│ │ └────── Day of Month
│ └──────── Hour
└────────── Minute

Examples:

Every minute
* * * * *
Every hour
0 * * * *
Every day at 2 AM
0 2 * * *
Every Sunday
0 0 * * 0
12. Real Production Examples
Database Backup
Every Day 2 AM
       ↓
CronJob
       ↓
Backup Database
       ↓
Upload to Storage
Log Cleanup
Every Night
      ↓
Delete Old Logs
Report Generation
Every Morning
       ↓
Generate PDF Reports
13. Useful Commands
View Jobs
kubectl get jobs
View CronJobs
kubectl get cronjobs

Short form:

kubectl get cj
Describe
kubectl describe cronjob backup-job
View Pods
kubectl get pods
Logs
kubectl logs <pod-name>
14. Suspend a CronJob

Stop scheduling:

spec:
  suspend: true

Useful during maintenance.

15. Delete Old Job History
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 1

Keeps cluster clean.

16. Common Mistakes
Using Deployment for Batch Work

Wrong:

Run Backup
      ↓
Deployment
      ↓
Keeps Restarting Forever

Use Job.

Wrong Cron Expression
0 25 * * *

Invalid hour.

CronJob won't work.

Missing restartPolicy

Jobs usually require:

restartPolicy: Never

or

restartPolicy: OnFailure
17. Interview Questions
What is a Job?

A Kubernetes resource that runs a task to completion.

What is a CronJob?

A scheduled Job that runs based on a cron expression.

Difference between Job and Deployment?
Feature	Job	Deployment
Runs forever	❌	✅
Completes task	✅	❌
Batch processing	✅	❌
Web applications	❌	✅
What is backoffLimit?

Maximum retries before marking a Job as failed.

What is parallelism?

Number of Pods running simultaneously.