# 🚀 Helm Tutorial — Lesson 12: Rollbacks & Release History

> Learn how to inspect Helm release history, view deployed configurations, and safely roll back applications to previous working versions.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Rollbacks Matter](#-why-rollbacks-matter)
- [What is a Revision?](#-what-is-a-revision)
- [Viewing Installed Releases](#-viewing-installed-releases)
- [Viewing Release History](#-viewing-release-history)
- [Understanding Release Status](#-understanding-release-status)
- [Viewing Release Status](#-viewing-release-status)
- [Viewing Deployed Values](#-viewing-deployed-values)
- [Viewing Rendered Manifests](#-viewing-rendered-manifests)
- [Viewing Release Notes](#-viewing-release-notes)
- [Rolling Back to a Previous Revision](#-rolling-back-to-a-previous-revision)
- [What Happens During a Rollback?](#-what-happens-during-a-rollback)
- [Verifying a Rollback](#-verifying-a-rollback)
- [Rollback Options](#-rollback-options)
- [Viewing Previous Revision Data](#-viewing-previous-revision-data)
- [Production Rollback Workflow](#-production-rollback-workflow)
- [Using `--atomic`](#-using---atomic)
- [Common Production Commands](#-common-production-commands)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand Helm release revisions
- ✅ View release history using `helm history`
- ✅ Check release status using `helm status`
- ✅ Roll back releases using `helm rollback`
- ✅ Use rollback options such as `--wait`, `--timeout`, and `--dry-run`
- ✅ View deployed manifests and values
- ✅ Follow production rollback strategies

---

# 🚨 Why Rollbacks Matter

Even with careful testing, production deployments can fail because of:

- Bad container images
- Configuration mistakes
- Application bugs
- Failed database migrations
- Infrastructure issues

Instead of manually fixing everything, Helm allows you to quickly restore a previously working release.

---

# 🔢 What is a Revision?

Every successful **install**, **upgrade**, or **rollback** creates a new revision.

Example:

```text
Revision 1
│
├── Image: nginx:1.27
│
▼
Revision 2
│
├── Image: nginx:1.28
│
▼
Revision 3
│
├── Replica Count: 5
│
▼
Revision 4
│
├── ConfigMap Updated
```

Helm stores every revision, allowing you to inspect and restore previous deployments.

---

# 📋 Viewing Installed Releases

Display installed releases:

```bash
helm list
```

Example:

```text
NAME         NAMESPACE   REVISION   STATUS     CHART
ecommerce    default     4          deployed   ecommerce-0.1.0
```

The current revision is:

```text
4
```

---

# 📜 Viewing Release History

Display the release history:

```bash
helm history ecommerce
```

Example:

```text
REVISION   UPDATED                  STATUS        CHART
1          2026-07-01 09:30         deployed      ecommerce-0.1.0
2          2026-07-01 10:00         superseded    ecommerce-0.1.0
3          2026-07-01 11:00         superseded    ecommerce-0.1.0
4          2026-07-01 12:00         deployed      ecommerce-0.1.0
```

This command shows every release revision and its current state.

---

# 📖 Understanding Release Status

| Status | Meaning |
|---------|---------|
| `deployed` | Current active revision |
| `superseded` | Replaced by a newer revision |
| `failed` | Installation or upgrade failed |
| `pending-install` | Installation is in progress |
| `pending-upgrade` | Upgrade is in progress |
| `pending-rollback` | Rollback is in progress |
| `uninstalled` | Release has been removed |

---

# 📊 Viewing Release Status

Check the current release:

```bash
helm status ecommerce
```

Example:

```text
NAME: ecommerce
STATUS: deployed
REVISION: 4
NAMESPACE: default
```

This provides a quick overview of the deployed release.

---

# 📄 Viewing Deployed Values

Sometimes you need to know which configuration was deployed.

Display user-supplied values:

```bash
helm get values ecommerce
```

Example:

```yaml
replicaCount: 5

image:
  tag: "2.6.0"
```

---

## View All Values

Include default values as well:

```bash
helm get values ecommerce --all
```

This is useful for troubleshooting and auditing deployments.

---

# 📜 Viewing Rendered Manifests

Display the exact Kubernetes manifests deployed by Helm:

```bash
helm get manifest ecommerce
```

Example:

```yaml
apiVersion: apps/v1
kind: Deployment
...
```

Useful when debugging live deployments.

---

# 📝 Viewing Release Notes

If the chart contains release notes:

```bash
helm get notes ecommerce
```

Example:

```text
Application URL:

http://my-app.example.com
```

---

# 🔄 Rolling Back to a Previous Revision

Suppose the history looks like this:

```text
Revision 1 → Stable

Revision 2 → Stable

Revision 3 → Broken
```

Current revision:

```text
Revision 3
```

Restore Revision 2:

```bash
helm rollback ecommerce 2
```

Helm restores:

- Deployment
- Services
- ConfigMaps
- Secrets
- Other Kubernetes resources managed by the release

---

# ⚙️ What Happens During a Rollback?

Helm does **not** reactivate the old revision.

Instead, it creates a **new revision** using the previous configuration.

```text
Revision 1
      │
      ▼
Revision 2
      │
      ▼
Revision 3 (Broken)
      │
      ▼
helm rollback 2
      │
      ▼
Revision 4
(Same configuration as Revision 2)
```

This preserves a complete deployment history.

---

# ✅ Verifying a Rollback

Run:

```bash
helm history ecommerce
```

Example:

```text
REVISION   STATUS

1          superseded

2          superseded

3          superseded

4          deployed
```

Revision **4** now contains the configuration from Revision **2**.

---

# ⚙️ Rollback Options

## Wait Until Resources Are Ready

```bash
helm rollback ecommerce 2 \
    --wait
```

Helm waits until Pods and other resources become healthy.

---

## Set a Timeout

```bash
helm rollback ecommerce 2 \
    --wait \
    --timeout 10m
```

Wait up to **10 minutes** before reporting failure.

---

## Preview the Rollback

```bash
helm rollback ecommerce 2 \
    --dry-run
```

No changes are applied.

Use this before performing production rollbacks.

---

# 📑 Viewing Previous Revision Data

View values from a specific revision:

```bash
helm get values ecommerce --revision 2
```

Compare with another revision:

```bash
helm get values ecommerce --revision 4
```

Useful for auditing configuration changes.

---

## View Previous Revision Manifest

```bash
helm get manifest ecommerce --revision 2
```

Compare it with the current manifest to identify what changed.

---

# 🏭 Production Rollback Workflow

A recommended production workflow:

```text
Developer
     │
     ▼
Deploy Revision 5
     │
     ▼
Application Fails
     │
     ▼
Check Status
     │
     ▼
helm history
     │
     ▼
Identify Stable Revision
     │
     ▼
helm rollback
     │
     ▼
Application Restored
```

---

# 🛡️ Using `--atomic`

From Lesson 11:

```bash
helm upgrade ecommerce . \
    --atomic
```

Workflow:

```text
Upgrade
   │
   ▼
Failure
   │
   ▼
Automatic Rollback
```

In many production deployments, manual rollback is unnecessary because `--atomic` automatically restores the previous working release.

---

# 🛠️ Common Production Commands

### List Releases

```bash
helm list
```

---

### View History

```bash
helm history ecommerce
```

---

### View Status

```bash
helm status ecommerce
```

---

### View Values

```bash
helm get values ecommerce
```

---

### View Manifests

```bash
helm get manifest ecommerce
```

---

### Roll Back

```bash
helm rollback ecommerce 3
```

---

# ❌ Common Mistakes

## Rolling Back Without Checking History

Incorrect:

```bash
helm rollback ecommerce 2
```

Always verify which revision is stable:

```bash
helm history ecommerce
```

---

## Assuming Rollback Deletes History

Rollback **does not remove history**.

Every rollback creates a new revision, preserving a complete audit trail.

---

## Forgetting `--wait`

Recommended:

```bash
helm rollback ecommerce 2 --wait
```

This ensures resources are healthy before the rollback completes.

---

## Assuming Database Changes Are Reverted

Helm only manages Kubernetes resources.

It **does not** automatically undo:

- Database schema changes
- Database migrations
- Application data modifications

Database rollback strategies must be handled separately.

---

# 🧪 Hands-on Lab

Install your chart:

```bash
helm install ecommerce .
```

Update the image:

```yaml
image:
  tag: "2.0"
```

Upgrade:

```bash
helm upgrade ecommerce .
```

Update the replica count:

```yaml
replicaCount: 5
```

Upgrade again:

```bash
helm upgrade ecommerce .
```

View history:

```bash
helm history ecommerce
```

Roll back to Revision 2:

```bash
helm rollback ecommerce 2 --wait
```

Verify:

```bash
helm history ecommerce
```

Inspect deployed values:

```bash
helm get values ecommerce --all
```

---

# 📋 Summary

| Command | Purpose |
|----------|---------|
| `helm history` | Show release revision history |
| `helm status` | Display current release status |
| `helm get values` | Show deployed values |
| `helm get manifest` | Display deployed Kubernetes manifests |
| `helm get notes` | Show release notes |
| `helm rollback` | Restore a previous release revision |

---

# 🎤 Interview Questions

### 1. What is a Helm revision?

> A Helm revision is a numbered version of a release created after every successful install, upgrade, or rollback.

---

### 2. Does a rollback remove release history?

> No. Every rollback creates a new revision while preserving all previous revisions.

---

### 3. Which command displays release history?

```bash
helm history <release-name>
```

---

### 4. How do you roll back to Revision 3?

```bash
helm rollback <release-name> 3
```

---

### 5. What is the purpose of `helm get manifest`?

> It displays the exact Kubernetes manifests deployed by Helm for a release.

---

### 6. Does `helm rollback` undo database schema or data changes?

> No. Helm only restores Kubernetes resources managed by the release. Database schema changes and data migrations must be rolled back separately.

---

# 📌 Key Takeaways

- Every install, upgrade, and rollback creates a new Helm revision.
- `helm history` provides a complete audit trail of all release revisions.
- `helm status` shows the current deployment state.
- `helm get values`, `helm get manifest`, and `helm get notes` help inspect deployed releases.
- `helm rollback` restores a previous configuration by creating a new revision.
- Always verify release history before performing a rollback.
- Use `--wait` during rollbacks to ensure workloads become healthy before considering the operation successful.
- Helm rollbacks restore Kubernetes resources but do **not** reverse database schema or data changes.