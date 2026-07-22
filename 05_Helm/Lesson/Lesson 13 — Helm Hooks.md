Lesson 13 — Helm Hooks

Helm Hooks allow you to execute Kubernetes resources before or after specific Helm lifecycle events.

This is an advanced but very common production feature.

Real-world examples include:

Running database migrations before an upgrade
Creating a database before the application starts
Running smoke tests after deployment
Cleaning up resources before uninstalling
Sending deployment notifications
Learning Objectives

By the end of this lesson, you'll understand:

What Helm Hooks are
Helm lifecycle events
pre-install
post-install
pre-upgrade
post-upgrade
pre-delete
post-delete
test
Hook weights
Hook delete policies
Production best practices
What is a Hook?

Normally, Helm installs resources in this order:

helm install
      │
      ▼
Deployment
Service
ConfigMap
Secret

Sometimes you need to run something before or after this process.

Example:

helm install
      │
      ▼
Create Database
      │
      ▼
Deploy Application

That's exactly what Hooks provide.

Helm Lifecycle
Install

↓

Upgrade

↓

Rollback

↓

Delete

↓

Test

Helm provides hook points around these operations.

Hook Events
Hook	When it Runs
pre-install	Before resources are installed
post-install	After installation succeeds
pre-upgrade	Before an upgrade
post-upgrade	After an upgrade
pre-delete	Before uninstalling
post-delete	After uninstalling
pre-rollback	Before rollback
post-rollback	After rollback
test	When helm test is executed
Hooks are Kubernetes Resources

A hook is just a normal Kubernetes resource with special annotations.

Most commonly:

Job
Pod

Sometimes:

ConfigMap
Secret
Example — pre-install

Create:

templates/db-init-job.yaml
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

Flow:

helm install

↓

Run Job

↓

Job Completes

↓

Deploy Application
post-install

Suppose you want to send a notification after deployment.

metadata:
  annotations:
    "helm.sh/hook": post-install

Flow:

Application Installed

↓

Run Notification Job
pre-upgrade

Before upgrading:

Revision 5

↓

Database Backup

↓

Upgrade

↓

Revision 6

Annotation:

annotations:
  "helm.sh/hook": pre-upgrade

Common use cases:

Backup database
Pause traffic
Validate prerequisites
post-upgrade

Example:

Upgrade Complete

↓

Run Smoke Tests

↓

Send Slack Notification

Annotation:

annotations:
  "helm.sh/hook": post-upgrade
pre-delete

Suppose the application owns a cloud resource.

Before uninstall:

Delete Storage

↓

Delete Application

Annotation:

annotations:
  "helm.sh/hook": pre-delete
post-delete

Runs after Helm removes the release.

Example:

Application Deleted

↓

Cleanup Logs

↓

Send Notification
Rollback Hooks

Before rollback:

annotations:
  "helm.sh/hook": pre-rollback

After rollback:

annotations:
  "helm.sh/hook": post-rollback

Useful for:

Cache clearing
Restarting dependent services
Notifications
Multiple Hooks

You can assign more than one hook:

annotations:
  "helm.sh/hook": pre-install,pre-upgrade

The same Job runs:

Before installation
Before upgrades
Hook Weights

Suppose you have three Jobs.

Job A

Job B

Job C

Which runs first?

Use:

annotations:
  "helm.sh/hook-weight": "-10"

Example:

Job A

hook-weight: "-20"

Job B

hook-weight: "-10"

Job C

hook-weight: "5"

Execution order:

-20

↓

-10

↓

5

Smaller numbers execute first.

Hook Delete Policy

Without cleanup:

Job

↓

Completed

↓

Still Exists

Cluster becomes cluttered.

Delete automatically:

annotations:

  "helm.sh/hook-delete-policy": hook-succeeded

After success:

Run Job

↓

Success

↓

Delete Job
Available Delete Policies
Policy	Meaning
hook-succeeded	Delete after successful execution
hook-failed	Delete after failure
before-hook-creation	Delete previous hook before creating a new one

Example:

annotations:
  "helm.sh/hook-delete-policy": before-hook-creation

Useful for repeated upgrades.

Complete Example
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

This Job:

Runs before upgrade
Executes before hooks with higher weights
Is deleted after success
Helm Test Hook

Helm has a dedicated hook:

annotations:

  "helm.sh/hook": test

Run:

helm test ecommerce

Helm creates the test Pod or Job and reports whether it succeeded.

We'll cover testing in the next lesson.

Production Examples
Database Migration
pre-upgrade

↓

Run SQL Migration

↓

Upgrade Deployment
Cache Warm-up
post-install

↓

Populate Redis

↓

Users Start Accessing App
Backup Database
pre-upgrade

↓

Database Backup

↓

Upgrade
Smoke Test
post-upgrade

↓

Run Health Checks

↓

Success
Slack Notification
post-install

↓

Deployment Successful

↓

Notify Team
Common Mistakes
❌ Running Long Jobs

Avoid hooks that take a very long time.

They delay the Helm operation and may hit timeout limits.

❌ Forgetting Delete Policies

Jobs remain in the cluster.

Always consider:

hook-delete-policy: hook-succeeded
❌ Wrong Hook Type

Don't use:

post-install

for a database migration that must complete before the application starts.

Use:

pre-install

instead.

❌ Assuming Hook Failure Is Ignored

If a required hook fails, the Helm operation usually fails as well (unless behavior is specifically altered). Design hook Jobs to report success or failure correctly.

Hands-on Lab

Create:

templates/pre-install-job.yaml
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

Preview:

helm template demo .

Notice that the Job appears in the rendered output with the hook annotations.

Install:

helm install demo .

Watch the Job:

kubectl get jobs

If you configured hook-delete-policy: hook-succeeded, the Job will be removed after it completes successfully.

Summary
Hook	Purpose
pre-install	Before installation
post-install	After installation
pre-upgrade	Before upgrade
post-upgrade	After upgrade
pre-delete	Before uninstall
post-delete	After uninstall
pre-rollback	Before rollback
post-rollback	After rollback
test	Used by helm test
Interview Questions
1. What is a Helm Hook?

A Kubernetes resource that Helm executes during specific lifecycle events.

2. How do you define a hook?

By adding the helm.sh/hook annotation to a Kubernetes resource.

3. What is the difference between pre-install and post-install?
pre-install runs before Helm installs the main resources.
post-install runs after the installation succeeds.
4. What is a hook weight?

It determines the execution order when multiple hooks of the same type exist. Lower numbers run first.

5. Why use hook-delete-policy?

To automatically clean up completed or failed hook resources and keep the cluster tidy.

6. Give three real-world uses of hooks.
Database migrations
Database backups before upgrades
Smoke tests or deployment notifications