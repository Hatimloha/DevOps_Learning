# 🚀 Helm Tutorial — Lesson 10: Dependencies & Subcharts

> Learn how Helm packages multiple applications into a single deployment using **dependencies** and **subcharts**, making complex Kubernetes applications easier to manage.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Do We Need Dependencies?](#-why-do-we-need-dependencies)
- [Parent Chart](#-parent-chart)
- [Child Chart (Subchart)](#-child-chart-subchart)
- [Parent vs Child Charts](#-parent-vs-child-charts)
- [Adding Dependencies](#-adding-dependencies)
- [Downloading Dependencies](#-downloading-dependencies)
- [Understanding `Chart.lock`](#-understanding-chartlock)
- [Installing All Components](#-installing-all-components)
- [Passing Values to Subcharts](#-passing-values-to-subcharts)
- [Enabling and Disabling Dependencies](#-enabling-and-disabling-dependencies)
- [Using Official Repository Charts](#-using-official-repository-charts)
- [Using Local Subcharts](#-using-local-subcharts)
- [Dependency Flow](#-dependency-flow)
- [Enterprise Project Structure](#-enterprise-project-structure)
- [Best Practices](#-best-practices)
- [Hands-on Lab](#-hands-on-lab)
- [Interview Questions](#-interview-questions)
- [Homework](#-homework)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what subcharts are
- ✅ Understand Helm dependencies
- ✅ Differentiate between parent and child charts
- ✅ Configure dependencies in `Chart.yaml`
- ✅ Understand the `charts/` directory
- ✅ Use `helm dependency update`
- ✅ Pass values to subcharts
- ✅ Enable or disable optional dependencies

---

# ❓ Why Do We Need Dependencies?

Real-world applications rarely consist of a single service.

An **e-commerce application** might require:

```text
E-Commerce Application

├── Frontend
├── Backend
├── Redis
├── PostgreSQL
└── Prometheus
```

Without Helm, each component must be installed separately.

```bash
helm install frontend ./frontend

helm install backend ./backend

helm install redis bitnami/redis

helm install postgres bitnami/postgresql

helm install prometheus prometheus-community/prometheus
```

That's five separate installations.

---

## Helm's Solution

Bundle everything into a single parent chart.

```text
E-Commerce Chart

├── Frontend
├── Backend
├── Redis
└── PostgreSQL
```

Install everything with one command:

```bash
helm install ecommerce .
```

Helm deploys all required components together.

---

# 📦 Parent Chart

Suppose your project is called:

```text
ecommerce/
```

This is the **parent chart**.

Project structure:

```text
ecommerce/
├── Chart.yaml
├── values.yaml
├── templates/
└── charts/
```

The parent chart orchestrates the deployment of all dependent components.

---

# 👶 Child Chart (Subchart)

Inside the `charts/` directory:

```text
ecommerce/
└── charts/
    ├── redis/
    └── postgresql/
```

Each directory contains an independent Helm Chart.

These are called **subcharts**.

---

# ⚖️ Parent vs Child Charts

| Parent Chart | Child Chart |
|---------------|-------------|
| Main application | Dependency |
| Controls deployment | Provides a supporting service |
| Defines dependencies | Used by the parent |

Example:

```text
Parent Chart
      │
      ▼
Backend
      │
      ▼
Redis
```

The Backend depends on Redis, but the parent manages both.

---

# ➕ Adding Dependencies

Open `Chart.yaml` and define dependencies.

Example:

```yaml
apiVersion: v2
name: ecommerce
version: 0.1.0

dependencies:
  - name: redis
    version: 20.6.0
    repository: https://charts.bitnami.com/bitnami

  - name: postgresql
    version: 16.7.4
    repository: https://charts.bitnami.com/bitnami
```

This tells Helm:

- Download the Redis chart
- Download the PostgreSQL chart
- Include both during installation

> **Tip:** Chart versions change over time. Always verify the latest compatible version from the chart repository before adding it.

---

# 📥 Downloading Dependencies

Run:

```bash
helm dependency update
```

Helm performs the following steps:

```text
Read Chart.yaml
      │
      ▼
Download Dependency Charts
      │
      ▼
Store Them
      │
      ▼
charts/
```

Result:

```text
charts/
├── redis-20.6.0.tgz
└── postgresql-16.7.4.tgz
```

---

# 🔒 Understanding `Chart.lock`

After running:

```bash
helm dependency update
```

Helm creates:

```text
Chart.lock
```

Example:

```yaml
dependencies:
  - name: redis
    version: 20.6.0

  - name: postgresql
    version: 16.7.4
```

### Purpose

`Chart.lock` locks dependency versions to ensure reproducible deployments.

It is similar to:

| Ecosystem | Lock File |
|------------|-----------|
| npm | `package-lock.json` |
| Python | `Pipfile.lock` |
| Rust | `Cargo.lock` |

Always commit `Chart.lock` to version control.

---

# 🚀 Installing All Components

Once dependencies have been downloaded:

```bash
helm install ecommerce .
```

Helm installs:

```text
Parent Chart
      │
      ▼
Redis
      │
      ▼
PostgreSQL
      │
      ▼
Application
```

Everything is deployed with a single command.

---

# ⚙️ Passing Values to Subcharts

The parent chart can configure subcharts.

Example:

```yaml
redis:
  architecture: standalone

  auth:
    enabled: false
```

The Redis chart automatically receives values under:

```text
.Values.redis
```

---

## Example

Parent `values.yaml`

```yaml
redis:
  replica:
    replicaCount: 2
```

The Redis subchart receives:

```yaml
replica:
  replicaCount: 2
```

No modifications to the Redis chart are required.

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

Behavior:

```text
redis.enabled = true
        │
        ▼
Redis Installed
```

```text
redis.enabled = false
        │
        ▼
Redis Skipped
```

This conditional dependency pattern is widely used in production Helm Charts.

---

# 📦 Using Official Repository Charts

Instead of creating your own Redis chart:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami

helm dependency update
```

Helm downloads the official Redis chart automatically.

Benefits:

- Community maintained
- Regular updates
- Production tested
- Saves development time

---

# 🏠 Using Local Subcharts

Not every dependency comes from a repository.

Example:

```text
ecommerce/

charts/
├── frontend/
└── backend/
```

Directory structure:

```text
charts/
├── frontend/
│     ├── Chart.yaml
│     └── templates/
│
└── backend/
      ├── Chart.yaml
      └── templates/
```

Helm packages local charts together with the parent chart.

---

# 🔄 Dependency Flow

```text
Parent Chart
│
├── templates/
│
├── values.yaml
│
└── charts/
       │
       ├── Redis
       │
       └── PostgreSQL
             │
             ▼
      helm install
             │
             ▼
   Everything Deploys
```

---

# 🏢 Enterprise Project Structure

A typical enterprise platform may look like this:

```text
company-platform/

├── frontend/
├── backend/
├── redis/
├── kafka/
├── postgresql/
├── monitoring/
└── ingress/
```

One Helm release.

Many services.

---

# ✅ Best Practices

### Keep the Parent Chart Lightweight

The parent chart should orchestrate dependencies rather than duplicate their logic.

---

### Use Official Charts

Instead of writing your own Redis or PostgreSQL chart, use trusted community-maintained charts whenever appropriate.

---

### Lock Dependency Versions

Always commit:

```text
Chart.lock
```

This guarantees consistent deployments across environments.

---

### Don't Modify Downloaded Charts

Configure dependencies through:

```yaml
values.yaml
```

instead of editing files inside:

```text
charts/
```

Otherwise, changes may be lost when dependencies are updated.

---

### Disable Optional Components

Example:

```yaml
redis:
  enabled: false
```

Install only the components required for a specific environment.

---

# 🧪 Hands-on Lab

Create a parent chart:

```bash
helm create ecommerce
```

Open `Chart.yaml` and add:

```yaml
dependencies:
  - name: redis
    version: <current-version>
    repository: https://charts.bitnami.com/bitnami
```

> Replace `<current-version>` with the latest compatible version from the Bitnami repository.

Download dependencies:

```bash
helm dependency update
```

Verify:

```text
charts/
└── redis-<version>.tgz
```

Render the chart:

```bash
helm template demo .
```

Verify that:

- Redis resources are included.
- Your application's resources are included.
- Everything is rendered as a single deployment.

---

# 🎯 Interview Questions

### 1. What is a subchart?

> A subchart is a Helm Chart that is used as a dependency of another Helm Chart.

---

### 2. Where are dependencies defined?

> Dependencies are defined in the `dependencies` section of `Chart.yaml`.

---

### 3. What does `helm dependency update` do?

> It downloads all required dependency charts, stores them in the `charts/` directory, and creates or updates `Chart.lock`.

---

### 4. What is the purpose of `Chart.lock`?

> `Chart.lock` locks dependency versions, ensuring reproducible and consistent installations across environments.

---

### 5. Can a parent chart override a subchart's values?

> Yes. A parent chart can configure a subchart by defining values under the subchart's name in `values.yaml`.

---

### 6. Why use Helm dependencies?

> Dependencies allow multiple related applications and services to be packaged and deployed together using a single Helm release.

---

# 📝 Homework

Complete the following tasks:

1. Create a parent chart named `ecommerce`.
2. Add Redis as a dependency in `Chart.yaml`.
3. Run:

```bash
helm dependency update
```

4. Inspect:

```text
charts/
```

and

```text
Chart.lock
```

5. Override a Redis configuration value (for example, disable authentication if supported by the chart) from the parent `values.yaml`.

6. Render the chart:

```bash
helm template ecommerce .
```

Verify that:

- Your application resources are included.
- Redis resources are included.
- The overridden Redis configuration is reflected in the rendered manifests.

---

# 📌 Key Takeaways

- Subcharts are Helm Charts used as dependencies of a parent chart.
- Dependencies are declared in the `dependencies` section of `Chart.yaml`.
- `helm dependency update` downloads dependency charts and generates `Chart.lock`.
- `Chart.lock` ensures reproducible deployments by locking dependency versions.
- Parent charts can configure subcharts through their own `values.yaml`.
- Dependencies can be enabled or disabled conditionally.
- A single Helm release can deploy an entire application stack, simplifying management in production environments.