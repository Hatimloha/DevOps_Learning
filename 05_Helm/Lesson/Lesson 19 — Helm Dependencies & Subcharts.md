````md id="d19k4m"
# 🚀 Helm Tutorial — Lesson 19: Helm Dependencies & Subcharts

> Learn how to build modular Helm deployments using **dependencies and subcharts**. Instead of maintaining every component yourself, Helm allows you to reuse trusted charts such as PostgreSQL, Redis, and other services, making deployments faster, more reliable, and easier to maintain.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Dependencies?](#-why-dependencies)
- [Parent Charts and Subcharts](#-parent-charts-and-subcharts)
- [Declaring Dependencies](#-declaring-dependencies)
- [Downloading Dependencies](#-downloading-dependencies)
- [Understanding `Chart.lock`](#-understanding-chartlock)
- [Installing the Parent Chart](#-installing-the-parent-chart)
- [Overriding Dependency Values](#-overriding-dependency-values)
- [Enabling and Disabling Dependencies](#-enabling-and-disabling-dependencies)
- [Dependency Conditions](#-dependency-conditions)
- [Dependency Tags](#-dependency-tags)
- [`helm dependency update`](#-helm-dependency-update)
- [`helm dependency build`](#-helm-dependency-build)
- [Production Example](#-production-example)
- [Viewing Dependencies](#-viewing-dependencies)
- [Updating Dependency Versions](#-updating-dependency-versions)
- [Local Dependencies](#-local-dependencies)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand Helm dependencies
- ✅ Differentiate between parent charts and subcharts
- ✅ Declare dependencies in `Chart.yaml`
- ✅ Download and manage chart dependencies
- ✅ Understand the purpose of `Chart.lock`
- ✅ Enable or disable dependencies
- ✅ Override values for subcharts
- ✅ Apply dependency management best practices

---

# 🌟 Why Dependencies?

Real-world applications usually consist of multiple services.

Example:

```text
E-Commerce Platform

├── Frontend
├── Backend
├── PostgreSQL
└── Redis
```

Without Helm dependencies:

```text
Write PostgreSQL Chart ❌

Write Redis Chart ❌

Maintain Everything Yourself ❌
```

With dependencies:

```text
Your Chart
      │
      ├── Bitnami PostgreSQL
      └── Bitnami Redis
```

Instead of reinventing the wheel, you can reuse trusted community charts.

---

# 👨‍👩‍👧‍👦 Parent Charts and Subcharts

## Parent Chart

Your primary application chart.

Example:

```text
ecommerce/
```

This is called the **Parent Chart**.

---

## Subcharts

Dependencies automatically become **Subcharts**.

Example:

```text
ecommerce/

├── Chart.yaml
├── values.yaml
├── charts/
│
├── postgresql/
│
└── redis/
```

The parent chart controls how all subcharts are deployed.

---

# 📄 Declaring Dependencies

Dependencies are declared in `Chart.yaml`.

Example:

```yaml
apiVersion: v2

name: ecommerce

version: 1.0.0

dependencies:

  - name: postgresql
    version: "16.7.0"
    repository: "https://charts.bitnami.com/bitnami"

  - name: redis
    version: "21.2.3"
    repository: "https://charts.bitnami.com/bitnami"
```

> **Tip:** Always verify available chart versions using `helm search repo` before pinning them, as repository versions change over time.

---

# ⬇️ Downloading Dependencies

After updating `Chart.yaml`, run:

```bash
helm dependency update
```

Helm performs the following steps:

```text
Read Chart.yaml
      │
      ▼
Download Dependencies
      │
      ▼
Create charts/
      │
      ▼
Generate Chart.lock
```

Result:

```text
ecommerce/

├── charts/

│   ├── postgresql-16.7.0.tgz

│   └── redis-21.2.3.tgz

├── Chart.lock
```

---

# 🔒 Understanding `Chart.lock`

Example:

```yaml
dependencies:

- name: redis
  version: 21.2.3

- name: postgresql
  version: 16.7.0
```

Purpose:

- Locks dependency versions
- Ensures reproducible builds
- Prevents unexpected dependency changes

Comparable files in other ecosystems:

| Technology | Lock File |
|------------|-----------|
| npm | `package-lock.json` |
| Go | `go.sum` |
| Rust | `Cargo.lock` |
| Helm | `Chart.lock` |

---

# 🚀 Installing the Parent Chart

Install the chart:

```bash
helm install ecommerce .
```

Deployment flow:

```text
Parent Chart
      │
      ▼
Frontend
      │
      ▼
Backend
      │
      ▼
PostgreSQL
      │
      ▼
Redis
```

All components are installed together as a single release.

---

# ⚙️ Overriding Dependency Values

Each dependency has its own configurable values.

Example:

```yaml
postgresql:

  auth:
    username: admin
    password: mypassword
    database: shopdb

redis:

  architecture: standalone
```

Helm automatically passes these values to the corresponding subcharts.

This allows you to customize dependencies without modifying their source code.

---

# 🔄 Enabling and Disabling Dependencies

Suppose Redis is optional.

`values.yaml`

```yaml
redis:
  enabled: false
```

`Chart.yaml`

```yaml
dependencies:

- name: redis
  condition: redis.enabled
```

When:

```yaml
redis:
  enabled: false
```

Helm skips installing Redis.

---

# 🎛️ Dependency Conditions

Conditions allow components to be enabled or disabled individually.

Example:

```yaml
dependencies:

- name: redis
  condition: redis.enabled

- name: postgresql
  condition: postgresql.enabled
```

Different environments can enable only the components they require.

Example:

```text
Development
  │
  ├── PostgreSQL ✅
  └── Redis ❌

Production
  │
  ├── PostgreSQL ✅
  └── Redis ✅
```

---

# 🏷️ Dependency Tags

Tags allow multiple dependencies to be managed together.

Example:

```yaml
dependencies:

- name: redis
  tags:
    - cache

- name: memcached
  tags:
    - cache
```

Disable all cache-related components:

```yaml
tags:
  cache: false
```

This is useful when multiple charts belong to the same functional group.

---

# 🔄 `helm dependency update`

Purpose:

- Resolves dependencies from `Chart.yaml`
- Downloads missing charts
- Updates dependency versions
- Regenerates `Chart.lock`

Command:

```bash
helm dependency update
```

Use this whenever dependency definitions change.

---

# 🛠️ `helm dependency build`

Purpose:

- Rebuilds the `charts/` directory
- Uses the existing `Chart.lock`
- Does **not** resolve newer versions

Command:

```bash
helm dependency build
```

Useful for CI/CD pipelines where reproducible builds are required.

---

## Difference

| Command | Purpose |
|----------|---------|
| `helm dependency update` | Resolve/download dependencies from `Chart.yaml` and regenerate `Chart.lock` |
| `helm dependency build` | Recreate `charts/` from the existing `Chart.lock` without resolving newer versions |

---

# 🏢 Production Example

Enterprise application:

```text
shopping-platform/

├── frontend
├── backend
├── ingress
├── monitoring
├── redis
└── postgresql
```

Architecture:

```text
Shopping Platform
        │
        ▼
Bitnami Redis
        │
        ▼
Bitnami PostgreSQL
        │
        ▼
Application Deployment
```

This reduces maintenance while using trusted community-maintained charts.

---

# 📋 Viewing Dependencies

Display downloaded dependencies:

```bash
helm dependency list
```

Example:

```text
NAME          VERSION

postgresql    16.7.0

redis         21.2.3
```

This helps verify installed dependency versions.

---

# 🔖 Updating Dependency Versions

Suppose PostgreSQL releases:

```text
16.8.0
```

Update `Chart.yaml`:

```yaml
dependencies:

- name: postgresql
  version: "16.8.0"
```

Then run:

```bash
helm dependency update
```

Helm downloads the new version and updates `Chart.lock`.

---

# 📂 Local Dependencies

Dependencies don't have to come from remote repositories.

Example:

```yaml
dependencies:

- name: common
  repository: "file://../common"
```

This is useful for:

- Internal shared charts
- Organization-wide templates
- Reusable platform components

---

# ✅ Best Practices

## Pin Dependency Versions

Use fixed versions:

```yaml
version: "16.7.0"
```

Avoid broad version ranges unless automatic upgrades are intentional.

---

## Use Trusted Charts

Prefer:

- Bitnami
- Internal company repositories
- Official vendor charts

Avoid unknown repositories.

---

## Never Modify Downloaded Subcharts

Avoid editing:

```text
charts/postgresql-16.7.0.tgz
```

Instead, customize behavior through `values.yaml`.

---

## Commit `Chart.lock`

Store `Chart.lock` in version control.

This ensures:

- Consistent builds
- Predictable deployments
- Identical dependency versions across environments

---

## Override Configuration Instead of Forking

Whenever possible, configure subcharts using values instead of maintaining modified copies.

---

# ❌ Common Mistakes

## Forgetting `helm dependency update`

After modifying `Chart.yaml`, always run:

```bash
helm dependency update
```

---

## Editing Downloaded Subcharts

Incorrect:

```text
charts/redis/
```

Changes will be overwritten the next time dependencies are updated or rebuilt.

---

## Forgetting to Override Values

Without custom values, subcharts use their default configuration, which may not match your application's requirements.

---

## Using Floating Versions

Avoid unspecified or broad version ranges.

Pinned versions provide predictable deployments.

---

# 🧪 Hands-on Lab

## Step 1 — Create a Chart

```bash
helm create ecommerce
```

---

## Step 2 — Add Dependencies

```yaml
dependencies:

- name: redis
  version: "<verified-version>"
  repository: "https://charts.bitnami.com/bitnami"

- name: postgresql
  version: "<verified-version>"
  repository: "https://charts.bitnami.com/bitnami"
```

---

## Step 3 — Download Dependencies

```bash
helm dependency update
```

---

## Step 4 — Verify Downloads

```bash
ls charts/
```

Expected output:

```text
postgresql-<version>.tgz

redis-<version>.tgz
```

---

## Step 5 — Install the Chart

```bash
helm install ecommerce .
```

---

## Step 6 — Verify Resources

```bash
kubectl get pods
```

You should see Pods for:

- Your application
- PostgreSQL
- Redis

---

# 📋 Summary

| Command | Purpose |
|----------|---------|
| `helm dependency update` | Download or update dependencies |
| `helm dependency build` | Rebuild dependencies from `Chart.lock` |
| `helm dependency list` | Display chart dependencies |

---

# 🎤 Interview Questions

### 1. What is a Helm dependency?

> A Helm dependency is another chart that is included and managed by a parent chart, allowing multiple applications or services to be deployed together.

---

### 2. What is the purpose of `Chart.lock`?

> `Chart.lock` locks dependency versions, ensuring reproducible builds and consistent deployments across environments.

---

### 3. What is the difference between `helm dependency update` and `helm dependency build`?

- `helm dependency update` resolves dependency versions from `Chart.yaml`, downloads them, and regenerates `Chart.lock`.
- `helm dependency build` recreates the `charts/` directory using the existing `Chart.lock` without resolving newer versions.

---

### 4. How do you disable a dependency?

> Define a `condition` in `Chart.yaml` and set the corresponding value (for example, `redis.enabled: false`) in `values.yaml`.

---

### 5. Why shouldn't you edit downloaded subcharts?

> Downloaded subcharts are managed artifacts. Any manual changes will be overwritten the next time dependencies are updated or rebuilt.

---

### 6. Can a dependency come from a local directory?

> Yes. Local dependencies can be referenced using a `file://` repository path.

Example:

```yaml
repository: "file://../common"
```

---

# 📌 Key Takeaways

- Helm dependencies allow parent charts to reuse existing charts such as PostgreSQL, Redis, or other services.
- Dependencies are declared in `Chart.yaml` and downloaded into the `charts/` directory.
- `Chart.lock` locks dependency versions for reproducible builds.
- Use `helm dependency update` to resolve and download dependencies, and `helm dependency build` to recreate them from the lock file.
- Override dependency behavior using values instead of modifying downloaded charts.
- Conditions and tags provide flexible control over which subcharts are deployed.
- Pin dependency versions and commit `Chart.lock` to ensure reliable production deployments.