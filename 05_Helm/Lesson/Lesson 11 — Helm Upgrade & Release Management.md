# 🚀 Helm Tutorial — Lesson 11: Helm Upgrade & Release Management

> Learn how Helm manages application releases, performs safe upgrades, and enables reliable deployments with rollback capabilities.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [What is a Helm Release?](#-what-is-a-helm-release)
- [Release Lifecycle](#-release-lifecycle)
- [Installing a Release](#-installing-a-release)
- [Viewing Installed Releases](#-viewing-installed-releases)
- [Upgrading a Release](#-upgrading-a-release)
- [Upgrading with Values Files](#-upgrading-with-values-files)
- [Using `--set` During Upgrades](#-using---set-during-upgrades)
- [Using `helm upgrade --install`](#-using-helm-upgrade---install)
- [Reusing Existing Values](#-reusing-existing-values)
- [Waiting for Resources](#-waiting-for-resources)
- [Setting Upgrade Timeouts](#-setting-upgrade-timeouts)
- [Automatic Rollback with `--atomic`](#-automatic-rollback-with---atomic)
- [Dry Run Deployments](#-dry-run-deployments)
- [Debug Mode](#-debug-mode)
- [Previewing Templates](#-previewing-templates)
- [Recommended Upgrade Workflow](#-recommended-upgrade-workflow)
- [Production Deployment Example](#-production-deployment-example)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what a Helm Release is
- ✅ Learn how Helm stores release information
- ✅ Install and upgrade releases
- ✅ Use `helm upgrade --install`
- ✅ Reuse existing values with `--reuse-values`
- ✅ Deploy safely using `--wait`, `--timeout`, and `--atomic`
- ✅ Preview deployments using `--dry-run`
- ✅ Follow production-safe deployment strategies

---

# 📦 What is a Helm Release?

When you execute:

```bash
helm install ecommerce .
```

Helm does **more than create Kubernetes resources**.

It also creates a **Release**.

```text
Chart
   │
   ▼
Install
   │
   ▼
Release #1
```

A Helm Release is:

- A deployed instance of a Helm Chart
- Stored in the Kubernetes cluster
- Versioned
- Upgradeable
- Rollbackable

Every time you upgrade the application, Helm creates a new release revision.

---

# 🔄 Release Lifecycle

```text
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
```

Helm maintains a revision history, allowing upgrades and rollbacks.

---

# 🚀 Installing a Release

Install a new release:

```bash
helm install ecommerce .
```

Where:

- **Release Name:** `ecommerce`
- **Chart:** Current directory (`.`)

---

# 📋 Viewing Installed Releases

List all releases:

```bash
helm list
```

Example:

```text
NAME         NAMESPACE     REVISION     STATUS      CHART
ecommerce    default       1            deployed    ecommerce-0.1.0
```

### Column Explanation

| Column | Description |
|----------|-------------|
| NAME | Release name |
| NAMESPACE | Kubernetes namespace |
| REVISION | Release revision number |
| STATUS | Current deployment status |
| CHART | Chart name and version |

---

# ⬆️ Upgrading a Release

Suppose you update:

```yaml
image:
  tag: "2.0"
```

Deploy the changes:

```bash
helm upgrade ecommerce .
```

Helm performs:

```text
Current Release
        │
        ▼
Render New Templates
        │
        ▼
Compare Changes
        │
        ▼
Update Only Modified Resources
```

There is no need to uninstall and reinstall the application.

---

## Verify the Revision

Run:

```bash
helm list
```

Example:

```text
NAME         REVISION
ecommerce    2
```

The revision number increases after every successful upgrade.

---

# 📄 Upgrading with Values Files

### Development

```bash
helm upgrade ecommerce . \
    -f values-dev.yaml
```

### Production

```bash
helm upgrade ecommerce . \
    -f values-prod.yaml
```

This allows different environments to be upgraded using their respective configuration files.

---

# ⚙️ Using `--set` During Upgrades

Upgrade only the image version:

```bash
helm upgrade ecommerce . \
    --set image.tag=2.6.0
```

No file modification is required.

---

### Multiple Overrides

```bash
helm upgrade ecommerce . \
    -f values-prod.yaml \
    --set image.tag=2.6.1 \
    --set replicaCount=5
```

Final values:

```text
image.tag = 2.6.1
replicaCount = 5
```

---

# 🔄 Using `helm upgrade --install`

This command is widely used in CI/CD pipelines.

Instead of deciding whether to install or upgrade:

```bash
helm install ecommerce .
```

or

```bash
helm upgrade ecommerce .
```

use:

```bash
helm upgrade --install ecommerce .
```

Workflow:

```text
Release Exists?
      │
 ┌────┴────┐
 │         │
Yes        No
 │         │
 ▼         ▼
Upgrade  Install
```

Perfect for automation because no prior existence check is required.

---

# ♻️ Reusing Existing Values

Suppose the current release contains:

```yaml
replicaCount: 5

image:
  tag: "2.5"
```

Only update the image:

```bash
helm upgrade ecommerce . \
    --reuse-values \
    --set image.tag=2.6
```

Result:

```text
replicaCount = 5
image.tag = 2.6
```

All previous values remain unchanged unless explicitly overridden.

---

# ⏳ Waiting for Resources

Without:

```bash
helm upgrade ecommerce .
```

Helm exits immediately after sending resources to Kubernetes.

With:

```bash
helm upgrade ecommerce . --wait
```

Helm waits until resources become ready.

Examples include:

- Pods are running
- Deployments are available
- Services are created

Only then does Helm report success.

---

# ⌛ Setting Upgrade Timeouts

Some applications take longer to start.

Example:

```bash
helm upgrade ecommerce . \
    --wait \
    --timeout 10m
```

Helm waits up to **10 minutes** before considering the upgrade failed.

---

# 🛡️ Automatic Rollback with `--atomic`

One of the most important production flags.

```bash
helm upgrade ecommerce . \
    --atomic
```

Workflow:

```text
Upgrade
   │
   ▼
Success?
   │
 ┌─┴──────┐
 │         │
Yes        No
 │         │
 ▼         ▼
Keep     Automatic
Changes  Rollback
```

If anything fails, Helm restores the previous working release automatically.

This is highly recommended for production deployments.

---

# 🧪 Dry Run Deployments

Preview changes without modifying the cluster:

```bash
helm upgrade ecommerce . \
    --dry-run
```

Benefits:

- No changes applied
- Preview rendered manifests
- Validate configuration before deployment

---

# 🐞 Debug Mode

Enable detailed output:

```bash
helm upgrade ecommerce . \
    --dry-run \
    --debug
```

Displays:

- Rendered templates
- Computed values
- Helpful debugging information

This is one of the first commands to use when troubleshooting Helm Charts.

---

# 👀 Previewing Templates

Render templates locally:

```bash
helm template ecommerce .
```

### Comparison

| Command | Contacts Kubernetes Cluster? |
|----------|------------------------------|
| `helm template` | ❌ No |
| `helm upgrade --dry-run` | ✅ Yes (validates against the cluster where applicable) |

`helm template` only renders YAML locally and does not communicate with the Kubernetes API.

---

# 🔄 Recommended Upgrade Workflow

A safe production deployment process:

```text
Developer
     │
     ▼
Modify values.yaml
     │
     ▼
helm template
     │
     ▼
Review Generated YAML
     │
     ▼
helm upgrade --dry-run
     │
     ▼
Validate Changes
     │
     ▼
helm upgrade --atomic --wait
     │
     ▼
Production
```

This minimizes deployment risks.

---

# 🌐 Production Deployment Example

```bash
helm upgrade --install ecommerce-prod . \
    -f values-prod.yaml \
    --atomic \
    --wait \
    --timeout 10m
```

This command:

- Installs the release if it doesn't exist
- Upgrades it if it already exists
- Waits until resources become ready
- Automatically rolls back if the upgrade fails
- Allows up to 10 minutes for resource readiness

---

# ❌ Common Mistakes

## Using `helm install` for an Existing Release

### Incorrect

```bash
helm install ecommerce .
```

If the release already exists, Helm returns an error.

### Correct

```bash
helm upgrade ecommerce .
```

or

```bash
helm upgrade --install ecommerce .
```

---

## Skipping `--wait`

Without `--wait`, a CI/CD pipeline may continue before Pods are actually ready.

Recommended:

```bash
helm upgrade ecommerce . \
    --wait
```

---

## Upgrading Directly in Production

Avoid:

```bash
helm upgrade ecommerce .
```

Instead:

```bash
helm upgrade ecommerce . \
    --dry-run
```

Verify the output before applying changes.

---

## Forgetting `--atomic`

Without:

```bash
helm upgrade ecommerce .
```

A failed deployment may leave the application partially updated.

Recommended:

```bash
helm upgrade ecommerce . \
    --atomic
```

Automatic rollback restores the previous working release if the upgrade fails.

---

# 🧪 Hands-on Lab

Install the chart:

```bash
helm install ecommerce .
```

Verify the release:

```bash
helm list
```

Update the image:

```yaml
image:
  tag: "2.0"
```

Preview the upgrade:

```bash
helm upgrade ecommerce . \
    --dry-run \
    --debug
```

Perform a safe upgrade:

```bash
helm upgrade ecommerce . \
    --atomic \
    --wait
```

Verify the revision:

```bash
helm list
```

The revision number should increase.

---

# 📋 Summary

| Command / Flag | Purpose |
|----------------|---------|
| `helm install` | Install a new release |
| `helm upgrade` | Upgrade an existing release |
| `helm upgrade --install` | Install if missing, otherwise upgrade |
| `--reuse-values` | Reuse existing values during upgrade |
| `--wait` | Wait until resources become ready |
| `--timeout` | Set the maximum wait time |
| `--atomic` | Automatically roll back if the upgrade fails |
| `--dry-run` | Preview changes without applying them |
| `--debug` | Show detailed rendering and debugging information |

---

# 🎤 Interview Questions

### 1. What is a Helm Release?

> A Helm Release is a deployed instance of a Helm Chart that Helm tracks, versions, and manages throughout its lifecycle.

---

### 2. What is the difference between `helm install` and `helm upgrade`?

- `helm install` creates a new release.
- `helm upgrade` updates an existing release.

---

### 3. Why use `helm upgrade --install`?

> It simplifies automation by installing the release if it does not exist, or upgrading it if it already exists.

---

### 4. What does `--atomic` do?

> If an upgrade fails, Helm automatically rolls back to the previous successful release.

---

### 5. What is the purpose of `--wait`?

> It waits until Kubernetes resources become ready before reporting the deployment as successful.

---

### 6. When should you use `--dry-run`?

> Use `--dry-run` before applying changes—especially in staging or production—to preview rendered manifests and validate the upgrade safely.

---

# 📌 Key Takeaways

- A Helm Release is a versioned deployment of a Helm Chart.
- Every successful upgrade creates a new release revision.
- `helm upgrade` updates existing releases without reinstalling them.
- `helm upgrade --install` is ideal for CI/CD automation.
- `--reuse-values` preserves existing configuration during upgrades.
- `--wait`, `--timeout`, and `--atomic` make deployments safer and more reliable.
- Always use `--dry-run` and `--debug` to validate changes before deploying to production.