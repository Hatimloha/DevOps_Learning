# 🚀 Helm Tutorial — Lesson 13: Helm Hooks

> Learn how to execute Kubernetes resources before and after Helm lifecycle events using **Helm Hooks**, one of the most powerful production features of Helm.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Helm Hooks?](#-why-helm-hooks)
- [What is a Helm Hook?](#-what-is-a-helm-hook)
- [Helm Lifecycle](#-helm-lifecycle)
- [Hook Events](#-hook-events)
- [Hooks are Kubernetes Resources](#-hooks-are-kubernetes-resources)
- [Using `pre-install`](#-using-pre-install)
- [Using `post-install`](#-using-post-install)
- [Using `pre-upgrade`](#-using-pre-upgrade)
- [Using `post-upgrade`](#-using-post-upgrade)
- [Using `pre-delete`](#-using-pre-delete)
- [Using `post-delete`](#-using-post-delete)
- [Rollback Hooks](#-rollback-hooks)
- [Using Multiple Hooks](#-using-multiple-hooks)
- [Hook Weights](#-hook-weights)
- [Hook Delete Policy](#-hook-delete-policy)
- [Complete Hook Example](#-complete-hook-example)
- [Helm Test Hook](#-helm-test-hook)
- [Production Use Cases](#-production-use-cases)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what Helm Hooks are
- ✅ Understand Helm lifecycle events
- ✅ Use `pre-install` and `post-install`
- ✅ Use `pre-upgrade` and `post-upgrade`
- ✅ Use `pre-delete` and `post-delete`
- ✅ Use rollback hooks
- ✅ Configure hook weights
- ✅ Configure hook delete policies
- ✅ Apply Helm Hooks in production deployments

---

# ❓ Why Helm Hooks?

Real-world deployments often require additional tasks before or after deploying an application.

Examples include:

- Running database migrations
- Creating databases
- Backing up data
- Running smoke tests
- Clearing caches
- Sending deployment notifications
- Cleaning up resources before uninstalling

Instead of performing these tasks manually, Helm Hooks automate them.

---

# 📖 What is a Helm Hook?

Normally, Helm installs resources like this:

```text
helm install
      │
      ▼
Deployment
Service
ConfigMap
Secret
```

Sometimes you need an additional step.

Example:

```text
helm install
      │
      ▼
Create Database
      │
      ▼
Deploy Application
```

Helm Hooks allow Kubernetes resources to execute before or after Helm lifecycle events.

---

# 🔄 Helm Lifecycle

```text
Install
   │
   ▼
Upgrade
   │
   ▼
Rollback
   │
   ▼
Delete
   │
   ▼
Test
```

Helm exposes hook points around each of these operations.

---

# 📋 Hook Events

| Hook | Executes |
|------|----------|
| `pre-install` | Before resources are installed |
| `post-install` | After installation succeeds |
| `pre-upgrade` | Before an upgrade |
| `post-upgrade` | After an upgrade |
| `pre-delete` | Before uninstalling |
| `post-delete` | After uninstalling |
| `pre-rollback` | Before rollback |
| `post-rollback` | After rollback |
| `test` | When `helm test` is executed |

---

# 📦 Hooks are Kubernetes Resources

A Hook is simply a normal Kubernetes resource with special annotations.

Most commonly used resources:

- Job
- Pod

Sometimes:

- ConfigMap
- Secret

Helm detects the annotation and executes the resource at the appropriate lifecycle event.

---

# 🚀 Using `pre-install`

Create:

```text
templates/db-init-job.yaml
```

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: db-init

  annotations:
    "helm.sh/hook": pre-install

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: db-init
          image: busybox
          command:
            - sh
            - -c
            - echo "Initializing Database..."
```

Execution flow:

```text
helm install
      │
      ▼
Run Job
      │
      ▼
Job Completes
      │
      ▼
Deploy Application
```

This is commonly used for database initialization or prerequisite checks.

---

# 📬 Using `post-install`

Suppose you want to notify your team after a successful deployment.

```yaml
metadata:
  annotations:
    "helm.sh/hook": post-install
```

Workflow:

```text
Application Installed
        │
        ▼
Run Notification Job
```

Common use cases:

- Slack notifications
- Email notifications
- Cache warm-up
- Initial health verification

---

# ⬆️ Using `pre-upgrade`

Before upgrading:

```text
Revision 5
      │
      ▼
Database Backup
      │
      ▼
Upgrade
      │
      ▼
Revision 6
```

Annotation:

```yaml
annotations:
  "helm.sh/hook": pre-upgrade
```

Typical production tasks:

- Backup databases
- Pause traffic
- Validate prerequisites
- Prepare external systems

---

# ✅ Using `post-upgrade`

After the application has been upgraded:

```text
Upgrade Complete
      │
      ▼
Run Smoke Tests
      │
      ▼
Send Slack Notification
```

Annotation:

```yaml
annotations:
  "helm.sh/hook": post-upgrade
```

Typical uses:

- Smoke tests
- Health checks
- Cache refresh
- Deployment notifications

---

# 🗑️ Using `pre-delete`

Sometimes an application owns external resources.

Before uninstalling:

```text
Delete Storage
      │
      ▼
Delete Application
```

Annotation:

```yaml
annotations:
  "helm.sh/hook": pre-delete
```

Examples:

- Delete cloud storage
- Revoke certificates
- Disconnect external integrations

---

# 🧹 Using `post-delete`

Runs after Helm removes the release.

Workflow:

```text
Application Deleted
      │
      ▼
Cleanup Logs
      │
      ▼
Send Notification
```

Useful for:

- Removing temporary files
- Logging
- Sending uninstall notifications

---

# 🔄 Rollback Hooks

Execute tasks before or after a rollback.

### Before Rollback

```yaml
annotations:
  "helm.sh/hook": pre-rollback
```

---

### After Rollback

```yaml
annotations:
  "helm.sh/hook": post-rollback
```

Typical use cases:

- Cache clearing
- Restart dependent services
- Deployment notifications
- Validation checks

---

# 🔗 Using Multiple Hooks

A resource can respond to multiple lifecycle events.

Example:

```yaml
annotations:
  "helm.sh/hook": pre-install,pre-upgrade
```

The same Job executes:

- Before installation
- Before upgrades

---

# ⚖️ Hook Weights

Suppose multiple hooks exist.

```text
Job A

Job B

Job C
```

Which executes first?

Assign weights:

```yaml
annotations:
  "helm.sh/hook-weight": "-10"
```

Example:

```text
Job A
hook-weight: "-20"

Job B
hook-weight: "-10"

Job C
hook-weight: "5"
```

Execution order:

```text
-20
 │
 ▼
-10
 │
 ▼
 5
```

> **Rule:** Smaller numbers execute first.

---

# 🧹 Hook Delete Policy

Without cleanup:

```text
Run Job
   │
   ▼
Completed
   │
   ▼
Still Exists
```

Completed Jobs accumulate and clutter the cluster.

Automatically delete completed Jobs:

```yaml
annotations:
  "helm.sh/hook-delete-policy": hook-succeeded
```

Workflow:

```text
Run Job
   │
   ▼
Success
   │
   ▼
Delete Job
```

---

## Available Delete Policies

| Policy | Purpose |
|----------|----------|
| `hook-succeeded` | Delete after successful execution |
| `hook-failed` | Delete after failure |
| `before-hook-creation` | Delete previous hook before creating a new one |

Example:

```yaml
annotations:
  "helm.sh/hook-delete-policy": before-hook-creation
```

Useful during repeated upgrades.

---

# 📄 Complete Hook Example

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: db-migration

  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: migrate
          image: busybox
          command:
            - sh
            - -c
            - echo "Running Migration..."
```

This Job:

- Runs before upgrades
- Executes before hooks with higher weights
- Deletes itself after successful completion

---

# 🧪 Helm Test Hook

Helm provides a dedicated test hook.

```yaml
annotations:
  "helm.sh/hook": test
```

Run tests:

```bash
helm test ecommerce
```

Helm creates the test Pod or Job and reports whether it succeeds.

Testing is covered in the next lesson.

---

# 🏭 Production Use Cases

## Database Migration

```text
pre-upgrade
      │
      ▼
Run SQL Migration
      │
      ▼
Upgrade Deployment
```

---

## Cache Warm-up

```text
post-install
      │
      ▼
Populate Redis
      │
      ▼
Users Access Application
```

---

## Database Backup

```text
pre-upgrade
      │
      ▼
Backup Database
      │
      ▼
Upgrade Application
```

---

## Smoke Testing

```text
post-upgrade
      │
      ▼
Run Health Checks
      │
      ▼
Deployment Successful
```

---

## Slack Notification

```text
post-install
      │
      ▼
Deployment Successful
      │
      ▼
Notify Team
```

---

# ❌ Common Mistakes

## Running Long-Running Jobs

Avoid hooks that take a long time.

Long-running Jobs delay Helm operations and may exceed timeout limits.

---

## Forgetting Delete Policies

Without cleanup:

```yaml
hook-delete-policy: hook-succeeded
```

Completed Jobs remain in the cluster.

Always consider adding an appropriate delete policy.

---

## Choosing the Wrong Hook

Incorrect:

```text
post-install
```

for a database migration that must finish before the application starts.

Correct:

```text
pre-install
```

---

## Assuming Hook Failures Are Ignored

If a required hook fails, the Helm operation usually fails as well (unless behavior is specifically altered).

Design hook Jobs to return proper success or failure status.

---

# 🧪 Hands-on Lab

Create:

```text
templates/pre-install-job.yaml
```

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: demo-pre-install

  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-delete-policy": hook-succeeded

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: demo
          image: busybox
          command:
            - sh
            - -c
            - echo "Running Pre-Install Hook"
```

Preview the chart:

```bash
helm template demo .
```

Notice the rendered Job contains the hook annotations.

Install:

```bash
helm install demo .
```

Monitor the Job:

```bash
kubectl get jobs
```

If `hook-delete-policy: hook-succeeded` is configured, the Job is automatically removed after successful execution.

---

# 📋 Summary

| Hook | Purpose |
|-------|---------|
| `pre-install` | Execute before installation |
| `post-install` | Execute after installation |
| `pre-upgrade` | Execute before upgrade |
| `post-upgrade` | Execute after upgrade |
| `pre-delete` | Execute before uninstall |
| `post-delete` | Execute after uninstall |
| `pre-rollback` | Execute before rollback |
| `post-rollback` | Execute after rollback |
| `test` | Execute when `helm test` runs |

---

# 🎤 Interview Questions

### 1. What is a Helm Hook?

> A Helm Hook is a Kubernetes resource that Helm executes during specific lifecycle events such as install, upgrade, rollback, delete, or testing.

---

### 2. How do you define a Hook?

> By adding the `helm.sh/hook` annotation to a Kubernetes resource.

Example:

```yaml
annotations:
  "helm.sh/hook": pre-install
```

---

### 3. What is the difference between `pre-install` and `post-install`?

- `pre-install` runs before Helm installs the main application resources.
- `post-install` runs after the installation completes successfully.

---

### 4. What is a Hook Weight?

> A Hook Weight determines the execution order when multiple hooks of the same type exist. Hooks with lower weight values execute first.

---

### 5. Why use `hook-delete-policy`?

> It automatically removes completed or failed hook resources, keeping the Kubernetes cluster clean and preventing unnecessary resource accumulation.

---

### 6. Give three real-world uses of Helm Hooks.

- Database migrations
- Database backups before upgrades
- Smoke tests or deployment notifications

---

# 📌 Key Takeaways

- Helm Hooks execute Kubernetes resources before or after Helm lifecycle events.
- Hooks are implemented using standard Kubernetes resources with special annotations.
- Common lifecycle hooks include `pre-install`, `post-install`, `pre-upgrade`, `post-upgrade`, `pre-delete`, and `post-delete`.
- Hook Weights control execution order when multiple hooks of the same type exist.
- Hook Delete Policies automatically clean up completed hook resources.
- Helm Hooks are widely used in production for database migrations, backups, smoke tests, cache warm-up, and deployment notifications.
- Design hooks carefully—long-running or failing hooks can delay or block Helm operations.