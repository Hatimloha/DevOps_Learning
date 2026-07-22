Lesson 11 — Helm Upgrade & Release Management

This lesson is one of the most important operational topics in Helm.

Creating a chart is only the beginning. In real projects, applications are continuously updated:

New image versions
Configuration changes
Bug fixes
Security patches

Helm provides release management to make these updates safe and reversible.

Learning Objectives

By the end of this lesson, you'll understand:

What a Helm Release is
How Helm stores release information
helm install
helm upgrade
helm upgrade --install
--reuse-values
--atomic
--wait
--timeout
Dry runs
Safe deployment strategies
What is a Helm Release?

When you run:

helm install ecommerce .

Helm doesn't just create Kubernetes resources.

It also creates a Release.

Think of it like this:

Chart
   │
   ▼
Install
   │
   ▼
Release #1

A release is:

A deployed instance of a chart
Stored in the Kubernetes cluster
Versioned
Upgradeable
Rollbackable
Release Lifecycle
helm install
      │
      ▼
Release 1
      │
      ▼
helm upgrade
      │
      ▼
Release 2
      │
      ▼
helm upgrade
      │
      ▼
Release 3
      │
      ▼
helm rollback
      │
      ▼
Back to Release 2
Install a Release
helm install ecommerce .

Release Name:

ecommerce

Chart:

Current Directory
Verify Installed Releases
helm list

Example:

NAME         NAMESPACE     REVISION     STATUS      CHART
ecommerce    default       1            deployed    ecommerce-0.1.0

Explanation:

Column	Meaning
NAME	Release name
NAMESPACE	Kubernetes namespace
REVISION	Release version
STATUS	Deployment status
CHART	Chart name and version
Upgrade a Release

Suppose you update:

image:
  tag: "2.0"

Deploy the changes:

helm upgrade ecommerce .

Helm compares:

Current Release

↓

New Templates

↓

Only Changed Resources

↓

Apply Changes

No need to delete and reinstall.

Verify Revision
helm list

Output:

NAME         REVISION

ecommerce       2

Revision increased.

Upgrade Using Values File

Development:

helm upgrade ecommerce . \
    -f values-dev.yaml

Production:

helm upgrade ecommerce . \
    -f values-prod.yaml
Upgrade Image Only
helm upgrade ecommerce . \
    --set image.tag=2.6.0

No file modification required.

Upgrade with Multiple Overrides
helm upgrade ecommerce . \
    -f values-prod.yaml \
    --set image.tag=2.6.1 \
    --set replicaCount=5

Final values:

image.tag = 2.6.1

replicas = 5
helm upgrade --install

Very common in CI/CD.

Instead of:

helm install ecommerce .

or

helm upgrade ecommerce .

Use:

helm upgrade --install ecommerce .

Behavior:

Release Exists?

      │

   Yes ─────────► Upgrade

      │

      No

      │

      ▼

Install

Perfect for automation because you don't need to know whether the release already exists.

--reuse-values

Suppose:

Current release:

replicaCount: 5

image:
  tag: "2.5"

Now you only want:

image:
  tag: "2.6"

Run:

helm upgrade ecommerce . \
    --reuse-values \
    --set image.tag=2.6

Result:

replicaCount = 5

image.tag = 2.6

Existing values are reused.

--wait

Without:

helm upgrade ecommerce .

Helm exits immediately after sending resources to Kubernetes.

With:

helm upgrade ecommerce . --wait

Helm waits until resources become ready.

For example:

Pods are Running
Deployments are Available
Services are created

Only then does Helm finish successfully.

--timeout

Sometimes Pods need longer to start.

Example:

helm upgrade ecommerce . \
    --wait \
    --timeout 10m

Helm waits up to:

10 Minutes

If resources aren't ready within that time, the operation fails.

--atomic

One of the most important production flags.

Example:

helm upgrade ecommerce . \
    --atomic

Behavior:

Upgrade

      │

      ▼

Success?

   │

Yes ─────► Keep Changes

   │

No

   │

▼

Automatic Rollback

If something fails, Helm restores the previous working release automatically.

This is widely used in production pipelines.

Dry Run

Preview changes without applying them:

helm upgrade ecommerce . \
    --dry-run

Nothing changes in the cluster.

Very useful before production deployments.

Debug Mode
helm upgrade ecommerce . \
    --dry-run \
    --debug

Displays:

Rendered templates
Computed values
Helpful debugging information

This is one of the first commands to use when troubleshooting Helm charts.

Preview Template Changes

Another useful command:

helm template ecommerce .

Difference:

Command	Contacts Kubernetes?
helm template	❌ No
helm upgrade --dry-run	✅ Yes (validates against the cluster where applicable)

helm template simply renders YAML locally.

Common Upgrade Workflow
Developer

↓

Modify values.yaml

↓

helm template

↓

Verify YAML

↓

helm upgrade --dry-run

↓

Verify

↓

helm upgrade --atomic --wait

↓

Production

This is a safe deployment pattern.

Production Deployment Example
helm upgrade --install ecommerce-prod . \
    -f values-prod.yaml \
    --atomic \
    --wait \
    --timeout 10m

This command:

Installs if missing
Upgrades if present
Waits for readiness
Rolls back automatically if the upgrade fails
Allows up to 10 minutes for resources to become ready
Common Mistakes
❌ Using install for Existing Releases

Wrong:

helm install ecommerce .

If the release already exists, Helm returns an error.

Correct:

helm upgrade ecommerce .

or

helm upgrade --install ecommerce .
❌ Skipping --wait

Your CI/CD pipeline may continue even though Pods are still starting.

Prefer:

helm upgrade ecommerce . \
    --wait
❌ Upgrading Directly in Production

Don't do:

helm upgrade ecommerce .

Instead:

helm upgrade ecommerce . \
    --dry-run

Verify the output first, then deploy.

❌ Forgetting --atomic

Without:

helm upgrade ecommerce .

A failed deployment can leave your application in a partially updated state.

With:

helm upgrade ecommerce . \
    --atomic

Helm automatically rolls back if the upgrade fails.

Hands-on Lab
Install your chart:
helm install ecommerce .
Verify the release:
helm list
Change:
image:
  tag: "2.0"
Preview the upgrade:
helm upgrade ecommerce . \
    --dry-run \
    --debug
Perform the upgrade safely:
helm upgrade ecommerce . \
    --atomic \
    --wait
Check the revision:
helm list

You should see the revision number increase.

Summary
Command	Purpose
helm install	Install a new release
helm upgrade	Upgrade an existing release
helm upgrade --install	Install if missing, otherwise upgrade
--reuse-values	Reuse existing values during upgrade
--wait	Wait until resources are ready
--timeout	Set the maximum wait time
--atomic	Roll back automatically if the upgrade fails
--dry-run	Preview changes without applying them
--debug	Show detailed rendering and debugging information
Interview Questions
1. What is a Helm Release?

A release is a deployed instance of a Helm chart that Helm tracks and versions.

2. What is the difference between helm install and helm upgrade?
helm install creates a new release.
helm upgrade updates an existing release.
3. Why use helm upgrade --install?

It makes automation simpler by installing the release if it doesn't exist, or upgrading it if it does.

4. What does --atomic do?

If the upgrade fails, Helm automatically rolls back to the previous successful release.

5. What is the purpose of --wait?

It waits until Kubernetes resources are ready before reporting success.

6. When should you use --dry-run?

Before applying changes, especially in staging or production, to preview the rendered manifests and validate the upgrade.